# Chess Platform

Open-source chess platform inspired by Lichess. Real-time multiplayer, Stockfish AI, matchmaking, Elo rating, and post-game analysis. Runs entirely on free tiers.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + Zustand + `react-chessboard` + `chess.js`
- **Backend**: NestJS + Socket.IO + Prisma (PostgreSQL) + Redis + `chess.js`
- **Engine**: Stockfish (system binary, bundled in backend Docker image)
- **Hosting**: Backend on Render (Docker web service + Postgres + Redis), Frontend on Vercel

## Repo layout

```
apps/
  backend/           # NestJS API + WebSocket gateway + Stockfish worker
  frontend/          # Next.js app
packages/
  shared/            # Shared TypeScript types
render.yaml          # Render blueprint (web + postgres + redis)
```

## Local development

Prerequisites: Node.js 20+, pnpm 9+, PostgreSQL, Redis, Stockfish (`apt install stockfish`). If you don't have PG/Redis locally, the backend falls back to SQLite + in-memory Redis shim for matchmaking.

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# Terminal 1
pnpm dev:backend    # http://localhost:4000

# Terminal 2
pnpm dev:frontend   # http://localhost:3000
```

## Features

- Real-time multiplayer via WebSocket with rooms, premoves, clocks, and reconnection handling
- Matchmaking queue with time-control pools
- Elo rating (K=32, floor 100)
- Play vs Stockfish at multiple skill levels
- Live eval bar + best move suggestion (opt-in)
- Post-game analysis: blunder detection, engine lines, PGN import/export
- Guest login (no signup friction) + optional persistent accounts

## Deployment

See `DEPLOY.md` for the automated deploy flow to Render + Vercel.

## License

AGPL-3.0 (same spirit as Lichess).
