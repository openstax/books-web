import flow from 'lodash/fp/flow';
import identity from 'lodash/fp/identity';
import createArchiveLoader from '../../../gateways/createArchiveLoader';
import { Book, Page } from '../types';

export default function getCleanContent(
  book: Book | undefined,
  page: Page | undefined,
  archiveLoader: ReturnType<typeof createArchiveLoader>,
  transformer: (content: string) => string = identity
) {
  const cachedPage = book && page &&
    archiveLoader.book(book.id, book.version).page(page.id).cached()
  ;

  const pageContent = cachedPage ? cachedPage.content : '';

  const replacements = (content: string) => content
    // remove body and surrounding content
    .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
    // fix assorted self closing tags
    .replace(/<(a|em|h3|iframe|span|strong|sub|sup|u|figcaption)([^>]*?)\/>/g, '<$1$2></$1>')
    // remove page titles from content (they are in the nav)
    .replace(/<(h1|h2|div) data-type="document-title".*?<\/\1>/, '')
    // move (first-child) figure and table ids up to the parent div
    .replace(/(<div[^>]*)(>[^<]*<(?:figure|table)[^>]*?) (id=[^\s>]*)/g, '$1 $3$2 data-$3')
  ;

  return flow(replacements, transformer)(pageContent);
}
