import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { print } from '../../print';
import * as select from '../../selectors';
import { Book } from '../../types';
import * as Styled from './styled';

interface Props {
  currentPath: string;
  book: Book | undefined;
}

class PrintButton extends Component<Props> {
  public render() {
    return (
      <FormattedMessage id='i18n:toolbar:print:text'>
        {(msg: Element | string) => (
          <FormattedMessage id='i18n:toolbar:print:aria-label'>
            {(label: Element | string) => (
              <Styled.PrintOptWrapper
                onClick={() => print(this.props.book, this.props.currentPath)}
                aria-label={label}
                data-testid='print'
              >
                <Styled.PrintIcon />
                <Styled.PrintOptions>{msg}</Styled.PrintOptions>
              </Styled.PrintOptWrapper>
            )}
          </FormattedMessage>
        )}
      </FormattedMessage>
    );
  }
}

export default connect((state: AppState) => ({
  ...select.bookAndPage(state),
  currentPath: selectNavigation.pathname(state),
}))(PrintButton);
