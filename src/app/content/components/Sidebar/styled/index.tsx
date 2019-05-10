import React, { ComponentType } from 'react';
import styled, { css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import { textStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { ArchiveTree } from '../../../types';
import { splitTitleParts } from '../../../utils/archiveTreeUtils';
import ContentLinkComponent from '../../ContentLink';

export * from './wrapper';

const numberCharacterWidth = 0.8;
const numberPeriodWidth = 0.2;
const iconSize = 1.7;
const tocLinkHover = css`
  :hover {
    color: ${theme.color.text.black};
  }
`;

// tslint:disable-next-line:variable-name
export const SummaryTitle = styled.span`
  ${tocLinkHover}
  font-size: 1.4rem;
  line-height: 1.6rem;
  font-weight: normal;
  width: 100%;
  display: flex;
`;

// tslint:disable-next-line:variable-name
export const ContentLink = styled(ContentLinkComponent)`
  ${textStyle}
  ${tocLinkHover}
  display: flex;
  margin-left: ${iconSize}rem;
  text-decoration: none;

  li[aria-label="Current Page"] & {
    font-weight: bold;
  }
`;

// tslint:disable-next-line:variable-name
export const NavItemComponent: ComponentType<{active?: boolean, className?: string}> = React.forwardRef(
  ({active, className, children}, ref) => <li
    ref={ref}
    className={className}
    {...(active ? {'aria-label': 'Current Page'} : {})}
  >{children}</li>
);

// tslint:disable-next-line:variable-name
export const NavItem = styled(NavItemComponent)`
  ${textStyle}
  list-style: none;
  font-size: 1.4rem;
  line-height: 1.6rem;
  overflow: visible;
  margin: 0 0 1.5rem 0;
`;

const expandCollapseIconStyle = css`
  height: ${iconSize}rem;
  width: ${iconSize}rem;
  margin-right: 0;
`;

// tslint:disable-next-line:variable-name
export const ExpandIcon = styled(CaretRight)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
export const CollapseIcon = styled(CaretDown)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
export const Summary = styled.summary`
  display: flex;
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }
`;

const getNumberWidth = (contents: ArchiveTree['contents']) => contents.reduce((result, {title}) => {
  const num = splitTitleParts(title)[0];

  if (!num) {
    return result;
  }

  const numbers = num.replace(/[^0-9]/, '');
  const periods = num.replace(/[^\.]/, '');

  return Math.max(result, numbers.length * numberCharacterWidth + periods.length * numberPeriodWidth);
}, 0);

// tslint:disable-next-line:variable-name
export const NavOl = styled.ol<{section: ArchiveTree}>`
  margin: 0;
  padding: 0 3rem 0 0;
  ${(props) => {
    const numberWidth = getNumberWidth(props.section.contents);

    return css`
      .os-number {
        width: ${numberWidth}rem;
      }

      .os-divider {
        width: 0.5rem;
      }

      .os-text {
        flex: 1;
      }

      ol {
        margin-left: ${numberWidth + 0.5}rem;
      }
    `;
  }}
`;

// tslint:disable-next-line:variable-name
export const Details = styled.details`
  border: none;
  overflow: visible;
  ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
    &[open] > ${Summary} > ${ExpandIcon} {
      display: none;
    }

    &:not([open]) > ${Summary} > ${CollapseIcon} {
      display: none;
    }
  `}

  ${NavItem} {
    margin-bottom: 1.2rem;

    :first-child {
      margin-top: 1.5rem;
    }

    :last-child {
      margin-bottom: 0;
    }
  }
`;
