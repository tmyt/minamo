#!/bin/bash
DIR=$(cd "$(dirname "$0")"; pwd)
(cd ${DIR}/../../cli; npm pack; mv ${DIR}/../../cli/minamo-cli-1.0.0.tgz ${DIR})
docker build $* -t minamo-internal/shell ${DIR}
rm ${DIR}/minamo-cli-1.0.0.tgz
