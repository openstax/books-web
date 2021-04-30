import React from 'react';
import renderer from 'react-test-renderer';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { assertDocument } from '../../../utils/browser-assertions';
import Note from './Note';

describe('Note', () => {
  it('matches snapshot', () => {
    const textarea = assertDocument().createElement('textarea');

    const component = renderer.create(<TestContainer>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onChange', () => {
    const textareaElement = assertDocument().createElement('textarea');

    const onChange = jest.fn();
    const component = renderer.create(<TestContainer>
      <Note textareaRef={{ current: textareaElement }} note='' onChange={onChange} onFocus={() => null} />
    </TestContainer>);

    const textarea = component.root.findByType('textarea');

    renderer.act(() => {
      textarea.props.onChange({
        target: {
          value: 'asdf',
        },
      });
    });

    expect(onChange).toHaveBeenCalledWith('asdf');
  });

  it('resizes on update when necessary', () => {
    const textarea = assertDocument().createElement('textarea');

    const {node, root} = renderToDom(<TestContainer>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
    </TestContainer>);

    Object.defineProperty(node, 'scrollHeight', { value: 100 });
    Object.defineProperty(node, 'offsetHeight', { value: 50 });

    renderToDom(<TestContainer>
      <Note textareaRef={{ current: textarea }} note='asdf' onChange={() => null} onFocus={() => null} />
    </TestContainer>, root);

    expect(node.style.height).toEqual('105px');
  });

  it('doesn\'t resize on update when unneccessary', () => {
    const textarea = assertDocument().createElement('textarea');

    const {node, root} = renderToDom(<TestContainer>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
    </TestContainer>);

    Object.defineProperty(node, 'scrollHeight', { value: 50 });
    Object.defineProperty(node, 'offsetHeight', { value: 50 });

    renderToDom(<TestContainer>
      <Note textareaRef={{ current: textarea }} note='asdf' onChange={() => null} onFocus={() => null} />
    </TestContainer>, root);

    expect(node.style.height).toEqual('');
  });
});
