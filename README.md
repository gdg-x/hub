GDG[x] Hub
===

[![Join the chat at https://gitter.im/gdg-x/hub](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gdg-x/hub?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/gdg-x/hub.png?branch=master)](https://travis-ci.org/gdg-x/hub)

The public instance of the GDG[x] Hub is hosted at [https://hub.gdgx.io]

## Required tools
* [Node.js](https://nodejs.org/download/)
* [MongoDB](https://github.com/gdg-x/hub/wiki/MongoDB-Config)


## Install dependencies
Run `npm install`

## Configure API keys

1. Define the **simpleApiKey**: The API key for your project, available from the [Cloud Console](https://cloud.google.com/console)
    1. Create a new project then go to APIs & Auth->APIs, activate Google+ API.
    1. Go to APIs & Auth->Credentials. Add Credentials->API key->Browser key->Create (keep `Any referrer allowed` set).
1. Define the **oauthClientId** and **oauthClientSecret**: The Client Id and secret for your project, available from the [Cloud Console](https://cloud.google.com/console)
    1. Go to APIs & Auth->Credentials. Add Credentials->API key->OAuth 2.0 client ID->Web Application->Create.

* lib/config/keys.js
    * simpleApiKey - Browser key from step 1
    * oauthClientId - Web Application clientId from step 2
    * oauthClientSecret - Web Application client secret from step 2

## Check Mongo Server
Run `mongostart` or `mongod`

## Build and start the Hub
Run `npm start`

The distributable version will be placed in /dist.
The debug web server has LiveReload.

## Run Tests
Run `npm test`

## Ingest data into your local Hub instance
See the [wiki](https://github.com/gdg-x/hub/wiki/Ingesting-data-into-the-Hub).

#### For GDG-X Core

[History](https://docs.google.com/document/d/1X8fuwTvA4Y2Hm_PmP8gE_VH6kNd6lYGXjbOfoNUapcM/edit?usp=sharing&authkey=CMiRgOYF)

###Contributors
See [list of contributors](https://github.com/gdg-x/hub/graphs/contributors)

Maintainer: 

######GDG Apps, GDG[x] are not endorsed and/or supported by Google, the corporation.

License
--------

    © 2013-2016 GDG[x]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
