import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import ScrollLock from '../../../components/ScrollLock';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { assertWindow } from '../../../utils';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header, Modal, PopupWrapper } from '../../styles/PopupStyles';
import { closePracticeQuestions } from '../actions';
import * as pqSelectors from '../selectors';
import ShowPracticeQuestions from './ShowPracticeQuestions';

// tslint:disable-next-line: variable-name
const PracticeQuestionsPopup = () => {
  const dispatch = useDispatch();
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenClosePQ = useAnalyticsEvent('openClosePracticeQuestions');
  const isPracticeQuestionsOpen = useSelector(pqSelectors.practiceQuestionsOpen);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const bookTheme = useSelector(bookThemeSelector);
  const intl = useIntl();

  const closeAndTrack = React.useCallback((method: string) => () => {
    if (currentQuestionIndex !== null) {
      const message = intl.formatMessage({ id: 'i18n:practice-questions:popup:warning-before-close' });
      if (!assertWindow().confirm(message)) { return; }
    }
    dispatch(closePracticeQuestions());
    trackOpenClosePQ(method);
  }, [dispatch, currentQuestionIndex, trackOpenClosePQ, intl]);

  useOnEsc(popUpRef, isPracticeQuestionsOpen, closeAndTrack('esc'));

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && isPracticeQuestionsOpen) {
      popUp.focus();
    }
  }, [isPracticeQuestionsOpen]);

  return isPracticeQuestionsOpen ? (
    <PopupWrapper>
      <ScrollLock
        overlay={true}
        mobileOnly={false}
        zIndex={theme.zIndex.highlightSummaryPopup}
        onClick={closeAndTrack('overlay')}
      />
      <Modal
        ref={popUpRef}
        tabIndex='-1'
        data-testid='practice-questions-popup-wrapper'
      >
        <Header colorSchema={bookTheme}>
          <FormattedMessage id='i18n:practice-questions:popup:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <FormattedMessage id='i18n:practice-questions:popup:close'>
            {(msg: string) => (
              <CloseIconWrapper
                data-testid='close-practice-questions-popup'
                aria-label={msg}
                onClick={closeAndTrack('button')}
              >
                <CloseIcon colorSchema={bookTheme} />
              </CloseIconWrapper>
            )}
          </FormattedMessage>
        </Header>
        <ShowPracticeQuestions />
      </Modal>
    </PopupWrapper>
  ) : null;
};

export default PracticeQuestionsPopup;
