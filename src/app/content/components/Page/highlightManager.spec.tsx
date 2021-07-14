import UntypedHighlighter, {
  Highlight,
  SerializedHighlight as UntypedSerializedHighlight,
} from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import keyBy from 'lodash/fp/keyBy';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { page } from '../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../test/mocks/highlight';
import { AppServices, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { assertDocument } from '../../../utils/browser-assertions';
import Card from '../../highlights/components/Card';
import CardWrapper from '../../highlights/components/CardWrapper';
import { HighlightData, HighlightScrollTarget } from '../../highlights/types';
import { Page } from '../../types';
import highlightManager from './highlightManager';
import { HighlightProp, stubHighlightManager } from './highlightManager';

jest.mock('@openstax/highlighter');

jest.mock('../../highlights/components/utils/showConfirmation',
  () => () => new Promise((resolve) => resolve(false)));
jest.mock('../../highlights/components/Card', () => (props: any) => <div mock-card {...props} />);

UntypedHighlighter.prototype.eraseAll = jest.fn();
UntypedHighlighter.prototype.erase = jest.fn();
UntypedHighlighter.prototype.highlight = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;
const fromApiResponse = UntypedSerializedHighlight.fromApiResponse = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  UntypedHighlighter.prototype.getHighlights = jest.fn(() => []);
  UntypedHighlighter.prototype.getOrderedHighlights = jest.fn(() => []);
});

