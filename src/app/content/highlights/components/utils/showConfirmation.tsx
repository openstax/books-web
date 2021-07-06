import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid/v4';
import MessageProvider from '../../../../messages/MessageProvider';
import { assertDocument, assertNotNull } from '../../../../utils';
import ConfirmationModal from '../ConfirmationModal';

export default async() => {
  const document = assertDocument();
  const domNode = document.createElement('div');

  domNode.id = `dialog-${uuid()}`;
  const root = assertNotNull(document.getElementById('root'), 'root element not found');
  root.insertAdjacentElement('afterend', domNode);

  const userChoice: boolean = await new Promise((resolve) => {
    const confirm = () => resolve(true);
    const deny = () => resolve(false);
    ReactDOM.render(
      <MessageProvider>
        <ConfirmationModal deny={deny} confirm={confirm} />
      </MessageProvider>,
      domNode
    );
  });

  ReactDOM.unmountComponentAtNode(domNode);
  assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

  return userChoice;
};
