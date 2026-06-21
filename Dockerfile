FROM nginx:alpine
RUN mkdir -p /etc/nginx/certs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 443 8080
ENTRYPOINT ["/entrypoint.sh"]
