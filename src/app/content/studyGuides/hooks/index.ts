import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { closeModal } from '../../../navigation/hooks/closeModalHook';
import { openModal } from '../../../navigation/hooks/openModalHook';
import { actionHook } from '../../../utils';
import * as actions from '../actions';
import { modalUrlName } from '../constants';
import {
  loadMoreHook,
  locationChangeHook,
  setSummaryFiltersHook,
} from './loadMore';
import loadStudyGuides, { hookBody as loadStudyGuidesHookBody } from './locationChange';
import { openStudyGuidesHook } from './openStudyGuides';
import { printStudyGuidesHook } from './printStudyGuides';
import { hookBody as updateQueryWithSummaryFiltersHookBody } from './updateQueryWithSummaryFiltersHookBody';

export {
  loadStudyGuides,
};

export default [
  loadMoreHook,
  locationChangeHook,
  printStudyGuidesHook,
  openStudyGuidesHook,
  setSummaryFiltersHook,
  actionHook(actions.openStudyGuides, openModal(modalUrlName)),
  actionHook(actions.closeStudyGuides, closeModal),
  actionHook(receiveFeatureFlags, loadStudyGuidesHookBody),
  actionHook(actions.updateSummaryFilters, updateQueryWithSummaryFiltersHookBody),
  actionHook(actions.setDefaultSummaryFilters, updateQueryWithSummaryFiltersHookBody),
];
