import { HTMLElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedWindowSize } from '../../../reactUtils';
import { assertDocument, remsToPx } from '../../../utils';
import { page as pageSelector } from '../../selectors';
import { hasStudyGuides, studyGuidesEnabled } from '../../studyGuides/selectors';
import {
  arrowDesktopHeight,
  arrowLeftMargin,
  arrowMobileHeight,
  arrowTopMargin,
  closeButtonDistanceFromContent,
  contentMarginTop,
  cookieNudge,
  nudgeStudyToolsMinPageLimit,
  nudgeStudyToolsShowLimit,
  nudgeStudyToolsTargetId,
  spotlightPadding,
  timeIntervalBetweenShowingNudgeInMs,
} from './constants';

interface Positions {
  arrowLeft: number;
  arrowTopOffset: number;
  closeButtonLeft: number;
  closeButtonTopOffset: number;
  contentWrapperRight: number;
  contentWrapperTopOffset: number;
  spotlightHeight: number;
  spotlightLeftOffset: number;
  spotlightTopOffset: number;
  spotlightWidth: number;
}

export const getPositions = (target: HTMLElement, isMobile: boolean, windowWidth: number): Positions => {
  const { top, left, right, height, width } = getBoundingRectOfNudgeTarget(target);
  const padding = remsToPx(spotlightPadding);
  const spotlightTopOffset = top - padding;
  const spotlightLeftOffset = left - padding;
  const spotlightHeight = height + (padding * 2);
  const spotlightWidth = width + (padding * 2);
  const arrowTopOffset = spotlightTopOffset + spotlightHeight + remsToPx(arrowTopMargin);
  const arrowLeft = spotlightLeftOffset + remsToPx(arrowLeftMargin);
  const contentWrapperTopOffset = arrowTopOffset
    + remsToPx(isMobile ? arrowMobileHeight : arrowDesktopHeight)
    + remsToPx(contentMarginTop);
  const contentWrapperRight = windowWidth - right - padding;
  const closeButtonLeft = left + spotlightWidth;
  const closeButtonTopOffset = contentWrapperTopOffset - remsToPx(closeButtonDistanceFromContent);

  return {
    arrowLeft,
    arrowTopOffset,
    closeButtonLeft,
    closeButtonTopOffset,
    contentWrapperRight,
    contentWrapperTopOffset,
    spotlightHeight,
    spotlightLeftOffset,
    spotlightTopOffset,
    spotlightWidth,
  };
};

// Target may have display set to `contents` so we are calculatings rect for children of passed target.
const getBoundingRectOfNudgeTarget = (target: HTMLElement) => {
  // Starting values depends on if we checks for Math.max or Math.min
  let top = 9999;
  let bottom = 0;
  let left = 9999;
  let right = 0;

  for (const child of Array.from(target.children)) {
    const rect = child.getBoundingClientRect();
    top = Math.min(top, rect.top);
    bottom = Math.max(bottom, rect.bottom);
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
  }

  return {
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
  };
};

export const usePositions = (isMobile: boolean) => {
  const [windowWidth] = useDebouncedWindowSize();
  const [positions, setPositions] = React.useState<Positions | null>(null);
  const studyGuides = useSelector(hasStudyGuides);
  const isEnabled = useSelector(studyGuidesEnabled);

  React.useEffect(() => {
    const document = assertDocument();
    const target = document.querySelector(`#${nudgeStudyToolsTargetId}`) as HTMLElement | null;
    if (isEnabled && target) {
      // Make sure that we calculate positions with body overflow set to hidden
      // because it causes scrollbar to hide which results with different positions.
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setPositions(getPositions(target, isMobile, windowWidth));

      // Resets to the value from before calculations. We want this style change to be handled
      // directly in the component.
      document.body.style.overflow = prevOverflow;
    }
    return () => setPositions(null);
  }, [studyGuides, isEnabled, windowWidth, isMobile]);

  return positions;
};

export const getCounterCookie = () => {
  return Number(Cookies.get(cookieNudge.counter) || 0);
};

export const getDateCookie = () => {
  const lastShownDate = Cookies.get(cookieNudge.date);
  return lastShownDate ? new Date(lastShownDate) : undefined;
};

export const passedTimeInterval = () => {
  const lastShownDate = getDateCookie();
  return !lastShownDate
    ? true
    : (Date.now() - lastShownDate.getTime()) > timeIntervalBetweenShowingNudgeInMs
  ;
};

export const getPageCounterCookie = () => {
  return Number(Cookies.get(cookieNudge.pageCounter) || 0);
};

export const incrementPageCounterCookie = () => {
  const counter = getPageCounterCookie();
  Cookies.set(cookieNudge.pageCounter, (counter + 1).toString());
};

export const shouldDisplayNudgeStudyTools = (): boolean => {
  const counter = getCounterCookie();
  const numberOfPagesOpenedByUser = getPageCounterCookie();

  return counter < nudgeStudyToolsShowLimit
    && passedTimeInterval()
    && (numberOfPagesOpenedByUser >= nudgeStudyToolsMinPageLimit);
};

// Set required cookies and reset opened page counter
export const setNudgeStudyToolsCookies = () => {
  const now = new Date();
  const counter = getCounterCookie();
  Cookies.set(cookieNudge.counter, (counter + 1).toString());
  Cookies.set(cookieNudge.date, now.toString());
  Cookies.remove(cookieNudge.pageCounter);
};

export const useIncrementPageCounter = () => {
  const page = useSelector(pageSelector);
  return React.useEffect(() => {
    const counter = getPageCounterCookie();
    if (page && counter <= nudgeStudyToolsMinPageLimit) { incrementPageCounterCookie(); }
  }, [page]);
};
