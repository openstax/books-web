import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { FirstArgumentType } from '../../../types';
import Modal from '../../components/Modal';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header } from '../../styles/PopupStyles';
import { closeStudyGuides } from '../actions';
import { studyGuidesOpen } from '../selectors';
import ShowStudyGuides from './ShowStudyGuides';

// tslint:disable-next-line: variable-name
const StudyguidesPopUp = () => {
  const dispatch = useDispatch();

  const popUpRef = React.useRef<HTMLElement>(null);
  const trackClose = useAnalyticsEvent('closeStudyGuides');
  const isStudyGuidesOpen = useSelector(studyGuidesOpen) || false;
  const bookTheme = useSelector(bookThemeSelector);

  const closeAndTrack = React.useCallback((method: FirstArgumentType<typeof trackClose>) => () => {
    dispatch(closeStudyGuides());
    trackClose(method);
  }, [dispatch, trackClose]);

  useOnEsc(popUpRef, isStudyGuidesOpen, closeAndTrack('esc'));

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && isStudyGuidesOpen) {
      popUp.focus();
    }
  }, [isStudyGuidesOpen]);

  return isStudyGuidesOpen ?
    <Modal
      ref={popUpRef}
      tabIndex='-1'
      data-testid='studyguides-popup-wrapper'
      scrollLockProps={{
        mobileOnly: false,
        onClick: closeAndTrack('overlay'),
        overlay: true,
        zIndex: theme.zIndex.highlightSummaryPopup,
      }}
    >
      <Header colorSchema={bookTheme}>
        <FormattedMessage id='i18n:toolbar:studyguides:popup:heading'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
        <FormattedMessage id='i18n:toolbar:studyguides:popup:close-button:aria-label'>
          {(msg: string) => (
            <CloseIconWrapper
              data-testid='close-studyguides-popup'
              aria-label={msg}
              onClick={closeAndTrack('button')}
            >
              <CloseIcon colorSchema={bookTheme} />
            </CloseIconWrapper>
          )}
        </FormattedMessage>
      </Header>
      <ShowStudyGuides />
    </Modal>
    : null;
};

export default StudyguidesPopUp;
