import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight
} from '../../../content/components/constants';
import { addToast } from '../../../notifications/actions';
import ToastNotifications from '../../../notifications/components/ToastNotifications';
import { groupedToastNotifications } from '../../../notifications/selectors';
import theme from '../../../theme';

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + toolbarDesktopHeight;
export const getMobileSearchFailureTop = ({mobileToolbarOpen}: {mobileToolbarOpen: boolean}) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + toolbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + toolbarMobileHeight;

export const addToastToPage = (messageKey: string) => addToast(messageKey, {destination: 'page'});

// tslint:disable-next-line:variable-name
export const ToastContainerWrapper = styled.div`
  width: 100%;
  position: sticky;
  overflow: visible;
  z-index: ${theme.zIndex.contentNotifications - 1};
  top: ${desktopSearchFailureTop}rem;
  ${theme.breakpoints.mobile(css`
    z-index: ${theme.zIndex.contentNotifications + 1};
    top: ${getMobileSearchFailureTop}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const PageToasts = () => {
  const toasts = useSelector(groupedToastNotifications).page || [];

  return <ToastContainerWrapper>
    <ToastNotifications toasts={toasts} />
  </ToastContainerWrapper>;
};

export default PageToasts;
