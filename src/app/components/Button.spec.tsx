import React from 'react';
import renderer from 'react-test-renderer';
import Button from './Button';

describe('Button', () => {
  it('matches snapshot - small', () => {
    const component = renderer.create(<Button size='small' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot - medium', () => {
    const component = renderer.create(<Button size='medium' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot - large', () => {
    const component = renderer.create(<Button size='large' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot - primary', () => {
    const component = renderer.create(<Button variant='primary' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot - secondary', () => {
    const component = renderer.create(<Button variant='secondary' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('matches snapshot - default', () => {
    const component = renderer.create(<Button variant='default' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
