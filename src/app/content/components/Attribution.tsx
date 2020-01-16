import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { CollapseIcon, Details, ExpandIcon, Summary } from '../../components/Details';
import { bodyCopyRegularStyle, decoratedLinkStyle, textRegularLineHeight } from '../../components/Typography';
import { scrollTo } from '../../domUtils';
import * as selectNavigation from '../../navigation/selectors';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertString } from '../../utils';
import { hasOSWebData } from '../guards';
import * as select from '../selectors';
import { Book, BookWithOSWebData, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { contentTextStyle } from './Page/PageContent';
import { disablePrint } from './utils/disablePrint';
import { wrapperPadding } from './Wrapper';

const detailsMarginTop = 2;
const desktopSpacing = 1.8;
const mobileSpacing = 0.8;
export const desktopAttributionHeight = detailsMarginTop + textRegularLineHeight + desktopSpacing * 2;
export const mobileAttributionHeight = detailsMarginTop + textRegularLineHeight + mobileSpacing * 2;

const summaryIconStyle = css`
  margin-left: -0.3rem;
`;

// tslint:disable-next-line:variable-name
const SummaryClosedIcon = styled((props) => <ExpandIcon {...props} />)`
  ${summaryIconStyle}
`;
// tslint:disable-next-line:variable-name
const SummaryOpenIcon = styled((props) => <CollapseIcon {...props} />)`
  ${summaryIconStyle}
`;

// tslint:disable-next-line:variable-name
const AttributionSummary = styled((props) => <Summary {...props} />)`
  ${contentTextStyle}
  font-weight: 500;
  list-style: none;

  &,
  span {
    ${bodyCopyRegularStyle}
    ${decoratedLinkStyle}
  }
`;

// tslint:disable-next-line:variable-name
const Content = styled.div`
  ${contentTextStyle}

  blockquote {
    margin-left: 0;
  }
`;

// tslint:disable-next-line:variable-name
const AttributionDetails = styled(Details)`
  ${bodyCopyRegularStyle}
  box-shadow: 0 -1rem 1rem -1rem rgba(0, 0, 0, 0.1);
  margin: ${detailsMarginTop}rem 0 0 0;
  min-height: 6rem;
  ${wrapperPadding}
  padding-top: ${desktopSpacing}rem;

  > ${AttributionSummary} {
    margin-bottom: ${desktopSpacing}rem;
  }

  ${theme.breakpoints.mobile(css`
    min-height: 4rem;
    padding-top: ${mobileSpacing}rem;

    > ${Summary} {
      margin-bottom: ${mobileSpacing}rem;
    }
  `)}

  li {
    margin-bottom: 1rem;
    overflow: visible;
  }

  ${disablePrint}
`;

interface Props {
  currentPath: string;
  book: Book | undefined;
  page: Page | undefined;
}

class Attribution extends Component<Props> {
  public container = React.createRef<HTMLDetailsElement>();
  private toggleHandler: undefined | (() => void);

  public componentDidMount() {
    const container = this.container.current;

    if (!container) {
      return;
    }

    this.toggleHandler = () => container.getAttribute('open') !== null && scrollTo(container);
    container.addEventListener('toggle', this.toggleHandler);
  }

  public componentWillUnmount() {
    if (!this.container.current || !this.toggleHandler) {
      return;
    }
    this.container.current.removeEventListener('toggle', this.toggleHandler);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.container.current && prevProps.page && prevProps.page !== this.props.page) {
      this.container.current.removeAttribute('open');
    }
  }

  public render() {
    const {book} = this.props;

    return <AttributionDetails
      ref={this.container}
      data-testid='attribution-details'
      data-analytics-region='attribution'
    >
      <FormattedMessage id='i18n:attribution:toggle'>
        {(msg) => <AttributionSummary aria-label={msg}>
          <SummaryClosedIcon />
          <SummaryOpenIcon />
          <span>{msg}</span>
        </AttributionSummary>}
      </FormattedMessage>
      {book && hasOSWebData(book) && <FormattedHTMLMessage id='i18n:attribution:text' values={this.getValues(book)}>
        {(html) => <Content
          dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:attribution:text must return a string')}}
        ></Content>}
      </FormattedHTMLMessage>}
    </AttributionDetails>;
  }

  private getValues = (book: BookWithOSWebData) => {
    const introPage = findDefaultBookPage(book);
    const introPageUrl = getBookPageUrlAndParams(book, introPage).url;
    const bookPublishDate = new Date(book.publish_date);

    // date is initialized as UTC, conversion to local time can change the date.
    // this compensates
    bookPublishDate.setMinutes(bookPublishDate.getMinutes() + bookPublishDate.getTimezoneOffset());

    const seniorAuthors = book.authors.filter((author) => author.value.senior_author);

    return {
      bookAuthors: seniorAuthors.map(({value: {name}}) => name).join(', '),
      bookLicenseName: book.license.name,
      bookLicenseVersion: book.license.version,
      bookPublishDate,
      bookTitle: book.title,
      currentPath: this.props.currentPath,
      introPageUrl,
    };
  };
}

export default connect(
  (state: AppState) => ({
    ...select.bookAndPage(state),
    currentPath: selectNavigation.pathname(state),
  })
)(Attribution);
