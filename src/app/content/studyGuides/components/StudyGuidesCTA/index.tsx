import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import {
  loggedOut,
  loginLink as loginLinkSelector,
  signupLink as signupLinkSelector,
} from '../../../../auth/selectors';
import htmlMessage from '../../../../components/htmlMessage';
import arrowDesktop from './assets/arrow-desktop.svg';
import arrowMobile from './assets/arrow-mobile.svg';
import * as Styled from './styles';

// tslint:disable-next-line:variable-name
const StudyGuidesCTATitle = htmlMessage('i18n:studyguides:cta:title', Styled.StudyGuidesCTATitle);

// tslint:disable-next-line:variable-name
const StudyGuidesCTAInfo = htmlMessage('i18n:studyguides:cta:info', Styled.StudyGuidesCTAInfo);

// tslint:disable-next-line: variable-name
const StudyGuidesCTA = () => {
  const isNotLoggedIn = useSelector(loggedOut);
  const loginLink = useSelector(loginLinkSelector);
  const signupLink = useSelector(signupLinkSelector);

  if (!isNotLoggedIn) { return null; }

  return <Styled.StudyGuidesCTAWrapper>
    <Styled.StudyGuidesCTAContent>
      <StudyGuidesCTATitle />
      <Styled.StudyGuidesCTAButtons>
        <FormattedMessage id='i18n:studyguides:cta:button'>
          {(msg: Element | string) => <Styled.StudyGuidesCTAButton
            // eslint-disable-next-line
            component={<a href={signupLink}/>}
          >{msg}</Styled.StudyGuidesCTAButton>}
        </FormattedMessage>
        <Styled.StudyGuidesCTAButtonsSecondary>
          <Styled.StudyGuidesCTASeparator>
            <FormattedMessage id='i18n:studyguides:cta:separator'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.StudyGuidesCTASeparator>
          <FormattedMessage id='i18n:studyguides:cta:login'>
            {(msg: Element | string) => <Styled.StudyGuidesCTALink
              href={loginLink}
            >{msg}</Styled.StudyGuidesCTALink>}
          </FormattedMessage>
        </Styled.StudyGuidesCTAButtonsSecondary>
      </Styled.StudyGuidesCTAButtons>
    </Styled.StudyGuidesCTAContent>
    <Styled.StudyGuidesCTAInfoWrapper>
      <StudyGuidesCTAInfo />
      <Styled.StudyGuidesCTAArrowDesktop src={arrowDesktop} alt='' />
      <Styled.StudyGuidesCTAArrowMobile src={arrowMobile} alt='' />
    </Styled.StudyGuidesCTAInfoWrapper>
  </Styled.StudyGuidesCTAWrapper>;
};

export default StudyGuidesCTA;
