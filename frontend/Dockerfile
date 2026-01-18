FROM node:23-alpine3.20 as build-stage
WORKDIR /sigpro-doctor-manager-web
COPY package.json ./
RUN yarn
COPY . .
RUN yarn run build

FROM nginx:1.26.3-alpine3.20
COPY --from=build-stage /sigpro-doctor-manager-web/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]