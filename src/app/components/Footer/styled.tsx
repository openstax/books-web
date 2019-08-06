import styled, { css } from 'styled-components/macro';
import { FacebookF } from 'styled-icons/fa-brands/FacebookF';
import { Instagram } from 'styled-icons/fa-brands/Instagram';
import { LinkedinIn } from 'styled-icons/fa-brands/LinkedinIn';
import { Twitter } from 'styled-icons/fa-brands/Twitter';
import { textRegularSize, textRegularStyle } from '../../components/Typography';
import { contentWrapperMaxWidth } from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';

const desktopMinWidth = '37.6';
const mobileMaxWidth = '60.1';
const mobileMinWidth = '37.5';

export const columnLink = css`
  color: inherit;
`;

export const iconStyles = css`
  height: 1em;
`;

// tslint:disable-next-line:variable-name
export const FBIcon = styled(FacebookF)`
  ${iconStyles}
`;

// tslint:disable-next-line:variable-name
export const TwitterIcon = styled(Twitter)`
  ${iconStyles}
`;

// tslint:disable-next-line:variable-name
export const IGIcon = styled(Instagram)`
  ${iconStyles}
`;

// tslint:disable-next-line:variable-name
export const LinkedInIcon = styled(LinkedinIn)`
  ${iconStyles}
`;

const boxedMargin = 1.5;
export const boxed = css`
  max-width: ${contentWrapperMaxWidth + boxedMargin * 2}rem;
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  margin: 0 auto;
  padding-left: ${boxedMargin}rem;
  padding-right: ${boxedMargin}rem;
  width: 100%;
`;

// tslint:disable-next-line:variable-name
export const FooterWrapper = styled.footer`
  ${textRegularStyle}
  z-index: 0;
  opacity: 1;
  transition: opacity 0.2s;
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const InnerFooter = styled.div`
  color: #d5d5d5;
  display: grid;
`;

// tslint:disable-next-line:variable-name
export const FooterTop = styled.div`
  background-color: #424242;

  @media (min-width: ${mobileMaxWidth}em) {
    padding: 7rem 0;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 2rem 0;
  }

  @media (max-width: ${mobileMaxWidth}em) and (min-width: ${desktopMinWidth}em) {
    padding: 4rem 0;
  }
`;

// tslint:disable-next-line:variable-name
export const TopBoxed = styled.div`
  ${boxed}
  display: grid;
  grid-row-gap: 2rem;
  overflow: visible;

  @media (min-width: ${desktopMinWidth}em) {
    align-items: start;
    grid-column-gap: 4rem;
    grid-template: "headline col1 col2 col3" "mission col1 col2 col3"/minmax(auto, 50rem) auto auto auto;
  }

  @media (max-width: ${mobileMinWidth}em) {
    grid-template: "headline" "mission" "col1" "col2" "col3";
  }

  @media (min-width: ${mobileMaxWidth}em) {
    grid-column-gap: 8rem;
  }
`;

// tslint:disable-next-line:variable-name
export const Heading = styled.div`
  grid-area: headline;

  @media (min-width: ${desktopMinWidth}em) {
    font-size: 2.4rem;
    font-weight: bold;
    letter-spacing: -0.096rem;
    line-height: normal;
  }

  @media (max-width: ${mobileMinWidth}em) {
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: -0.08rem;
    line-height: normal;
  }
`;

// tslint:disable-next-line:variable-name
const DonateLink = css`
  ${columnLink}
  font-weight: bold;
  text-underline-position: under;
`;

// tslint:disable-next-line:variable-name
export const Mission = styled.div`
  grid-area: mission;

  @media (min-width: ${desktopMinWidth}em) {
    font-size: 1.8rem;
    font-weight: normal;
    letter-spacing: normal;
    line-height: 3rem;
  }

  a {
    ${DonateLink}
  }
`;

// tslint:disable-next-line:variable-name
export const FooterLink = styled.a`
  ${columnLink}
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }

  @media (max-width: ${mobileMinWidth}em) {
    line-height: 4.5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const BottomLink = styled.a`
  ${columnLink}
  display: inline-grid;
  grid-auto-flow: column;
  grid-column-gap: 0.7rem;
  overflow: hidden;
`;

export const column = css`
  display: grid;
  grid-gap: 0.5rem;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const Column1 = styled.div`
  ${column}
  grid-area: col1;
`;

// tslint:disable-next-line:variable-name
export const Column2 = styled.div`
  ${column}
  grid-area: col2;
`;

// tslint:disable-next-line:variable-name
export const Column3 = styled.div`
  ${column}
  grid-area: col3;
`;

// tslint:disable-next-line:variable-name
export const ColumnHeading = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: -0.072rem;
  line-height: normal;

  @media (max-width: ${mobileMinWidth}em) {
    line-height: 4.5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const FooterBottom = styled.div`
  font-size: 1.2rem;
  font-weight: normal;
  letter-spacing: normal;
  line-height: normal;
  background-color: #3b3b3b;

  @media (min-width: ${desktopMinWidth}em) {
    padding: 2.5rem 0;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 1.5rem;
  }
`;

// tslint:disable-next-line:variable-name
export const BottomBoxed = styled.div`
  ${boxed}
  display: grid;
  grid-gap: 1.5rem 4rem;
  overflow: visible;

  @media (min-width: ${desktopMinWidth}em) {
    grid-auto-flow: column;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const Copyrights = styled.div`
  display: grid;
  grid-gap: 1rem;
  overflow: visible;

  [data-html="copyright"] {
    overflow: visible;
  }

  a {
    ${columnLink}
    overflow: visible;
  }

  sup {
    font-size: 66%;
    margin-left: 0.1rem;
    position: relative;
    top: -0.25em;
    vertical-align: top;
  }
`;

// tslint:disable-next-line:variable-name
export const Social = styled.div`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 1rem;
  justify-content: end;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const SocialIcon = styled.a`
  ${columnLink}
  ${textRegularSize}
  background-color: #959595;
  align-content: center;
  border-radius: 50%;
  display: grid;
  height: 3rem;
  justify-content: center;
  overflow: hidden;
  width: 3rem;
`;

// tslint:disable-next-line:variable-name
export const FooterLogo = styled.img`
  height: 4rem;
  transform: translateY(0.2rem);
`;
