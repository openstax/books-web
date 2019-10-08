import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { linkStyle } from '../../components/Typography';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { RouteState } from '../../navigation/types';
import { AppState, Dispatch } from '../../types';
import { content } from '../routes';
import * as selectSearch from '../search/selectors';
import * as select from '../selectors';
import { Book } from '../types';
import { getBookPageUrlAndParams, stripIdVersion, toRelativeUrl } from '../utils';

interface Props {
  book: Book;
  page: {
    id: string;
    shortId: string;
    title: string;
  };
  currentBook: Book | undefined;
  onClick?: () => void;
  navigate: typeof push;
  currentPath: string;
  search: RouteState<typeof content>['search'];
  className?: string;
  myForwardedRef: React.Ref<HTMLAnchorElement>;
}

// tslint:disable-next-line:variable-name
export const ContentLink = (props: React.PropsWithChildren<Props>) => {
  const {
    book,
    page,
    currentBook,
    currentPath,
    search,
    navigate,
    onClick,
    children,
    myForwardedRef,
    ...anchorProps
  } = props;
  const {url, params} = getBookPageUrlAndParams(book, page);
  const relativeUrl = toRelativeUrl(currentPath, url);
  const bookUid = stripIdVersion(book.id);

  return <a
    ref={myForwardedRef}
    onClick={(e) => {
      if (e.metaKey) {
        return;
      }
      e.preventDefault();
      if (onClick) {
        onClick();
      }
      navigate({
        params,
        route: content,
        state : {
          bookUid,
          bookVersion: book.version,
          pageUid: stripIdVersion(page.id),
          ...(currentBook && currentBook.id === bookUid && search && Object.values(search).filter((x) => !!x).length > 0
            ? {search}
            : {}
          ),
        },
      });
    }}
    href={relativeUrl}
    {...anchorProps}
  >{children}</a>;
};

// tslint:disable-next-line:variable-name
export const ConnectedContentLink = connect(
  (state: AppState, ownProps: {search?: Partial<RouteState<typeof content>['search']>}) => ({
    currentBook: select.book(state),
    currentPath: selectNavigation.pathname(state),
    search: ({
      query: selectSearch.query(state),
      selectedResult: selectSearch.selectedResult(state),
      ...(ownProps.search ? ownProps.search : {}),
    }),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(ContentLink);

// tslint:disable-next-line:variable-name
export const StyledContentLink = styled(ConnectedContentLink)`
  ${linkStyle}
`;

export default React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof ConnectedContentLink>, 'myForwardedRef'>
>((props, ref) =>
  <ConnectedContentLink {...props} myForwardedRef={ref} />
);
