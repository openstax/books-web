import { css, FlattenSimpleInterpolation } from 'styled-components';
// based on https://sketchviewer.com/sketches/59766aabb57e8900114c89ce/latest/

export interface ColorSet {
  base: string;
  darker: string;
  darkest: string;
  foreground: string;
}
const textColors = {
  default: '#424242',
  label: '#6f6f6f',
  white: '#fff',
};

const padding = {
  page: {
    desktop: 3.2,
    mobile: 1.6,
  },
};

const color = {
  neutral: {
    base: '#fff',
    darker: '#fafafa',
    darkest: '#e5e5e5',
    foreground: textColors.default,
  },
  primary: {
    blue: {
      base: '#002468',
      foreground: textColors.white,
    },
    gray: {base: '#5e6062'},
    green: {base: '#63a524'},
    orange: {
      base: '#f36b32',
      darker: '#e96128',
      darkest: '#df571e',
      foreground: textColors.white,
    },
    yellow: {base: '#f4d019'},
  },
  secondary: {
    deepGreen: {base: '#0c9372'},
    gold: {base: '#fdbd3e'},
    lightBlue: {base: '#0dc0dc'},
    lightGray: {
      base: '#959595',
      darker: '#8b8b8b',
      darkest: '#818181',
      foreground: textColors.white,
    },
    red: {base: '#c22032'},
  },
  text: textColors,
};

const mobileQuery = '(max-width: 64em)';

export default {
  breakpoints: {
    mobile: (style: FlattenSimpleInterpolation) => css`
      @media ${mobileQuery} {
        ${style}
      }
    `,
    mobileQuery,
  },
  color,
  padding,
};
