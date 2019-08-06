import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { ComponentType, ReactElement } from 'react';
import ReactDOM from 'react-dom';

// JSDom logs to console.error when an Error is thrown.
// Disable the console just in this instance, and re-enable after.
// See https://github.com/facebook/jest/pull/5267#issuecomment-356605468
export function expectError(message: string, fn: () => void) {
  const consoleError = jest.spyOn(console, 'error');
  consoleError.mockImplementation(() => { /* suppress jsdom logging to console */ });

  try {
      fn();
      expect('Code should not have succeeded').toBeFalsy();
  } catch (err) {
      expect(err.message).toBe(message);
  } finally {
      consoleError.mockRestore();
  }
}

// Utility to handle nulls and SFCs
export function renderToDom<C extends ComponentType>(subject: ReactElement<C>, container?: HTMLElement) {

  // tslint:disable-next-line:variable-name
  const Wrapper = class extends Component {
    public render() {
      return subject;
    }
  };

  if (!document) {
    throw new Error('document is requried to render to dom');
  }

  const domContainer = container || document.createElement('div');
  const c = ReactDOM.render<C>(<Wrapper />, domContainer) as C;

  if (!c) {
      throw new Error(`BUG: Component was not rendered`);
  }
  const node = ReactDOM.findDOMNode(c) as HTMLElement;

  return {
    node,
    root: domContainer as HTMLElement,
    tree: c,
  };
}
