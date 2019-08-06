import Color from 'color';
import React from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components/macro';
import { sidebarTransitionTime, toolbarDesktopHeight } from '../content/components/constants';
import { findFirstScrollableParent } from '../content/utils/domUtils';
import { isHtmlElement } from '../guards';
import theme from '../theme';
import OnScroll, { OnScrollCallback } from './OnScroll';

// tslint:disable-next-line:variable-name
const MobileScrollLockBodyClass = createGlobalStyle`
  body {
    ${theme.breakpoints.mobile(css`
      overflow: hidden;
    `)}
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

// tslint:disable-next-line:variable-name
const Overlay = styled.div`
  animation: ${sidebarTransitionTime}ms ${fadeIn} ease-out;
  background-color: ${Color(theme.color.primary.gray.base).alpha(0.75).string()};
  z-index: 2; /* stay above book content */
  position: absolute;
  content: "";
  top: -${toolbarDesktopHeight}rem;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

interface Props {
  onClick?: () => void;
}

export default class MobileScrollLock extends React.Component<Props> {

  public render() {
    return <OnScroll callback={this.blockScroll}>
      <Overlay onClick={this.props.onClick}><MobileScrollLockBodyClass /></Overlay>
    </OnScroll>;
  }

  private blockScroll: OnScrollCallback = (e) => {
    if (
      typeof(window) !== 'undefined'
      && window.matchMedia(theme.breakpoints.mobileQuery).matches
      && isHtmlElement(e.target)
      && !findFirstScrollableParent(e.target)
    ) {
      e.preventDefault();
    }
  };
}
