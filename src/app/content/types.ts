
export interface Params {
  bookId: string;
  pageId: string;
}

export interface State {
  tocOpen: boolean;
  params?: Params;
  loading: {
    book?: string;
    page?: string;
  };
  book?: {
    id: string;
    shortId: string;
    title: string;
  };
  page?: {
    id: string;
    shortId: string;
    title: string;
  };
}

export interface ArchiveContent {
  id: string;
  shortId: string;
  content: string;
  version: string;
  title: string;
}
