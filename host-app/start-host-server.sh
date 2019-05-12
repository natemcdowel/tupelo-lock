#!/bin/bash

nohup node node_modules/react-scripts/scripts/start.js &
nohup node ../server/server.js &
nohup ./tupelo-v0.2.0-linux-arm-7 rpc-server &
