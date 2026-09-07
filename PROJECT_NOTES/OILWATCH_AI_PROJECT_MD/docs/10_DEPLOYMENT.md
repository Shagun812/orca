# 10 — Deployment

## Local
```bash
docker compose up --build
```

## Services
```text
frontend
backend
postgres-postgis
redis
ml-service
```

## Environment
```text
DATABASE_URL=
REDIS_URL=
ML_SERVICE_URL=
JWT_SECRET=
RUST_LOG=
VITE_API_URL=
```

Never commit secrets.

## Network
```text
Browser → Frontend → Rust API
                         ├→ PostgreSQL/PostGIS
                         ├→ Redis
                         └→ ML Service
```

## Production direction
- HTTPS/reverse proxy
- managed PostgreSQL/PostGIS
- Redis
- object storage for large satellite files
- container orchestration
- monitoring/logging

## Security
Authentication, authorization, HTTPS, validation, rate limiting, least-privilege DB credentials, secret management and audit logs.
