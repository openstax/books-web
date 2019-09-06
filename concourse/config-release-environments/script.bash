#!/bin/bash
set -e -u

destination=$(pwd)/environment-configs
base_dir=$(pwd)

for release_dir in "$base_dir"/releases/*
do
  release_id=$(jq -r '.id' < "$release_dir/rex/release.json")
  branch_name=$(dirname "$release_id")
  env_name="${branch_name/\//-}"

  cd "$destination.params.txt"

  {
    echo "env_name=$env_name"
    echo "rex_release_id=$release_id"
  } > "$env_name" 

  cat "$env_name"
done

ls
