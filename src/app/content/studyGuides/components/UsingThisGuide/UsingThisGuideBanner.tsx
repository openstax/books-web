import { HTMLImageElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { Times } from 'styled-icons/fa-solid/Times';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { PlainButton } from '../../../../components/Button';
import { H2, h4MobileStyle } from '../../../../components/Typography/headings';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import { filters } from '../../../styles/PopupConstants';
import desktopBanner from './assets/banner.png';
import mobileBanner from './assets/banner_mobile.png';
import { cookieUTG } from './constants';

// tslint:disable-next-line: variable-name
const BannerWrapper = styled.div`
  position: relative;
  background: ${theme.color.black};
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: ${filters.dropdownToggle.topBottom.desktop}rem ${filters.dropdownToggle.sides.desktop}rem;

  ${PlainButton} {
    position: absolute;
    top: 4.6rem;
    right: 3.2rem;
  }

  ${theme.breakpoints.mobile(css`
    padding: ${filters.dropdownToggle.topBottom.mobile}rem ${filters.dropdownToggle.sides.mobile}rem;
    ${PlainButton} {
      top: 1.5rem;
      right: 1.6rem;
    }
  `)}

  ${disablePrint}
`;

// tslint:disable-next-line: variable-name
export const DesktopBanner = styled.img`
  width: 100%;
  padding: 0 4.2rem;
  ${theme.breakpoints.mobileMedium(css`
    max-width: 30rem;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
const UsingThisGuideTitle = styled(H2)`
  text-align: center;
  width: 100%;
  color: ${theme.color.white};
  ${theme.breakpoints.mobile(css`
    ${h4MobileStyle}
    color: ${theme.color.white};
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled(Times)`
  position: absolute;
  right: 0;
  background: ${theme.color.white};
  color: ${theme.color.black};
  height: 2.8rem;
  width: 2.8rem;
  border-radius: 50%;
  padding: 0.4rem;
  cursor: pointer;
  ${theme.breakpoints.mobile(css`
    height: 1.6rem;
    width: 1.6rem;
  `)}
`;

interface Props {
  onClick: () => void;
  show: boolean;
  isOpenedForTheFirstTime: boolean;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideBanner = (props: Props) => {
  const desktopBannerRef = React.useRef<HTMLImageElement>(null);
  const toggleCounter = React.useRef(0);
  const trackOpenUTG = useAnalyticsEvent('openUTG');

  React.useEffect(() => {
    if (props.show) {
      toggleCounter.current += 1;
      Cookies.set(cookieUTG, 'true');
    }
    // Send GA event when banner is open, except when it is opened initially.
    if (props.show && (!props.isOpenedForTheFirstTime || toggleCounter.current > 1)) {
      trackOpenUTG();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show]);

  React.useEffect(() => {
    // Do not focus image if banner was opened initially
    if (props.isOpenedForTheFirstTime && toggleCounter.current <= 1) { return; }
    if (desktopBannerRef.current) {
      desktopBannerRef.current.focus();
    }
  }, [props.isOpenedForTheFirstTime, props.show]);

  if (!props.show) { return null; }

  return <BannerWrapper>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
      {(msg: Element | string) => <UsingThisGuideTitle>{msg}</UsingThisGuideTitle>}
    </FormattedMessage>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide:alt'>
      {(msg: Element | string) => <picture>
        <source media={theme.breakpoints.mobileMediumQuery} srcSet={mobileBanner} />
        <DesktopBanner src={desktopBanner} alt={msg} ref={desktopBannerRef} tabIndex={-1} />
      </picture>}
    </FormattedMessage>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide:close:aria-label'>
      {(msg: string) => <PlainButton onClick={props.onClick} aria-label={msg} data-testid='close-utg'>
        <CloseIcon />
      </PlainButton>}
    </FormattedMessage>
  </BannerWrapper>;
};

export default UsingThisGuideBanner;
