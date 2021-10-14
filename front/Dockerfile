# build stage
FROM node:14-alpine as build-stage
WORKDIR /app
ARG API_URL
ENV API_URL=${API_URL}
COPY package*.json ./
RUN yarn
COPY . .
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
