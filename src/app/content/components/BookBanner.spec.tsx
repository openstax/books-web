import React from 'react';
import renderer from 'react-test-renderer';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import { formatBookData } from '../utils';
import { BarWrapper, BookBanner } from './BookBanner';

const book = formatBookData(archiveBook, mockCmsBook);

describe('BookBanner', () => {

  it('renders empty state with no page or book', () => {
    const component = renderer.create(<BookBanner />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when you pass a page and book', () => {
    const component = renderer.create(<BookBanner page={shortPage} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders empty state when passed a page that isn\'t in the book tree', () => {
    const pageNotInTree = {...shortPage, id: 'asdfasdfasd'};
    const component = renderer.create(<BookBanner page={pageNotInTree} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('mounts in a dom', () => {
    expect(() => renderToDom(<BookBanner page={shortPage} book={book} />)).not.toThrow();
  });

  it('wrapper transition matches snapshot', () => {
    const component = renderer.create(<BarWrapper colorSchema='blue' up={true} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
