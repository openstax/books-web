import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import NextSectionMessage from './NextSectionMessage';

// tslint:disable-next-line: variable-name
const StyledEmptyScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 38rem;
  margin: 2rem auto;
  flex: 1;
  text-align: center;
  ${textRegularStyle}

  > span {
    margin-bottom: 3rem;
  }
`;

interface EmptyScreenProps {
  nextSection: LinkedArchiveTreeSection;
}

// tslint:disable-next-line: variable-name
const EmptyScreen = ({ nextSection }: EmptyScreenProps) => {
  const dispatch = useDispatch();

  return <StyledEmptyScreen>
    <span>
      <FormattedMessage id='i18n:practice-questions:popup:empty:message'>
        {(msg: string) => msg}
      </FormattedMessage>
    </span>
    <NextSectionMessage
      nextSection={nextSection}
      messageKey='i18n:practice-questions:popup:empty:next-section'
      onClick={() => dispatch(setSelectedSection(nextSection))}
    />
  </StyledEmptyScreen>;
};

export default EmptyScreen;
