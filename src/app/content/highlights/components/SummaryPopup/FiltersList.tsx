import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { PlainButton } from '../../../../components/Button';
import Times from '../../../../components/Times';
import { textStyle } from '../../../../components/Typography';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import { setSummaryFilters } from '../../actions';
import { highlightLocationFilters, summaryFilters } from '../../selectors';

// tslint:disable-next-line: variable-name
export const StyledPlainButton = styled(PlainButton)`
  height: 1.7rem;
  margin-right: 0.4rem;

  svg {
    height: 0.8rem;
    width: 0.8rem;
    color: ${theme.color.primary.gray.base};
  }

  ${disablePrint}
`;

// tslint:disable-next-line: variable-name
const ItemLabel = styled.span`
  ${textStyle}
  font-weight: 300;
  color: ${theme.color.primary.gray.base};
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  line-height: 1.5rem;

  @media print {
    max-width: max-content;
  }
`;

// tslint:disable-next-line: variable-name
const FilterListItem = styled.li`
  height: 4rem;
`;

interface FiltersListColorProps {
  color: HighlightColorEnum;
  onRemove: () => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListColor = (props: FiltersListColorProps) => (
  <FilterListItem>
    <StyledPlainButton onClick={props.onRemove}><Times /></StyledPlainButton>
    <ItemLabel>
      <FormattedMessage id={`i18n:highlighting:colors:${props.color}`}>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </ItemLabel>
  </FilterListItem>
);

interface FiltersListChapterProps {
  title: string;
  locationId: string;
  onRemove: () => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListChapter = (props: FiltersListChapterProps) => (
  <FilterListItem>
    <StyledPlainButton onClick={props.onRemove}><Times /></StyledPlainButton>
    <ItemLabel dangerouslySetInnerHTML={{ __html: props.title }} />
  </FilterListItem>
);

interface FiltersListProps {
  className?: string;
}

// tslint:disable-next-line: variable-name
const FiltersList = ({className}: FiltersListProps) => {
  const locationFilters = useSelector(highlightLocationFilters);
  const filters = useSelector(summaryFilters);

  const dispatch = useDispatch();

  const onRemoveChapter = (locationId: string) => {
    dispatch(setSummaryFilters({
      locationIds: filters.locationIds.filter(not(match(locationId))),
    }));
  };

  const onRemoveColor = (color: HighlightColorEnum) => {
    dispatch(setSummaryFilters({
      colors: filters.colors.filter(not(match(color))),
    }));
  };

  return <ul className={className}>
    {Array.from(locationFilters).map(([locationId, location]) => filters.locationIds.includes(locationId) &&
    <FiltersListChapter
      key={locationId}
      title={location.title}
      locationId={locationId}
      onRemove={() => onRemoveChapter(locationId)}
    />)}
    {filters.colors.sort().map((color) => <FiltersListColor
      key={color}
      color={color}
      onRemove={() => onRemoveColor(color)}
    />)}
  </ul>;
};

export default styled(FiltersList)`
  ${textStyle}
  font-size: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 0;
  padding: 0 2.8rem 0.4rem 2.8rem;
  list-style: none;

  li {
    margin-right: 3.2rem;
    display: flex;
    align-items: center;
  }

  @media print {
    margin: 0;
  }
`;
