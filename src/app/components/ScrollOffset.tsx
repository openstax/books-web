import { MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components/macro';
import { isHtmlElement } from '../guards';
import theme from '../theme';
import { assertWindow, remsToPx } from '../utils';

interface ScrollOffsetProps {
  desktopOffset: number;
  mobileOffset: number;
}

// tslint:disable-next-line:variable-name
const GlobalStyle = createGlobalStyle<ScrollOffsetProps>`
  body {
    scroll-padding: ${(props) => props.desktopOffset}rem 0 0 0;
    ${theme.breakpoints.mobile(css`
      scroll-padding: ${(props: ScrollOffsetProps) => props.mobileOffset}rem 0 0 0;
    `)}
  }
`;

/*
 * everything from here down is only necessary because some browsers do not support
 * scroll-padding. safari *claims* to support scroll-padding, but doesn't outside
 * the context of a scroll snap position
 *
 * https://bugs.webkit.org/show_bug.cgi?id=179379
 */

/*
 * how close to the element's getBoundingClientRect().top does the window
 * have to be after a scroll for us to think that it was intentionally scrolled
 * to
 *
 * this used to be 2 but safari has been seen producing up to 3.4
 */
const matchingThreshold = 4;

/*
 * number of times to check the scroll after page load before assuming everything
 * after that is triggered by the user scrolling.
 *
 * firefox seems to try to set the scroll twice a couple seconds apart on load, so
 * initial browser scroll + initial fix + second browser scroll = 3
 */
const pageLoadScrollChecks = 3;

export default class ScrollOffset extends React.Component<ScrollOffsetProps> {

  public getOffset = (window: Window) => -(window.matchMedia(theme.breakpoints.mobileQuery).matches
    ? remsToPx(this.props.mobileOffset)
    : remsToPx(this.props.desktopOffset)
  );

  public componentDidMount() {
    // hashchange event is unreliable because it is not sent
    // when clicking the same link twice
    assertWindow().addEventListener('click', this.clickHandler);
    assertWindow().addEventListener('resize', this.resizeHandler);

    this.resizeHandler();
    this.checkScroll(pageLoadScrollChecks);
  }

  public componentWillUnmount() {
    const window = assertWindow();
    window.removeEventListener('click', this.clickHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  public render() {
    return <GlobalStyle {...this.props} />;
  }

  private resizeHandler = () => {
    const window = assertWindow();
    const body = window.document.body;

    body.setAttribute('data-scroll-padding', String(this.getOffset(window)));
  };

  private clickHandler = (e: MouseEvent) => {
    if (isHtmlElement(e.target) && e.target.matches('a[href^="#"]')) {
      this.checkScroll();
    }
  };

  private checkScroll = (maxChecks: number = 1) => {
    let scrolls = 0;
    const handler = () => {
      scrolls++;
      if (scrolls >= maxChecks) {
        assertWindow().removeEventListener('scroll', handler);
      }
      this.scrollForOffset();
    };
    assertWindow().addEventListener('scroll', handler);
  };

  private scrollForOffset = () => {
    const window = assertWindow();
    const targetId = window.location.hash.slice(1);
    const target = window.document.getElementById(targetId);

    if (!targetId || !target) {
      return;
    }

    if (Math.abs(target.getBoundingClientRect().top) < matchingThreshold) {
      window.scrollBy(0, this.getOffset(window));
    }
  };
}
