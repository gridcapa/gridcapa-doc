FROM inca.rte-france.com/gridcapa/caddy:2-alpine AS caddy
## Copy the Caddyfile.
COPY Caddyfile /etc/caddy/Caddyfile
## Copy the Docusaurus build output.
COPY --from=prod build /var/docusaurus