#!/bin/bash
# shellcheck disable=SC2016
# sed expression needs $s
set -e

echo "HACKING WORKBOX SCRIPT WITH STRING REPLACEMENT"
echo "remove this when offical solution is merged https://github.com/facebook/create-react-app/pull/5369"

function abs_path {
  (cd "$(dirname '$1')" &>/dev/null && printf "%s/%s" "$PWD" "${1##*/}")
}

build=$(abs_path "${BASH_SOURCE%/*}/../build")
worker="$build"/service-worker.js

# add cache behaviors for 100% offline load 
cp "$worker" "$worker".bak
head -n 39 "$worker".bak > "$worker"

cat >> "$worker" <<- EOM
workbox.routing.registerRoute(
  /https:\/\/buyprint\.openstax\.org/,
  new workbox.strategies.StaleWhileRevalidate({ // can't use cachefirst because responses are opaque
    cacheName: 'buy-print',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/mathjax\//,
  new workbox.strategies.StaleWhileRevalidate({ // can't use cachefirst because responses are opaque
    cacheName: 'cdn-assets',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 100, // mathjax loads a lot of files
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /\/cms\/assets\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'cms-assets',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /\/contents|resources|extras\//,
  new workbox.strategies.CacheFirst({
    cacheName: 'book-content',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 300,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /\/apps\/cms\/api\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'cms-api',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
      }),
    ],
  })
);
EOM

mkdir "$build"/books

mv "$worker" "$build"/books/
