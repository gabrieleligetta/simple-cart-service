# Simple Cart Service

A Nest.js backend microservice for managing products, carts, and discounts in an e-commerce scenario.

---

## Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ & Yarn for local development

---

## Quickstart with Docker

1. **Build & start containers**

   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Stop containers**

   ```bash
   docker-compose down
   ```

---

## Configuration

you can copy .env.locale into a .env file if you want to start the project locally with yarn start:dev or stick with the .env.docker if you want to start the app inside a docker container

```dotenv
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=cart_db
DROP_SCHEMA=false

JWT_SECRET=<your_jwt_secret>
JWT_DURATION=20d

REDIS_HOST=redis
REDIS_PORT=6379

ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Secret!123!
```

> **Tip:** The Docker `app` service injects these via the Compose file.

---

## Database & Seeding

1. **Ensure DB schema & indexes**

   On first run, TypeORM will create tables and indexes.

2. **Seed data**

   Run all seeders via the app container:

   ```bash
   # run both in sequence:
   docker exec -it my_cart_app yarn seed:all
   ```

---

## Running Tests (e2e)

Execute tests inside the running `app` container:

```bash
# run only once after 'docker-compose up -d'
docker exec -it my_cart_app yarn test:e2e --detectOpenHandles
```

---
## Admin User

An admin is auto-created on first run if missing (via `UserRepository` init hook). Credentials from `.env`:

```dotenv
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Secret!123!
```

Use these to authenticate and manage discounts.

---

## Docker Exec Shortcuts

- **Run a shell in app**
  ```bash
  docker exec -it my_cart_app sh
  ```



