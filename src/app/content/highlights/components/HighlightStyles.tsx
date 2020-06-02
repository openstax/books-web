import React from 'react';
import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import htmlMessage from '../../../components/htmlMessage';
import Times from '../../../components/Times';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { H3, h4Style } from '../../../components/Typography/headings';
import theme from '../../../theme';
import { contentWrapperMaxWidth, toolbarIconColor } from '../../components/constants';
import { disablePrint } from '../../components/utils/disablePrint';
import { mobileMarginSides, mobileMarginTopBottom, mobilePaddingSides } from './SummaryPopup/constants';

export const desktopPopupWidth = 74.4;
export const popupPadding = 3.2;
export const popupBodyPadding = 2.4;
export const myHighlightsImageWidth = 72.8;
export const myHighlightsImageHeight = 23.2;
export const headerHeight = 7.2;
export const topBottomMargin = headerHeight + popupBodyPadding;

export const stickyNoteMeasures = {
  blue: 'rgb(13, 192, 220)',
  bulletSize: 1.6,
  defaultOffset: 3.2,
  green: 'rgb(99, 165, 36)',
  height: 8,
  left: 32.8,
  opacity: '0.85',
  width: 29.8, /* to allow text to fit in one line with tooltip */
};

export const imageStyles = css`
  height: 25.6rem;
  width: 36rem;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0, 0, 0, 20);
`;

// tslint:disable-next-line:variable-name
export const PopupWrapper = styled.div`
  display: flex;
  justify-content: center;

  @media print {
    display: block;

    & ~ div {
      display: none;
    }
  }
`;

// tslint:disable-next-line:variable-name
export const Modal = styled.div`
  top: 0;
  z-index: ${theme.zIndex.highlightSummaryPopup};
  position: fixed;
  background: ${theme.color.neutral.base};
  border-radius: 0.5rem;
  height: calc(100% - ${topBottomMargin}rem);
  outline: none;
  overflow: hidden;
  margin: ${headerHeight}rem auto ${popupBodyPadding}rem;
  max-width: ${contentWrapperMaxWidth}rem;
  width: calc(100% - ${popupBodyPadding}rem * 2);
  ${theme.breakpoints.mobile(css`
    margin: 2rem 0;
    width: calc(100% - ${mobileMarginSides * 2}rem);
    height: calc(100% - ${mobileMarginTopBottom * 2}rem);
  `)}

  @media print {
    position: relative;
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const Header = styled(H3)`
  ${disablePrint}
  background: #002569;
  color: ${theme.color.neutral.base};
  padding: ${popupPadding}rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${headerHeight}rem;
  overflow: hidden;
  ${theme.breakpoints.mobile(css`
    padding: ${mobilePaddingSides}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const PopupBody = styled.div`
  -webkit-overflow-scrolling: touch;
  height: calc(100% - ${headerHeight}rem);
  background: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    text-align: center;
    padding: 8rem 3.2rem;
  `)}

  @media print {
    height: max-content;
    overflow: auto;
  }
`;

// tslint:disable-next-line:variable-name
export const FirstImage = styled.img`
  ${imageStyles}
`;

// tslint:disable-next-line:variable-name
export const SecondImage = styled.img`
  ${imageStyles}
  margin-top: 17.6rem;
`;

// tslint:disable-next-line:variable-name
export const ImageWrapper = styled.div`
  width: ${(desktopPopupWidth - popupBodyPadding) / 2}rem;
`;

// tslint:disable-next-line: variable-name
export const StickyNoteBullet = styled.div`
  position: absolute;
  width: ${stickyNoteMeasures.bulletSize * 2}rem;
  height: ${stickyNoteMeasures.bulletSize}rem;
  overflow: hidden;

  ::after {
    content: "";
    position: absolute;
    width: ${stickyNoteMeasures.bulletSize}rem;
    height: ${stickyNoteMeasures.bulletSize}rem;
    transform: rotate(45deg);
    top: ${stickyNoteMeasures.bulletSize / 2}rem;
    left: ${stickyNoteMeasures.bulletSize / 2}rem;
    box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0, 0, 0, 30);
  }
`;

// tslint:disable-next-line:variable-name
export const StickyNote = styled.div`
  width: ${stickyNoteMeasures.width}rem;
  position: absolute;
  padding: ${stickyNoteMeasures.bulletSize}rem ${popupBodyPadding}rem;
  overflow: visible;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0, 0, 0, 30);
  opacity: ${stickyNoteMeasures.opacity};
`;

// tslint:disable-next-line:variable-name
export const BlueStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.blue};
  top: ${stickyNoteMeasures.defaultOffset}rem;
  left: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;

  ${StickyNoteBullet} {
    transform: rotate(-90deg);
    top: ${stickyNoteMeasures.height / 2 - stickyNoteMeasures.bulletSize / 2}rem;
    left: -${stickyNoteMeasures.bulletSize * 1.5}rem;

    ::after {
      background: ${stickyNoteMeasures.blue};
    }
  }
`;

// tslint:disable-next-line:variable-name
export const GreenStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.green};
  bottom: ${stickyNoteMeasures.defaultOffset}rem;
  right: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;

  ${StickyNoteBullet} {
    transform: rotate(90deg);
    top: ${stickyNoteMeasures.height / 2 - stickyNoteMeasures.bulletSize / 2}rem;
    right: -${stickyNoteMeasures.bulletSize * 1.5}rem;

    ::after {
      background: ${stickyNoteMeasures.green};
    }
  }
`;

// tslint:disable-next-line:variable-name
export const StickyNoteUl = styled.ul`
  padding: 0;
  overflow: visible;
  margin: 0;
  list-style: none;
`;

// tslint:disable-next-line:variable-name
export const StickyNoteLi = styled.li`
  ${h4Style}
  overflow: visible;
  padding: 0;
  display: flex;
  color: ${theme.color.neutral.base};

  ::before {
    content: "\\2022";
    padding-right: 0.5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const CloseIconWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='true' />)`
  color: ${theme.color.neutral.base};
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.base};
  }

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const GridWrapper = styled.div`
  margin: 3.6rem auto 0;
  overflow: visible;
  width: ${desktopPopupWidth}rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const ImagesGrid = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const GeneralText = styled(H3)`
  width: 100%;
  padding: 0.8rem 0;
`;

// tslint:disable-next-line:variable-name
export const GeneralTextWrapper = styled.div`
  ${bodyCopyRegularStyle}
  padding: ${popupBodyPadding}rem ${popupPadding}rem 0;

  @media print {
    height: max-content;
    overflow: auto;
  }
`;

// tslint:disable-next-line:variable-name
export const LoginText = htmlMessage('i18n:toolbar:highlights:popup:login-text', GeneralTextWrapper);

// tslint:disable-next-line:variable-name
export const MyHighlightsWrapper = styled.div`
  margin: 3.6rem auto 0;
  width: ${desktopPopupWidth}rem;
  text-align: center;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const GeneralLeftText = styled(GeneralTextWrapper)`
  display: flex;
  flex-direction: column;
  padding: 2rem 3.2rem;
`;

// tslint:disable-next-line:variable-name
export const GeneralCenterText = styled(GeneralTextWrapper)`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 5rem 3.2rem;
  text-align: center;
`;

// tslint:disable-next-line:variable-name
export const MyHighlightsImage = styled.img`
  width: ${myHighlightsImageWidth}rem;
  height: ${myHighlightsImageHeight}rem;
  margin-top: ${popupBodyPadding}rem;
`;
