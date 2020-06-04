import React from 'react';
import { useDispatch } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import { setPlatform } from '../../platform/actions';
import Panel from './Panel';

export default () => {
  const dispatch = useDispatch();

  return <Panel title='Platform'>
    <ButtonGroup expand={false}>
      <Button onClick={() => dispatch(setPlatform('web'))} data-testid='set-web'>
        web
      </Button>
      <Button onClick={() => dispatch(setPlatform('android'))} data-testid='set-android'>
        android
      </Button>
      <Button onClick={() => dispatch(setPlatform('ios'))} data-testid='set-ios'>
        ios
      </Button>
    </ButtonGroup>
  </Panel>;
};
