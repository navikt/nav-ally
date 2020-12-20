#!/bin/zsh

npm version $1 # major, minor, or patch

git commit -am "Bump version to $2"
git tag $2

git push
git push --tags

npm publish