describe('highlightManager', () => {
  let window: Window;
  let element: HTMLElement;
  let prop: HighlightProp;
  let prevProp: HighlightProp;
  let store: Store;
  let services: AppServices;

  beforeEach(() => {
    window = assertWindow();
    element = window.document.createElement('div');
    prop = {
      clearFocus: jest.fn(),
      focus: jest.fn(),
      focused: undefined,
      hasUnsavedHighlight: false,
      highlights: [],
      highlightsLoaded: true,
      loggedOut: false,
      page,
      scrollTarget: null,
    };
    prevProp = {...prop};
    services = createTestServices();
    store = createTestStore();
  });

  afterEach(() => {
    delete (window as any).document.getSelection;
  });

  it('CardList is rendered initially', () => {
    const {CardList} = highlightManager(element, () => prop, services);
    const component = renderer.create(<Provider store={store}>
      <CardList/>
    </Provider>);
    // findByType method does not work with memo components (ex. styled components)
    // https://github.com/facebook/react/issues/17301
    expect(() => component.root.findByType(CardWrapper.type)).not.toThrow();
  });

  it('CardList is rendered after update', () => {
    const {CardList, update} = highlightManager(element, () => prop, services);
    update(prevProp);
    const component = renderer.create(<Provider store={store}>
      <CardList/>
    </Provider>);
    // findByType method does not work with memo components (ex. styled components)
    // https://github.com/facebook/react/issues/17301
    expect(() => component.root.findByType(CardWrapper.type)).not.toThrow();
  });

  it('CardList doesn\'t double render the pending highlight', async() => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    };
    const mockHighlightData = {id: mockHighlight.id} as HighlightData;
    const {CardList, update} = highlightManager(element, () => prop, services);
    const component = renderer.create(<Provider store={store}>
      <CardList/>
    </Provider>);

    renderer.act(() => {
      update(prevProp);
    });

    expect(component.root.findAllByType(Card).length).toEqual(0);

    await renderer.act(() => {
      Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
      return new Promise((resolve) => defer(resolve));
    });

    expect(component.root.findAllByType(Card).length).toEqual(1);

    prop.highlights = [
      mockHighlightData,
    ];
    Highlighter.mock.instances[0].getHighlight
      .mockReturnValueOnce(undefined)
      .mockReturnValue(mockHighlight);
    Highlighter.mock.instances[0].getOrderedHighlights.mockReturnValue([mockHighlight]);

    renderer.act(() => {
      update(prevProp);
    });

    expect(component.root.findAllByType(Card).length).toEqual(1);
  });

  it('creates highlighter', () => {
    highlightManager(element, () => prop, services);
    expect(Highlighter).toHaveBeenCalled();
  });

  it('calls highlighter.formatMessage', () => {
    const mockFormatMessage = jest.spyOn(services.intl, 'formatMessage').mockImplementation(jest.fn());
    highlightManager(element, () => prop, services);
    expect(Highlighter).toHaveBeenCalled();
    const options = Highlighter.mock.calls[0][1];
    options.formatMessage({ id: 'id' }, { style: 'abc' });
    expect(mockFormatMessage).toHaveBeenCalledWith({ id: 'id' }, { style: 'abc' });
  });

  it('calls highlighter.onFocusIn', async() => {
    highlightManager(element, () => prop, services);
    expect(Highlighter).toHaveBeenCalled();
    const options = Highlighter.mock.calls[0][1];
    options.onFocusIn({ id: 'abc' });
    await new Promise((resolve) => defer(resolve));
    expect(prop.focus).toHaveBeenCalledWith('abc');
  });

  it('calls highlighter.onFocusOut', async() => {
    highlightManager(element, () => prop, services);
    expect(Highlighter).toHaveBeenCalled();
    const options = Highlighter.mock.calls[0][1];
    options.onFocusOut();
    await new Promise((resolve) => defer(resolve));
    expect(prop.clearFocus).toHaveBeenCalled();
  });

  it('noops on highlighter.onFocusOut if active element has data-highlight-card attribute', async() => {
    highlightManager(element, () => prop, services);
    expect(Highlighter).toHaveBeenCalled();
    const options = Highlighter.mock.calls[0][1];
    const document = assertDocument();
    const highlightElement = document.createElement('span');
    highlightElement.setAttribute('data-highlight-card', 'true');
    highlightElement.setAttribute('tabindex', '0');
    document.body.append(highlightElement);
    highlightElement.focus();
    options.onFocusOut();
    await new Promise((resolve) => defer(resolve));
    expect(prop.clearFocus).not.toHaveBeenCalled();
  });

  it('noops on highlighter.onFocusOut if active element has data-for-screenreaders attribute', async() => {
    highlightManager(element, () => prop, services);
    expect(Highlighter).toHaveBeenCalled();
    const options = Highlighter.mock.calls[0][1];
    const document = assertDocument();
    const highlightElement = document.createElement('span');
    highlightElement.setAttribute('data-for-screenreaders', 'true');
    highlightElement.setAttribute('tabindex', '0');
    document.body.append(highlightElement);
    highlightElement.focus();
    options.onFocusOut();
    await new Promise((resolve) => defer(resolve));
    expect(prop.clearFocus).not.toHaveBeenCalled();
  });

  it('highlights highlights', () => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    };
    const mockHighlightData = {id: mockHighlight.id} as HighlightData;
    const {update} = highlightManager(element, () => prop, services);

    prop.highlights = [
      mockHighlightData,
    ];

    const highlight = Highlighter.mock.instances[0].highlight;

    Highlighter.mock.instances[0].getHighlight
      .mockReturnValueOnce(mockHighlight)
      .mockReturnValueOnce(undefined)
      .mockReturnValue(mockHighlight)
    ;

    fromApiResponse.mockReturnValue(mockHighlight);

    update(prevProp);

    expect(fromApiResponse).toHaveBeenCalledTimes(1);
    expect(fromApiResponse).toHaveBeenCalledWith(mockHighlightData);
    expect(highlight).toHaveBeenCalled();
    expect(highlight.mock.calls[0][0]).toBe(mockHighlight);
  });

  it('erases highlights', () => {
    const mockHighlight1 = createMockHighlight();
    const mockHighlight2 = createMockHighlight();
    const {update} = highlightManager(element, () => prop, services);

    prop.highlights = [
      {id: mockHighlight1.id} as HighlightData,
    ];

    const erase = Highlighter.mock.instances[0].erase;

    Highlighter.mock.instances[0].getHighlight.mockImplementation(
      (id: string) => keyBy('id', [mockHighlight1, mockHighlight2])[id]
    );
    Highlighter.mock.instances[0].getHighlights.mockReturnValue([mockHighlight1, mockHighlight2]);

    fromApiResponse
      .mockReturnValueOnce(mockHighlight1)
      .mockReturnValueOnce(mockHighlight2)
    ;

    update(prevProp);

    expect(erase).toHaveBeenCalledTimes(1);
    expect(erase).toHaveBeenCalledWith(mockHighlight2);
  });

  it('focuses highlights without scrolling to them', () => {
    const mockHighlights = [
      createMockHighlight(),
      createMockHighlight(),
    ];
    const {update} = highlightManager(element, () => prop, services);

    prop.focused = mockHighlights[0].id;
    prop.highlights = mockHighlights.map(({id}) => ({id} as HighlightData));

    const addFocusedStyles = jest.spyOn(mockHighlights[0], 'addFocusedStyles');
    const highlightScrollIntoView = jest.fn();
    mockHighlights[0].elements.push({
      scrollIntoView: highlightScrollIntoView,
    } as any as HTMLElement);

    Highlighter.mock.instances[0].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[0].getHighlight.mockImplementation((id: string) => keyBy('id', mockHighlights)[id]);

    update(prevProp);

    expect(addFocusedStyles).toHaveBeenCalledTimes(1);
    expect(highlightScrollIntoView).toHaveBeenCalledTimes(0);
    expect(addFocusedStyles).toHaveBeenCalledWith();
  });

  it('focuses scroll target highlight and scrolls it into view', () => {
    const mockHighlights = [
      createMockHighlight(),
      createMockHighlight(),
    ];
    const {update} = highlightManager(element, () => prop, services);

    prop.scrollTarget = {
      elementId: 'does-not-matter',
      id: mockHighlights[1].id,
      type: 'highlight',
    } as HighlightScrollTarget;

    const addFocusedStyles = jest.spyOn(mockHighlights[1], 'addFocusedStyles');
    const highlightScrollIntoView = jest.fn();
    mockHighlights[1].elements.push({
      scrollIntoView: highlightScrollIntoView,
    } as any as HTMLElement);

    const options = {
      onSelect: jest.fn(),
    };

    Highlighter.mock.instances[0].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[0].getHighlight.mockImplementation((id: string) => keyBy('id', mockHighlights)[id]);

    update(prevProp, options);

    expect(addFocusedStyles).toHaveBeenCalledTimes(1);
    expect(highlightScrollIntoView).toHaveBeenCalledTimes(1);
    expect(prop.focus).toHaveBeenCalledWith(mockHighlights[1].id);
    expect(options.onSelect).toHaveBeenCalledWith(mockHighlights[1]);
  });

  it('calls options.onSelect with null if user is loggedOut, page is fetched and there is scroll target', () => {
    const mockHighlights = [] as Highlight[];
    const {update} = highlightManager(element, () => prop, services);

    prop.highlightsLoaded = false;
    prop.loggedOut = true;
    prop.page = { id: 'mock-page' } as any as Page;
    prop.scrollTarget = {
      elementId: 'does-not-matter',
      id: 'asdf',
      type: 'highlight',
    } as HighlightScrollTarget;

    Highlighter.mock.instances[0].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[0].getHighlight.mockImplementation((id: string) => keyBy('id', mockHighlights)[id]);

    const options = {
      onSelect: jest.fn(),
    };

    update(prevProp, options);

    expect(options.onSelect).toHaveBeenCalledWith(null);
  });

  it(`calls options.onSelect with null if highlight from scroll target was not found`, () => {
    const mockHighlights = [
      createMockHighlight(),
      createMockHighlight(),
    ];
    const {update} = highlightManager(element, () => prop, services);

    prop.scrollTarget = {
      elementId: 'does-not-matter',
      id: 'this-id-does-not-exists',
      type: 'highlight',
    } as HighlightScrollTarget;

    Highlighter.mock.instances[0].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[0].getHighlight.mockImplementation((id: string) => keyBy('id', mockHighlights)[id]);

    const options = {
      onSelect: jest.fn(),
    };

    update(prevProp, options);

    expect(options.onSelect).toHaveBeenCalledWith(null);
  });

  it('umounts', () => {
    const manager = highlightManager(element, () => prop, services);

    const unmount = Highlighter.mock.instances[0].unmount = jest.fn();

    manager.unmount();

    expect(unmount).toHaveBeenCalled();
  });

  describe('onSelect', () => {
    let manager: ReturnType<typeof highlightManager>;

    beforeEach(() => {
      manager = highlightManager(element, () => prop, services);
    });

    afterEach(() => {
      manager.unmount();
    });

    describe('without unsaved changes', () => {
      it('noops when there are highlights in the selection', () => {
        const highlight = Highlighter.mock.instances[0].highlight = jest.fn();

        Highlighter.mock.calls[0][1].onSelect([{}], {});
        expect(highlight).not.toBeCalled();
      });

      it('shows create card when there aren\'t any highlights in selection', async() => {
        const mockHighlight = createMockHighlight();
        manager.update(prevProp);
        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);

        expect(component.root.findAllByType(Card).length).toEqual(0);

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
          return new Promise((resolve) => defer(resolve));
        });

        expect(component.root.findAllByType(Card).length).toEqual(1);
      });

      it('clears pending highlight when it is removed from state', async() => {
        const mockHighlight = createMockHighlight();
        const existingHighlight = {
          ...createMockHighlight(),
          isAttached: () => true,
        };
        prop.highlights = [{id: existingHighlight.id} as HighlightData];

        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);

        Highlighter.mock.instances[0].getHighlight
          .mockReturnValueOnce(existingHighlight)
          .mockReturnValueOnce()
          .mockReturnValueOnce(existingHighlight)
        ;

        Highlighter.mock.instances[0].getOrderedHighlights
          .mockReturnValueOnce([existingHighlight]);

        fromApiResponse.mockReturnValue(existingHighlight);

        renderer.act(() => {
          manager.update(prevProp);
        });

        expect(component.root.findAllByType(Card).length).toEqual(1);

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
          return new Promise((resolve) => defer(resolve));
        });
        prop.focused = mockHighlight.id;

        expect(component.root.findAllByType(Card).length).toEqual(2);

        Highlighter.mock.instances[0].getHighlight
          .mockReturnValueOnce(existingHighlight)
          .mockReturnValueOnce(mockHighlight)
          .mockReturnValueOnce(mockHighlight);

        Highlighter.mock.instances[0].getHighlights.mockReturnValue([existingHighlight, mockHighlight]);

        Highlighter.mock.instances[0].getOrderedHighlights
          .mockReturnValueOnce([existingHighlight]);

        renderer.act(() => {
          manager.update(prevProp);
        });

        expect(component.root.findAllByType(Card).length).toEqual(1);
      });

      it('clears pending highlight when it is removed from state before element is mounted', async() => {
        const mockHighlight = createMockHighlight();
        manager.update(prevProp);

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
          return new Promise((resolve) => defer(resolve));
        });

        Highlighter.mock.instances[0].getHighlights.mockReturnValue([mockHighlight]);
        renderer.act(() => {
          manager.update(prevProp);
        });

        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);
        expect(component.root.findAllByType(Card).length).toEqual(0);
      });

      it('loads pending highlight when selected before component mount', async() => {
        const mockHighlight = createMockHighlight();
        manager.update(prevProp);

        Highlighter.mock.calls[0][1].onSelect([], mockHighlight);

        await new Promise((resolve) => defer(resolve));

        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);

        await new Promise((resolve) => defer(resolve));

        expect(component.root.findAllByType(Card).length).toEqual(1);
      });
    });

    describe('with unsaved changes', () => {
      const removeAllRanges = jest.fn();
      beforeEach(() => {
        window.getSelection = jest.fn(() => ({
          removeAllRanges,
        })) as any;

        prop.focused = 'random id';
        prop.hasUnsavedHighlight = true;
        manager.update(prevProp);
      });

      it('noops if user decides not to discard changes', async() => {
        const highlight = Highlighter.mock.instances[0].highlight = jest.fn();

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], {});
          return new Promise((resolve) => defer(resolve));
        });

        expect(highlight).not.toHaveBeenCalled();
        expect(removeAllRanges).toHaveBeenCalled();
      });
    });
  });

  describe('onClick', () => {
    let manager: ReturnType<typeof highlightManager>;

    beforeEach(() => {
      manager = highlightManager(element, () => prop, services);
    });

    afterEach(() => {
      manager.unmount();
    });

    it('noops without highlight', async() => {
      Highlighter.mock.calls[0][1].onClick();
      await new Promise((resolve) => defer(resolve));
      expect(prop.focus).not.toHaveBeenCalled();
    });

    it('noops if user decides not to discard changes', async() => {
      prop.focused = 'random id';
      prop.hasUnsavedHighlight = true;

      manager.update(prevProp);

      Highlighter.mock.calls[0][1].onClick({});
      await new Promise((resolve) => defer(resolve));
      expect(prop.focus).not.toHaveBeenCalled();
    });

    it('focuses on click', async() => {
      const mockHighlight = createMockHighlight();

      Highlighter.mock.calls[0][1].onClick(mockHighlight);

      await new Promise((resolve) => defer(resolve));

      expect(prop.focus).toHaveBeenCalledWith(mockHighlight.id);
    });

    it('noops when you click on not a highlight', () => {
      Highlighter.mock.calls[0][1].onClick();
      expect(prop.focus).not.toHaveBeenCalled();
    });
  });
});

describe('stubHighlightManager', () => {
  it('umounts', () => {
    expect(stubHighlightManager.unmount).not.toThrow();
  });
});
