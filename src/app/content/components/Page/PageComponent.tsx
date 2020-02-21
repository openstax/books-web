import { Highlight } from '@openstax/highlighter';
import { HTMLAnchorElement, HTMLDivElement, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import WeakMap from 'weak-map';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { assertWindow } from '../../../utils';
import SearchFailure from '../../../notifications/components/SearchFailure'
import { preloadedPageIdIs } from '../../utils';
import getCleanContent from '../../utils/getCleanContent';
import PrevNextBar from '../PrevNextBar';
import { PagePropTypes } from './connector';
import { mapSolutions, toggleSolution, transformContent } from './contentDOMTransformations';
import * as contentLinks from './contentLinkHandler';
import highlightManager, { stubHighlightManager } from './highlightManager';
import MinPageHeight from './MinPageHeight';
import PageContent from './PageContent';
import RedoPadding from './RedoPadding';
import scrollTargetManager, { stubScrollTargetManager } from './scrollTargetManager';
import searchHighlightManager, { stubManager } from './searchHighlightManager';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "NodeList.forEach" */ 'mdn-polyfills/NodeList.prototype.forEach');
}

const parser = new DOMParser();

export default class PageComponent extends Component<PagePropTypes> {
  public container = React.createRef<HTMLDivElement>();
  public state = { hasSearchError: false }
  private clickListeners = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
  private searchHighlightManager = stubManager;
  private highlightManager = stubHighlightManager;
  private scrollTargetManager = stubScrollTargetManager;
  private processing: Promise<void> = Promise.resolve();

  public getTrasnformedContent = () => {
    const {book, page, services} = this.props;
    const cleanContent = parser.parseFromString(
      getCleanContent(book, page, services.archiveLoader, contentLinks.reduceReferences(this.props.contentLinks)),
      'text/html'
    );
    transformContent(cleanContent, cleanContent.body, this.props.intl);
    return cleanContent.body.innerHTML;
  };

  public componentDidMount() {
    this.postProcess();
    if (!this.container.current) {
      return;
    }
    this.searchHighlightManager = searchHighlightManager(this.container.current);
    this.highlightManager = highlightManager(this.container.current, () => this.props.highlights);
    this.scrollTargetManager = scrollTargetManager(this.container.current);
  }

  public async componentDidUpdate(prevProps: PagePropTypes) {
    // if there is a previous processing job, wait for it to finish.
    // this is mostly only relevant for initial load to ensure search results
    // are not highlighted before math is done typesetting, but may also
    // be relevant if there are rapid page navigations.
    await this.processing;

    this.scrollTargetManager(prevProps.scrollTarget, this.props.scrollTarget);

    if (prevProps.page !== this.props.page) {
      await this.postProcess();
    }

    const highlgihtsAddedOrRemoved = this.highlightManager.update();

    this.searchHighlightManager.update(
      prevProps.searchHighlights,
      this.props.searchHighlights,
      { forceRedraw: highlgihtsAddedOrRemoved },
      this.onHighlightSelect
    );
  }

  public onHighlightSelect = (highlight?: Highlight) => {
    if (!highlight && !this.state.hasSearchError) {
      this.setState({
        hasSearchError: true,
      });
    }
  };

  public dismissError = () => {
    this.setState({
      hasSearchError: false,
    });
  };

  public getSnapshotBeforeUpdate(prevProps: PagePropTypes) {
    if (prevProps.page !== this.props.page) {
      this.listenersOff();
    }
    return null;
  }

  public componentWillUnmount() {
    this.listenersOff();
    this.searchHighlightManager.unmount();
    this.highlightManager.unmount();
  }

  public render() {
    return <MinPageHeight>
      <this.highlightManager.CardList />
      {this.state.hasSearchError ? <SearchFailure dismiss={this.dismissError} /> : null}
      <RedoPadding>
        {this.props.page ? this.renderContent() : this.renderLoading()}
        <PrevNextBar />
      </RedoPadding>
    </MinPageHeight>;
  }

  private renderContent = () => {
    const html = this.getTrasnformedContent() || this.getPrerenderedContent();

    return <PageContent
      key='main-content'
      ref={this.container}
      dangerouslySetInnerHTML={{ __html: html}}
    />;
  };

  private renderLoading = () => <PageContent
    key='main-content'
    ref={this.container}
  >
    <Loader large delay={1500} />
  </PageContent>;

  private getPrerenderedContent() {
    if (
      typeof(window) !== 'undefined'
      && this.props.page
      && preloadedPageIdIs(window, this.props.page.id)
    ) {
      return this.props.services.prerenderedContent || '';
    }
    return '';
  }

  private mapLinks(cb: (a: HTMLAnchorElement) => void) {
    if (this.container.current) {
      Array.from(this.container.current.querySelectorAll('a')).forEach(cb);
    }
  }

  private listenersOn() {
    this.listenersOff();

    this.mapLinks((a) => {
      const handler = contentLinks.contentLinkHandler(a, () => this.props.contentLinks);
      this.clickListeners.set(a, handler);
      a.addEventListener('click', handler);
    });

    mapSolutions(this.container.current, (button) => {
      const handler = toggleSolution(button, this.props.intl);
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
    mapSolutions(this.container.current, removeIfExists);
  }

  private postProcess() {
    const container = this.container.current;

    if (!container) {
      return;
    }

    this.listenersOn();

    const promise = typesetMath(container, assertWindow());
    this.props.services.promiseCollector.add(promise);
    this.processing = promise;

    return promise;
  }
}
