import { receivePageFocus } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { actionHook } from '../../../utils';
import { closeMyHighlights, openMyHighlights } from '../actions';
import { modalUrlName } from '../constants';
import createHighlight from './createHighlight';
import { initializeMyHighlightsSummaryHook } from './initializeMyHighlightsSummary';
import { loadMoreHook, setSummaryFiltersHook } from './loadMore';
import loadHighlights from './locationChange';
import { openMyHighlightsHook } from './openMyHighlights';
import { printHighlightsHook } from './printHighlights';
import receiveDeleteHighlight from './receiveDeleteHighlight';
import requestDeleteHighlight from './requestDeleteHighlight';
import { closeModal, openModal } from './sharedHooks';
import updateHighlight from './updateHighlight';

export { loadHighlights };

export default [
  createHighlight,
  receiveDeleteHighlight,
  requestDeleteHighlight,
  updateHighlight,
  initializeMyHighlightsSummaryHook,
  setSummaryFiltersHook,
  openMyHighlightsHook,
  printHighlightsHook,
  loadMoreHook,
  actionHook(closeMyHighlights, closeModal),
  actionHook(openMyHighlights, openModal(modalUrlName)),
  actionHook(receiveUser, loadHighlights),
  actionHook(receivePageFocus, loadHighlights),
];
