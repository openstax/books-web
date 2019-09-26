#!/bin/bash
# shellcheck disable=SC2016
# sed expression needs $s
set -e

# i struggled with getopt(s) for about two hours before breaking down and doing this
if [[ "$*" =~ (^(--profile=([^ ]+) )?([^ ]+) ([^ ]+)$) ]]; then
  aws_profile="${BASH_REMATCH[3]}"
  first_release="${BASH_REMATCH[4]}"
  second_release="${BASH_REMATCH[5]}"
else
  echo "invalid command"
  exit 1;
fi

function stripToContent() {
  while IFS= read -r -d '' -u 9
  do
    path=$REPLY

    sed -Ei '' \
      -e '1h;2,$H;$!d;g' \
      -e 's/^.*id="main-content"[^>]*>(.*)<div class="PrevNextBar.*$/\1/' \
      -e 's/id="(term)?[0-9]+(_copy_[0-9]+)?"/id="[redacted for uniqueness]"/g' \
      -e 's/(href="[^"#]+#)(term)?[0-9]+(_copy_[0-9]+)?"/\1[redacted for uniqueness]"/g' \
      -e 's/(data-cnxml-to-html-ver=")[\.0-9]+"/\1[redacted for uniqueness]"/' \
      "$path"
  done 9< <( find books -type f -exec printf '%s\0' {} + )
}

if [[ -n $aws_profile ]]; then
  echo "switching to aws profile: $aws_profile";
  export AWS_DEFAULT_PROFILE=$aws_profile
fi

git checkout --orphan "content-diffs--$first_release-$second_release"
git clean -fd

aws s3 sync "s3://unified-web-primary/rex/releases/$first_release/books" books/
stripToContent

git add books
git -c commit.gpgsign=false commit -m "stripped content for $first_release"

rm -rf books/*

aws s3 sync "s3://unified-web-primary/rex/releases/$second_release/books" books/
stripToContent

git add books
git -c commit.gpgsign=false commit -m "stripped content for $second_release"
