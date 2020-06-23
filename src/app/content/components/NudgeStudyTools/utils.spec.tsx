import { Document, HTMLElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import * as reactUtils from '../../../reactUtils';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import * as studyGuidesSelect from '../../studyGuides/selectors';
import * as constants from './constants';
import * as utils from './utils';

describe('useGetStudyToolsTarget', () => {
  let document: Document;
  let target: HTMLElement;
  let store: Store;
  // tslint:disable-next-line: variable-name
  let Component: () => JSX.Element;

  beforeEach(() => {
    document = assertDocument();
    target = document.createElement('div');
    target.setAttribute('id', constants.nudgeStudyToolsTargetId);
    jest.spyOn(target, 'getBoundingClientRect')
      .mockReturnValue({ top: 100, left: 200, right: 300, height: 40, width: 300, bottom: 200 });
    document.body.appendChild(target);

    store = createTestStore();
    Component = () => {
      const targetElement = utils.useGetStudyToolsTarget();
      return <React.Fragment>
        {
          targetElement
          ? `id: ${targetElement.getAttribute('id')}, ${targetElement.toString()}`
          : null
        }
      </React.Fragment>;
    };
  });

  afterEach(() => {
    target.remove();
  });

  it('return target if has study guides', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);

    const component = renderer.create(<Provider store={store}>
      <Component />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('return null if there are no study guides', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(false);

    const component = renderer.create(<Provider store={store}>
      <Component />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('usePositions', () => {
  let document: Document;
  let target: HTMLElement;
  let store: Store;
  // tslint:disable-next-line: variable-name
  let Component: (props: { isMobile: boolean }) => JSX.Element;

  beforeEach(() => {
    document = assertDocument();
    target = document.createElement('div');
    target.setAttribute('id', constants.nudgeStudyToolsTargetId);
    jest.spyOn(target, 'getBoundingClientRect')
      .mockReturnValue({ top: 100, left: 200, right: 300, height: 40, width: 300, bottom: 200 });
    document.body.appendChild(target);

    store = createTestStore();
    Component = (props) => {
      const positions = utils.usePositions(props.isMobile);
      return <React.Fragment>
        {JSON.stringify(positions)}
      </React.Fragment>;
    };
  });

  afterEach(() => {
    target.remove();
  });

  it('return null if target was not found', () => {
    target.remove();

    const component = renderer.create(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    // assign target so afterEach not throw an error
    target = document.createElement('div');
  });

  it('returns different positions depends on isMobile and windowWidth', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);

    jest.spyOn(reactUtils, 'useDebouncedWindowSize')
      .mockReturnValueOnce([1900])
      .mockReturnValueOnce([1900])
      .mockReturnValueOnce([1900])
      .mockReturnValue([1200]);

    // Call component.update multiple times to make sure that nested hooks are called

    const component = renderer.create(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    component.update(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    component.update(<Provider store={store}>
      <Component isMobile={true} />
    </Provider>);

    component.update(<Provider store={store}>
      <Component isMobile={true} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    component.update(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    component.update(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('cookies helpers', () => {
  beforeEach(() => {
    Cookies.remove(constants.cookieNudgeStudyGuidesDate);
    Cookies.remove(constants.cookieNudgeStudyGuidesCounter);
    Cookies.remove(constants.cookieNudgeStudyGuidesPageCounter);
  });

  it('getCounterCookie gets counter or 0', () => {
    expect(utils.getCounterCookie()).toEqual(0);
    Cookies.set(constants.cookieNudgeStudyGuidesCounter, '2');
    expect(utils.getCounterCookie()).toEqual(2);
  });

  it('getDateCookie gets date or undefined', () => {
    expect(utils.getDateCookie()).toEqual(undefined);
    const date = new Date();
    Cookies.set(constants.cookieNudgeStudyGuidesDate, date.toString());
    expect(utils.getDateCookie()).toEqual(new Date(date.toString()));
  });

  it('getPageCounterCookie gets counter or undefined', () => {
    expect(utils.getPageCounterCookie()).toEqual(0);
    Cookies.set(constants.cookieNudgeStudyGuidesPageCounter, '3');
    expect(utils.getPageCounterCookie()).toEqual(3);
  });

  it('passedTimeInterval - return false if did not pass time interval', () => {
    expect(utils.passedTimeInterval()).toEqual(true);
    Cookies.set(constants.cookieNudgeStudyGuidesDate, new Date().toString());
    expect(utils.passedTimeInterval()).toEqual(false);
  });

  it('passedTimeInterval - return true if passed allowed time interval or last date is undefined', () => {
    expect(utils.passedTimeInterval()).toEqual(true);
    const now = new Date();
    const passed = new Date(now.getTime() - constants.timeIntervalBetweenShowingNudgeInMs - 10000);
    Cookies.set(constants.cookieNudgeStudyGuidesDate, passed.toString());
    expect(utils.passedTimeInterval()).toEqual(true);
  });

  it('incrementPageCounterCookie increments page counter cookie', () => {
    expect(utils.getPageCounterCookie()).toEqual(0);
    utils.incrementPageCounterCookie();
    utils.incrementPageCounterCookie();
    expect(utils.getPageCounterCookie()).toEqual(2);
  });

  it('shouldDisplayNudgeStudyTools - return true only if all criteria passes', () => {
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(false);

    const now = new Date();
    const passed = new Date(now.getTime() - constants.timeIntervalBetweenShowingNudgeInMs - 10000);
    Cookies.set(constants.cookieNudgeStudyGuidesDate, passed.toString());
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(false);

    Cookies.set(constants.cookieNudgeStudyGuidesPageCounter, constants.nudgeStudyToolsMinPageLimit.toString());
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(true);

    Cookies.set(constants.cookieNudgeStudyGuidesCounter, constants.nudgeStudyToolsShowLimit.toString());
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(false);
  });

  it('setNudgeStudyToolsCookies', () => {
    Cookies.set(constants.cookieNudgeStudyGuidesPageCounter, '1');
    const counter = utils.getCounterCookie();
    const pageCounter = utils.getPageCounterCookie();
    const date = utils.getDateCookie();
    expect(counter).toEqual(0);
    expect(pageCounter).toEqual(1);
    expect(date).toEqual(undefined);

    utils.setNudgeStudyToolsCookies();

    expect(utils.getCounterCookie()).toEqual(1);
    expect(utils.getPageCounterCookie()).toEqual(0);
    expect(utils.getDateCookie()).toBeTruthy();
  });

  it('useIncrementPageCounter - increments page counter cookie to until it reaches limit', () => {
    const store = createTestStore();
    // tslint:disable-next-line: variable-name
    const Component = () => {
      utils.useIncrementPageCounter();
      return <div/>;
    };

    const component = renderer.create(<Provider store={store}>
      <Component />
    </Provider>);

    component.update(() => {
      expect(utils.getPageCounterCookie()).toEqual(0);
    });

    component.update(<Provider store={store}>
      <Component />
    </Provider>);
    component.update(() => {
      expect(utils.getPageCounterCookie()).toEqual(1);
    });

    component.update(<Provider store={store}>
      <Component />
    </Provider>);
    component.update(() => {
      expect(utils.getPageCounterCookie()).toEqual(2);
    });

    component.update(<Provider store={store}>
      <Component />
    </Provider>);
    component.update(() => {
      expect(utils.getPageCounterCookie()).toEqual(3);
    });
  });
});
