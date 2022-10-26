#!/bin/sh

NAME=$(jq -r .name package.json)
VERSION=$(jq -r .version package.json)
RELEASE_PATH=${PWD}/releases/${NAME}-${VERSION}
RELEASE_PACKED=$RELEASE_PATH.crx

sha256sum $RELEASE_PACKED >> $RELEASE_PACKED.sha256
