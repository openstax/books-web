import Highlighter from '@openstax/highlighter';
import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLAnchorElement, HTMLButtonElement, HTMLDivElement, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import isEqual from 'lodash/fp/isEqual';
import React, { Component } from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import WeakMap from 'weak-map';
import { typesetMath } from '../../../helpers/mathjax';
import MainContent from '../../components/MainContent';
import { bodyCopyRegularStyle } from '../../components/Typography';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { RouteState } from '../../navigation/types';
import theme from '../../theme';
import { AppServices, AppState } from '../../types';
import { Dispatch } from '../../types';
import { assertDefined, assertWindow, resetTabIndex, scrollTo } from '../../utils';
import { content } from '../routes';
import * as selectSearch from '../search/selectors';
import { SelectedResult } from '../search/types';
import { highlightResults } from '../search/utils';
import * as select from '../selectors';
import { State } from '../types';
import getCleanContent from '../utils/getCleanContent';
import { getBookPageUrlAndParams, toRelativeUrl } from '../utils/urlUtils';
import { contentTextWidth } from './constants';
import allImagesLoaded from './utils/allImagesLoaded';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "NodeList.forEach" */ 'mdn-polyfills/NodeList.prototype.forEach');
}

interface PropTypes {
  intl: IntlShape;
  page: State['page'];
  book: State['book'];
  hash: string;
  currentPath: string;
  navigate: typeof push;
  className?: string;
  references: State['references'];
  searchResults: SearchResultHit[];
  search: RouteState<typeof content>['search'];
  services: AppServices;
}

export class PageComponent extends Component<PropTypes> {
  public container = React.createRef<HTMLDivElement>();
  private clickListeners = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
  private searchHighlighter: Highlighter | undefined;
  private searchResultMap: ReturnType<typeof highlightResults> = [];

  public getCleanContent = () => {
    const {book, page, services, currentPath} = this.props;
    return getCleanContent(book, page, services.archiveLoader, (pageContent) =>
      this.props.references.reduce((html, reference) =>
        html.replace(reference.match, toRelativeUrl(currentPath, content.getUrl(reference.params))), pageContent));
  };

  public scrollToTop(prevProps: PropTypes, window: Window) {
    if (prevProps.page && prevProps.page !== this.props.page) {
      resetTabIndex(window.document);
    }
    window.scrollTo(0, 0);
  }

  public componentDidMount() {
    if (!this.container.current) {
      return;
    }
    this.postProcess(this.container.current);
    this.addGenericJs(this.container.current);
    this.listenersOn();
    this.searchHighlighter = new Highlighter(this.container.current, {
      className: 'search-highlight',
    });
  }

  public componentDidUpdate(prevProps: PropTypes) {
    const target = this.getScrollTarget();

    if (this.container.current && typeof(window) !== 'undefined' && prevProps.page !== this.props.page) {
      this.postProcess(this.container.current);
      this.addGenericJs(this.container.current);

      if (!target) {
        this.scrollToTop(prevProps, window);
      }
    }

    if (this.container.current && typeof(window) !== 'undefined' && target) {
      allImagesLoaded(this.container.current).then(() => scrollTo(target));
    }

    if (prevProps.searchResults !== this.props.searchResults) {
      this.updateHighlights();
    }

    if (
      this.container.current &&
      this.searchHighlighter &&
      this.props.search &&
      this.props.search.selectedResult &&
      (
        !prevProps.search ||
        (this.props.search.selectedResult !== prevProps.search.selectedResult)
      )
    ) {
      this.scrollToSearch(this.container.current, this.searchHighlighter, this.props.search.selectedResult);
    }

    this.listenersOn();
  }

  public getSnapshotBeforeUpdate() {
    this.listenersOff();
    return null;
  }

  public componentWillUnmount() {
    if (this.container.current) {
      this.listenersOff();
    }
  }

  public render() {
    const html = this.getCleanContent() || this.getPrerenderedContent();

    return <MainContent
      className={this.props.className}
      ref={this.container}
      dangerouslySetInnerHTML={{ __html: html}}
    />;
  }

  private scrollToSearch = (container: HTMLElement, highlighter: Highlighter, selected: SelectedResult) => {
    const elementHighlights = this.searchResultMap.find((map) => isEqual(map.result, selected.result));
    const selectedHighlights = elementHighlights && elementHighlights.highlights[selected.highlight];
    const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

    highlighter.clearFocus();

    if (firstSelectedHighlight) {
      firstSelectedHighlight.focus();

      allImagesLoaded(container)
        .then(() => scrollTo(firstSelectedHighlight.elements[0]));
    }
  };

  private updateHighlights = () => {
    const { searchResults } = this.props;

    if (!this.container.current || !this.searchHighlighter) {
      return;
    }

    this.searchHighlighter.eraseAll();
    this.searchResultMap = highlightResults(this.searchHighlighter, searchResults);

    if (this.props.search && this.props.search.selectedResult) {
      this.scrollToSearch(this.container.current, this.searchHighlighter, this.props.search.selectedResult);
    }
  };

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
  private addGenericJs(rootEl: HTMLElement) {
    this.addScopeToTables(rootEl);
    this.wrapElements(rootEl);
    this.tweakFigures(rootEl);
    this.fixLists(rootEl);
    this.wrapSolutions(rootEl);
  }

  private addScopeToTables(rootEl: HTMLElement) {
    rootEl.querySelectorAll('table th').forEach((el) => el.setAttribute('scope', 'col'));
  }

