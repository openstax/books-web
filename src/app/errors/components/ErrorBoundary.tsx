import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Sentry from '../../../helpers/Sentry';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import { labelStyle } from '../../components/Typography';
import { H2 } from '../../components/Typography/headings';

interface Props {
  children: ReactNode;
}

interface State {
  error?: Error;
}

// tslint:disable-next-line:variable-name
const ErrorWrapper = styled.div`
  margin: 3rem auto;
`;

// tslint:disable-next-line:variable-name
const HeadingWrapper = styled.div`
  text-align: center;
  margin-top: 5rem;
`;

// tslint:disable-next-line:variable-name
const BodyErrorText = styled.div`
  ${labelStyle}
  font-weight: 300;
`;

// tslint:disable-next-line:variable-name
const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

class ErrorBoundary extends React.Component<Props, State> {

  public state = { error: undefined };

  public componentDidCatch(error: Error) {
    Sentry.captureException(error);
    this.setState({ error });
  }

  public render() {
    if (this.state.error) {
      return (
        <ErrorWrapper error={this.state.error as any as Error}>
          <HeadingWrapper>
            <FormattedMessage id='i18n:error:boundary:sub-heading'>
              {(msg) => <H2>{msg}</H2>}
            </FormattedMessage>
          </HeadingWrapper>
          <BodyWithLink values={{supportCenterLink}}/>
        </ErrorWrapper>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
