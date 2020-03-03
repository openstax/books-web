import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import Dropdown, { DropdownItem, DropdownList } from '../../../components/Dropdown';
import Times from '../../../components/Times';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { mergeRefs } from '../../../utils';
import { cardPadding, cardWidth, highlightStyles } from '../constants';
import Confirmation from './Confirmation';
import MenuToggle, { MenuIcon } from './MenuToggle';
import TruncatedText from './TruncatedText';
import { useOnClickOutside } from './utils/onClickOutside';

// tslint:disable-next-line:variable-name
const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  color: ${theme.color.primary.gray.lighter};
  height: 4.2rem;
  width: 4.2rem;
  padding: 1.6rem;
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  ${theme.breakpoints.mobile(css`
    display: block;
 `)}
`;

export interface DisplayNoteProps {
  note: string;
  style: typeof highlightStyles[number];
  isFocused: boolean;
  highlight: Highlight;
  onEdit: () => void;
  onBlur: () => void;
  onRemove: () => void;
  onHeightChange: (id: string, ref: React.RefObject<HTMLElement>) => void;
  className: string;
}

// tslint:disable-next-line:variable-name
const DisplayNote = React.forwardRef<HTMLElement, DisplayNoteProps>((
  {note, isFocused, onBlur, onEdit, onRemove, onHeightChange, highlight, className}: DisplayNoteProps,
  ref
) => {
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);
  const confirmationRef = React.useRef<HTMLElement>(null);

  useOnClickOutside(element, isFocused, onBlur);

  React.useEffect(() => {
    if (!isFocused) {
      setConfirmingDelete(false);
    }
  }, [isFocused]);

  React.useEffect(() => {
    const refElement = confirmationRef.current ? confirmationRef : element;
    onHeightChange(highlight.id, refElement);
  }, [element, highlight, confirmationRef, confirmingDelete]);

  return <div className={className} ref={mergeRefs(ref, element)}>
    <Dropdown toggle={<MenuToggle />}>
      <DropdownList>
        <DropdownItem message='i18n:highlighting:dropdown:edit' onClick={onEdit} />
        <DropdownItem
          message='i18n:highlighting:dropdown:delete'
          data-testid='delete'
          onClick={() => setConfirmingDelete(true)}
        />
      </DropdownList>
    </Dropdown>
    <CloseIcon onClick={onBlur} />
    <label>Note:</label>
    <TruncatedText text={note} isFocused={isFocused} />
    {confirmingDelete && <Confirmation
      ref={confirmationRef}
      data-analytics-label='delete'
      data-analytics-region='confirm-delete-inline-highlight'
      message='i18n:highlighting:confirmation:delete-both'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={onRemove}
      onCancel={() => setConfirmingDelete(false)}
    />}
  </div>;
});

export default styled(DisplayNote)`
  width: ${cardWidth}rem;
  overflow: visible;
  background: ${theme.color.neutral.formBackground};
  ${(props: DisplayNoteProps) => props.isFocused && css`
    background: ${theme.color.white};
  `}

  > label {
    display: none;
    ${textStyle}
    color: ${(props: DisplayNoteProps) => props.style.focused};
    font-size: 1.4rem;
    line-height: 2rem;
    margin: ${cardPadding * 1.5}rem 0 0 ${cardPadding * 2}rem;
  }

  ${css`
    ${DropdownList}${DropdownList} {
      left: -4rem;
    }
  `}

  ${Dropdown} {
    position: absolute;
    top: 0.8rem;
    right: -0.2rem;

    .focus-within ${MenuIcon} {
      color: ${theme.color.primary.gray.base};
    }

    :focus-within ${MenuIcon} {
      color: ${theme.color.primary.gray.base};
    }
  }

  ${theme.breakpoints.mobile(css`
    width: unset;

    > label {
      display: block;
    }

    ${Dropdown} {
      display: none;
    }
 `)}
`;
