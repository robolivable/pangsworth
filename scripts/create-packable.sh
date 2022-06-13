#!/bin/sh

NAME=$(jq -r .name package.json)
VERSION=$(jq -r .version package.json)
RELEASE_PATH=${PWD}/releases/${NAME}-${VERSION}

npm run build-release \
  && rm -rf $RELEASE_PATH && mkdir -p $RELEASE_PATH \
  && cp -R ${PWD}/manifest.json ${PWD}/build ${PWD}/static $RELEASE_PATH
