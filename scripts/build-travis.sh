#!/usr/bin/env bash
set -e

info() { echo "$0: $1"; }
error() { info "$1"; exit 1; }
skip() { info "$1. Skipping build."; exit; }

[[ "$TRAVIS" ]] || error "this script assumes its running within Travis"

[[ "$TRAVIS_PULL_REQUEST" == "false" ]] || {
  skip "This build was triggered by a pull request"
}

type="snapshot"
[[ "$TRAVIS_TAG" ]] && type="release"
[[ "$TRAVIS_BRANCH" == "staging" ]] && type="staging"

[[ "$type" != "snapshot" ]] && {
  openssl aes-256-cbc -K $encrypted_eecd1dce8c89_key -iv $encrypted_eecd1dce8c89_iv -in .android/release-files.tar.enc -out .android/release-files.tar -d
  tar xvf .android/release-files.tar -C .android
}

grunt ehaCordovaBuild:"$type"
# Deploy only the resulting APK(s), not the interim artefacts
rm -rf build/move
