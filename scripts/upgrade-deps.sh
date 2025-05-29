#!/bin/bash

script_dir=`dirname $0`
cd $script_dir/..

npm i debug@latest
npm i -D @biomejs/biome@latest @types/debug@latest @types/node@latest @vitest/coverage-v8@latest typescript@latest vitest@latest
