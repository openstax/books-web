import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../test/TestContainer';
import { resetModules } from '../../../../test/utils';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import Toast from '../../../notifications/components/ToastNotifications/Toast';
import { ToastNotification } from '../../../notifications/types';
import ToastNotifications from './ToastNotifications';

describe('ToastNotifications', () => {
  beforeEach(() => {
    resetModules();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <ToastNotifications />
    </TestContainer>);

    const tree = component.toJSON();

    expect(component.root.findAllByType(Toast).length).toBe(0);
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshots with toasts', () => {
    const toasts: ToastNotification[] = [{
      destination: 'myHighlights',
      messageKey: toastMessageKeys.higlights.failure.delete,
      shouldAutoDismiss: true,
      timestamp: 1,
    }, {
      destination: 'myHighlights',
      errorId: 'error-id',
      messageKey: toastMessageKeys.higlights.failure.update.annotation,
      shouldAutoDismiss: true,
      timestamp: 2,
    }];

    const component = renderer.create(<TestContainer>
      <ToastNotifications toasts={toasts} />
    </TestContainer>);

    const tree = component.toJSON();

    expect(component.root.findAllByType(Toast).length).toBe(2);
    expect(tree).toMatchSnapshot();
  });
});
