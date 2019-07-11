#!/usr/bin/env bash

get_latest_release() {
  curl --silent "https://api.github.com/repos/$1/releases/latest" | # Get latest release from GitHub api
    grep '"tag_name":' |                                            # Get tag line
    sed -E 's/.*"([^"]+)".*/\1/'                                    # Pluck JSON value
}

LATEST_RELEASE=$(get_latest_release "rodlukas/UP-admin")
git clone --depth 1 --branch "$LATEST_RELEASE" "https://github.com/rodlukas/UP-admin.git"
