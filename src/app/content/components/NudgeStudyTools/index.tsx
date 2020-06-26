import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useDebouncedMatchMobileQuery } from '../../../reactUtils';
import { assertDocument, assertNotNull } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import { showNudgeStudyTools } from '../../selectors';
import { hasStudyGuides as hasStudyGuidesSelector } from '../../studyGuides/selectors';
import arrowDesktop from './assets/arrowDesktop.svg';
import arrowMobile from './assets/arrowMobile.svg';
import {
  NudgeArrow,
  NudgeCloseButton,
  NudgeCloseIcon,
  NudgeContent,
  NudgeContentWrapper,
  NudgeHeading,
  NudgeText,
  NudgeWrapper,
  Spotlight,
  Container,
  InnerContainer,
  FittingSizeContainer
} from './styles';
import {
  setNudgeStudyToolsCookies,
  shouldDisplayNudgeStudyTools,
  useIncrementPageCounter,
} from './utils';
import StudyGuidesButton from '../Toolbar/StudyGuidesButton';
import HighlightButton from '../Toolbar/HighlightButton';

// tslint:disable-next-line: variable-name
const NudgeStudyTools = () => {
  const body = React.useRef(assertNotNull(assertDocument().querySelector('body'), 'body element is not defined'));
  const isMobile = useDebouncedMatchMobileQuery();
  const show = useSelector(showNudgeStudyTools);
  const hasStudyGuides = useSelector(hasStudyGuidesSelector);
  const trackOpen = useAnalyticsEvent('openNudgeStudyTools');
  const dispatch = useDispatch();

  useIncrementPageCounter();

  React.useEffect(() => {
    if (
      show === null
      && hasStudyGuides
      && shouldDisplayNudgeStudyTools()
    ) {
      setNudgeStudyToolsCookies();
      trackOpen();
      dispatch(openNudgeStudyTools());
    }
  }, [show, hasStudyGuides, trackOpen, dispatch]);

  React.useEffect(() => {
    if (show) {
      body.current.style.overflow = 'hidden';
    }
    // body.current will not change because it is not pointing to a react component
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { body.current.style.overflow = null; };
  }, [body, show]);

  return !show && false
      ? <><StudyGuidesButton /><HighlightButton /></>
      : <Container>
          <Spotlight><StudyGuidesButton /><HighlightButton /></Spotlight>
          <InnerContainer>
            <FormattedMessage id='i18n:nudge:study-tools:aria-label'>
              {(msg: string) => <NudgeWrapper
                aria-label={msg}
                data-analytics-region='Nudge Study Tools'
              >
                <FittingSizeContainer>
                <NudgeArrow
                  src={isMobile ? arrowMobile : arrowDesktop}
                  alt=''
                />
                <NudgeCloseButton
                  onClick={() => dispatch(closeNudgeStudyTools())}
                  data-analytics-label='close'
                ><NudgeCloseIcon />
                </NudgeCloseButton>
                </FittingSizeContainer>
                
                  
                <NudgeContentWrapper>
                  <NudgeContent>
                    <NudgeHeading />
                    <NudgeText />
                  </NudgeContent>
                </NudgeContentWrapper>
              </NudgeWrapper>}
            </FormattedMessage>
          </InnerContainer>
      </Container>
};

export default NudgeStudyTools;
