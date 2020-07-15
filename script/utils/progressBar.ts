import ProgressBar from 'progress';

const noop = {
  interrupt: (message: string) => console.log(message), // tslint:disable-line:no-console
  tick: () => null,
};

export default function(...args: ConstructorParameters<typeof ProgressBar>) {

  if (!process.stdout.isTTY) {
    return noop;
  }

  return new ProgressBar(...args);
}
