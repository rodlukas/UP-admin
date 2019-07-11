#!/usr/bin/env bash

get_latest_release() {
  curl --silent "https://api.github.com/repos/$1/releases/latest" | # Get latest release from GitHub api
    grep '"tag_name":' |                                            # Get tag line
    sed -E 's/.*"([^"]+)".*/\1/'                                    # Pluck JSON value
}

REPO="rodlukas/UP-admin"
LATEST_RELEASE=$(get_latest_release "$REPO")
git clone --branch "$LATEST_RELEASE" "$REPO"
