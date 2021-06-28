import { MiddlewareAPI } from '../../../../types';
import { showConfirmationModal } from '../../../actions';
import { setForceScrollToHiglight } from '../../actions';

export default (
  dispatch: MiddlewareAPI['dispatch']): Promise<boolean> => new Promise((resolve) => {
    dispatch(showConfirmationModal({
      options: {
        bodyi18nKey: 'i18n:discard:body',
        callback: (confirmed: boolean) => {
          resolve(confirmed);
          if (!confirmed) {
            dispatch(setForceScrollToHiglight(true));
          }
        },
        cancelButtoni18nKey: 'i18n:discard:button:cancel',
        headingi18nKey: 'i18n:discard:heading',
        okButtoni18nKey: 'i18n:discard:button:discard',
      },
    }));
  });
