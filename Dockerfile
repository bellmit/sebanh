FROM nginx:1.19.2-alpine
COPY ./default.conf /etc/nginx/conf.d
COPY ./dist/angular-seateller /usr/share/nginx/seateller
