import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardPadding, cardWidth } from '../constants';

interface Props {
  note: string;
  onChange: (note: string) => void;
  onFocus: () => void;
}

const noteMaxLength = 1000;

const width = cardWidth - cardPadding * 2;
// tslint:disable-next-line:variable-name
const TextArea = styled.textarea`
  display: block;
  min-height: 5.6rem;
  width: ${width}rem;
  max-height: 30rem;
  max-width: ${width}rem;
  min-width: ${width}rem;
  border: 1px solid ${theme.color.neutral.formBorder};
  padding: ${cardPadding}rem;
  ${textStyle}
  color: ${theme.color.text.label};
  font-size: 1.4rem;
  font-family: inherit;
  line-height: 2rem;
  font-weight: normal;
`;

// tslint:disable-next-line:variable-name
const Note = ({onChange, onFocus, note}: Props) => {
  const textArea = React.useRef<HTMLTextAreaElement>(null);

  const setTextAreaHeight = () => {
    const element = textArea.current;
    if (!element) {
      return;
    }

    if (element.scrollHeight > element.offsetHeight) {
      element.style.height = `${element.scrollHeight + 5}px`;
    }
  };

  React.useEffect(setTextAreaHeight, [note]);

  return <FormattedMessage id='i18n:highlighting:card:placeholder'>
    {(msg: Element | string) => <TextArea
        ref={textArea}
        value={note}
        onFocus={onFocus}
        maxLength={noteMaxLength}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e.target.value);
        }}
        placeholder={msg}
      />
    }
  </FormattedMessage>;
};

export default Note;
