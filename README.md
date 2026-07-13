# FreelanceHub

A lightweight backend API for freelance developers to manage clients, projects, and tasks — a personal, Jira-style workspace without the overhead.

Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

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

## Project Structure

```
src/
├── config/
│   ├── database.ts       # MongoDB connection
│   └── env.ts            # Environment validation
├── middleware/
│   └── error.middleware.ts
├── types/
├── app.ts                # Express app setup
└── server.ts             # Entry point
```
