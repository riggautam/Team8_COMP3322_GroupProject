# Team8_COMP3322_GroupProject

## Run with Docker Desktop

1. Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Open a terminal in the project root (the folder containing `docker-compose.yml`).
3. Build the development images, start both services, and enable automatic
   synchronization/rebuilds:

   ```powershell
   docker compose up --build --watch
   ```

4. Open <http://localhost:8080> for the frontend. The API is available at
   <http://localhost:8080/api/hello>; the frontend's `/api/` requests are proxied to it.

The single root `Dockerfile` contains development and production targets for both
services. Compose uses the development targets: frontend changes sync to Vite, while
backend changes sync to nodemon. Dependency changes and edits to the root Dockerfile
automatically rebuild the affected service.

The backend listens on port 3001 inside Docker and is not published on a host port;
the frontend proxies API requests to it. Only the frontend is exposed on host port
8080, avoiding a macOS host-port conflict with AirPlay.

The backend reads `OPENROUTER_API_KEY` from `backend/.env`; keep this key out of
source control. Transfer requests send the selected universities and exchange course
description to OpenRouter's `nvidia/nemotron-3-ultra-550b-a55b:free` model and ask it
to return up to three ranked course suggestions with rough match percentages in JSON,
which the backend validates. Suggestions, percentages, and course links are not
web-verified, so review them before relying on them. The request timeout is two
minutes. Free model availability and rate limits are controlled by OpenRouter.
Leave this command running during development; press `Ctrl+C` to stop its services.
Use `docker compose down` only when you want to stop and remove the services:

```powershell
docker compose down
```

The API allows up to 100 requests per client IP every 15 minutes. If you deploy behind
a reverse proxy, set `TRUST_PROXY_HOPS` to the number of trusted proxy hops before the
backend so rate limiting uses the client IP. The default is `0` (no proxy trusted).
The default limiter store is in-memory and is suitable for a single backend instance;
multiple instances need a shared rate-limit store.

## Run locally for development

Install the dependencies in the project root and in both apps, then start them:

```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
npm run dev
```