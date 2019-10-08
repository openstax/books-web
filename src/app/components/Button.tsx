import styled, { css } from 'styled-components/macro';
import theme, { ColorSet } from '../theme';
import { contentFont } from './Typography';

const applyColor = (color: ColorSet) => `

  color: ${color.foreground};
  background-color: ${color.base};

  :hover {
    background-color: ${color.darker};
  }
  :active {
    background-color: ${color.darkest};
  }
`;

type Variant = 'primary' | 'secondary' | 'default';
type Size = 'large' | 'medium' | 'small';

// tslint:disable-next-line:variable-name
const Button = styled.button<{variant?: Variant, size?: Size}>`
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: ${contentFont};
  border-radius: 0.2rem;
  ${(props) => props.size === 'large' && `
    font-size: 1.6rem;
    height: 5rem;
    padding: 0 3rem;
  `}
  ${(props) => (props.size === 'medium' || props.size === undefined) && `
    min-width: 12rem;
    font-size: 1.6rem;
    height: 4rem;
    padding: 0 3rem;
  `}
  ${(props) => props.size === 'small' && `
    font-size: 1.4rem;
    height: 3rem;
    padding: 0 2rem;
  `}

  ${(props) => props.variant === 'primary' && `
    ${applyColor(theme.color.primary.orange)}
    font-weight: bold;
    border: none;
  `}
  ${(props) => props.variant === 'secondary' && `
    ${applyColor(theme.color.secondary.lightGray)}
    font-weight: bold;
    border: none;
  `}
  ${(props) => (props.variant === 'default' || props.variant === undefined) && `
    ${applyColor({
      ...theme.color.neutral,
      foreground: theme.color.primary.gray.base,
    })}
    border: 1px solid #d5d5d5;
    font-weight: regular;
  `}
`;

// tslint:disable-next-line:variable-name
export const ButtonGroup = styled.div`
  display: grid;
  overflow: visible;
  ${(props: {expand: boolean}) => props.expand === false && css`
    grid-auto-columns: min-content;
  `}
  grid-auto-flow: column;
  grid-gap: 1rem;
`;

export default Button;