  // Wrap title and content elements in header and section elements, respectively
  private wrapElements(rootEl: HTMLElement) {
    rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
      [data-type="example"], [data-type="exercise"],
      [data-type="note"], [data-type="abstract"]`).forEach((el) => {

      // JSDOM does not support `:scope` in .querySelectorAll() so use .matches()
      const titles = Array.from(el.children).filter((child) => child.matches('.title, [data-type="title"], .os-title'));

      const bodyWrap = assertDefined(document, 'document should be defined').createElement('section');
      bodyWrap.append(...Array.from(el.childNodes));

      const titleWrap = assertDefined(document, 'document should be defined').createElement('header');
      titleWrap.append(...titles);

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

  private tweakFigures(rootEl: HTMLElement) {
    // move caption to bottom of figure
    rootEl.querySelectorAll('figure > figcaption').forEach((el) => {
      const parent = assertDefined(el.parentElement, 'figcaption parent should always be defined');
      parent.classList.add('ui-has-child-figcaption');
      parent.appendChild(el);
    });
  }

  private fixLists(rootEl: HTMLElement) {
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

  private wrapSolutions(rootEl: HTMLElement) {
    const title = this.props.intl.formatMessage({id: 'i18n:content:solution:toggle-title'});

    // Wrap solutions in a div so "Show/Hide Solutions" work
    rootEl.querySelectorAll('.exercise .solution, [data-type="exercise"] [data-type="solution"]').forEach((el) => {
      const contents = el.innerHTML;
      el.innerHTML = `
        <div class="ui-toggle-wrapper">
          <button class="btn-link ui-toggle" title="${title}"></button>
        </div>
        <section class="ui-body" role="alert">${contents}</section>
      `;
    });
  }

  private getScrollTarget(): Element | null {
    return this.container.current && typeof(window) !== 'undefined' && this.props.hash
      ? this.container.current.querySelector(`[id="${this.props.hash.replace(/^#/, '')}"]`)
      : null;
  }

  private mapLinks(cb: (a: HTMLAnchorElement) => void) {
    if (this.container.current) {
      Array.from(this.container.current.querySelectorAll('a')).forEach(cb);
    }
  }

  private mapSolutions(cb: (a: HTMLButtonElement) => void) {
    if (this.container.current) {
      Array.from(this.container.current.querySelectorAll<HTMLButtonElement>(
        '[data-type="solution"] > .ui-toggle-wrapper > .ui-toggle, .solution > .ui-toggle-wrapper > .ui-toggle'
      )).forEach(cb);
    }
  }

  private listenersOn() {
    this.mapLinks((a) => {
      const handler = this.clickListener(a);
      this.clickListeners.set(a, handler);
      a.addEventListener('click', handler);
    });

    this.mapSolutions((button) => {
      const handler = this.toggleSolution(button);
      this.clickListeners.set(button, handler);
      button.addEventListener('click', handler);
    });
  }

  private listenersOff() {
    const removeIfExists = (el: HTMLElement) => {
      const handler = this.clickListeners.get(el);
      if (handler) {
        el.removeEventListener('click', handler);
      }
    };

    this.mapLinks(removeIfExists);
    this.mapSolutions(removeIfExists);
  }

  private toggleSolution = (button: HTMLElement) => () => {
    if (!button.parentElement || !button.parentElement.parentElement) {
      return;
    }
    const solution = button.parentElement.parentElement;

    if (solution.classList.contains('ui-solution-visible')) {
      solution.classList.remove('ui-solution-visible');
      solution.removeAttribute('aria-expanded');
      solution.setAttribute('aria-label', this.props.intl.formatMessage({id: 'i18n:content:solution:show'}));
    } else {
      solution.className += ' ui-solution-visible';
      solution.setAttribute('aria-expanded', '');
      solution.setAttribute('aria-label', this.props.intl.formatMessage({id: 'i18n:content:solution:hide'}));
    }
  };

  private clickListener = (anchor: HTMLAnchorElement) => (e: MouseEvent) => {
    const {references, navigate, book, page} = this.props;
    const href = anchor.getAttribute('href');

    if (!href || !book || !page) {
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
    } else if (pathname === this.props.currentPath && hash && !e.metaKey) {
      e.preventDefault();
      navigate({
        params: getBookPageUrlAndParams(book, page).params,
        route: content,
        state: {
          ...getBookPageUrlAndParams(book, page).state,
          search: this.props.search,

        },
      }, {hash, search});
    }
  };

  private postProcess(container: HTMLElement) {
    const promise = typesetMath(container, assertWindow());
    this.props.services.promiseCollector.add(promise);
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

  @media screen {
    .search-highlight {
      background-color: #ffd17e;

      &.focus {
        background-color: #ff9e4b;

        .search-highlight {
          background-color: unset;
        }
      }
    }
  }

  .os-figure,
  .os-figure:last-child {
    margin-bottom: 5px; /* fix double scrollbar bug */
  }

  * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;

const connector = connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
    hash: selectNavigation.hash(state),
    page: select.page(state),
    references: select.contentReferences(state),
    search: selectSearch.query(state) || selectSearch.selectedResult(state)
      ? {
        query: selectSearch.query(state),
        selectedResult: selectSearch.selectedResult(state),
      }
      : undefined
    ,
    searchResults: selectSearch.currentPageResults(state),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
);

export default flow(
  injectIntl,
  withServices,
  connector
)(StyledPageComponent);
