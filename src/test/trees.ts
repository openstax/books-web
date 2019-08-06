export const treeWithoutUnits = {
  contents: [
    {
      id: 'preface@1',
      shortId: 'prefaceshortid@1',
      title: '<span class="os-divider"> </span><span class="os-text">preface</span>',
    },
    {
      contents: [
        {
          id: 'page1@1',
          shortId: 'page1shortid@1',
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
        },
        {
          id: 'page2@1',
          shortId: 'page2shortid@1',
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
        },
        {
          contents: [
            {
              id: 'reviewpage@1',
              shortId: 'reviewpageshortid@1',
              // tslint:disable-next-line:max-line-length
              title: '<span class="os-text">review page</span>',
            },
          ],
          id: 'review@1',
          shortId: 'reviewshortid@1',
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-text">chapter review</span>',
        },
      ],
      id: 'chapter1@1',
      shortId: 'chapter1shortid@1',
      // tslint:disable-next-line:max-line-length
      title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
    },
    {
      id: 'appendix@1',
      shortId: 'appendixshortid@1',
      title: '<span class="os-number">A</span><span class="os-divider"> | </span><span class="os-text">Appendix</span>',
    },
  ],
  id: 'bookid@1',
  shortId: 'bookshortid@1',
  title: '<span class="os-text">cool book</span>',
};
export const treeWithUnits = {
  contents: [
    {
      contents: [
        {
          id: 'preface@1',
          shortId: 'prefaceshortid@1',
          title: '<span class="os-divider"> </span><span class="os-text">preface</span>',
        },
        {
          contents: [
            {
              id: 'page1@1',
              shortId: 'page1shortid@1',
              // tslint:disable-next-line:max-line-length
              title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
            },
            {
              id: 'page2@1',
              shortId: 'page2shortid@1',
              // tslint:disable-next-line:max-line-length
              title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
            },
          ],
          id: 'chapter1@1',
          shortId: 'chapter1shortid@1',
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
        },
      ],
      id: 'unitid@1',
      shortId: 'unitshortid@1',
      title: '<span class="os-text">some unit</span>',
    },
  ],
  id: 'bookid@1',
  shortId: 'bookshortid@1',
  title: '<span class="os-text">cool book</span>',
};
