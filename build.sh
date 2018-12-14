#!/usr/bin/env bash
#
# Builds the plugin.
#

# Fail on first error.
set -e

if [ -z `which yarn` ]; then
  echo '>> Installing Yarn...'

  if [ -z `which curl` ]; then
    sudo apt-get install -y --force-yes curl apt-transport-https
  fi

  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee \
    /etc/apt/sources.list.d/yarn.list
  sudo apt-get update
  sudo apt-get install -y --force-yes yarn
fi

yarn
yarn run build
