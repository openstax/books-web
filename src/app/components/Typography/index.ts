import { css } from 'styled-components/macro';
import { textStyle } from './base';

export * from './base';
export * from './headings';

const linkColor = '#027EB5';
export const linkHover = '#0064A0';
export const linkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: underline;

  :hover {
    color: ${linkHover};
  }
`;
export const decoratedLinkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: none;

  :hover {
    text-decoration: underline;
    color: ${linkHover};
  }
`;

export const textRegularLineHeight = 2.5;
export const textRegularSize = css`
  font-size: 1.6rem;
  line-height: ${textRegularLineHeight}rem;
`;

export const textRegularStyle = css`
  ${textStyle}
  ${textRegularSize}
`;

export const bodyCopyRegularStyle = css`
  ${textRegularStyle}

  a {
    ${linkStyle}
  }
`;

export const labelStyle = css`
  ${textStyle}
  font-size: 1.4rem;
  line-height: 1.6rem;
  font-weight: normal;
`;
