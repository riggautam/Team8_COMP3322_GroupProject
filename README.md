# Team8_COMP3322_GroupProject

## Run with Docker Desktop

1. Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Open a terminal in the project root (the folder containing `docker-compose.yml`).
3. Build the images and start both services:

   ```powershell
   docker compose up --build
   ```

4. Open <http://localhost:8080> for the frontend. The API is available at
   <http://localhost:5000/api/hello>; the frontend's `/api/` requests are proxied to it.

The build creates `west-frontend:latest` and `west-backend:latest`. They will appear
under **Images** in Docker Desktop; the running services appear under **Containers**.
To stop the services, press `Ctrl+C` in the terminal and run:

```powershell
docker compose down
```

If you need to load an image archive (`.tar`) instead, open Docker Desktop and run
this in PowerShell from the folder containing the archive:

```powershell
docker load --input .\image-name.tar
```

The loaded image will then appear under **Images** in Docker Desktop.

If port 8080 is already in use, set a different frontend port for the session before
starting Compose, for example:

```powershell
$env:FRONTEND_PORT = "8081"
docker compose up --build
```

Then open <http://localhost:8081>.

## Run locally for development

Install the dependencies in the project root and in both apps, then start them:

```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
npm run dev
```