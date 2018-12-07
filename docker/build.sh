#!/bin/bash
set -e

declare -r NAV_ALLY="/nav-ally/defs"

docker build . -t $1 --no-cache

if [ -n "$2" ]; then
  docker run -v "$(pwd)":$NAV_ALLY $1 -f $NAV_ALLY/$2
fi
