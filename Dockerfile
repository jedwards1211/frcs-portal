FROM node:5.10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY .babelrc .eslintrc /usr/src/app/
COPY webpack /usr/src/app/webpack
COPY src /usr/src/app/src
RUN DOCKER_BUILD=true npm run build

EXPOSE 80 389

ENV DATABASE_HOST=localhost \
    DATABASE_PORT=28015 \
    DATABASE_SSL=false \
    BASENAME=/portal \
    PROTOCOL=http \
    HOST=localhost \
    PORT=80 \
    LDAP_PORT=389 \
    LDAP_ORGANIZATION="Detroit Urban Grotto" \
    LDAP_ADMIN_CN="cn=admin" \
    LDAP_BASE="dc=fisherridge,dc=net" \
    LDAP_USERS_OU="ou=users"

CMD ["npm", "run", "prod"]
