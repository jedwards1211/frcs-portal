FROM node:5.10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY .babelrc .eslintrc /usr/src/app/
COPY webpack /usr/src/app/webpack
COPY src /usr/src/app/src

ARG ROOT_URL=http://localhost:3000 \
    BASENAME=""
ENV ROOT_URL=$ROOT_URL \
    BASENAME=$BASENAME

RUN DOCKER_BUILD=true npm run build

EXPOSE 80 389

ENV DATABASE_HOST=localhost \
    DATABASE_PORT=28015 \
    DATABASE_SSL=false \
    PORT=80 \
    LDAP_PORT=389 \
    LDAP_ORGANIZATION="Detroit Urban Grotto" \
    LDAP_BASE="dc=fisherridge,dc=net"

CMD ["npm", "run", "prod"]
