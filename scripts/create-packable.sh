#!/bin/sh

NAME=$(jq -r .name package.json)
VERSION=$(jq -r .version package.json)
RELEASE_PATH=${PWD}/releases/${NAME}-${VERSION}

npm run build-release \
  && rm -rf $RELEASE_PATH && mkdir -p $RELEASE_PATH \
  && cp -R ${PWD}/manifest.json ${PWD}/build ${PWD}/static $RELEASE_PATH \
  && echo "#############################################################" \
  && echo "-" \
  && echo "Release prepared:"\
  && echo "${RELEASE_PATH}" \
  && echo "-" \
  && echo "Please use the browser's extension packing tool to pack this" \
  && echo "release. Then run \`npm run prepare-release\` to generate the" \
  && echo "shasum file before uploading." \
  && echo "#############################################################" \
