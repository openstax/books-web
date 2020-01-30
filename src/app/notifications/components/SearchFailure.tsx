import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { ActionType } from 'typesafe-actions';
import Times from '../../components/Times';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
} from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { dismissNotification, searchFailure,  } from '../actions';
import { inlineDisplayBreak } from '../theme';
import { Header } from './Card';

const bannerBackground = '#F8E8EB';
const errorBorderColor = '#E297A0';
const closeIconClor = '#EDBFC5';
const hoveredCloseIconColor = errorBorderColor;

// tslint:disable-next-line:variable-name
const BannerBody = styled.div`
  width: 100%;
  margin: 0;
  padding: 0.5rem 1rem;
  background: ${bannerBackground};
  display: flex;
  align-items: center;
  justify-content:space-between;
  border: 1px solid ${errorBorderColor};
  z-index: ${theme.zIndex.contentNotifications};
  overflow: visible;
  position: sticky;
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;

  ${Header} {
    width:90%;
    background: inherit;
    color: ${theme.color.text.red};
    font-weight: normal;
    line-height: 2.6rem;
  }

  @media (max-width: ${inlineDisplayBreak}) {
    top : ${bookBannerMobileMiniHeight + toolbarMobileHeight}rem;
    align-items:flex-start;
    z-index: calc(${theme.zIndex.searchSidebar} + 1);
    padding: 1.6rem ${theme.padding.page.mobile}rem;
  };

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  width: 1.8rem;
  height: 1.8rem;
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
export const CloseButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0;
  color: ${closeIconClor};
  &:hover{
    color: ${hoveredCloseIconColor};
  }
`;

// tslint:disable-next-line:variable-name
const SearchFailure = ({dismiss}: {dismiss: () => void }) =>
  <BannerBody>
    <FormattedMessage id='i18n:notification:search-failure'>
      {(txt) =>  <Header>{txt}</Header>}
    </FormattedMessage>
    <CloseButton onClick={dismiss}>
      <CloseIcon />
    </CloseButton>
  </BannerBody>;

export default connect(
  () => ({
  }),
  (dispatch: Dispatch, ownProps: {notification: ActionType<typeof searchFailure>}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
    },
  })
)(SearchFailure);
