import Highlighter, { Highlight } from '@openstax/highlighter';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { AppState, Dispatch } from '../../../types';
import { highlightStyles } from '../../constants';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import * as contentSelect from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { getHighlightLocationFilterForPage } from '../../utils/sharedHighlightsUtils';
import {
  clearFocusedHighlight,
  createHighlight,
  deleteHighlight,
  focusHighlight,
  setAnnotationChangesPending,
} from '../actions';
import { HighlightData } from '../types';
import { mainCardStyles } from './cardStyles';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import showConfirmation from './utils/showConfirmation';

export interface CardProps {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isFocused: boolean;
  isTocOpen: boolean;
  hasQuery: boolean;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  focus: typeof focusHighlight;
  remove: typeof deleteHighlight;
  blur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPending;
  data?: HighlightData;
  className: string;
  zIndex: number;
  topOffset?: number;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
}

// tslint:disable-next-line:variable-name
const Card = (props: CardProps) => {
  const annotation = props.data && props.data.annotation;
  const element = React.useRef<HTMLElement>(null);
  const [editing, setEditing] = React.useState<boolean>(!annotation);
  const locationFilters = useSelector(selectHighlights.highlightLocationFilters);
  const hasUnsavedHighlight = useSelector(selectHighlights.hasUnsavedHighlight);

  React.useEffect(() => {
    if (!props.isFocused) {
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isFocused]);

  React.useEffect(() => {
    if (annotation) {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.add('has-note'));
    } else {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.remove('has-note'));
    }
  }, [props.highlight, annotation]);

  React.useEffect(() => {
    if (!annotation && !props.isFocused) {
      props.onHeightChange({ current: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotation, props.isFocused]);

  const location = React.useMemo(() => {
    return props.page && getHighlightLocationFilterForPage(locationFilters, props.page);
  }, [locationFilters, props.page]);

  const locationFilterId = location && stripIdVersion(location.id);

  const { page, book } = props;
  if (!props.highlight.range || !page || !book || !locationFilterId || (!props.isFocused && !annotation)) {
    return null;
  }

  const handleClickOnCard = async() => {
    if (!props.isFocused && (!hasUnsavedHighlight || await showConfirmation())) {
      props.focus(props.highlight.id);
    }
  };

  const onRemove = () => {
    if (props.data) {
      props.remove(props.data.id, {
        locationFilterId,
        pageId: page.id,
      });
    }
  };
  const style = highlightStyles.find((search) => props.data && search.label === props.data.color);

  const onCreate = () => {
    props.create({
      ...props.highlight.serialize().getApiPayload(props.highlighter, props.highlight),
      scopeId: book.id,
      sourceId: page.id,
      sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
    }, {
      locationFilterId,
      pageId: page.id,
    });
  };

  const commonProps = {
    className: props.className,
    highlight: props.highlight,
    isFocused: props.isFocused,
    onBlur: props.blur,
    onHeightChange: props.onHeightChange,
    onRemove,
    ref: element,
  };

  return <div onClick={handleClickOnCard} data-testid='card'>
    {
      !editing && style && annotation ? <DisplayNote
        {...commonProps}
        style={style}
        note={annotation}
        focus={props.focus}
        onEdit={() => setEditing(true)}
      /> : <EditCard
        {...commonProps}
        locationFilterId={locationFilterId}
        hasUnsavedHighlight={hasUnsavedHighlight}
        pageId={page.id}
        onCreate={onCreate}
        setAnnotationChangesPending={props.setAnnotationChangesPending}
        onCancel={() => setEditing(false)}
        data={props.data}
      />
    }
  </div>;
};

// tslint:disable-next-line: variable-name
const StyledCard = styled(Card)`
  ${mainCardStyles}
`;

export default connect(
  (state: AppState, ownProps: {highlight: Highlight}) => ({
    ...selectContent.bookAndPage(state),
    data: selectHighlights.highlights(state).find((search) => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isFocused: selectHighlights.focused(state) === ownProps.highlight.id,
    isTocOpen: contentSelect.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    blur: flow(clearFocusedHighlight, dispatch),
    create: flow(createHighlight, dispatch),
    focus: flow(focusHighlight, dispatch),
    remove: flow(deleteHighlight, dispatch),
    setAnnotationChangesPending: flow(setAnnotationChangesPending, dispatch),
  })
)(StyledCard);
