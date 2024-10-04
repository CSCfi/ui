#!/bin/bash
if [ "$CI" = true ]; then
  echo "Skip Husky"
else
  if [[ "$OSTYPE" == "msys"* ]]; then
    icacls ./node_modules/husky/lib/bin.js /grant:r *S-1-1-0:F
  elif [[ "$OSTYPE" == "darwin"* || "$OSTYPE" == "linux"* ]]; then
    chmod +x ./node_modules/husky/lib/bin.js
  fi
fi

husky install
