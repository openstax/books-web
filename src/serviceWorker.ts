import { ServiceWorker, ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import noop from 'lodash/fp/noop';
import { assertWindow } from './app/utils';
// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read http://bit.ly/CRA-PWA

const window = assertWindow();
const navigator = window.navigator;
const fetch = window.fetch;

const isLocalhost = Boolean(window && (
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
));

const isSameOrigin = Boolean((() => {
  // The URL constructor is available in all browsers that support SW.
  const publicUrl = new URL(
    (process as { env: { [key: string]: string } }).env.PUBLIC_URL,
    window.location.href
  );
  // Our service worker won't work if PUBLIC_URL is on a different origin
  // from what our page is served on. This might happen if a CDN is used to
  // serve assets; see https://github.com/facebook/create-react-app/issues/2374
  return publicUrl.origin === window.location.origin;
})());

interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export function register(config?: Config) {
  if (!navigator || !navigator.serviceWorker) { return; }
  if (process.env.NODE_ENV !== 'production') { return; }
  if (!isSameOrigin) { return; }

  window.addEventListener('load', onLoad(config));
}

const onLoad = (config?: Config) => () => {
  const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

  if (isLocalhost) {
    // This is running on localhost. Let's check if a service worker still exists or not.
    checkValidServiceWorker(swUrl, config);
  } else {
    // Is not localhost. Just register service worker
    registerValidSW(swUrl, config);
  }
};

const onStateChange = (
  installingWorker: ServiceWorker,
  config: Config | undefined,
  registration: ServiceWorkerRegistration
) => () => {
  if (!navigator || !config || installingWorker.state !== 'installed') {
    return;
  }

  const callback = (navigator.serviceWorker.controller
    ? config.onUpdate
    : config.onSuccess
  ) || noop;

  callback(registration);
};

function registerValidSW(swUrl: string, config?: Config) {
  if (!navigator) { return; }

  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) { return; }
        installingWorker.onstatechange = onStateChange(installingWorker, config, registration);
      };
    })
    .catch(() => {
      // black hole
    });
}

function isValidSWResponse(response: any) {
  // Ensure service worker exists, and that we really are getting a JS file.
  const contentType = response.headers.get('content-type');
  return response.status !== 404
    && contentType !== null
    && contentType.indexOf('javascript') !== -1;
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  if (!fetch || !navigator) { return; }
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl).then((response: any) => isValidSWResponse(response)
      // Service worker found. Proceed as normal.
      ? registerValidSW(swUrl, config)
      // No service worker found. Probably a different app. Reload the page.
      : navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        })
    )
    .catch(() => {
      // black hole
    });
}

export function unregister() {
  if (!navigator) { return; }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
