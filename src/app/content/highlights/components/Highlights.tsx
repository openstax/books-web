import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import { typesetMath } from '../../../../helpers/mathjax';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { useServices } from '../../../context/Services';
import { assertDefined, assertWindow } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import * as selectors from '../selectors';
import { OrderedSummaryHighlights } from '../types';
import * as HStyled from './HighlightStyles';
import * as Styled from './ShowMyHighlightsStyles';
import HighlightListElement from './SummaryPopup/HighlightListElement';

// tslint:disable-next-line: variable-name
const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const orderedHighlights = useSelector(selectors.orderedSummaryHighlights);
  const isLoading = useSelector(selectors.summaryIsLoading);
  const totalCountsPerPage = useSelector(selectors.totalCountsPerPage);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(allImagesLoaded(container.current));
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, ignore promiseCollector
  }, [orderedHighlights]);

  if (
    !isLoading
    && (!totalCountsPerPage || Object.keys(totalCountsPerPage).length === 0)
  ) {
    return <Styled.Highlights ref={container}>
      <HStyled.GeneralLeftText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:no-highlights-in-book'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </HStyled.GeneralLeftText>
      <HStyled.MyHighlightsWrapper>
        <HStyled.GeneralText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </HStyled.GeneralText>
        <HStyled.GeneralTextWrapper>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </HStyled.GeneralTextWrapper>
        <HStyled.MyHighlightsImage src={myHighlightsEmptyImage} />
      </HStyled.MyHighlightsWrapper>
    </Styled.Highlights>;
  }

  if (!isLoading && orderedHighlights && orderedHighlights.length === 0) {
    return <Styled.Highlights ref={container}>
      <HStyled.GeneralCenterText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
        <NoHighlightsTip />
      </HStyled.GeneralCenterText>
    </Styled.Highlights>;
  }

  return <React.Fragment>
    {isLoading ? <Styled.LoaderWrapper><Loader large /></Styled.LoaderWrapper> : null}
    {orderedHighlights && <Styled.Highlights ref={container}>
      {orderedHighlights.map((highlightData) => {
        return <SectionHighlights
          key={highlightData.location.id}
          highlightDataInSection={highlightData}
        />;
      })}
    </Styled.Highlights>}
  </React.Fragment>;
};

export default Highlights;

interface SectionHighlightsProps {
  highlightDataInSection: OrderedSummaryHighlights[0];
}

// tslint:disable-next-line: variable-name
export const SectionHighlights = ({ highlightDataInSection: {pages, location}}: SectionHighlightsProps) => {
  const pageIdIsSameAsSectionId = pages.every((highlights) => highlights.pageId === location.id);

  return (
    <React.Fragment>
      <Styled.HighlightsChapterWrapper>
        <Styled.HighlightsChapter dangerouslySetInnerHTML={{ __html: location.title }} />
      </Styled.HighlightsChapterWrapper>
      {pages.map(({pageId, highlights}) => {
        const page = assertDefined(
          archiveTreeSectionIsChapter(location)
            ? findArchiveTreeNode(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <Styled.HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <Styled.HighlightSection
            dangerouslySetInnerHTML={{ __html: page.title }}
          />}
          {highlights.map((item) => <HighlightListElement
            key={item.id}
            highlight={item}
            locationFilterId={location.id}
            pageId={pageId}
          />)}
        </Styled.HighlightWrapper>;
      })}
    </React.Fragment>
  );
};
