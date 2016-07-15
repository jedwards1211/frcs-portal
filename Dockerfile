FROM node:5.10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY .babelrc .eslintrc /usr/src/app/
COPY webpack /usr/src/app/webpack
COPY src /usr/src/app/src

ARG PROTOCOL=http
ARG HOST=localhost
ARG PUBLIC_PORT=80
ARG BASENAME=""
ENV PROTOCOL=$PROTOCOL \
    HOST=$HOST \
    PUBLIC_PORT=$PUBLIC_PORT \
    BASENAME=$BASENAME

RUN DOCKER_BUILD=true npm run build

EXPOSE 80

ENV DATABASE_HOST=localhost \
    DATABASE_PORT=28015 \
    DATABASE_SSL=false \
    PORT=80

CMD ["npm", "run", "prod"]
