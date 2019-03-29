import { connect } from 'react-redux';
import { css, FlattenSimpleInterpolation } from 'styled-components';
import theme from '../../../theme';
import { AppState } from '../../../types';
import * as selectors from '../../selectors';
import { State } from '../../types';

export const isOpenConnector = connect((state: AppState) => ({isOpen: selectors.tocOpen(state)}));

export const styleWhenSidebarClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {isOpen: State['tocOpen']}) => props.isOpen === null && theme.breakpoints.mobile(closedStyle)}
  ${(props: {isOpen: State['tocOpen']}) => props.isOpen === false && closedStyle}
`;
