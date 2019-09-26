import UntypedRangy, { RangyRange as BaseRangyRange, RangyStatic, TextRange } from 'rangy';
import 'rangy/lib/rangy-textrange';

export type RangyRange = BaseRangyRange & TextRange;

const rangy = UntypedRangy as RangyStatic<RangyRange & TextRange>;

if (!rangy.initialized) {
  rangy.init();
}

export default rangy;

export const findTextInRange = (
  withinRange: RangyRange,
  text: string,
  range: RangyRange = rangy.createRange()
): RangyRange[] => {
  const foundMatch = range.findText(text, {
    withinRange: withinRange.cloneRange(),
  });

  // no matches, or matches were outside the given range boundaries
  if (!foundMatch || !range.intersectsRange(withinRange)) {
    return [];
  }

  const match = range.cloneRange();
  range.collapse(false);

  // if we're outside the given range boundaries after collapsing, don't
  // check for more matches
  if (!range.intersectsRange(withinRange)) {
    return [match];
  }

  return [
    match,
    ...findTextInRange(withinRange, text, range),
  ];
};
