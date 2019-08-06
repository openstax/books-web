import { Event } from '@openstax/types/lib.dom';
import React from 'react';

export type OnScrollCallback = (e: Event) => void;
interface Props {callback: OnScrollCallback; }

export default class OnScroll extends React.Component<Props> {
  public componentDidMount() {
    if (typeof(document) === 'undefined') {
      return;
    }

    document.addEventListener('touchmove', this.props.callback, {passive: false});
    document.addEventListener('scroll', this.props.callback, {passive: false});
  }

  public componentWillUnmount() {
    if (typeof(document) === 'undefined') {
      return;
    }
    document.removeEventListener('touchmove', this.props.callback);
    document.removeEventListener('scroll', this.props.callback);
  }

  public render() {
    return this.props.children;
  }
}
