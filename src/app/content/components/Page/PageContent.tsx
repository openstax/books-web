import Color from 'color';
import styled, { css } from 'styled-components/macro';
import MainContent from '../../../components/MainContent';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { MAIN_CONTENT_ID } from '../../../context/constants';
import theme from '../../../theme';
import { highlightStyles } from '../../constants';
import {
  highlightBlockPadding,
  highlightIndicatorSize,
  highlightIndicatorSizeForBlock,
} from '../../highlights/constants';
import { contentTextWidth } from '../constants';

export const contentTextStyle = css`
  ${bodyCopyRegularStyle}

  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;

export default styled(MainContent)`
  ${contentTextStyle}
  font-size: 1.4rem;
  line-height: 2rem;
  overflow: visible;

  @media screen {
    flex: 1;
    display: flex;
    width: 100%;

    #${MAIN_CONTENT_ID} {
      overflow: visible;
      width: 100%;
    }

    /* trying to add margin to a page wrapper that
     * will collapse with the margin of the top element in the
     * page. can't add it to the page element because it is flexy,
     * or the main_content because page makes it flexy. those
     * need to be flexy to center the loading indicator
     */
    #${MAIN_CONTENT_ID} > [data-type="page"],
    #${MAIN_CONTENT_ID} > [data-type="composite-page"] {
      margin-top: ${theme.padding.page.desktop}rem;
      ${theme.breakpoints.mobile(css`
        margin-top: ${theme.padding.page.mobile}rem;
      `)}
    }
  }

  .highlight {
    position: relative;
    z-index: 1;
  }

  .MathJax_Display .highlight,
  .MathJax_Preview + .highlight {
    display: inline-block;
  }

  ${highlightStyles.map((style) => css`
    .highlight.${style.label} {
      background-color: ${style.passive};

      &.block {
        display: block;

        &:after {
          position: absolute;
          z-index: -1;
          content: "";
          display: block;
          top: -1rem;
          bottom: -1rem;
          left: -1rem;
          right: -1rem;
          background-color: ${style.passive};
        }

        &.first.has-note:before {
          position: absolute;
          top: -${highlightBlockPadding}rem;
          left: -${highlightBlockPadding}rem;
          content: "";
          width: 0;
          height: 0;
          opacity: 0.8;
          border-left: ${highlightIndicatorSizeForBlock}em solid ${style.focused};
          border-bottom: ${highlightIndicatorSizeForBlock}em solid transparent;
        }
      }

      &.first.text.has-note [data-for-screenreaders]:first-child {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        content: "";
        width: 0;
        height: 0;
        opacity: 0.8;
        border-left: ${highlightIndicatorSize}em solid ${style.focused};
        border-top: ${highlightIndicatorSize}em solid transparent;
        transform: rotate(90deg);
      }

      @media screen {
        &.focus {
          background-color: ${style.focused};

          ${Color(style.focused).isDark() && css`
            color: ${theme.color.text.white};
          `}

          &.block:after {
            background-color: ${style.focused};
          }

          &.first.text.has-note [data-for-screenreaders]:first-child {
            border: none;
          }
        }
      }
    }
  `)}

  @media screen {
    .search-highlight {
      font-weight: bold;
      background-color: #ffea00;

      &.focus {
        background-color: #ff9e4b;

        .search-highlight {
          background-color: unset;
        }
      }
    }
  }

  .os-figure,
  .os-figure:last-child {
    margin-bottom: 5px; /* fix double scrollbar bug */
  }

  #${MAIN_CONTENT_ID} * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;
