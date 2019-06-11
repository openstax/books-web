import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import React, { ComponentType } from 'react';
import styled, { css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import { labelStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { ArchiveTree } from '../../../types';
import { splitTitleParts } from '../../../utils/archiveTreeUtils';
import ContentLinkComponent from '../../ContentLink';

export * from './wrapper';

const numberCharacterWidth = 1;
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
  ${labelStyle}
  display: flex;
  flex: 1;
`;

// tslint:disable-next-line:variable-name
export const ContentLink = styled(ContentLinkComponent)`
  ${tocLinkHover}
  ${labelStyle}
  display: flex;
  margin-left: ${iconSize}rem;
  text-decoration: none;

  li[aria-label="Current Page"] & {
    font-weight: 600;
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
  list-style: none;
  overflow: visible;
  margin: 1.7rem 0 0 0;
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
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }
`;

// tslint:disable-next-line:variable-name
export const SummaryWrapper = styled.div`
  display: flex;
`;

const getNumberWidth = (contents: ArchiveTree['contents']) => contents.reduce((result, {title}) => {
  const num = splitTitleParts(title)[0];

  if (!num) {
    return result;
  }
  const numbers = num.replace(/[\W]/, '');
  const periods = num.replace(/[^\.]/, '');

  return Math.max(result, numbers.length * numberCharacterWidth + periods.length * numberPeriodWidth);
}, 0);

// tslint:disable-next-line:variable-name
export const NavOl = styled.ol<{section: ArchiveTree}>`
  margin: 0;
  padding: 0;
  ${(props) => {
    const numberWidth = getNumberWidth(props.section.contents);

    return css`
      .os-number {
        width: ${numberWidth}rem;
        overflow: hidden;
      }

      .os-divider {
        width: 0.5rem;
        text-align: center;
        overflow: hidden;
      }

      .os-text {
        flex: 1;
        overflow: hidden;
      }

      ol {
        margin-left: ${numberWidth + 0.5}rem;
      }
    `;
  }}
`;

type DetailsComponentProps = {defaultOpen: boolean} & React.HTMLProps<HTMLDetailsElement>;
class DetailsComponent extends React.Component<DetailsComponentProps, {defaultOpen: boolean}> {
  constructor(props: DetailsComponentProps) {
    super(props);
    this.state = {defaultOpen: props.defaultOpen};
  }
  public render() {
    const {open, defaultOpen: _, ...props} = this.props;
    const {defaultOpen} = this.state;

    return <details {...props} open={open || defaultOpen} />;
  }
}

// tslint:disable-next-line:variable-name
export const Details = styled(DetailsComponent)`
  border: none;
  overflow: visible;
  ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
    &[open] > ${Summary} ${ExpandIcon} {
      display: none;
    }

    &:not([open]) > ${Summary} ${CollapseIcon} {
      display: none;
    }
  `}
`;
