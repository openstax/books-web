import { Event, HTMLElement, TouchEvent, Window } from '@openstax/types/lib.dom';
import React from 'react';
import { getTouchScrollElement } from '../domUtils';

export type OnScrollCallback = (e: Event) => void;
export type OnTouchMoveCallback = (element: Window | HTMLElement, e: TouchEvent) => void;

interface Props {
  callback?: OnScrollCallback;
  onTouchMove?: OnTouchMoveCallback;
}

export default class OnScroll extends React.Component<Props> {
  private lastTouch: TouchEvent | null = null;

  public componentDidMount() {
    if (typeof(document) === 'undefined') {
      return;
    }

    document.addEventListener('touchstart', this.onTouchStart, {passive: false});
    document.addEventListener('touchend', this.onTouchEnd, {passive: false});
    document.addEventListener('touchmove', this.onTouchMove, {passive: false});

    if (this.props.callback) {
      document.addEventListener('touchmove', this.props.callback, {passive: false});
      document.addEventListener('scroll', this.props.callback, {passive: false});
    }
  }

  public componentWillUnmount() {
    if (typeof(document) === 'undefined') {
      return;
    }
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('touchmove', this.onTouchMove);

    if (this.props.callback) {
      document.removeEventListener('touchmove', this.props.callback);
      document.removeEventListener('scroll', this.props.callback);
    }
  }

  public render() {
    return this.props.children;
  }

  private onTouchMove = (e: TouchEvent) => {
    if (!this.lastTouch || !this.props.onTouchMove) {
      return;
    }

    const element = getTouchScrollElement(this.lastTouch, e);

    if (element) {
      this.props.onTouchMove(element, e);
    }

    this.lastTouch = e;
  };

  private onTouchStart = (e: TouchEvent) => {
    this.lastTouch = e;
  };
  private onTouchEnd = () => {
    this.lastTouch = null;
  };
}
