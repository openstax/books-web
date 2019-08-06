import styled, { css } from 'styled-components/macro';
import theme from '../../theme';
import { textStyle } from './base';

const headingStyle = (fontSize: string, lineHeight: string, topPadding: string) => css`
  ${textStyle}
  font-size: ${fontSize};
  line-height: ${lineHeight};
  letter-spacing: -0.02rem;
  padding: ${topPadding} 0 1rem 0;
  margin: 0;
`;

export const H1 = styled.h1`
  ${headingStyle('4.8rem', '5rem', '0')}
`;

export const H2 = styled.h2`
  ${headingStyle('3.6rem', '4rem', '2rem')}
`;

const h3MobileFontSize = 1.6;
export const h3MobileLineHeight = 2;
export const h3Style = css`
  ${headingStyle('2.4rem', '3rem', '1.5rem')}
  ${theme.breakpoints.mobile(css`
    font-size: ${h3MobileFontSize}rem;
    line-height: ${h3MobileLineHeight}rem;
  `)}
`;

export const H3 = styled.h3`
  ${h3Style}
`;

export const h4DesktopStyle = css`
  ${headingStyle('1.8rem', '2.5rem', '1rem')}
`;
export const h4MobileStyle = css`
  ${headingStyle(`1.6rem`, '2rem', '1rem')}
`;
export const h4Style = css`
  ${h4DesktopStyle}
  ${theme.breakpoints.mobile(h4MobileStyle)}
`;
