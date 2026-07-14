# FreelanceHub

A lightweight backend API for freelance developers to manage clients, projects, and tasks — a personal, Jira-style workspace without the overhead.

Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

## Features

- **JWT authentication** — register and login with bcrypt-hashed passwords
- **Client management** — CRUD for clients scoped to the authenticated user
- **Task tracking** — create and update tasks per client, filter by status
- **Embedded data** — team members and projects stored inside each client document
- **Multi-tenant by design** — every resource is filtered by `userId` from the JWT

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript (strict) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Dev tooling | tsx, nodemon, dotenv |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a remote connection string

### Installation

```bash
git clone https://github.com/<your-username>/freelance-hub.git
cd freelance-hub
npm install
```

### Environment

Copy the example env file and adjust the values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Secret used to sign JWT tokens | — |
| `JWT_EXPIRES_IN` | Token expiration (e.g. `7d`, `24h`) | `7d` |

### Development

```bash
npm run dev
```

The server starts at `http://localhost:3000`. Verify it with:

```bash
curl http://localhost:3000/health
# → { "status": "ok" }
```

### Production build

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting files |
| `npm test` | Run the Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |

## Tests

The initial test suite covers the validation and authentication service layers:

```
tests/
├── services/
│   └── auth.service.test.ts
└── validation/
    └── task.validator.test.ts
```

Run the tests with:

```bash
npm test
```

## Authentication

Protected routes require a JWT in the `Authorization` header using the Bearer scheme (RFC 6750):

```
Authorization: Bearer <token>
```

Obtain a token via `POST /auth/register` or `POST /auth/login`. The response includes:

```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "...",
    "email": "you@example.com",
    "name": "Simone",
    "createdAt": "2026-07-14T..."
  }
}
```

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Create account, returns JWT |
| `POST` | `/auth/login` | No | Sign in, returns JWT |

**Register / login body:**

```json
{
  "email": "you@example.com",
  "password": "secret123",
  "name": "Simone"
}
```

`name` is required for register only.

### Clients

All client routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/clients` | List clients for the authenticated user |
| `POST` | `/clients` | Create a client |
| `GET` | `/clients/:id` | Get client detail (team members & projects) |
| `PATCH` | `/clients/:id` | Update a client |
| `DELETE` | `/clients/:id` | Delete a client |

**Create client body** (`name` required):

```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "company": "Acme",
  "notes": "Retainer client",
  "teamMembers": [
    { "name": "Jane Doe", "role": "PM", "email": "jane@acme.com" }
  ],
  "projects": [
    { "name": "Website redesign", "status": "active" }
  ]
}
```

`PATCH` accepts partial updates. When `teamMembers` or `projects` are sent, the entire array is replaced.

### Tasks

All task routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/clients/:id/tasks` | Create a task for a client |
| `GET` | `/clients/:id/tasks` | List client tasks (`?status=todo` filter) |
| `GET` | `/tasks/:id` | Get task detail |
| `PATCH` | `/tasks/:id` | Partial update (title, description, status, priority, dueDate, projectId) |
| `DELETE` | `/tasks/:id` | Delete a task |

**Create task body** (`title` required):

```json
{
  "title": "Implement login page",
  "description": "OAuth + email/password",
  "projectId": "<embedded-project-id>",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-08-01T00:00:00.000Z"
}
```

**Update task body** (partial):

```json
{
  "title": "Implement login page v2",
  "description": "Add OAuth providers",
  "status": "in_progress",
  "priority": "medium",
  "dueDate": "2026-08-15T00:00:00.000Z",
  "projectId": "<embedded-project-id>"
}
```

Send `null` for `dueDate` or `projectId` to clear those fields.

Task status: `cancelled` | `todo` | `in_progress` | `test` | `done`  
Task priority: `low` | `medium` | `high`

### Example flow

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret123","name":"Simone"}'

# Create a client (use token from register/login response)
curl -X POST http://localhost:3000/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","company":"Acme"}'

# List clients
curl http://localhost:3000/clients \
  -H "Authorization: Bearer <token>"

# Create a task for a client
curl -X POST http://localhost:3000/clients/<client-id>/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Setup CI","priority":"high"}'

# List tasks filtered by status
curl "http://localhost:3000/clients/<client-id>/tasks?status=todo" \
  -H "Authorization: Bearer <token>"

# Get task detail
curl http://localhost:3000/tasks/<task-id> \
  -H "Authorization: Bearer <token>"

# Update task
curl -X PATCH http://localhost:3000/tasks/<task-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Setup CI pipeline","status":"in_progress"}'

# Delete task
curl -X DELETE http://localhost:3000/tasks/<task-id> \
  -H "Authorization: Bearer <token>"
```

## Data Models

### User

- `email` (unique), `password` (hashed), `name`, `createdAt`

### Client

- `userId` — owner reference
- `name`, `email`, `company`, `notes`
- Embedded `teamMembers`: `{ name, role?, email?, notes? }`
- Embedded `projects`: `{ name, description?, status, createdAt }`
  - Project status: `cancelled` | `pending` | `active` | `completed` | `paused`

### Task

- `userId`, `clientId`, optional `projectId` (embedded project on client)
- `title`, `description`, `dueDate`, `createdAt`
- Status: `cancelled` | `todo` | `in_progress` | `test` | `done` (default: `todo`)
- Priority: `low` | `medium` | `high` (default: `medium`)

## Project Structure

```
src/
├── config/
│   ├── database.ts           # MongoDB connection
│   └── env.ts                # Environment validation
├── controllers/
│   ├── auth.controller.ts
│   ├── client.controller.ts
│   └── task.controller.ts
├── mappers/
│   ├── auth.mapper.ts
│   ├── client.mapper.ts
│   └── task.mapper.ts
├── middleware/
│   ├── auth.middleware.ts    # JWT verification
│   └── error.middleware.ts
├── models/
│   ├── user.model.ts
│   ├── client.model.ts
│   └── task.model.ts
├── routes/
│   ├── auth.routes.ts
│   ├── client.routes.ts
│   └── task.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── client.service.ts
│   └── task.service.ts
├── types/
│   └── index.ts              # Shared TypeScript types
├── utils/
│   ├── auth.utils.ts         # Password hashing, JWT signing
│   ├── http.utils.ts         # HTTP helpers, Bearer token parsing
│   └── validation/           # Request payload validators
│       ├── validation.utils.ts
│       ├── auth.validator.ts
│       ├── client.validator.ts
│       ├── task.validator.ts
│       └── index.ts
├── app.ts                    # Express app setup
└── server.ts                 # Entry point
```

## Roadmap

- [x] Project bootstrap (TypeScript, Express, MongoDB, env config)
- [x] Shared types
- [x] Auth (register, login, JWT middleware)
- [x] Client CRUD endpoints
- [x] Task endpoints with status filtering
- [x] Request validation (payload validators)
- [x] Initial validation and authentication service tests

## License

ISC
