import createArchiveLoader from '../../../gateways/createArchiveLoader';
import { Book, Page } from '../types';

function ident(x: string) { return x; }

export default function getCleanContent(
    book: Book | undefined,
    page: Page | undefined,
    archiveLoader: ReturnType<typeof createArchiveLoader>,
    reducer = ident) {

  const cachedPage = book && page &&
    archiveLoader.book(book.id, book.version).page(page.id).cached()
  ;

  const pageContent = cachedPage ? cachedPage.content : '';

  return reducer(pageContent)
    // remove body and surrounding content
    .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
    // fix assorted self closing tags
    .replace(/<(em|h3|iframe|span|strong|sub|sup|u|figcaption)([^>]*?)\/>/g, '<$1$2></$1>')
    // remove page titles from content (they are in the nav)
    .replace(/<(h1|h2|div) data-type="document-title".*?<\/\1>/, '')
    // target blank and add `rel` to links that begin with: http:// https:// //
    .replace(/<a ([^>]*?href="(https?:\/\/|\/\/).*?)>/g, '<a target="_blank" rel="noopener nofollow" $1>')
    // same as previous, but allow indexing links to relative content
    .replace(/<a(.*?href="\.\.\/.*?)>/g, '<a target="_blank"$1>')
    // move (first-child) figure and table ids up to the parent div
    .replace(/(<div[^>]*)(>[^<]*<(?:figure|table)[^>]*?) (id=[^\s>]*)/g, '$1 $3$2 data-$3')
  ;
}
