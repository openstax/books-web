import { appMessageType } from './reducer';
import { AnyNotification, AppMessageNotification } from './types';

export const isAppMessage = (message: AnyNotification): message is AppMessageNotification =>
  message.type === appMessageType;
