#!/bin/bash
target="$(pwd)/src/test/fixtures/specials/version"
sim=radio-waves

if [ -d "${target}/${sim}" ]; then
  exit 0
fi

curl -s "https://s3.amazonaws.com/rex-web-build-resources/${sim}.tar.gz" | tar -xzv -C "${target}"
