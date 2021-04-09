import { setHead } from '../../head/actions';
import { pathname } from '../../navigation/selectors';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { receivePage } from '../actions';
import { defaultTheme } from '../components/constants';
import { hasOSWebData } from '../guards';
import { content as contentRoute } from '../routes';
import * as select from '../selectors';
import { getCanonicalUrlParams } from '../utils/canonicalUrl';
import getCleanContent from '../utils/getCleanContent';
import { createTitle, getDescriptionPhrase } from '../utils/seoUtils';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../types';
import { assertDefined } from '../../utils';

const stripHtmlAndTrim = (str: string) => str
  .replace(/(<span class="os-math-in-para">)(.*?)(<\/span>)/g, ' ... ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/ +/g, ' ')
  .trim()
  .substring(0, 155)
  .trim();

  const getContentDom = (str: string) => {
    const d = document!.createElement('div')!;
    d.innerHTML = str;
    console.log(d)
    return d;
  }

const getChapterName = (tree: LinkedArchiveTree | LinkedArchiveTreeSection | undefined) => {
  if (!tree) return "";
  const chapterNum = tree.slug.match(/\d*(?=-)/);
  if (tree.slug.includes("chapter") && tree.parent) {
    console.log(tree.parent)
    return stripHtmlAndTrim(tree.parent.title);
  } else if (chapterNum) {
    return `Chapter ${chapterNum}`;
  } else {
    return "the";
  }
}

const getPageTitle = (str: string, tree: LinkedArchiveTree | LinkedArchiveTreeSection | undefined) => {
  console.log('getting title: ', str, tree)
  return str.includes("Chapter") ? "no title" : str
}

const hookBody: ActionHookBody<typeof receivePage> = ({
  getState,
  dispatch,
  archiveLoader,
  osWebLoader}) => async() => {

  const state = getState();
  const book = select.book(state);
  const page = select.page(state);
  const loadingBook = select.loadingBook(state);
  const loadingPage = select.loadingPage(state);
  const currentPath = pathname(state);

  if (!page || !book) {
    return;
  }
  if (loadingBook) {
    return;
  }
  if (loadingPage) {
    return;
  }

  const title = createTitle(page, book);
  const cleanContent = getCleanContent(book, page, archiveLoader);
  const contentDom = getContentDom(cleanContent);
  const pageType = contentDom.children[0].getAttribute("data-type");
  const firstParagraph = contentDom.querySelector("p")?.outerHTML || "";
  const node = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );
  console.log(getDescriptionPhrase(node))
  const chapterName = getChapterName(node);
  const pageTitle = getPageTitle(page.title, node);
  const description = pageType === "page" ? stripHtmlAndTrim(firstParagraph): `On this page you will discover the ${pageTitle} for ${chapterName} of OpenStax's ${book.title} free college textbook.`
  const canonical = await getCanonicalUrlParams(archiveLoader, osWebLoader, book, page.id, book.version);
  const canonicalUrl = canonical && contentRoute.getUrl(canonical);
  const bookTheme = theme.color.primary[hasOSWebData(book) ? book.theme : defaultTheme].base;

  dispatch(setHead({
    links: canonicalUrl ? [
      {rel: 'canonical', href: `https://openstax.org${canonicalUrl}`},
    ] : [],
    meta: [
      {name: 'description', content: description},
      {property: 'og:description', content: description},
      {property: 'og:title', content: title},
      {property: 'og:url', content: `https://openstax.org${currentPath}`},
      {name: 'theme-color', content: bookTheme},
    ],
    title,
  }));
};

export default hookBody;
