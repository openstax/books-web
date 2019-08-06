#!/bin/bash

destination=$(pwd)/release

cd /code || exit 111

yarn prerender

cp -r build/* "$destination"
