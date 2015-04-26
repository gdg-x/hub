GDG[x] Hub
===

[![Join the chat at https://gitter.im/gdg-x/hub](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gdg-x/hub?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/gdg-x/hub.png?branch=master)](https://travis-ci.org/gdg-x/hub)

The public instance of the GDG[x] Hub is hosted at [https://hub.gdgx.io]

## Required tools
* [Node.js](https://nodejs.org/download/)
* Bower - `npm install -g bower`
* Grunt - `npm install -g grunt grunt-cli`
* [MongoDB](https://github.com/gdg-x/hub/wiki/MongoDB-Config)

Note: `npm` may require `sudo` on OS X or Linux.

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

## Build the Hub
```
grunt build
```
The distributable version will be placed in /dist

## Start Debug Server (with Livereload)
```
grunt serve
```

## Run Tests
```
grunt test
```

## Check installation
* check that all event data has been received by ???

## History (just for the fun of it)

https://docs.google.com/document/d/1X8fuwTvA4Y2Hm_PmP8gE_VH6kNd6lYGXjbOfoNUapcM/edit?usp=sharing&authkey=CMiRgOYF
