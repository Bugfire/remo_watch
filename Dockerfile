###

FROM node:10 AS build

COPY package*.json tsconfig.json /usr/src/app/
COPY src/* /usr/src/app/src/
WORKDIR /usr/src/app
RUN npm install

RUN npx tsc 

###

FROM node:10

COPY package*.json /usr/src/app/
WORKDIR /usr/src/app
RUN npm install --production

COPY --from=build /usr/src/app/build/*.js /usr/src/app/

VOLUME [ "/config" ]

CMD [ "node", "index.js", "/" ]
