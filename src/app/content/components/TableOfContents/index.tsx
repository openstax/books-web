import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../types';
import { resetToc } from '../../actions';
import { isArchiveTree } from '../../guards';
import * as selectors from '../../selectors';
import { ArchiveTree, Book, Page, State } from '../../types';
import { archiveTreeContainsNode } from '../../utils/archiveTreeUtils';
import { expandCurrentChapter, scrollSidebarSectionIntoView, setSidebarHeight } from '../../utils/domUtils';
import { stripIdVersion } from '../../utils/idUtils';
import * as Styled from './styled';

interface SidebarProps {
  onNavigate: () => void;
  isOpen: State['tocOpen'];
  book?: Book;
  page?: Page;
}

export class TableOfContents extends Component<SidebarProps> {
  public sidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();

  public render() {
    const {isOpen, book} = this.props;
    return <FormattedMessage id='i18n:toc:title'>
      {(msg: Element | string) =>
        <Styled.SidebarBody isOpen={isOpen} ref={this.sidebar} data-testid='toc' aria-label={msg}>
          {this.renderTocHeader()}
          {book && this.renderToc(book)}
        </Styled.SidebarBody>
      }
    </FormattedMessage>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();
    const sidebar = this.sidebar.current;

    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }

    const {callback, deregister} = setSidebarHeight(sidebar, window);
    callback();
    this.deregister = deregister;
  }

  public componentDidUpdate(prevProps: SidebarProps) {
    if (this.props.page !== prevProps.page) {
      expandCurrentChapter(this.activeSection.current);
      this.scrollToSelectedPage();
    }
  }

  public componentWillUnmount() {
    this.deregister();
  }
  private deregister: () => void = () => null;

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(this.sidebar.current, this.activeSection.current);
  }

  private renderChildren = (book: Book, section: ArchiveTree) =>
    <Styled.NavOl section={section}>
      {section.contents.map((item) => {
        const active = this.props.page && stripIdVersion(item.id) === this.props.page.id;
        return isArchiveTree(item)
        ? <Styled.NavItem key={item.id}>{this.renderTocNode(book, item)}</Styled.NavItem>
        : <Styled.NavItem
          key={item.id}
          ref={active ? this.activeSection : null}
          active={active}
        >
          <Styled.ContentLink
            onClick={this.props.onNavigate}
            book={book}
            page={item}
            dangerouslySetInnerHTML={{__html: item.title}}
          />
        </Styled.NavItem>;
      })}
    </Styled.NavOl>;

  private renderTocNode = (book: Book, node: ArchiveTree) => <Styled.NavDetails
    {...this.props.page && archiveTreeContainsNode(node, this.props.page.id)
        ? {defaultOpen: true}
        : {}
    }
  >
    <Styled.Summary>
      <Styled.SummaryWrapper>
        <Styled.ExpandIcon/>
        <Styled.CollapseIcon/>
        <Styled.SummaryTitle dangerouslySetInnerHTML={{__html: node.title}}/>
      </Styled.SummaryWrapper>
    </Styled.Summary>
    {this.renderChildren(book, node)}
  </Styled.NavDetails>;

  private renderTocHeader = () => <Styled.ToCHeader data-testid='tocheader'>
    <Styled.SidebarHeaderButton><Styled.TimesIcon /></Styled.SidebarHeaderButton>
  </Styled.ToCHeader>;

  private renderToc = (book: Book) => this.renderChildren(book, book.tree);
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    onNavigate: () => dispatch(resetToc()),
  })
)(TableOfContents);
