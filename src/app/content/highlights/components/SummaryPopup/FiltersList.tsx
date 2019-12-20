import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import Times from '../../../../components/Times';
import { textStyle } from '../../../../components/Typography';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { setSummaryFilters } from '../../actions';
import { highlightLocations, summaryFilters } from '../../selectors';

// tslint:disable-next-line: variable-name
export const RemoveIcon = styled.span`
  padding: 0.5rem;
  cursor: pointer;

  svg {
    height: 1rem;
    width: 1rem;
  }
`;

// tslint:disable-next-line: variable-name
const ItemLabel = styled.span`
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
`;

interface FiltersListColorProps {
  color: HighlightColorEnum;
  onRemove: (color: HighlightColorEnum) => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListColor = (props: FiltersListColorProps) => {
  const handleClick = () => {
    props.onRemove(props.color);
  };

  return <li>
    <RemoveIcon onClick={handleClick}><Times /></RemoveIcon>
    <ItemLabel>
      <FormattedMessage id={`i18n:highlighting:colors:${props.color}`}>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </ItemLabel>
  </li>;
};

interface FiltersListChapterProps {
  title: string;
  chapterId: string;
  onRemove: (chapterId: string) => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListChapter = (props: FiltersListChapterProps) => {
  const handleClick = () => {
    props.onRemove(props.chapterId);
  };

  return <li>
    <RemoveIcon onClick={handleClick}><Times /></RemoveIcon>
    <ItemLabel dangerouslySetInnerHTML={{ __html: props.title }} />
  </li>;
};

interface FiltersListProps {
  className?: string;
}

// tslint:disable-next-line: variable-name
const FiltersList = ({className}: FiltersListProps) => {
  const locations = useSelector(highlightLocations);
  const filters = useSelector(summaryFilters);

  const dispatch = useDispatch();

  const onRemoveChapter = (locationId: string) => {
    dispatch(setSummaryFilters({
      ...filters,
      locationIds: filters.locationIds.filter(not(match(locationId))),
    }));
  };

  const onRemoveColor = (color: HighlightColorEnum) => {
    dispatch(setSummaryFilters({
      ...filters,
      colors: filters.colors.filter(not(match(color))),
    }));
  };

  return <ul className={className}>
    {filters.locationIds.map((locationId) => locations.has(locationId) && <FiltersListChapter
      key={locationId}
      title={locations.get(locationId)!.title}
      chapterId={locationId}
      onRemove={onRemoveChapter}
    />)}
    {filters.colors.map((color) => <FiltersListColor
      key={color}
      color={color}
      onRemove={onRemoveColor}
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
  padding: 2rem 0;
  list-style: none;

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}

  li {
    margin-right: 2rem;
    display: flex;
    align-items: center;
  }
`;
