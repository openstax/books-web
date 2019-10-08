import { HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';

const {Consumer, Provider} = React.createContext({
  registerMainContent: (_mainContent: HTMLDivElement | null): void => {
    throw new Error('BUG: MainContent must be inside SkipToContentWrapper');
  },
});

export {
  Consumer,
  Provider,
};
