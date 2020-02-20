import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import Button from '../../components/Button';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { clearCurrentError } from '../actions';
import { currentError, getErrorIdStack } from '../selectors';
import ErrorCard, { Footer } from './ErrorCard';

// tslint:disable-next-line:variable-name
const Mask = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.3);
`;

// tslint:disable-next-line:variable-name
const Modal = styled.div`
  top: 0;
  z-index: ${theme.zIndex.errorPopup};
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const CardWrapper = styled.div`
  z-index: 1;
`;

interface PropTypes {
  error?: Error;
  stack: string[];
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorModal = ({ error, clearError }: PropTypes) => {
  if (!error) { return null; }

  return (
    <Modal className='error-modal'>
      <CardWrapper>
        <ErrorCard
          footer={
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
          }
          clearError={clearError}
        />
      </CardWrapper>
      <Mask />
    </Modal>
  );
};

export default connect(
  (state: AppState) => ({
    error: currentError(state),
    stack: getErrorIdStack(state),
  }),
  (dispatch: Dispatch) => ({
    clearError: () => dispatch(clearCurrentError()),
  })
)(ErrorModal);
