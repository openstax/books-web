import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import { assertDocument } from '../app/utils';
import { APP_ENV, RELEASE_ID } from '../config';

/*
 * when a page is initially loaded, the built in release
 * id might legitimately be different from the environment.json
 * release id if a deployment is currently in progress. in order
 * to avoid repeatedly prompting to reload in this case, we wait
 * to actually observe the environment.json release id change
 * before prompting.
 *
 * there is potential to miss the environment.json changing if
 * the window doesn't have focus, so after a bit we can start
 * trusting the release id from environment.json and just compare
 * it to our built one
 */

const pollInterval = 1000 * 60; // 1m
export const trustAfter = 1000 * 60 * 60; // 1h
const pageLoaded = new Date().getTime();
const trustRelease = () => (new Date().getTime()) - pageLoaded > trustAfter;
let previousObservedReleaseId: string | undefined;

export type Cancel = () => void;
interface Environment {
  release_id: string;
}

const processEnvironment = (store: Store, environment: Environment) => {
  const releaseId = environment.release_id;

  if (
    (trustRelease() && releaseId !== RELEASE_ID)
    || (previousObservedReleaseId && previousObservedReleaseId !== releaseId)
  ) {
    store.dispatch(updateAvailable());
  }

  previousObservedReleaseId = releaseId;
};

export const poll = (store: Store) => async() => {
  const environment = await fetch('/rex/environment.json')
    .then((response) => response.json() as Promise<Environment>)
    .catch(() => null)
  ;

  if (environment) {
    processEnvironment(store, environment);
  }
};

export default (store: Store): Cancel => {
  if (APP_ENV !== 'production') {
    return () => undefined;
  }

  const handler = poll(store);
  const document = assertDocument();
  let interval: ReturnType<typeof setInterval>;

  const visibilityListener = () => document.visibilityState === 'visible'
    ? activateInterval()
    : clearInterval(interval);

  const cancel = () => {
    document.removeEventListener('visibilitychange', visibilityListener);
    clearInterval(interval);
  };
  const activateInterval = () => {
    interval = setInterval(handler, pollInterval);
    handler();
  };

  activateInterval();
  document.addEventListener('visibilitychange', visibilityListener);

  return cancel;
};
