# DBC Production Readiness & Operations Runbook

This document details the environment specifications, deployment workflows, backup strategies, monitoring configurations, and incident response procedures for operating the DBC platform in production environments.

---

## 1. Environment Configuration

The following variables must be configured in the production environment. DO NOT commit values to version control.

| Variable Name   | Purpose                                     | Example/Constraint                              |
|-----------------|---------------------------------------------|-------------------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string                | `postgresql://usr:pwd@host:5432/db?schema=public` |
| `JWT_SECRET`    | Secret for signing/verifying session JWTs  | Min 256-bit secure cryptographically random key |
| `NODE_ENV`      | Deployment execution mode                   | Set to `production`                             |

---

## 2. Containerized Deployment Steps

We utilize multi-stage Docker builds to ensure minimal footprint and hardened runtimes.

### Step 2.1: Build and Run with Docker Compose
```bash
# 1. Clone the repository and navigate to root
cd /opt/dbc-platform

# 2. Build production containers
docker-compose build --no-cache

# 3. Start services in daemon (background) mode
docker-compose up -d

# 4. Verify service health checks
docker-compose ps
```

---

## 3. CI/CD Deployment Pipeline

The CI/CD pipeline consists of the following steps:

1. **Lint and Test**: Runs code lint checks and execution of testing suites (`npm run test`).
2. **Build Validation**: Executes frontend bundle compilation (`npm run build`).
3. **Staging Deploy**: Deploys to staging environment upon successful checks.
4. **Manual Gate**: Requires developer review and approval prior to production release.
5. **Production Deploy**: Updates production Docker containers with zero-downtime rolling upgrades.

---

## 4. Backup & Recovery Strategy

### Step 4.1: Database Backup Procedure
Execute daily automated pg_dump tasks:
```bash
# Export compressed database state to secure backup storage
docker exec -t dbc-database-prod pg_dump -U dbc_admin -d dbc_marketplace -F c -b -v -f /backups/dbc_db_$(date +%F).backup
```

### Step 4.2: Recovery Procedure (DR)
In the event of database corruption or hardware failure, restore from the latest clean backup:
```bash
# 1. Clean existing database schemas
docker exec -t dbc-database-prod dropdb -U dbc_admin dbc_marketplace
docker exec -t dbc-database-prod createdb -U dbc_admin dbc_marketplace

# 2. Restore database structure and contents
docker exec -i dbc-database-prod pg_restore -U dbc_admin -d dbc_marketplace -v /backups/dbc_db_YYYY-MM-DD.backup
```

---

## 5. Rollback Procedures

If a deployment introduces regressions or security risks:

### Step 5.1: Container Rollback
```bash
# 1. Point to previous stable container tag in docker-compose.yml
# 2. Re-pull and update active service instances
docker-compose up -d --remove-orphans
```

### Step 5.2: Database Migration Rollback
If schema modifications must be reverted:
```bash
# Revert to last successfully executed database migration step
npx prisma db push --force-reset
```

---

## 6. Observability, Logging & Monitoring

- **Structured Logs**: Application and security logs are structured as JSON outputs, enabling ingestion by aggregators like Datadog, ELK, or CloudWatch.
- **Metrics Collection**: System stats are exposed securely at the `/api/health` check endpoint, showing:
  - Memory footprints (`heapUsed`).
  - Database connectivity readiness status.
  - Runtime uptime ticks.
- **Uptime Monitoring**: Configure external ping checking (such as Pingdom, Uptime Robot) targeting the `/api/health` endpoint. Alerting thresholds should trigger on HTTP status codes of `503` or connection times exceeding `5s`.

---

## 7. Security Policy Enforcement

- **CSP Headers**: Enforces strict Content Security Policy, Frame Options (`DENY`), XSS blocks, and MIME sniffing prevention headers.
- **Session Protection**: All persistent sessions are managed via rotation of `HttpOnly`, `Secure` (production only), and `SameSite=Lax` cookies to prevent token theft or injection.
