import { MatchImageSnapshotOptions, toMatchImageSnapshot } from 'jest-image-snapshot';

type ToMatchImageSnapshot = (image: Buffer, config: MatchImageSnapshotOptions) => {pass: boolean, message(): string};
interface Config { [key: string]: MatchImageSnapshotOptions; }

export default function(this: jest.MatcherUtils, image: Buffer, config: Config = {}) {
  const options = process.env.CI
    ? config.CI
    : config.DEV;

  return (toMatchImageSnapshot as ToMatchImageSnapshot).bind(this)(image, options || {
    failureThreshold: 0,
  });
}
