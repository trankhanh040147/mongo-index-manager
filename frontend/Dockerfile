FROM node:22.21.1-alpine3.23 as build
WORKDIR /documentation
COPY package.json ./
RUN yarn
COPY . .
RUN yarn build

FROM nginx:1.29.4-alpine3.23
RUN apk add --upgrade c-ares=1.34.6-r0
COPY builder/tpl /usr/local/bin/tpl
RUN chmod +x /usr/local/bin/tpl
COPY docker-entrypoint.sh docker-entrypoint.sh
COPY --from=build /documentation/build /usr/share/nginx/html
COPY builder/env.config /usr/share/nginx/html/env.config
COPY builder/server.config /etc/nginx/conf.d/server.conf.example
RUN ["chmod", "+x", "docker-entrypoint.sh"]

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx \
    /etc/nginx /var/cache/nginx /var/log/nginx

USER nginx

CMD ["nginx", "-g", "daemon off;"]
