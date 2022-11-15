#!/usr/bin/env bash
# pokud se jedna o tagged commit, vytvor frontend.zip
# se sestavenym frontendem (vcetne template) pro nahrani na GH

if [ "$GITHUB_REF_TYPE" = "tag" ]; then
  zip --must-match --recurse-paths frontend.zip frontend/build admin/templates/react-autogenerate.html --exclude frontend/build/assets/react-autogenerate.html
else
  echo "frontend.zip se nevytvoril, protoze se nejedna o tagged commit"
fi
