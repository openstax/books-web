declare module 'scroll-to-element' {

  interface Options {
    offset: number;
  }

  export default function scrolltoElement(e: Element, options?: Options): void;
}
