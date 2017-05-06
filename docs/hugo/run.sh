#!/usr/bin/env sh

echo "HUGO_THEME:" $HUGO_THEME
echo "HUGO_BASEURL" $HUGO_BASEURL
echo "ARGS" $@

HUGO=/usr/local/sbin/hugo
echo "Building one time..."
$HUGO --source="/app" --theme="$HUGO_THEME" --destination="/app/public" --baseUrl="$HUGO_BASEURL" "$@" || exit 1
