GDG[x] Hub
===

[![Build Status](https://travis-ci.org/gdg-x/hub.png?branch=master)](https://travis-ci.org/gdg-x/hub)

The public instance of the GDG[x] Hub is hosted at [https://hub.gdgx.io]

## Required tools
* npm and bower
* mongodb

## Install dependencies
```
npm install
bower install
```
## Configure API keys

lib/config/keys.js
* Google API
* New Relic API

## Check Mongo Server
```
mongod
```

## Start Debug Server (with Livereload)
```
grunt serve
```
## Check installation
* check that all event data has been received by ???

## Build the Hub
```
grunt build
```
The distributable version will be placed in /dist
