
declare module 'jsdom' {

  type window = import ('@openstax/types/lib.dom').Window & {
    DOMParser: import ('@openstax/types/lib.dom').DOMParser,
  };

  export class JSDOM {
    public window: window;
  }
}
