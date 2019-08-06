import { HTMLElement } from '@openstax/types/lib.dom';
import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import openstaxLogo from '../../../assets/logo.svg';
import * as authSelect from '../../auth/selectors';
import { User } from '../../auth/types';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import { assertString } from '../../utils';
import OnScroll, { OnScrollCallback } from '../OnScroll';
import * as Styled from './styled';

export { maxNavWidth, navDesktopHeight, navMobileHeight } from './styled';

if (typeof(window) !== 'undefined') {
  import(/* webpackChunkName: "focus-within-polyfill" */ 'ally.js/style/focus-within')
    .then((module) => module.default());
}

export class Dropdown extends React.Component<{user: User, currentPath: string}> {
  private overlay = React.createRef<HTMLElement>();

  public render() {
    const {user, currentPath} = this.props;
    return <OnScroll callback={this.blockScroll}>
      <Styled.DropdownOverlay tabIndex='-1' ref={this.overlay}>
        <Styled.OverlayLogo aria-hidden='true' src={openstaxLogo} />
        <div>
          <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
            {(msg: Element | string) => <Styled.OverlayHeading>{msg}</Styled.OverlayHeading>}
          </FormattedMessage>
          <Styled.DropdownList>
            <li>
              <FormattedMessage id='i18n:nav:profile:text'>
                {(msg: Element | string) => <a href='/accounts/profile' target='_blank'>{msg}</a>}
              </FormattedMessage>
            </li>
            <li>
              <FormattedMessage id='i18n:nav:logout:text'>
                {(msg: Element | string) => <a href={'/accounts/logout?r=' + currentPath}>{msg}</a>}
              </FormattedMessage>
            </li>
          </Styled.DropdownList>
        </div>
      </Styled.DropdownOverlay>
    </OnScroll>;
  }

  private blockScroll: OnScrollCallback = (e) => {
    if (typeof(window) === 'undefined' || !this.overlay.current) {
      return;
    }

    const style = window.getComputedStyle(this.overlay.current);
    const visible = style.height !== '0px';

    if (visible) {
      e.preventDefault();
    }
  };
}

// tslint:disable-next-line:variable-name
const DropdownToggle: SFC<{user: User}> = ({user}) =>
  <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
    {(msg: Element | string) => <Styled.DropdownToggle tabIndex='0' data-testid='user-nav-toggle'>
      {msg}
      <Styled.DownIcon aria-hidden='true' />
      <Styled.HamburgerIcon ariaHidden='true' />
    </Styled.DropdownToggle>}
  </FormattedMessage>;

// tslint:disable-next-line:variable-name
const LoggedInState: SFC<{user: User, currentPath: string}> = ({user, currentPath}) =>
  <Styled.DropdownContainer data-testid='user-nav'>
    <DropdownToggle user={user} />
    <Dropdown user={user} currentPath={currentPath} />
    <Styled.TimesIcon />
  </Styled.DropdownContainer>;

// tslint:disable-next-line:variable-name
const LoggedOutState: SFC<{currentPath: string}> = ({currentPath}) => <FormattedMessage id='i18n:nav:login:text'>
  {(msg: Element | string) => <Styled.Link href={'/accounts/login?r=' + currentPath} data-testid='nav-login'>
    {msg}
  </Styled.Link>}
</FormattedMessage>;

interface NavigationBarProps {
  user?: User;
  loggedOut: boolean;
  currentPath: string;
}
// tslint:disable-next-line:variable-name
const NavigationBar = ({user, loggedOut, currentPath}: NavigationBarProps) =>
  <Styled.BarWrapper>
    <Styled.TopBar data-testid='navbar'>
      <FormattedMessage id='i18n:nav:logo:alt'>
        {(msg: Element | string) => <a href='/'>
          <Styled.HeaderImage role='img' src={openstaxLogo} alt={assertString(msg, 'alt text must be a string')} />
        </a>}
      </FormattedMessage>
      {loggedOut && <LoggedOutState currentPath={currentPath} />}
      {user && <LoggedInState user={user} currentPath={currentPath} />}
    </Styled.TopBar>
  </Styled.BarWrapper>;

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    loggedOut: authSelect.loggedOut(state),
    user: authSelect.user(state),
  })
)(NavigationBar);
