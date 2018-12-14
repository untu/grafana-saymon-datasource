#!/usr/bin/env bash
#
# Installs plugin to local Grafana installation.
#

# Fail on first error.
set -e

./build.sh

sudo ln -s `pwd` /var/lib/grafana/plugins/grafana-saymon-datasource

sudo service grafana-server restart

echo '>> Installation complete!'
