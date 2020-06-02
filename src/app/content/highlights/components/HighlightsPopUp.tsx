import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import notLoggedImage1 from '../../../../assets/My_Highlights_page_empty_1.png';
import notLoggedImage2 from '../../../../assets/My_Highlights_page_empty_2.png';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import * as authSelect from '../../../auth/selectors';
import { User } from '../../../auth/types';
import ScrollLock from '../../../components/ScrollLock';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { CloseIcon, CloseIconWrapper, Header, Modal, PopupBody, PopupWrapper } from '../../styles/PopupStyles';
import { closeMyHighlights } from '../actions';
import * as selectors from '../selectors';
import * as Styled from './HighlightStyles';
import ShowMyHighlights from './ShowMyHighlights';
import HighlightsHelpInfo from './SummaryPopup/HighlightsHelpInfo';

// tslint:disable-next-line: variable-name
const BlueNote = () => <Styled.BlueStickyNote>
  <Styled.StickyNoteUl>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:highlight'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:add-notes'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
  </Styled.StickyNoteUl>
</Styled.BlueStickyNote>;

// tslint:disable-next-line: variable-name
const GreenNote = () => <Styled.GreenStickyNote>
  <Styled.StickyNoteUl>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:study-guide'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
      <Styled.InfoIconWrapper>
        <Styled.InfoIcon />
        <Styled.Tooltip>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:tooltip:review'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </Styled.Tooltip>
      </Styled.InfoIconWrapper>
    </Styled.StickyNoteLi>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:filter-chapters'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
  </Styled.StickyNoteUl>
</Styled.GreenStickyNote>;

// tslint:disable-next-line: variable-name
const LoginForHighlights = () => {
  const loginLink = useSelector(authSelect.loginLink);

  return <PopupBody>
    <Styled.LoginText values={{ loginLink }} />
    <Styled.GridWrapper>
      <Styled.GeneralText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:highlights-free'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </Styled.GeneralText>
      <Styled.ImagesGrid>
        <Styled.ImageWrapper>
          <Styled.FirstImage src={notLoggedImage1} />
          <BlueNote />
        </Styled.ImageWrapper>
        <Styled.ImageWrapper>
          <Styled.SecondImage src={notLoggedImage2} />
          <GreenNote />
        </Styled.ImageWrapper>
      </Styled.ImagesGrid>
    </Styled.GridWrapper>
  </PopupBody>;
};

interface Props {
  myHighlightsOpen: boolean;
  closeMyHighlights: () => void;
  user?: User;
  loggedOut: boolean;
}

// tslint:disable-next-line: variable-name
const HighlightsPopUp = ({ ...props }: Props) => {
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

  const closeAndTrack = () => {
    props.closeMyHighlights();
    trackOpenCloseMH('esc');
  };

  useOnEsc(popUpRef, props.myHighlightsOpen, closeAndTrack);

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && props.myHighlightsOpen) {
      popUp.focus();
    }
  }, [props.myHighlightsOpen]);

  return props.myHighlightsOpen ? (
    <PopupWrapper>
      <ScrollLock
        overlay={true}
        mobileOnly={false}
        zIndex={theme.zIndex.highlightSummaryPopup}
        onClick={() => { props.closeMyHighlights(); trackOpenCloseMH('overlay'); }}
      />
      <Modal
        ref={popUpRef}
        tabIndex='-1'
        data-testid='highlights-popup-wrapper'
      >
        <Header>
          <FormattedMessage id='i18n:toolbar:highlights:popup:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <FormattedMessage id='i18n:toolbar:highlights:popup:close-button:aria-label'>
            {(msg: string) => (
              <CloseIconWrapper
               data-testid='close-highlights-popup'
               aria-label={msg}
               onClick={() => {
                 props.closeMyHighlights();
                 trackOpenCloseMH('button');
               }}
              >
                <CloseIcon />
              </CloseIconWrapper>
            )}
          </FormattedMessage>
        </Header>
        {props.user ? <ShowMyHighlights /> : <LoginForHighlights />}
      </Modal>
      <HighlightsHelpInfo />
    </PopupWrapper>
  ) : null;
};

export default connect(
  (state: AppState) => ({
    loggedOut: authSelect.loggedOut(state),
    myHighlightsOpen: selectors.myHighlightsOpen(state),
    user: authSelect.user(state),
  }),
  (dispatch: Dispatch) => ({
    closeMyHighlights: () => dispatch(closeMyHighlights()),
  })
)(HighlightsPopUp);
