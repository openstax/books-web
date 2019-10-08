import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Times from '../../../app/components/Times';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import { bodyCopyRegularStyle, h3Style, h4Style } from '../../components/Typography';
import { toolbarIconColor } from '../../content/components/constants';
import { toolbarIconStyles } from '../../content/components/Toolbar/styled';
import theme from '../../theme';

const margin = 3.0;

// tslint:disable-next-line:variable-name
const BodyErrorText = styled.div`
  padding: ${margin * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

// tslint:disable-next-line:variable-name
const Card = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  overflow: hidden;
  width: 40rem;
  ${bodyCopyRegularStyle};
  background-color: white;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.05), 0 0 4rem rgba(0, 0, 0, 0.08);
`;

// tslint:disable-next-line:variable-name
const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: ${margin * 0.5}rem;
  padding: ${margin * 0.5}rem ${margin}rem;
  background: #f1f1f1;
  border-bottom: solid 0.1rem ${theme.color.neutral.darker};
  justify-content: space-between;
`;

// tslint:disable-next-line:variable-name
const Heading = styled.h1`
  ${h4Style}
  display: flex;
  align-items: center;
  margin: 0;
  padding: ${margin * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
const BodyHeading = styled.h3`
  ${h3Style}
  font-weight: 400;
  padding: ${margin * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${margin}rem;

  ${Card.Header} + & { /* stylelint-disable */
  margin-top: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const Footer = styled.div`
  display: flex;
  padding: ${margin}rem;
`;

// tslint:disable-next-line:variable-name
export const CloseModalIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  cursor: pointer;
  margin-right: 0;
  padding-right: 0;
  color: ${toolbarIconColor.lighter};

  :hover {
    color: ${toolbarIconColor.base};
  }
  height: 2rem;
  width: 2rem;
`;

interface Props {
  className?: string;
  footer?: JSX.Element;
  clearError?: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorCard = ({className, footer, clearError}: Props) => <Card className={className}>
  <Header>
    <FormattedMessage id='i18n:error:boundary:heading'>
      {(message) => (
        <Heading>
          {message}
        </Heading>
      )}
    </FormattedMessage>
    <CloseModalIcon onClick={clearError}/>
  </Header>
  <Body>
    <FormattedMessage id='i18n:error:boundary:sub-heading'>
      {(msg) => <BodyHeading>{msg}</BodyHeading>}
    </FormattedMessage>
    <BodyWithLink values={{supportCenterLink}}/>
  </Body>
  {footer}
</Card>;

export default ErrorCard;
