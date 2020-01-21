import flow from 'lodash/fp/flow';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import { recordError } from '../../errors/actions';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import demoAppMessages from '../sample-app-messages.json';
import Panel from './Panel';

interface Props {
  updateAvailable: () => void;
  error: (error: Error) => void;
  sendMessages: () => void;
  acceptCookies: () => void;
}

// tslint:disable-next-line:variable-name
const Notifications = ({updateAvailable, error, sendMessages, acceptCookies}: Props) => {
  const [showError, setError] = useState(false);

  if (showError) {
    throw new Error('test error');
  }

  return <Panel title='Notifications'>
    <ButtonGroup expand={false}>

      <Button onClick={acceptCookies} >accept cookies</Button>

      <Button onClick={updateAvailable} data-testid='trigger-updates-available'>update available</Button>
      <Button onClick={sendMessages} data-testid='trigger-messages'>app messages</Button>
      <Button onClick={() => setError(true)} data-testid='trigger-inline-error'>inline error</Button>
      <Button onClick={() => error(new Error('this is an error'))} data-testid='trigger-modal-error'>
        modal error
      </Button>
    </ButtonGroup>
  </Panel>;
};

export default connect<{}, React.ComponentProps<typeof Notifications>>(
  () => ({}),
  (dispatch: Dispatch): Props => ({
    acceptCookies: flow(notifications.acceptCookies, dispatch),
    error: (error: Error) => dispatch(recordError({error})) ,
    sendMessages: () => dispatch(notifications.receiveMessages(demoAppMessages)),
    updateAvailable: flow(notifications.updateAvailable, dispatch),
  })
)(Notifications);
