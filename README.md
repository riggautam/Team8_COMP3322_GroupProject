# Team8_COMP3322_GroupProject

## Run with Docker Desktop

1. Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Open a terminal in the project root (the folder containing `docker-compose.yml`).
3. Build the development images and start the services:

   ```powershell
   docker compose up --build
   ```

4. Open <http://localhost:8080> for the frontend. Its `/api/` requests are proxied to
   the backend.

The root `Dockerfile` contains the two development images used by Compose. It mounts
the frontend and backend folders, so code changes show up while the containers run.
Rebuild after changing dependencies or the Dockerfile with
`docker compose up --build`. If dependencies changed, add `--renew-anon-volumes` so
the containers get fresh `node_modules` folders.

The backend listens on port 3001 inside Docker and is not published on a host port;
the frontend proxies API requests to it. Only the frontend is exposed on host port
8080, avoiding a macOS host-port conflict with AirPlay.

The backend reads `OPENROUTER_API_KEY` from `backend/.env`; keep this key out of
source control. Transfer requests send the selected universities and exchange course
description to OpenRouter's `nvidia/nemotron-3-ultra-550b-a55b:free` model and ask it
to return the exchange course code and name plus up to three ranked home-university
course suggestions with rough match percentages in JSON, which the backend validates.
Suggestions, percentages, and course links are not web-verified, so review them before
relying on them. The request timeout is two minutes. Free model availability and rate
limits are controlled by OpenRouter.
Leave this command running during development; press `Ctrl+C` to stop its services.
Use `docker compose down` only when you want to stop and remove the services:

```powershell
docker compose down
```
