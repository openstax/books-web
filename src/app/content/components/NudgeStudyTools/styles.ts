import styled, { css } from 'styled-components/macro';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { PlainButton } from '../../../components/Button';
import htmlMessage from '../../../components/htmlMessage';
import theme from '../../../theme';
import { remsToPx } from '../../../utils';
import { arrowDesktopHeight, arrowMobileHeight, closeButtonMobileMargin } from './constants';

// tslint:disable-next-line: variable-name
export const NudgeWrapper = styled.div`
  display: contents;
`;

// tslint:disable-next-line: variable-name
export const NudgeContentWrapper = styled.div`
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  position: absolute;
  width: max-content;
  top: 100%;
  ${theme.breakpoints.mobile(css`
    right: auto;
    text-align: center;
    padding: 0 2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeContent = styled.div`
  position: relative;
`;

export const Container = styled.div`
  display:flex;
  flex-direction:column;
  overflow:visible;
  /*just needs to be higher than the cover*/
  z-index: 9999;
  position: relative;
`

export const FittingSizeContainer = styled.div`
  width: 100%;
`

export const Spotlight = styled.div`
  background: white;
  display: flex;
  padding: 10px;
`

export const InnerContainer = styled.div`
  display:flex;
  position: absolute;
  flex-direction:column;
  align-items:flex-end;
  width: 100%;
  overflow: visible;
  top: 100%;
`

// tslint:disable-next-line: variable-name
const NudgeHeadingStyles = styled.h2`
  font-size: 3.6rem;
  line-height: 1.1;
  letter-spacing: -1.4px;
  margin: 0 0 1.7rem 0;
  color: ${theme.color.text.white};
  overflow: hidden;

  strong {
    color: ${theme.color.primary.yellow.base};
    font-weight: 600;
  }

  ${theme.breakpoints.mobile(css`
    font-size: 2.4rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeHeading = htmlMessage('i18n:nudge:study-tools:heading', NudgeHeadingStyles);

// tslint:disable-next-line: variable-name
const NudgeTextStyles = styled.div`
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -1px;
  color: ${theme.color.text.white};
  max-width: 690px;
  overflow: hidden;
  ${theme.breakpoints.mobile(css`
    max-width: 100%;
    font-size: 1.6rem;
    line-height: 1.4;
    padding: 0 2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeText = htmlMessage('i18n:nudge:study-tools:text', NudgeTextStyles);

// tslint:disable-next-line: variable-name
export const NudgeArrow = styled.img`
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  display: block;
  height: ${arrowDesktopHeight}rem;

  ${theme.breakpoints.mobile(css`
    height: ${arrowMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeCloseIcon = styled(Times)`
  width: 1.1rem;
  color: ${theme.color.text.white};
`;

// tslint:disable-next-line: variable-name
export const NudgeCloseButton = styled(PlainButton)`
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  width: 4rem;
  height: 4rem;
  padding: 1rem;
  border-radius: 50%;
  border: 1px solid ${theme.color.white};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  transform:translateY(-100%);
  ${theme.breakpoints.mobile(css`
    left: auto;
    top: ${remsToPx(closeButtonMobileMargin)}px;
    right: ${remsToPx(closeButtonMobileMargin)}px;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeBackground = styled.div`
  position: absolute;
  width: 200vw;
  height: 200vh;
  left: 0%;
  z-index: ${theme.zIndex.nudgeOverlay + 2};
  inset: 0px;
  opacity: 0.9;
  background-color: ${theme.color.black};
`;

// tslint:disable-next-line: variable-name
export const NudgeSpotlight = styled.div`
  position: fixed;
  background-color: gray;
`;
