
export type Meta = {property: string; content: string} | {name: string; content: string; };

export interface State {
  title: string;
  meta: Meta[];
}
