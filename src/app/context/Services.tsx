import React from 'react';
import { AppServices } from '../types';

const {Consumer, Provider} = React.createContext({} as AppServices);

export {
  Consumer,
  Provider,
};

interface ServiceConsumer {
  services: AppServices;
}

/* tslint:disable-next-line:variable-name */
export default <P extends ServiceConsumer>(Component: React.ComponentType<P>) =>
  (props: Pick<P, Exclude<keyof P, keyof ServiceConsumer>>) => <Consumer>
    {(services) => {
      // @ts-ignore - remove this when https://github.com/Microsoft/TypeScript/issues/28748 is resolved
      return <Component services={services} {...props} />;
    }}
  </Consumer>;
