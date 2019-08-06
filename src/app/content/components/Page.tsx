import { Element, HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import WeakMap from 'weak-map';
import { typesetMath } from '../../../helpers/mathjax';
import MainContent from '../../components/MainContent';
import { bodyCopyRegularStyle } from '../../components/Typography';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { AppServices, AppState } from '../../types';
import { assertDefined, assertWindow, scrollTo } from '../../utils';
import { content } from '../routes';
import * as selectSearch from '../search/selectors';
import {State as SearchState } from '../search/types';
import * as select from '../selectors';
import { State } from '../types';
import { toRelativeUrl } from '../utils/urlUtils';
import { contentTextWidth } from './constants';
import allImagesLoaded from './utils/allImagesLoaded';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  hash: string;
  currentPath: string;
  navigate: typeof push;
  className?: string;
  references: State['references'];
  search: SearchState['query'];
  services: AppServices;
}

export class PageComponent extends Component<PropTypes> {
  public container: Element | undefined | null;
  private clickListeners = new WeakMap<HTMLAnchorElement, (e: MouseEvent) => void>();

  public getCleanContent = () => {
    const {book, page, services, currentPath} = this.props;

    const cachedPage = book && page &&
      services.archiveLoader.book(book.id, book.version).page(page.id).cached()
    ;

    const pageContent = cachedPage ? cachedPage.content : '';

    return this.props.references.reduce((html, reference) =>
      html.replace(reference.match, toRelativeUrl(currentPath, content.getUrl(reference.params)))
    , pageContent)
      // remove body and surrounding content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      // fix assorted self closing tags
      .replace(/<(em|h3|iframe|span|strong|sub|sup|u|figcaption)([^>]*?)\/>/g, '<$1$2></$1>')
      // remove page titles from content (they are in the nav)
      .replace(/<(h1|h2|div) data-type="document-title".*?<\/\1>/, '')
      // target blank and add `rel` to links that begin with: http:// https:// //
      .replace(/<a(.*?href="(https?:\/\/|\/\/).*?)>/g, '<a target="_blank" rel="noopener nofollow"$1>')
      // same as previous, but allow indexing links to relative content
      .replace(/<a(.*?href="\.\.\/.*?)>/g, '<a target="_blank"$1>')
      // move (first-child) figure and table ids up to the parent div
      .replace(/(<div[^>]*)(>[^<]*<(?:figure|table)[^>]*?) (id=[^\s>]*)/g, '$1 $3$2 data-$3')
    ;
  };

  public componentDidMount() {
    this.postProcess();
    this.linksOn();
    if (this.container) { this.addGenericJs(this.container); }
  }

  public componentDidUpdate(prevProps: PropTypes) {
    const target = this.getScrollTarget();
    this.postProcess();

    if (this.container && typeof(window) !== 'undefined' && prevProps.page !== this.props.page) {
      this.linksOn();

      this.addGenericJs(this.container);
      if (target) {
        allImagesLoaded(this.container).then(() => scrollTo(target));
      } else {
        window.scrollTo(0, 0);
      }
    }
  }

  public getSnapshotBeforeUpdate() {
    this.linksOff();
    return null;
  }

  public componentWillUnmount() {
    if (this.container) {
      this.linksOff();
    }
  }

  public render() {
    const html = this.getCleanContent() || this.getPrerenderedContent();

    return <MainContent
      className={this.props.className}
      ref={(ref: any) => this.container = ref}
      dangerouslySetInnerHTML={{ __html: html}}
    />;
  }

  private getPrerenderedContent() {
    if (
      typeof(window) !== 'undefined'
      && this.props.page
      && window.__PRELOADED_STATE__
      && window.__PRELOADED_STATE__.content
      && window.__PRELOADED_STATE__.content.page
      && window.__PRELOADED_STATE__.content.page.id === this.props.page.id
    ) {
      return this.props.services.prerenderedContent || '';
    }
    return '';
  }

  // from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
  // .../src/scripts/modules/media/body/body.coffee#L123
  private addGenericJs(rootEl: Element) {
    this.addScopeToTables(rootEl);
    this.wrapElements(rootEl);
    this.tweakFigures(rootEl);
    this.fixLists(rootEl);
  }

  private addScopeToTables(rootEl: Element) {
    rootEl.querySelectorAll('table th').forEach((el) => el.setAttribute('scope', 'col'));
  }

  // Wrap title and content elements in header and section elements, respectively
  private wrapElements(rootEl: Element) {
    rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
      [data-type="example"], [data-type="exercise"],
      [data-type="note"], [data-type="abstract"]`).forEach((el) => {

      // JSDOM does not support `:scope` in .querySelectorAll() so use .matches()
      const titles = Array.from(el.children).filter((child) => child.matches('.title, [data-type="title"], .os-title'));

      const bodyWrap = assertDefined(document, 'document should be defined').createElement('section');
      bodyWrap.append(...Array.from(el.childNodes));

      const titleWrap = assertDefined(document, 'document should be defined').createElement('header');
      titleWrap.append(...Array.from(titles));

      el.append(titleWrap, bodyWrap);

      // Add an attribute for the parents' `data-label`
      // since CSS does not support `parent(attr(data-label))`.
      // When the title exists, this attribute is added before it
      const label = el.getAttribute('data-label');
      if (label) {
        titles.forEach((title) => title.setAttribute('data-label-parent', label));
      }

      // Add a class for styling since CSS does not support `:has(> .title)`
      // NOTE: `.toggleClass()` explicitly requires a `false` (not falsy) 2nd argument
      if (titles.length > 0) {
        el.classList.add('ui-has-child-title');
      }
    });
  }

  private tweakFigures(rootEl: Element) {
    // move caption to bottom of figure
    rootEl.querySelectorAll('figure > figcaption').forEach((el) => {
      const parent = assertDefined(el.parentElement, 'figcaption parent should always be defined');
      parent.classList.add('ui-has-child-figcaption');
      parent.appendChild(el);
    });
  }

  private fixLists(rootEl: Element) {
    // Copy data-mark-prefix and -suffix from ol to li so they can be used in css
    rootEl.querySelectorAll(`ol[data-mark-prefix] > li, ol[data-mark-suffix] > li,
    [data-type="list"][data-list-type="enumerated"][data-mark-prefix] > [data-type="item"],
    [data-type="list"][data-list-type="enumerated"][data-mark-suffix] > [data-type="item"]`).forEach((el) => {
      const parent = assertDefined(el.parentElement, 'list parent should always be defined');
      const markPrefix = parent.getAttribute('data-mark-prefix');
      const markSuffix = parent.getAttribute('data-mark-suffix');
      if (markPrefix) { el.setAttribute('data-mark-prefix', markPrefix); }
      if (markSuffix) { el.setAttribute('data-mark-suffix', markSuffix); }
    });
    rootEl.querySelectorAll('ol[start], [data-type="list"][data-list-type="enumerated"][start]').forEach((el) => {
      el.setAttribute('style', `counter-reset: list-item ${el.getAttribute('start')}`);
    });
}

  private getScrollTarget(): Element | null {
    return this.container && typeof(window) !== 'undefined' && this.props.hash
      ? this.container.querySelector(`[id="${this.props.hash.replace(/^#/, '')}"]`)
      : null;
  }

  private mapLinks(cb: (a: HTMLAnchorElement) => void) {
    if (this.container) {
      Array.from(this.container.querySelectorAll('a')).forEach(cb);
    }
  }

  private linksOn() {
    this.mapLinks((a) => {
      const handler = this.clickListener(a);
      this.clickListeners.set(a, handler);
      a.addEventListener('click', handler);
    });
  }

  private linksOff() {
    this.mapLinks((a) => {
      const handler = this.clickListeners.get(a);
      if (handler) {
        a.removeEventListener('click', handler);
      }
    });
  }

  private clickListener = (anchor: HTMLAnchorElement) => (e: MouseEvent) => {
    const {references, navigate, book} = this.props;
    const href = anchor.getAttribute('href');

    if (!href || !book) {
      return;
    }

    const {hash, search, pathname} = new URL(href, assertWindow().location.href);
    const reference = references.find((ref) => content.getUrl(ref.params) === pathname);

    if (reference && reference.params.book === book.slug && !e.metaKey) {
      e.preventDefault();
      navigate({
        params: reference.params,
        route: content,
        state: {
          ...reference.state,
          search: this.props.search,
        },
      }, {hash, search});
    }
  };

  private postProcess() {
    if (this.container && typeof(window) !== 'undefined') {
      const promise = typesetMath(this.container, window);
      this.props.services.promiseCollector.add(promise);
    }
  }
}

export const contentTextStyle = css`
  ${bodyCopyRegularStyle}

  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;

// tslint:disable-next-line:variable-name
const StyledPageComponent = styled(PageComponent)`
  ${contentTextStyle}

  @media screen { /* full page width in print */
    margin-top: ${theme.padding.page.desktop}rem;
    ${theme.breakpoints.mobile(css`
      margin-top: ${theme.padding.page.mobile}rem;
    `)}
  }

  overflow: visible; /* allow some elements, like images, videos, to overflow and be larger than the text. */

  .os-figure,
  .os-figure:last-child {
    margin-bottom: 5px; /* fix double scrollbar bug */
  }

  * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
    hash: selectNavigation.hash(state),
    page: select.page(state),
    references: select.contentReferences(state),
    search: selectSearch.query(state),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(withServices(StyledPageComponent));
