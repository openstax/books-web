import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import ContentLink from '../../components/ContentLink';
import { modalQueryParameterName } from '../../constants';
import { modalUrlName } from '../../practiceQuestions/constants';
import { hasPracticeQuestions, practiceQuestionsEnabled } from '../../practiceQuestions/selectors';
import { bookAndPage } from '../../selectors';
import { toolbarIconColor } from '../constants';
import { buttonMinWidth } from './styled';
import { toolbarDefaultButton, toolbarDefaultText } from './styled';

// TODO: refactor the styling of Toolbar ContentLinks
// tslint:disable-next-line:variable-name
export const StyledContentLink = styled(ContentLink)`
  ${toolbarDefaultButton}
  text-decoration: none;
  padding: 0;
  align-items: center;
  color: ${toolbarIconColor.base};
  height: 100%;
  min-width: ${buttonMinWidth};

  :hover,
  :focus {
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsIcon = styled.img`
  padding: 0.2rem;
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsText = styled.span`
  ${toolbarDefaultText}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsButton = () => {
  const intl = useIntl();
  const isEnabled = useSelector(practiceQuestionsEnabled);
  const trackOpenClose = useAnalyticsEvent('openClosePracticeQuestions');
  const hasPracticeQs = useSelector(hasPracticeQuestions);
  const { book, page } = useSelector(bookAndPage);

  if (!isEnabled || !hasPracticeQs || !book || !page) { return null; }

  const text = intl.formatMessage({id: 'i18n:toolbar:practice-questions:button:text'});

  return <StyledContentLink
    book={book}
    page={page}
    persistentQueryParams={{ [modalQueryParameterName]: modalUrlName }}
    onClick={trackOpenClose}
    aria-label={text}>
    <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
    <PracticeQuestionsText>{text}</PracticeQuestionsText>
  </StyledContentLink>;
};

export default PracticeQuestionsButton;
