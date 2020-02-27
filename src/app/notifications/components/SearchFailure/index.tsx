import React from 'react';
import { FormattedMessage } from 'react-intl';
import { assertWindow, useOnDOMEvent, useTimeout } from '../../../utils';
import { Header } from '../Card';
import {
  BannerBody,
  BannerBodyWrapper,
  clearErrorAfter,
  CloseButton,
  CloseIcon
} from './styles';

interface Props {
  dismiss: () => void;
}

// tslint:disable-next-line:variable-name
const SearchFailure = ({ dismiss }: Props) => {
  const window = assertWindow();
  const [isFadingOut, setIsFadingOut] = React.useState(false);
  const [shouldAllowDismissal, setShouldAllowDismissal] = React.useState(false);

  const startFadeOut = () => {
    if (shouldAllowDismissal) {
      setIsFadingOut(true);
    }
  };

  useTimeout(clearErrorAfter, startFadeOut, [shouldAllowDismissal]);
  useTimeout(100, () => setShouldAllowDismissal(true), []);

  useOnDOMEvent(window, !isFadingOut, 'click', startFadeOut);
  useOnDOMEvent(window, !isFadingOut, 'scroll', startFadeOut);

  return (
    <BannerBodyWrapper
      data-testid='banner-body'
      onAnimationEnd={dismiss}
      isFadingOut={isFadingOut}
    >
      <BannerBody>
        <FormattedMessage id='i18n:notification:search-failure'>
          {(txt) =>  <Header>{txt}</Header>}
        </FormattedMessage>
        <CloseButton onClick={dismiss}>
          <CloseIcon />
        </CloseButton>
      </BannerBody>
    </BannerBodyWrapper>
  );
};

export default SearchFailure;
