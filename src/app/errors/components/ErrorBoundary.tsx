import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Sentry from '../../../helpers/Sentry';
import Footer from '../../components/Footer';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { H2 } from '../../components/Typography/headings';
import theme from '../../theme';

interface Props {
  children: ReactNode;
}

interface State {
  error?: Error;
}

// tslint:disable-next-line:variable-name
const ErrorWrapper = styled.div`
  flex: 1;
  margin: 3rem auto;
  padding: 0 ${theme.padding.page.mobile}rem;
`;

// tslint:disable-next-line:variable-name
const HeadingWrapper = styled.div`
  text-align: center;
  margin-top: 5rem;
`;

// tslint:disable-next-line:variable-name
const BodyErrorText = styled.div`
  ${bodyCopyRegularStyle};
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
      return <React.Fragment>
        <ErrorWrapper error={this.state.error as any as Error}>
          <HeadingWrapper>
            <FormattedMessage id='i18n:error:boundary:sub-heading'>
              {(msg) => <H2>{msg}</H2>}
            </FormattedMessage>
          </HeadingWrapper>
          <BodyWithLink values={{supportCenterLink}}/>
        </ErrorWrapper>
        <Footer />
      </React.Fragment>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
