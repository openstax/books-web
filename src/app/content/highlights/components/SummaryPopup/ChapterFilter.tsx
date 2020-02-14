import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import { textStyle } from '../../../../components/Typography/base';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { setSummaryFilters } from '../../actions';
import { highlightLocationFilters, highlightLocationFiltersWithContent, summaryLocationFilters } from '../../selectors';
import ColorIndicator from '../ColorIndicator';
import { mobileMarginSides, mobilePaddingSides } from './constants';

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Row = styled.div`
  display: flex;
  flex-direction: row;
  ${theme.breakpoints.mobile(css`
    flex-direction: column;
    overflow: hidden;
  `)}
`;

// tslint:disable-next-line:variable-name
const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

// tslint:disable-next-line:variable-name
const ChapterTitle = styled.span`
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  margin-left: 0.8rem;

  > * {
    overflow: hidden;
  }

  .os-text {
    flex: 1;
    text-overflow: ellipsis;
  }

  .os-divider {
    margin: 0 0.4rem;
  }
`;

const chunk = <T extends any>(sections: T[]) => {
  const cutoff = Math.max(20, Math.ceil(sections.length / 2));
  return [sections.slice(0, cutoff), sections.slice(cutoff)].filter((arr) => arr.length > 0);
};

// tslint:disable-next-line:variable-name
const ChapterFilter = ({className}: Props) => {
  const locationFilters = useSelector(highlightLocationFilters);
  const locationFiltersWithContent = useSelector(highlightLocationFiltersWithContent);
  const selectedLocationFilters = useSelector(summaryLocationFilters);
  const dispatch = useDispatch();

  const setSelectedChapters = (ids: string[]) => {
    dispatch(setSummaryFilters({locationIds: ids}));
  };

  const handleChange = (id: string) => {
    if (selectedLocationFilters.has(id)) {
      setSelectedChapters([...selectedLocationFilters].filter(not(match(id))));
    } else {
      setSelectedChapters([...selectedLocationFilters, id]);
    }
  };

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedChapters([])}
      onAll={() => setSelectedChapters(Array.from(locationFiltersWithContent))}
    />
    <Row>
      {chunk(Array.from(locationFilters.values())).map((sectionChunk, index) => <Column key={index}>
        {sectionChunk.map((location) => <Checkbox
          key={location.id}
          checked={selectedLocationFilters.has(location.id)}
          disabled={!locationFiltersWithContent.has(location.id)}
          onChange={() => handleChange(location.id)}
        >
          <ChapterTitle dangerouslySetInnerHTML={{__html: location.title}} />
        </Checkbox>)}
      </Column>)}
    </Row>
  </div>;
};

export default styled(ChapterFilter)`
  ${textStyle}
  background: ${theme.color.white};
  font-size: 1.4rem;
  padding: 0.8rem 1.6rem;
  outline: none;
  max-height: 72rem;
  overflow: auto;
  z-index: 1;
  ${theme.breakpoints.mobile(css`
    &&& {
      left: -${mobilePaddingSides}rem;
      max-width: calc(100vw - ${mobileMarginSides}rem * 2);
    }
  `)}

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
