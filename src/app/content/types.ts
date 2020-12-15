import { BuyPrintResponse } from '../../gateways/createBuyPrintConfigLoader';
import { RouteParams, RouteState } from '../navigation/types';
import { State as HighlightState } from './highlights/types';
import { State as PracticeQuestionsState } from './practiceQuestions/types';
import { content } from './routes';
import { State as SearchState } from './search/types';
import { State as StudyGuidesState } from './studyGuides/types';

export interface SlugParams {
  slug: string;
}
interface VersionedSlugParams extends SlugParams {
  version: string;
}

export interface UuidParams {
  uuid: string;
}
interface VersionedUuidParams extends UuidParams {
  version: string;
}

export interface Params {
  book: SlugParams | VersionedSlugParams | VersionedUuidParams;
  page: SlugParams | UuidParams;
}

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
  references: PageReferenceMap[];
  buyPrint: Pick<BuyPrintResponse['buy_urls'][number], 'url' | 'disclosure'> | null;
}

export interface PageReferenceMap extends PageReference {
  match: string;
}

export interface PageReference {
  state: RouteState<typeof content>;
  params: RouteParams<typeof content>;
}

export interface BookWithOSWebData extends ArchiveBook {
  book_state: 'coming_soon' | 'deprecated' | 'live' | 'new_edition_available' | 'retired';
  theme: 'blue' | 'green' | 'gray' | 'yellow' | 'deep-green' | 'light-blue' | 'orange' | 'red';
  slug: string;
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
  abstract: string;
  id: string;
  title: string;
  version: string;
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
  license: {
    name: string;
    version: string;
  };
  revised: string;
}

export interface ArchivePage {
  abstract: string;
  id: string;
  content: string;
  version: string;
  title: string;
  revised: string;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
