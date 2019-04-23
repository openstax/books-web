import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import openstaxLogo from '../../assets/logo.svg';
import { h4Style } from '../components/Typography';
import theme from '../theme';
import { assertString } from '../utils';
import {User} from '../auth/types';
import * as authSelect from '../auth/selectors';
import {AppState} from '../types';

export const maxNavWidth = 117;
export const navDesktopHeight = 5;
export const navMobileHeight = 3.6;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${navDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  ${theme.breakpoints.mobile(css`
    height: ${navMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const HeaderImage = styled.img`
  display: block;
  width: auto;
  height: 3rem;
  ${theme.breakpoints.mobile(css`
    height: 2rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const LoginTxt = styled.a`
  ${h4Style}
  text-decoration: none;
  font-weight: bold;
  color: ${theme.color.primary.gray.base};

  :hover {
    color: ${theme.color.primary.gray.darker};
  }

  padding: 1rem 0;

  :hover,
  :active,
  :focus {
    padding-bottom: 0.6rem;
    border-bottom: 0.4rem solid ${theme.color.primary.green.base};
  }

  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    font-weight: normal;
    padding: 0.7rem 0;

    :hover,
    :active,
    :focus {
      padding-bottom: 0.3rem;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  z-index: 5; /* above book nav */
  background: ${theme.color.neutral.base};
  position: relative; /* drop shadow above notifications */
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const NavigationBar: SFC<{user?: User, loggedOut: boolean}> = ({user, loggedOut}) =>
  <BarWrapper>
    <TopBar>
      <FormattedMessage id='i18n:nav:logo:alt'>
        {(msg: Element | string) => <a href='/'>
          <HeaderImage role='img' src={openstaxLogo} alt={assertString(msg, 'alt text must be a string')} />
        </a>}
      </FormattedMessage>
      {loggedOut && <FormattedMessage id='i18n:nav:login:text'>
        {(msg: Element | string) => <LoginTxt href='/accounts/login'>{msg}</LoginTxt>}
      </FormattedMessage>}
      {user && <FormattedMessage id='i18n:nav:logout:text'>
        {(msg: Element | string) => <LoginTxt href='/accounts/logout'>{msg}</LoginTxt>}
      </FormattedMessage>}
    </TopBar>
  </BarWrapper>;

export default connect(
  (state: AppState) => ({
    user: authSelect.user(state),
    loggedOut: authSelect.loggedOut(state),
  })
)(NavigationBar);
