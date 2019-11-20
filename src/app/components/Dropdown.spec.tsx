import React from 'react';
import renderer from 'react-test-renderer';
import * as onClickOutside from '../content/highlights/components/utils/onClickOutside';
import MessageProvider from '../MessageProvider';
import Dropdown, { DropdownItem, DropdownList } from './Dropdown';

describe('Dropdown', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (closed)', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (open)', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('tab hidden closes', () => {
    const useOnClickOutside = jest.spyOn(onClickOutside, 'useOnClickOutside');

    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useOnClickOutside.mock.calls[0][2]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();
  });
});
