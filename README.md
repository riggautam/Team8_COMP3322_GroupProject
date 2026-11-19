# WEST — Website for Exchange Students Today

WEST helps HKU exchange students plan course transfers, browse events, read and
moderate blog posts, and navigate campus.

## Deployment

**Live URL:** https://c3322-pg08.cs.hku.hk/

The deployment uses a self-signed certificate, so browsers show a warning.

## Rebuild on the COMP3322 Server

Requirements: HKUVPN, Docker Compose, Git, and OpenSSL on the Ubuntu server.

```sh
ssh -i ~/.ssh/id_rsa ubuntu@c3322-pg08.cs.hku.hk
git clone https://github.com/riggautam/Team8_COMP3322_GroupProject.git
cd Team8_COMP3322_GroupProject
cp .env.example .env
```

Update `.env` with the group's real secrets and API keys:

```env
BACKEND_TARGET=backend-prod
FRONTEND_TARGET=frontend-prod
FRONTEND_HOST_PORT=443
FRONTEND_CONTAINER_PORT=443
CERTS_DIR=/home/ubuntu/certs
GOOGLE_REDIRECT_URI=https://c3322-pg08.cs.hku.hk/api/auth/google/callback
```

Also replace all `change-me` values and example passwords, and set a random
`SESSION_SECRET` of at least 32 characters. Never commit `.env` or private keys.

Create the self-signed certificate:

```sh
mkdir -p ~/certs
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout ~/certs/server.key \
  -out ~/certs/server.crt \
  -subj "/CN=c3322-pg08.cs.hku.hk"
```

Build and start:

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=50
```

Open <https://c3322-pg08.cs.hku.hk/> and continue past the certificate warning.
MySQL is initialized automatically from `db/init/`; existing data remains in
the `db-data` Docker volume across container rebuilds.

To rebuild application containers without deleting database data:

```sh
docker compose down
docker compose up -d --build
```

## Local Development

```sh
cp .env.example .env
docker compose up --build
```

Open <http://localhost:8080>. The `.env.example` development targets use Vite
with the backend and MySQL in Docker. Replace the example credentials and keys
before running.

## Configuration Notes

- `MYSQL_*`: database and backend connection settings.
- `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: required backend settings.
- `GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`: Google Maps.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: Google login.
- `OPENROUTER_API_KEY`: AI-assisted course matching.

The backend and MySQL are not exposed to the host. Production Nginx publishes
only HTTPS on port 443 and proxies `/api/` requests to the backend.
