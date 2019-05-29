import React, { SFC } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { assertString } from '../../utils';
import RiceWhiteLogo from './../../../assets/rice-white-text.png';
import * as Styled from './styled';

const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
const supportCenterLink = 'https://openstax.secure.force.com/help';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

const renderMission = () => <FormattedHTMLMessage id='i18n:footer:copyright:mission-text'>
  {(html) => <Styled.Mission
    dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:copyright:mission-text must return a string')}}
  ></Styled.Mission>}
</FormattedHTMLMessage>;

// tslint:disable-next-line:variable-name
const ColumnHeadingMessage: React.SFC<{id: string}> = ({id}) => <Styled.ColumnHeading>
  <FormattedMessage id={id}>
    {(msg: Element | string) => msg}
  </FormattedMessage>
</Styled.ColumnHeading>;

// tslint:disable-next-line:variable-name
const FooterLinkMessage: React.SFC<{id: string, href: string, target?: string }> = ({id, href, target }) => <Styled.FooterLink href={href} target={target? target : '_self'}>
  <FormattedMessage id={id}>
    {(msg: Element | string) => msg}
  </FormattedMessage>
</Styled.FooterLink>;

// tslint:disable-next-line:variable-name
const SocialIconMessage: React.SFC<{id: string, href: string, Icon: React.ComponentType}> = ({id, href, Icon}) =>
  <FormattedMessage id={id}>
    {(msg: Element | string) =>
      <Styled.SocialIcon aria-label={assertString(msg, 'aria-label must be a string')} href={href}>
        <Icon />
      </Styled.SocialIcon>
    }
  </FormattedMessage>;

const renderColumn1 = () => <Styled.Column1>
  <ColumnHeadingMessage id='i18n:footer:column1:help' />
  <FooterLinkMessage href='/contact' id='i18n:footer:column1:contact-us' />
  <FooterLinkMessage href={supportCenterLink} id='i18n:footer:column1:support-center' target='_blank'/>
  <FooterLinkMessage href='/faq' id='i18n:footer:column1:faqs' />
</Styled.Column1>;

const renderColumn2 = () => <Styled.Column2>
  <ColumnHeadingMessage id='i18n:footer:column2:openstax' />
  <FooterLinkMessage href='/press' id='i18n:footer:column2:press' />
  <FooterLinkMessage href={newsletterLink} id='i18n:footer:column2:newsletter' />
  <FooterLinkMessage href='/careers' id='i18n:footer:column2:careers' />
</Styled.Column2>;

const renderColumn3 = () => <Styled.Column3>
  <ColumnHeadingMessage id='i18n:footer:column3:policies' />
  <FooterLinkMessage href='/accessibility-statement' id='i18n:footer:column3:accessibility' />
  <FooterLinkMessage href='/tos' id='i18n:footer:column3:terms' />
  <FooterLinkMessage href='/license' id='i18n:footer:column3:license' />
  <FooterLinkMessage href='/privacy-policy' id='i18n:footer:column3:privacy-policy' />
</Styled.Column3>;

const renderCopyrights = () => <FormattedHTMLMessage id='i18n:footer:copyright:bottom-text' values={getValues()}>
  {(html) => <Styled.Copyrights
    dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:copyright:top-text must return a string')}}
  ></Styled.Copyrights>}
</FormattedHTMLMessage>;

const renderSocialDirectory = () => <Styled.Social role='directory'>
  <SocialIconMessage id='i18n:footer:social:fb:alt' href={fbUrl} Icon={Styled.FBIcon} />
  <SocialIconMessage id='i18n:footer:social:tw:alt' href={twitterUrl} Icon={Styled.TwitterIcon} />
  <SocialIconMessage id='i18n:footer:social:in:alt' href={linkedInUrl} Icon={Styled.LinkedInIcon} />
  <SocialIconMessage id='i18n:footer:social:ig:alt' href={instagramUrl} Icon={Styled.IGIcon} />
  <FormattedMessage id='i18n:footer:social:rice-logo:alt'>
    {(msg: Element | string) => <Styled.BottomLink href={riceUrl}>
      <Styled.FooterLogo src={RiceWhiteLogo} alt={msg} />
    </Styled.BottomLink>}
  </FormattedMessage>
</Styled.Social>;

function getValues() {
  return {
    copyrightLink,
    currentYear: new Date().getFullYear(),
  };
}

// tslint:disable-next-line:variable-name
const Footer: SFC = () => <Styled.FooterWrapper>
  <Styled.InnerFooter>
    <Styled.FooterTop>
      <Styled.TopBoxed>
        <Styled.Heading role='heading' aria-level={2}>
          <FormattedMessage id='i18n:footer:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </Styled.Heading>
        {renderMission()}
        {renderColumn1()}
        {renderColumn2()}
        {renderColumn3()}
      </Styled.TopBoxed>
    </Styled.FooterTop>
    <Styled.FooterBottom>
      <Styled.BottomBoxed>
        {renderCopyrights()}
        {renderSocialDirectory()}
      </Styled.BottomBoxed>
    </Styled.FooterBottom>
  </Styled.InnerFooter>
</Styled.FooterWrapper>;

export default Footer;
