type Observer = (font: string) => void;

export default class FontCollector {
  private _fonts: string[] = [];
  private observers: Observer[] = [];

  public get fonts(): ReadonlyArray<string> {
    return this._fonts;
  }

  public add(font: string) {
    this._fonts.push(font);
    this.observers.forEach((observer) => observer(font));
  }

  public handle(observer: Observer) {
    this.observers.push(observer);
    this.fonts.forEach((font) => observer(font));
  }
}
