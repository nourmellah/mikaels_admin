# server/Dockerfile
FROM postgres:16-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    PGDATA=/var/lib/postgresql/data

# Add Node + supervisor
RUN apt-get update && apt-get install -y curl ca-certificates gnupg supervisor bash \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get update && apt-get install -y nodejs \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# your schema file bootstrap reads
COPY ./database_definition.sql /app/database_definition.sql

# supervisord + entrypoint
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=10 CMD curl -fsS http://127.0.0.1:3000/health || exit 1
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
