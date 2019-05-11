#!/bin/bash

./tupelo-v0.2.0-linux-arm-7 rpc-server
node ../server/server.js
react-scripts start
