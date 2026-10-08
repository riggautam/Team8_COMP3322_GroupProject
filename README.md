# Team8_COMP3322_GroupProject

## Run with Docker Desktop

1. Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Open a terminal in the project root (the folder containing `docker-compose.yml`).
3. Build the images and start both services:

   ```powershell
   docker compose up --build
   ```

4. Open <http://localhost:8080> for the frontend. The API is available at
   <http://localhost:8080/api/hello>; the frontend's `/api/` requests are proxied to it.

The build creates `west-frontend:latest` and `west-backend:latest`. They will appear
under **Images** in Docker Desktop; the running services appear under **Containers**.
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