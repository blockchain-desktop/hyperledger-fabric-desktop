#!/bin/bash

npm run package
cd out
tar zcf 'Fabric-Desktop-linux-x64.tar.gz' 'Fabric-Desktop-linux-x64'