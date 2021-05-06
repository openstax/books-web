import React from 'react';
import { createIntl, RawIntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import en from '../../../../app/messages/en/index';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { makeFindByTestId } from '../../../../test/reactutils';
import * as Services from '../../../context/Services';
import { Store } from '../../../types';
import Confirmation from './Confirmation';

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('Confirmation', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  const intl = createIntl({
    locale: 'en',
    messages: {
      ...en,
      'i18n:confirm': 'confirm',
      'i18n:message': 'message',
    },
  });

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  it('matches snapshot no selection', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            message='message'
            data-analytics-region='region'
            confirmMessage='confirm'
            onConfirm={() => null}
            onCancel={() => null}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('prevents default when clicking confirm button', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            message='message'
            confirmMessage='confirm'
            onCancel={() => null}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');

    const preventDefault = jest.fn();
    button.props.onClick({preventDefault});

    expect(preventDefault).toHaveBeenCalled();
  });

  it('prevents default when clicking cancel button', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            message='message'
            confirmMessage='confirm'
            onCancel={() => null}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('cancel');

    const preventDefault = jest.fn();
    button.props.onClick({preventDefault});

    expect(preventDefault).toHaveBeenCalled();
  });

  it('doesn\'t prevent default when clicking confirm link', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            confirmLink='/asdf'
            message='message'
            confirmMessage='confirm'
            onCancel={() => null}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');

    const preventDefault = jest.fn();
    button.props.onClick({preventDefault});

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('calls onConfirm', () => {
    const onConfirm = jest.fn();
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            message='message'
            confirmMessage='confirm'
            onConfirm={onConfirm}
            onCancel={() => null}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');
    button.props.onClick({preventDefault: jest.fn()});

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel', () => {
    const onCancel = jest.fn();
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            message='message'
            confirmMessage='confirm'
            onConfirm={() => null}
            onCancel={onCancel}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('cancel');
    button.props.onClick({preventDefault: jest.fn()});

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls always', () => {
    const always = jest.fn();
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <RawIntlProvider value={intl}>
          <Confirmation
            message='message'
            confirmMessage='confirm'
            onCancel={() => null}
            always={always}
          />
        </RawIntlProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    findByTestId('confirm').props.onClick({preventDefault: jest.fn()});
    findByTestId('cancel').props.onClick({preventDefault: jest.fn()});

    expect(always).toHaveBeenCalledTimes(2);
  });
});
