interface Books {
  [key: string]: {
    defaultVersion: string;
  };
}

declare const books: Books;
export = books;
