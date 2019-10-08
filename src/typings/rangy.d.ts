
declare module 'rangy' {
  export interface RangyRange extends NativeRange {
    nativeRange: NativeRange;
    setStartAndEnd(startNode: Node, startOffset: number, endNode?: Node, endOffset?: number): any;
    setStartAndEnd(startNode: Node, startOffset: number, endOffset: number): any;
    canSurroundContents(): boolean;
    isValid(): boolean;
    toHtml(): string;
    compareNode(node: Node): any;
    intersectsOrTouchesRange(range: RangyRange): boolean;
    intersectsRange(range: RangyRange): boolean;
    intersection(range: RangyRange): RangyRange;
    cloneRange<T extends RangyRange>(this: T): T;
    union(range: RangyRange): RangyRange;
    containsNode(node: Node, partial: boolean): boolean;
    containsNodeContents(node: Node): boolean;
    containsNodeText(node: Node): boolean;
    containsRange(range: RangyRange): boolean;
    splitBoundaries(): any;
    normalizeBoundaries(): any;
    collapseToPoint(node: Node, offset: number): any;
    collapseBefore(node: Node): any;
    collapseAfter(node: Node): any;
    getNodes(nodeTypes?: any[], filter?: (node: Node) => boolean): Node[];
    getBookmark(containerNode?: Node): {start: number, end: number};
    getDocument(): Document;
    inspect(): string;
    equals(range: RangyRange): boolean;
    refresh(): any;
    select(): any;
    toCharacterRange(containerNode: Node, opts?: any): {start: number, end: number};
  }

  export interface TextRange {
    findText: (searchTerm: string, options?: {
      caseSensitive?: boolean,
      withinRange?: NativeRange | RangyRange,
      wholeWordsOnly?: boolean,
      wrap?: boolean,
      direction?: 'backward' | 'forward',
    }) => boolean;
  }

  export interface RangyStatic<R extends RangyRange = RangyRange> {
    initialized: boolean;
    init: () => void;
    supported: boolean;
    createNativeRange(doc?: Document | Window | HTMLIFrameElement): Range;
    createRange(doc?: Document | Window | HTMLIFrameElement): R;
    createRangyRange(doc?: Document | Window | HTMLIFrameElement): R;
    getNativeSelection(win?: Window): Selection;
    getSelection(doc?: Document | Window | HTMLIFrameElement): RangySelection;
    addInitListener(listener: (rangy: RangyStatic) => void): any;
    shim(): any;
    createMissingNativeApi(): any;
  }

  export default rangy;
  declare var rangy: RangyStatic;
  type NativeRange = import ('@openstax/types/lib.dom').Range;
}
