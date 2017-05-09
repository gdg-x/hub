GDG[x] Hub
===

[![Join the chat at https://gitter.im/gdg-x/hub](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gdg-x/hub?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/gdg-x/hub.png?branch=master)](https://travis-ci.org/gdg-x/hub)

The public instance of the [GDG[x] Hub](https://hub.gdgx.io).

# Maintainer Needed
We're looking for a lead maintainer to contribute to and take over maintenance of this project. Please contact us in the [GDG-X G+ Community](https://plus.google.com/communities/102264418110444725395) if you are interested.

## Required tools
* [Node.js](https://nodejs.org/download/)
* [MongoDB](https://github.com/gdg-x/hub/wiki/MongoDB-Config)

## Install dependencies
Run `npm install`

## Configure Environment

1. Define the **GOOGLE_SIMPLE_API_KEY**: The API key for your project, available from the [Cloud Console](https://cloud.google.com/console)
    1. Create a new project then go to APIs & Auth->APIs, activate Google+ API.
    1. Go to APIs & Auth->Credentials. Add Credentials->API key->Browser key->Create (keep `Any referrer allowed` set).
1. Define the **GOOGLE_OAUTH_CLIENT_ID** and **GOOGLE_OAUTH_CLIENT_SECRET**: The Client Id and secret for your project, available from the [Cloud Console](https://cloud.google.com/console)
    1. Go to APIs & Auth->Credentials. Add Credentials->API key->OAuth 2.0 client ID->Web Application->Create.
1. Create a private `.env` file in the root of the project with the following contents:
    ```
    GOOGLE_SIMPLE_API_KEY=
    GOOGLE_OAUTH_CLIENT_ID=
    GOOGLE_OAUTH_CLIENT_SECRET=
    SERVER_KEY_SECRET=
    ANDROID_CLIENT_IDS=
    MONGODB_DB_URL=
    NODEJS_PORT=
    NODEJS_IP=
    SESSION_SECRET=
    ```
1. Populate the `.env` file with the following variables that were provided to you:

    * GOOGLE_SIMPLE_API_KEY - Browser key from step 1
    * GOOGLE_OAUTH_CLIENT_ID - Web Application clientId from step 2
    * GOOGLE_OAUTH_CLIENT_SECRET - Web Application client secret from step 2
    * SERVER_KEY_SECRET - Only needed for testing Frisbee integration
    * ANDROID_CLIENT_IDS - Only needed for testing Frisbee integration. Needs to be a comma separated list
    * SESSION_SECRET - random 34 characters

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

    © 2013-2017 GDG[x]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
