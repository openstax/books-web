import { locationChange } from '../../navigation/actions';
import { ActionHookBody } from '../../types';
import { actionHook, assertDefined } from '../../utils';

export const hookBody: ActionHookBody<typeof locationChange> = () => () => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const head = assertDefined(document.head, 'document must have a head');

  head.querySelectorAll('meta[data-rex-page]').forEach((tag) => tag.remove());
};

export default actionHook(locationChange, hookBody);
