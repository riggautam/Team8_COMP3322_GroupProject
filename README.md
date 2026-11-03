# Team8_COMP3322_GroupProject

## Deploy on the COMP3322 server

1. Connect to HKUVPN and SSH into your group's Ubuntu server, as described in the
   COMP3322 Project Server Guide.
2. Clone or upload this repository and enter its root directory.
3. Create `.env` from `.env.example`. Set unique, strong database passwords and add
   the required API keys. For production, set `BACKEND_TARGET=backend-prod`,
   `FRONTEND_TARGET=frontend-prod`, and set both `FRONTEND_HOST_PORT` and
   `FRONTEND_CONTAINER_PORT` to `80`. Do not commit `.env`. The Google Maps key is
   included in browser code, so restrict it to the required APIs and your server's
   HTTP referrer.
4. Start the production services:

   ```sh
   docker compose up -d --build
   ```

5. Visit `http://c3322-pg08.cs.hku.hk`.

The production Compose setup builds the frontend as static files, serves them with
Nginx on host port 80, and proxies `/api/` requests to the backend. The backend and
MySQL are not published to host ports. MySQL data is kept in the `db-data` volume;
`docker compose down` does not delete it. Back up this volume before server
maintenance or data migrations.

## Dashboard data

The shared dashboard data comes from the MySQL `events`, `blog_posts`, and
`food_spots` tables created by `db/init/02-dashboard.sql`. Published blog posts,
food spots, and today's events are checked every 15 seconds; the page updates only when the returned data changes. Hong Kong weather comes from Open-Meteo and is
refreshed every 10 minutes. Course mappings and checklist progress remain deferred
until dashboard requests can be securely scoped to a signed-in student.

On a new database, Compose runs the SQL file automatically. If the `db-data` volume
already exists, apply the schema without deleting the volume:

```sh
docker compose exec -T db sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < db/init/02-dashboard.sql
```

The read endpoints are ready to reflect database changes; authenticated content
management endpoints are not part of this feature.

The public landing page is `/`. After signing in, the current user is sent to
`/dashboard`, which is available only while the frontend has a signed-in user.
Events, posts, and food spots remain shared content; course mappings and checklist
are not yet connected to an individual account.

To check service status and logs:

```sh
docker compose ps
docker compose logs -f
```

This deployment uses plain HTTP as permitted by the server guide. HTTP does not
encrypt login credentials in transit, and the current application stores passwords
without hashing. Do not use real or reused passwords until authentication is secured.

## Local development

Use the development target and ports from `.env.example`, then run:

```sh
docker compose up --build
```

Open <http://localhost:8080>. After changing source code, run
`docker compose up --build` to rebuild the development images. Stop the services
with `Ctrl+C`, or run `docker compose down`.

The backend reads `OPENROUTER_API_KEY` from the root `.env`; keep it out of source
control. Transfer requests send the selected universities and exchange course
description to OpenRouter's `nvidia/nemotron-3-ultra-550b-a55b:free` model and ask
it to return the exchange course code and name plus up to three ranked home-university
course suggestions with rough match percentages in JSON, which the backend validates.
Suggestions, percentages, and course links are not web-verified, so review them before
relying on them. The request timeout is two minutes. Free model availability and
rate limits are controlled by OpenRouter.
