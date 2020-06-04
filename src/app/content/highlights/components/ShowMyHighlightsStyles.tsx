import styled, { css } from 'styled-components/macro';
import { labelStyle } from '../../../components/Typography';
import { h4Style } from '../../../components/Typography/headings';
import theme from '../../../theme';
import {
  desktopHorizontalMargin,
  desktopVerticalMargin,
  mobileMarginSides,
  mobilePaddingSides
} from '../../styles/PopupConstants';
import { PopupBody, popupBodyPadding, popupPadding } from '../../styles/PopupStyles';

// tslint:disable-next-line: variable-name
export const Highlights = styled.div`
  overflow: visible;

  .os-divider {
    width: 0.8rem;
  }
`;

// tslint:disable-next-line: variable-name
export const LoaderWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: inherit;
  z-index: 1;
  background-color: rgba(241, 241, 241, 0.8);

  svg {
    margin-top: -5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightsChapterWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 5.6rem;
  padding: 0 ${popupPadding}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${mobilePaddingSides}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const HighlightsChapter = styled.div`
  ${h4Style}
  font-weight: bold;
  display: flex;
  align-items: baseline;
  width: 100%;

  .os-number {
    overflow: visible;
  }

  @media print {
    padding: 0;
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const ShowMyHighlightsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}

  @media print {
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightWrapper = styled.div`
  margin: ${desktopVerticalMargin}rem ${desktopHorizontalMargin}rem;
  border: solid 0.1rem ${theme.color.neutral.darkest};
  ${theme.breakpoints.mobile(css`
    margin: 0 0 ${mobileMarginSides * 2}rem 0;
  `)}
  overflow: visible;

  @media print {
    border-width: 0;
    margin: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightSection = styled.div`
  ${labelStyle}
  padding: 0 ${popupBodyPadding}rem 0 ${popupPadding}rem;
  background: ${theme.color.neutral.darkest};
  height: 3.2rem;
  display: flex;
  align-items: center;
  font-weight: bold;

  > .os-number,
  > .os-divider,
  > .os-text {
    overflow: hidden;
  }

  > .os-number,
  > .os-divider {
    flex-shrink: 0;
  }

  > .os-text {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  @media print {
    page-break-after: avoid;
    background: white;
  }
`;
