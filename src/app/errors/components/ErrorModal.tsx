import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import Button from '../../components/Button';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import Modal from '../../components/Modal';
import { modalPadding } from '../../components/Modal/styles';
import { Dispatch } from '../../types';
import { AppState } from '../../types';
import { clearCurrentError } from '../actions';
import { currentError } from '../selectors';

// tslint:disable-next-line:variable-name
const BodyErrorText = styled.div`
  padding: ${modalPadding * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

// tslint:disable-next-line:variable-name
const Footer = styled.div`
  padding-top: ${modalPadding}rem;
  display:flex;
`;

interface PropTypes {
  error?: Error;
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorModal = ({ error, clearError }: PropTypes) => {
  if (!error) { return null; }

  return (
    <Modal
      className='error-modal'
      heading='i18n:error:boundary:heading'
      subheading='i18n:error:boundary:sub-heading'
      onModalClose={clearError}
    >
      <BodyWithLink values={{supportCenterLink}}/>
      <Footer>
        <FormattedMessage id='i18n:error:boundary:action-btn-text'>
          {(msg) => <Button
            data-testid='clear-error'
            onClick={clearError}
            variant='primary'
            > {msg}
          </Button>}
        </FormattedMessage>
      </Footer>
    </Modal>
  );
};

export default connect(
  (state: AppState) => ({ error: currentError(state) }),
  (dispatch: Dispatch) => ({
    clearError: () => dispatch(clearCurrentError()),
  })
)(ErrorModal);
