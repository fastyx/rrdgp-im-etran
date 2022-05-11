FROM node:14.17.1-alpine3.11

RUN apk update && \
    apk add --no-cache tini && \
    apk add --no-cache tzdata

RUN apk add python make g++\
   && rm -rf /var/cache/apk/*

WORKDIR /opt/module
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN mkdir /opt/module/logs \
  && chmod 777 /opt/module/logs

ENTRYPOINT ["/sbin/tini", "--"]
