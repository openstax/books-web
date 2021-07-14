import { modalQueryParameterName } from '../../content/constants';
import { modalUrlName as SGmodalUrlName } from '../../content/studyGuides/constants';
import { summaryFilters } from '../../content/studyGuides/selectors';
import { AppServices, MiddlewareAPI } from '../../types';
import { push } from '../actions';
import * as navigation from '../selectors';
import { updateQuery } from '../utils';

export const openModal = (modalUrlName: string) => (services: MiddlewareAPI & AppServices) => () => {
  const state = services.getState();
  const existingQuery = navigation.query(state);
  const match = navigation.match(state);
  const { colors: sgColors, locationIds: sgLocationIds } = summaryFilters(state);

  if (match) {
    const query = {
      ...existingQuery,
      ...modalUrlName === SGmodalUrlName
        ? { colors: sgColors, locationIds: sgLocationIds }
        : {},
    };
    services.dispatch(push(match, {
      search: updateQuery({[modalQueryParameterName]: modalUrlName}, query),
    }));
  }
};
