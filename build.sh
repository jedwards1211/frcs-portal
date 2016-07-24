#!/usr/bin/env bash

COMMIT=$(git rev-parse HEAD)
VERSION=$(node -e "console.log(require('./package').version)")
docker build -t "frcs/portal:$COMMIT" -t "frcs/portal:$VERSION" .
docker push "frcs/portal:$COMMIT"
docker push "frcs/portal:$VERSION"
