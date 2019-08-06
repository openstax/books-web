import React from 'react';
import { connect } from 'react-redux';
import Button from '../../components/Button';
import * as notifications from '../../notifications/actions';
import { Dispatch } from '../../types';
import Panel from './Panel';

interface Props {
  updateAvailable: () => void;
}

// tslint:disable-next-line:variable-name
const Notifications = ({updateAvailable}: Props) => <Panel title='Notifications'>
  <Button onClick={updateAvailable}>update available</Button>
</Panel>;

export default connect<{}, React.ComponentProps<typeof Notifications>>(
  () => ({}),
  (dispatch: Dispatch): Props => ({
    updateAvailable: () => dispatch(notifications.updateAvailable()),
  })
)(Notifications);
