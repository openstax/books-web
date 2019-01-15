import { Element, Event, HTMLAnchorElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import scrollTo from 'scroll-to-element';
import url from 'url';
import { typesetMath } from '../../../helpers/mathjax';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { Dispatch } from '../../types';
import { AppServices, AppState } from '../../types';
import { content } from '../routes';
import * as select from '../selectors';
import { State } from '../types';
import BookStyles from './BookStyles';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  hash: string;
  navigate: typeof push;
  references: State['references'];
  services: AppServices;
}

export class PageComponent extends Component<PropTypes> {
  public container: Element | undefined | null;

  public getCleanContent = () => {
    const {book, page, services} = this.props;

    const cachedPage = book && page &&
      services.archiveLoader.book(book.id, book.version).page(page.id).cached()
    ;

    const pageContent = cachedPage ? cachedPage.content : '';

    return this.props.references.reduce((html, reference) =>
      html.replace(reference.match, content.getUrl(reference.params))
    , pageContent)
      // remove body and surrounding content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      // fix assorted self closing tags
      .replace(/<(em|h3|iframe|span|strong|sub|sup|u)([^>]*?)\/>/g, '<$1$2></$1>')
    ;
  }

  public componentDidMount() {
    const target = this.getScrollTarget();
    this.postProcess();
    this.linksOn();
    if (target) {
      scrollTo(target);
    }
  }

  public componentDidUpdate(prevProps: PropTypes) {
    const target = this.getScrollTarget();
    this.postProcess();

    if (this.container && typeof(window) !== 'undefined' && prevProps.page !== this.props.page) {
      this.linksOn();

      if (target) {
        scrollTo(target);
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
    return <BookStyles>
      {(className) => <div className={className}>
        <div data-type='chapter'>
          <div
            data-type='page'
            ref={(ref: any) => this.container = ref}
            dangerouslySetInnerHTML={{ __html: this.getCleanContent()}}
          />
        </div>
      </div>}
    </BookStyles>;
  }

  private getScrollTarget(): Element | null {
    return this.container && typeof(window) !== 'undefined' && this.props.hash
      ? this.container.querySelector(`[id="${this.props.hash.replace(/^#/, '')}"]`)
      : null;
  }

  private linksOn() {
    if (this.container) {
      Array.from(this.container.querySelectorAll('a')).forEach((a) =>
        a.addEventListener('click', this.clickListener(a))
      );
    }
  }

  private linksOff() {
    if (this.container) {
      Array.from(this.container.querySelectorAll('a')).forEach((a) =>
        a.removeEventListener('click', this.clickListener(a))
      );
    }
  }

  private clickListener = (anchor: HTMLAnchorElement) => (e: Event) => {
    const {references, navigate} = this.props;
    const href = anchor.getAttribute('href');

    if (!href) {
      return;
    }

    const parsed = url.parse(href);
    const hash = parsed.hash || '';
    const search = parsed.search || '';
    const path = href.replace(hash, '').replace(search, '');
    const reference = references.find((ref) => content.getUrl(ref.params) === path);

    if (reference) {
      e.preventDefault();
      navigate({
        params: reference.params,
        route: content,
        state: reference.state,
      }, {hash, search});
    }
  }

  private postProcess() {
    if (this.container && typeof(window) !== 'undefined') {
      typesetMath(this.container, window);
    }
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    hash: selectNavigation.hash(state),
    page: select.page(state),
    references: select.contentReferences(state),
  }),
  (dispatch: Dispatch): {navigate: typeof push} => ({
    navigate: (...args) => dispatch(push(...args)),
  })
)(withServices(PageComponent));
