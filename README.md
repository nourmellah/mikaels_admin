# mikaels_admin

---

# Deploy (Docker)

## Prereqs

* Docker + Docker Compose installed

## Quick start

```bash
# from the repo root
docker compose build --no-cache
docker compose up -d
# open http://localhost
```

## Configure (admin, secrets, uploads)

Edit `docker-compose.yml` and set your admin and secrets. Example:

```yaml
services:
  app:                      # server + Postgres
    build: ./server
    environment:
      ADMIN_USERNAME: admin          # <-- change me
      ADMIN_PASSWORD: change-me      # <-- change me
      JWT_SECRET: "generate-a-long-random-string"
      # ...
    volumes:
      - ./server/uploads:/app/uploads   # persist uploaded files

  web:                      # client (nginx)
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - app
```

> If you rename the `app` service, update `client/nginx.conf` (the proxy target `http://app:3000`).

## First run

* The server initializes Postgres and applies the first-run SQL automatically.
* A default admin is (re)created using `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
* Uploads are served at `http://localhost/uploads/<filename>` and persisted in `./server/uploads`.

Then log in at `http://localhost` with the admin creds you set above.

## Troubleshooting (super short)

* **Login 401/403** → wrong admin creds or missing `JWT_SECRET`.
* **Uploads 404** → ensure the file exists in `./server/uploads` and the compose volume maps to `/app/uploads`.
* **Bad gateway** → make sure service name `app` matches the Nginx proxy target in `client/nginx.conf`.

---

That’s it!
