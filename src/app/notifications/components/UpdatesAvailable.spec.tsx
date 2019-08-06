import ReactType from 'react';
import rendererType from 'react-test-renderer';
import MessageProvider from '../../MessageProvider';
import UpdatesAvailable from './UpdatesAvailable';

describe('UpdatesAvailable', () => {
  describe('in browser', () => {
    const reloadBackup = window!.location.reload;
    let reload: jest.SpyInstance;
    let renderer: typeof rendererType;
    let React: typeof ReactType; // tslint:disable-line:variable-name

    beforeEach(() => {
      React = require('react');
      renderer = require('react-test-renderer');

      reload = window!.location.reload = jest.fn();
    });

    afterEach(() => {
      window!.location.reload = reloadBackup;
    });

    it('reloads on click', () => {
      const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
      component.root.findByType('button').props.onClick();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    let renderer: typeof rendererType;
    let React: typeof ReactType; // tslint:disable-line:variable-name

    beforeEach(() => {
      jest.resetModules();
      delete (global as any).window;
      delete (global as any).document;
      React = require('react');
      renderer = require('react-test-renderer');
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('does nothing on click', () => {
      const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
      component.root.findByType('button').props.onClick();
      expect(() => component.root.findByType('button').props.onClick()).not.toThrow();
    });
  });
});
