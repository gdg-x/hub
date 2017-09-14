FROM node:8
MAINTAINER Vikram Tiwari vikramtheone1@gmail.com

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN yarn global add bower grunt-cli phantomjs-prebuilt

RUN apt-get install libfontconfig

COPY ./package.json /usr/src/app/

RUN chown -R node:node /usr/src/app
USER node
RUN touch /home/node/.mean
RUN yarn
RUN grunt

COPY . /usr/src/app/
ENV PORT 3000
ENV NODE_ENV production
EXPOSE 3000

CMD ["yarn", "startProd"]
