# Team8_COMP3322_GroupProject

## Run with Docker Desktop

1. Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Open a terminal in the project root (the folder containing `docker-compose.yml`).
3. Build the development images and start both services:

   ```powershell
   docker compose up --build
   ```

4. Open <http://localhost:8080> for the frontend. The API is available at
   <http://localhost:8080/api/hello>; the frontend's `/api/` requests are proxied to it.

The Compose setup bind-mounts the frontend and backend source into their containers.
Changes are picked up automatically by Vite and nodemon, including on Docker Desktop
for macOS. Rebuild only when dependencies or the development Dockerfiles change.
To stop the services, press `Ctrl+C` in the terminal and run:

```powershell
docker compose down
```

## Run locally for development

Install the dependencies in the project root and in both apps, then start them:

```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
npm run dev
```