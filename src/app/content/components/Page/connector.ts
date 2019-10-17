import { IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import * as selectNavigation from '../../../navigation/selectors';
import { AppServices, AppState } from '../../../types';
import { merge } from '../../../utils';
import * as select from '../../selectors';
import { State } from '../../types';
import { ContentLinkProp, mapDispatchToContentLinkProp, mapStateToContentLinkProp } from './contentLinkHandler';
import { HighlightProp, mapDispatchToHighlightProp, mapStateToHighlightProp } from './highlightManager';
import { mapStateToScrollTargetProp } from './scrollTargetManager';
import { mapStateToSearchHighlightProp } from './searchHighlightManager';

export interface PagePropTypes {
  intl: IntlShape;
  page: State['page'];
  book: State['book'];
  currentPath: string;
  className?: string;
  contentLinks: ContentLinkProp;
  locationState: ReturnType<typeof selectNavigation.locationState>;
  scrollTarget: ReturnType<typeof mapStateToScrollTargetProp>;
  searchHighlights: ReturnType<typeof mapStateToSearchHighlightProp>;
  highlights: HighlightProp;
  services: AppServices;
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    contentLinks: mapStateToContentLinkProp(state),
    currentPath: selectNavigation.pathname(state),
    highlights: mapStateToHighlightProp(state),
    page: select.page(state),
    scrollTarget: mapStateToScrollTargetProp(state),
    searchHighlights: mapStateToSearchHighlightProp(state),
  }),
  (dispatch) => ({
    contentLinks: mapDispatchToContentLinkProp(dispatch),
    highlights: mapDispatchToHighlightProp(dispatch),
  }),
  merge
);
