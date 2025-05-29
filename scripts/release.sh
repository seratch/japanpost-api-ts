#!/bin/bash

script_dir=`dirname $0`
cd $script_dir/..

npm i
npm run build:clean
npm publish
