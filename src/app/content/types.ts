import { BuyPrintResponse } from '../../gateways/createBuyPrintConfigLoader';
import { RouteParams, RouteState } from '../navigation/types';
import { State as HighlightState } from './highlights/types';
import { State as PracticeQuestionsState } from './practiceQuestions/types';
import { content } from './routes';
import { State as SearchState } from './search/types';
import { State as StudyGuidesState } from './studyGuides/types';

export type SlugParams = {
  slug: string;
};
type VersionedSlugParams = SlugParams & {
  version: string;
};

export type UuidParams = {
  uuid: string;
};
type VersionedUuidParams = UuidParams & {
  version: string;
};

export type Params = {
  book: SlugParams | VersionedSlugParams | VersionedUuidParams;
  page: SlugParams | UuidParams;
};

export interface State {
  tocOpen: boolean | null;
  pageNotFoundId: string | null;
  params: Params | null;
  practiceQuestions: PracticeQuestionsState;
  loading: Partial<Params>;
  search: SearchState;
  showNudgeStudyTools: boolean | null;
  studyGuides: StudyGuidesState;
  highlights: HighlightState;
  book?: Book;
  page?: Page;
  references: Array<PageReferenceMap | PageReferenceError>;
  buyPrint: Pick<BuyPrintResponse['buy_urls'][number], 'url' | 'disclosure'> | null;
}

export interface PageReferenceMap extends PageReference {
  match: string;
}

export interface PageReferenceError {
  match: string;
  type: 'error';
}

export interface PageReference {
  state: RouteState<typeof content>;
  params: RouteParams<typeof content>;
}

export interface BookWithOSWebData extends ArchiveBook {
  book_state: 'coming_soon' | 'deprecated' | 'live' | 'new_edition_available' | 'retired';
  theme: 'blue' | 'green' | 'gray' | 'yellow' | 'deep-green' | 'light-blue' | 'orange' | 'red';
  slug: string;
  promote_image: null | {
    id: number;
    title: string;
    meta: {
      type: string;
      detail_url: string;
      download_url: string;
    }
  };
  publish_date: string;
  amazon_link: string;
  authors: Array<{
    value: {
      name: string;
      senior_author: boolean;
    }
  }>;
}

export type Book = BookWithOSWebData | ArchiveBook;

export interface Page {
  abstract: string | null;
  id: string;
  title: string;
  slug: string;
}

export interface ArchiveTreeNode {
  id: string;
  title: string;
  slug: string;
}

export type ArchiveTreeSection = ArchiveTreeNode;

export interface LinkedArchiveTree extends ArchiveTree {
  parent?: LinkedArchiveTree;
}

export interface LinkedArchiveTreeSection extends ArchiveTreeSection {
  parent: LinkedArchiveTree;
}

export type LinkedArchiveTreeNode = LinkedArchiveTreeSection | LinkedArchiveTree;

export interface ArchiveTree extends ArchiveTreeSection {
  contents: Array<ArchiveTree | ArchiveTreeSection>;
}

export interface ArchiveBook {
  id: string;
  title: string;
  tree: ArchiveTree;
  version: string;
  language: string;
  license: {
    name: string;
    url: string;
    version: string;
  };
  revised: string;
}

export interface ArchivePage {
  abstract: string | null;
  id: string;
  content: string;
  title: string;
  revised: string;
  slug: string;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
