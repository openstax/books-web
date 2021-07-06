// tslint:disable: object-literal-sort-keys max-line-length
import { OSWebBook } from '../../../gateways/createOSWebLoader';

export const contentPage = {
  title: 'Introduction',
  abstract: '',
  content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="d1fd537-77fb-4eac-8a8a-60bbaa747b6d" class="introduction" data-cnxml-to-html-ver="2.1.0"><p>For example, take a look at the image above. This image is of the Andromeda Galaxy, which contains billions of individual stars, huge clouds of gas, and dust. Two smaller galaxies are also visible as bright blue spots in the background. At a staggering 2.5 million light years from the Earth, this galaxy is the nearest one to our own galaxy (which is called the Milky Way). The stars and planets that make up Andromeda might seem to be the furthest thing from most people’s regular, everyday lives. But Andromeda is a great starting point to think about the forces that hold together the universe.</p><p>The forces that cause Andromeda to act as it does are the same forces we contend with here on Earth, whether we are planning to send a rocket into space or simply raise the walls for a new home. The same gravity that causes the stars of Andromeda to rotate and revolve also causes water to flow over hydroelectric dams here on Earth. Tonight, take a moment to look up at the stars. The forces out there are the same as the ones here on Earth. Through a study of physics, you may gain a greater understanding of the interconnectedness of everything we can see and know in this universe.</p></div></body></html>',
  id: '3',
  version: '1.0',
  revised: '',
  slug: 'introduction',
};

export const contentPageWithObjectives = {
  title: 'How to Write a Test',
  content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="d1fd537-77fb-4eac-8a8a-60bbaa747b6d" data-cnxml-to-html-ver="2.1.0"><section class="learning-objectives"><h3 data-type="title">Learning Objectives</h3><p>By the end of this section, you will be able to:</p><ul><li>Explain the importance of citizen engagement in a democracy</li></ul></section><p>This is the paragraph that comes after the learning objectives section. It does not have any special classes applied.</p></div></body></html>',
  abstract: '',
  id: '4',
  version: '1.0',
  revised: '',
  slug: 'how-to-write-a-test',
};

export const contentPageShort = {
  title: 'Best Practices',
  content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="d1fd537-77fb-4eac-8a8a-60bbaa747b6d" data-cnxml-to-html-ver="2.1.0"><p>Two smaller galaxies are also visible as bright blue spots in the background.</p></div></body></html>',
  abstract: '',
  id: '5',
  version: '1.0',
  revised: '',
  slug: 'best-practices',
};

export const eocPage = {
  title: 'Review Questions',
  content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="composite-page" id="d1fd537-77fb-4eac-8a8a-60bbaa747b6d" data-cnxml-to-html-ver="2.1.0"><section><p>Religion describes the beliefs, values, and practices related to sacred or spiritual concerns. Social theorist Émile Durkheim defined religion as a “unified system of beliefs and practices relative to sacred things” (1915). Max Weber believed religion could be a force for social change. Karl Marx viewed religion as a tool used by capitalist societies to perpetuate inequality. Religion is a social institution, because it includes beliefs and practices that serve the needs of society. Religion is also an example of a cultural universal, because it is found in all societies in one form or another. Functionalism, conflict theory, and interactionism all provide valuable ways for sociologists to understand religion.</p></section></div></body></html>',
  abstract: '',
  id: '6',
  version: '1.0',
  revised: '',
  slug: 'review-questions',
};

export const eobPage = {
  title: 'References',
  content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="composite-page" id="d1fd537-77fb-4eac-8a8a-60bbaa747b6d" data-cnxml-to-html-ver="2.1.0"><div class="group-by"><div><p>The forces that cause Andromeda to act as it does are the same forces we contend with here on Earth, whether we are planning to send a rocket into space or simply raise the walls for a new home. The same gravity that causes the stars of Andromeda to rotate and revolve also causes water to flow over hydroelectric dams here on Earth. Tonight, take a moment to look up at the stars. The forces out there are the same as the ones here on Earth. Through a study of physics, you may gain a greater understanding of the interconnectedness of everything we can see and know in this universe.</p></div></div></div></body></html>',
  abstract: '',
  id: '12',
  version: '1.0',
  revised: '',
  slug: 'references',
};

export const mockOsWebBook: OSWebBook = {
  meta: {
    slug: 'js-book',
  },
  publish_date: '',
  authors: [{value: {name: 'Author Name', senior_author: true}}],
  book_state: 'coming_soon',
  cover_color: 'yellow',
  promote_image: null,
  cnx_id: '',
  amazon_link: '',
};

export const emptyPage = {
  title: 'Introduction',
  abstract: '',
  content: '<html xmlns="http://www.w3.org/1999/xhtml"><body></body></html>',
  id: '3',
  version: '1.0',
  revised: '',
  slug: 'introduction',
};

export const mockBook = {
  title: 'JavaScript Testing',
  id: '15',
  language: 'en',
  license: {
    name: '',
    url: '',
    version: '1.0',
  },
  version: '1.0',
  revised: '',
  slug: 'js-book',
  tree: {
    id: '1',
    title: 'JavaScript Testing',
    slug: 'javascript-testing-slug',
    contents: [
      {
        id: '2',
        title: '<span class="os-number"><span class="os-part-text">Chapter </span>1</span><span class="os-divider"> </span><span data-type="" itemprop="" class="os-text">What is a test?</span>',
        slug: '1-what-is-a-test-slug',
        contents: [
          contentPage,
          contentPageWithObjectives,
          contentPageShort,
          eocPage,
        ],
      },
      {
        id: '7',
        title: '<span class="os-number"><span class="os-part-text">Chapter </span>2</span><span class="os-divider"> </span><span data-type="" itemprop="" class="os-text">Unit Testing</span>',
        slug: '2-unit-testing',
        contents: [
          {
            title: 'Content Page',
            abstract: '',
            content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="1d1fd537-77fb-4eac-8a8a-60bbaa747b6d" class="introduction" data-cnxml-to-html-ver="2.1.0"><p>For example, take a look at the image above. This image is of the Andromeda Galaxy, which contains billions of individual stars, huge clouds of gas, and dust. Two smaller galaxies are also visible as bright blue spots in the background. At a staggering 2.5 million light years from the Earth, this galaxy is the nearest one to our own galaxy (which is called the Milky Way). The stars and planets that make up Andromeda might seem to be the furthest thing from most people’s regular, everyday lives. But Andromeda is a great starting point to think about the forces that hold together the universe.</p><p>The forces that cause Andromeda to act as it does are the same forces we contend with here on Earth, whether we are planning to send a rocket into space or simply raise the walls for a new home. The same gravity that causes the stars of Andromeda to rotate and revolve also causes water to flow over hydroelectric dams here on Earth. Tonight, take a moment to look up at the stars. The forces out there are the same as the ones here on Earth. Through a study of physics, you may gain a greater understanding of the interconnectedness of everything we can see and know in this universe.</p></div></body></html>',
            id: '13',
            version: '1.0',
            revised: '',
          },
          {
            id: '8',
            title: '<span data-type="" itemprop="" class="os-text">Chapter Review</span>',
            slug: '8-chapter-review-slug',
            contents: [],
          },
        ],
      },
      {
        id: '10',
        title: 'span class="os-text">Answer Key</span>',
        slug: 'answer-key',
        contents: [],
      },
      eobPage,
    ],
  },
};
