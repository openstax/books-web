import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export interface Message {
  id: string;
  html: string;
  dismissable: boolean;
  start_at: string | null;
  end_at: string | null;
  url_regex: string | null;
}

export interface AppMessageNotification {
  type: 'Notification/appMessage';
  payload: Message;
}

export type Messages = Message[];

export type ModalNotification = ActionType<Pick<typeof actions, 'updateAvailable' | 'acceptCookies' >>
  | AppMessageNotification;

export interface ToastNotification {
  messageKey: string;
  timestamp: number;
  shouldAutoDismiss: boolean;
}

export type AnyNotification = ModalNotification | ToastNotification;

export interface State {
  modalNotifications: ModalNotification[];
  toastNotifications: ToastNotification[];
}
