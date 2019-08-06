import React from 'react';
import { BOOKS } from '../../../config';
import { H3 } from '../../components/Typography';
import { StyledContentLink } from '../../content/components/ContentLink';
import { Book } from '../../content/types';
import { findDefaultBookPage } from '../../content/utils';
import withServices from '../../context/Services';
import { AppServices } from '../../types';
import Panel from './Panel';
import { getBooks } from './utils';

interface Props {
  services: AppServices;
}
interface State {
  books: Book[];
}

class Books extends React.Component<Props, State> {
  public state: State = {
    books: [],
  };

  public async componentDidMount() {
    const {archiveLoader, osWebLoader} = this.props.services;
    const bookEntries = Object.entries(BOOKS);
    const books: State['books'] = await getBooks(archiveLoader, osWebLoader, bookEntries);

    this.setState({books});
  }

  public render() {
    const {books} = this.state;

    return <Panel title='Books'>
      <ul>
        {books.map((book) => <li key={book.slug}>
          {this.renderBookLink(book)}
        </li>)}
      </ul>
    </Panel>;
  }

  private renderBookLink(book: Book) {
    const page = findDefaultBookPage(book);
    return <H3><StyledContentLink book={book} page={page}>{book.title}</StyledContentLink></H3>;
  }
}

export default withServices(Books);
