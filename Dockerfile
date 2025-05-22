FROM nginx:latest
## Copy the Docusaurus build output.
COPY build /usr/share/nginx/html/
## Replace URL and baseURL placeholders with Nginx SSI (Server Side Includes) instruction
RUN find /usr/share/nginx/html/ -type f -exec sed -i -e 's;http://PLACEHOLDER_URL/;<!--#echo var="URL" -->;g' {} \;
RUN find /usr/share/nginx/html/ -type f -exec sed -i -e 's;PLACEHOLDER_BASE_URL/;<!--#echo var="BASE_URL" -->;g' {} \;
## Copy the Nginx configuration template file (in which SSI is activated and above URL and BASE_URL variables are defined) for envsubst parsing
COPY custom-nginx.conf.template /etc/nginx/templates/default.conf.template
## Set default values for environment variables
ENV DOCU_URL=
ENV DOCU_BASE_URL=