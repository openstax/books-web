import * as Cookies from 'js-cookie';
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css, keyframes } from 'styled-components';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { user as userSelector } from '../../../../auth/selectors';
import { PlainButton } from '../../../../components/Button';
import htmlMessage from '../../../../components/htmlMessage';
import { linkStyle, textRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';

// This is copied from CallToActionPopup > styles.tsx
// Wher should we store this kind of functions?
const slideInFromBottom = keyframes`
  0% {
    bottom: -100%;
  }

  100% {
    bottom: 0;
  }
`;

const slideInAnimation = css`
  animation: ${800}ms ${slideInFromBottom} ease-out;
`;

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  z-index: ${theme.zIndex.highlightsHelpInfoMobile};
  ${textRegularStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 6rem;
  padding: 0 2rem;
  background-color: ${theme.color.neutral.formBackground};
  border: 1px solid ${theme.color.neutral.formBorder};
  ${slideInAnimation}

  a {
    ${linkStyle}
    text-decoration: none;
  }

  @media screen and (min-width: ${theme.breakpoints.mobileBreak}em) {
    display: none;
  }
`;

// tslint:disable-next-line: variable-name
export const CloseIcon = styled(Times)`
  color: ${theme.color.secondary.lightGray.darkest};
  width: 1.4rem;
`;

export const cookieId = 'highlights_help_info_dissmised';
export const timeBeforeShow = 1000;

// tslint:disable-next-line: variable-name
const Message = htmlMessage(
  'i18n:toolbar:highlights:popup:help-info',
  (props) => <span {...props} />);

// tslint:disable-next-line:variable-name
const HighlightsHelpInfo = () => {
  const [show, setShow] = React.useState(false);
  const user = useSelector(userSelector);
  const trackShowHelpInfo = useAnalyticsEvent('showHelpInfo');

  const dismiss = () => {
    Cookies.set(cookieId, 'true');
    setShow(false);
  };

  React.useEffect(() => {
    setTimeout(() => {
      if (Boolean(Cookies.get(cookieId))) { return; }
      setShow(true);
      trackShowHelpInfo();
    }, timeBeforeShow);
  }, []);

  if (!show || !user) { return null; }

  return <Wrapper data-analytics-region='Mobile MH help info'>
    <Message />
    <PlainButton onClick={dismiss} data-analytics-label='close'>
      <CloseIcon />
    </PlainButton>
  </Wrapper>;
};

export default HighlightsHelpInfo;
