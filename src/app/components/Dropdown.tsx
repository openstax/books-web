import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css, keyframes } from 'styled-components/macro';
import { useOnClickOutside } from '../content/highlights/components/utils/onClickOutside';
import theme from '../theme';
import { textStyle } from './Typography/base';

interface ToggleProps<T extends React.ComponentType = React.ComponentType> {
  className?: string;
  component: T extends React.ComponentType
    ? React.ReactComponentElement<T>:
    never;
}
// tslint:disable-next-line:variable-name
const DropdownToggle = styled(({component, ...props}: ToggleProps) => React.cloneElement(component, props))`
  cursor: pointer;
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const fadeInAnimation = css`
  animation: ${100}ms ${fadeIn} ease-out;
`;

const visuallyShown = css`
  height: unset;
  width: unset;
  clip: unset;
  overflow: visible;
`;

const visuallyHidden = css`
  height: 0;
  width: 0;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
`;

type Props = React.PropsWithChildren<{
  toggle: React.ReactNode;
  className?: string;
}>;

// tslint:disable-next-line:variable-name
const TabHiddenDropDown = styled(({toggle, children, className}: Props) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const container = React.useRef<HTMLElement>(null);

  useOnClickOutside(container, open, () => setOpen(false));

  return <div className={className} ref={container}>
    <DropdownToggle component={toggle} onClick={() => setOpen(!open)} />
    {open && children}
  </div>;
})`
  & > *:not(${DropdownToggle}) {
    ${fadeInAnimation}
    position: absolute;
    box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
    border: 1px solid ${theme.color.neutral.formBorder};
    top: calc(100% + 0.4rem);
    left: 0;
  }
`;

// tslint:disable-next-line:variable-name
const DropdownFocusWrapper = styled.div`
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const TabTransparentDropdown = styled(({toggle, children, className}: Props) => <div className={className}>
  <DropdownFocusWrapper>
    <DropdownToggle tabIndex={-1} component={toggle} />
    {children}
  </DropdownFocusWrapper>
  <DropdownToggle tabIndex={-1} component={toggle} />
</div>)`
  ${/* i don't know why stylelint was complaining about this but it was, css wrapper suppresses */ css`
    ${DropdownFocusWrapper} + ${DropdownToggle} {
      ${visuallyHidden}
    }
    ${DropdownFocusWrapper}.focus-within + ${DropdownToggle} {
      ${visuallyShown}
    }
    ${DropdownFocusWrapper}:focus-within + ${DropdownToggle} {
      ${visuallyShown}
    }

    ${DropdownFocusWrapper} > ${DropdownToggle} {
      ${visuallyShown}
    }
    ${DropdownFocusWrapper}.focus-within > ${DropdownToggle} {
      ${visuallyHidden}
    }
    ${DropdownFocusWrapper}:focus-within > ${DropdownToggle} {
      ${visuallyHidden}
    }
  `}

  ${DropdownFocusWrapper} > *:not(${DropdownToggle}) {
    ${fadeInAnimation}
    position: absolute;
    box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
    border: 1px solid ${theme.color.neutral.formBorder};
    top: calc(100% + 0.4rem);
    left: 0;
  }

  ${DropdownFocusWrapper} > *:not(${DropdownToggle}) {
    ${visuallyHidden}
  }
  ${DropdownFocusWrapper}.focus-within > *:not(${DropdownToggle}) {
    ${visuallyShown}
  }
  ${DropdownFocusWrapper}:focus-within > *:not(${DropdownToggle}) {
    ${visuallyShown}
  }
`;

// tslint:disable-next-line:variable-name
export const DropdownList = styled.ol`
  margin: 0;
  padding: 0.6rem 0;
  background: ${theme.color.neutral.formBackground};

  li button,
  li a {
    text-align: left;
    cursor: pointer;
    outline: none;
    border: none;
    padding: 0 0.8rem;
    margin: 0;
    height: 3.2rem;
    background: none;
    min-width: 7.2rem;
    ${textStyle}
    font-size: 1.4rem;
    line-height: 2rem;

    &:hover,
    &:focus {
      background: ${theme.color.neutral.formBorder};
    }
  }
`;

// tslint:disable-next-line:variable-name
export const DropdownItem = ({message, href, onClick}: {message: string, href?: string, onClick?: () => void}) => <li>
  <FormattedMessage id={message}>
    {(msg: Element | string) => href
      ? <a href={href} onClick={onClick}>{msg}</a>
      : <button onClick={onClick}>{msg}</button>
    }
  </FormattedMessage>
</li>;

// tslint:disable-next-line:variable-name
const Dropdown = ({transparentTab, ...props}: {transparentTab?: boolean} & Props) => transparentTab !== false
  ? <TabTransparentDropdown {...props} />
  : <TabHiddenDropDown {...props} />;

export default styled(Dropdown)`
  overflow: visible;
  position: relative;
`;
