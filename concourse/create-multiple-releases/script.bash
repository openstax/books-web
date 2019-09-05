#!/bin/bash
set -e -u

destination=$(pwd)/releases
base_dir=$(pwd)

for branch_dir in "$base_dir"/rex-build-branches/*
do
  branch_name=$(basename "$branch_dir")
  sha=$(< "$branch_dir/.git/short_ref")
  release_id="$branch_name/$sha"

  cd "$branch_dir"

  {
    echo "REACT_APP_RELEASE_ID=$release_id"
    echo "PUBLIC_URL=/rex/releases/${release_id}"
    echo "REACT_APP_CODE_VERSION=$sha"
  } > env.txt

  cat env.txt

  exists=$(curl -s -o /dev/null -w "%{http_code}" "https://openstax.org/rex/releases/$release_id/rex/release.json")

  if [ "$exists" != "404" ]; then
    echo "$release_id already exists, doing nothing."
    continue
  fi

  echo "building docker image for $release_id"

  docker build . -t "$branch_name"
  docker run -v "$destination/$branch_name:/output" --env-file=env.txt "$branch_name" bash -c "yarn prerender && mv build/* /output/"
done
