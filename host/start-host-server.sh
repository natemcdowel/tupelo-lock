#!/bin/bash

node node_modules/react-scripts/scripts/start.js
node ../server/server.js
./tupelo-v0.2.0-linux-arm-7 rpc-server


