
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import Toasts from '../../../notifications/components/ToastNotifications';
import theme from '../../../theme';
import { mobileToolbarOpen as toolbarSelector } from '../../search/selectors';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight
} from '../constants';

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + toolbarDesktopHeight;
export const getMobileSearchFailureTop = ({mobileToolbarOpen}: {mobileToolbarOpen: boolean}) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + toolbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + toolbarMobileHeight;

// tslint:disable-next-line:variable-name
const WrappedToasts = styled(Toasts)`
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
const ToastNotifications = () => {
  const toolbarOpen = useSelector(toolbarSelector);

  return <WrappedToasts mobileToolbarOpen={toolbarOpen} />;
};

export default ToastNotifications;
