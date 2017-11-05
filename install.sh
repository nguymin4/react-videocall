#!/bin/bash

cd server && yarn install --pure-lockfile
cd ../client && yarn install --pure-lockfile