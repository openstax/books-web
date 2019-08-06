import { css } from 'styled-components/macro';
import theme from '../../theme';

export const contentFont = 'Neue Helvetica W01';
export const textStyle = css`
  font-family: ${contentFont};
  color: ${theme.color.text.default};
`;
