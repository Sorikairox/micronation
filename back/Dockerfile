FROM node:14-alpine AS development

WORKDIR /usr/src/app/

COPY . .

RUN yarn --only=development

RUN yarn workspace flag-service build

RUN ls

FROM node:14-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./flag-service/package.json ./flag-service/package.json
COPY ./library ./library

RUN yarn --only=production

COPY --from=development /usr/src/app/flag-service/dist ./flag-service/dist

WORKDIR /usr/src/app/flag-service/

CMD ["yarn", "start:prod"]
