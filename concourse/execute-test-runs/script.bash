#!/usr/bin/env bash
set -e -u

base_dir=$(pwd)
failed=0


cloudfront_environment=$(< cloudfront-environment/version.txt)

cd rex-web

export BASE_URL="https://$cloudfront_environment"

echo "checking for runs using $BASE_URL"

for tr_run_dir in "$base_dir"/test-plans/*
do
  tr_run_id=$(basename "$tr_run_dir")
  base_url=$(< "$tr_run_dir/base_url.txt")

  if [[ "$BASE_URL" == "$base_url" ]]; then
    echo "found test plan $tr_run_id"

    browser=$(< "$tr_run_dir/browser.txt")
    export TR_RUN_ID=$tr_run_id
    export BROWSER=$browser

    make test-rail-sauce || failed=1
  fi
done

exit "$failed"
