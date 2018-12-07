#!/bin/bash
set -e

declare dir=`pwd`
echo "Starting in directory: $dir"

declare command="npm start -- $@"
echo "Running command: $command"

npm start -- $@
