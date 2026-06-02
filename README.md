# UCX Chess Platform

A fast, privacy-focused chess platform with multiple themes, piece styles, and AI opponents.

**Founded in 2023 by Kayan Erkama** as part of the UCX initiative.

## Features

- **6 AI Opponents** — Beginner, Cautious, Aggressive, Positional, Tactical, and Grandmaster bots
- **8 Board Themes** — Classic, Dark, Forest, Ocean, Sunset, Midnight, Rose, and Ice
- **4 Piece Styles** — Standard Unicode, Bold, Text Letters, and Minimal Dots
- **Privacy First** — No ads, no tracking, no analytics. Only username + hashed password stored
- **Encrypted Auth** — Passwords hashed with bcrypt (12 rounds), JWT tokens, HTTP-only cookies
- **Persistent SQLite DB** — Data survives server restarts; encryption keys stored in database
- **Fast & Responsive** — Built with React + Vite, compression enabled, minimal bundle size

## Tech Stack

- **Frontend:** React 18, Vite 5, React Router 6, chess.js
- **Backend:** Express.js, better-sqlite3, bcryptjs, jsonwebtoken
- **Package Manager:** Yarn 1.22.22

## Quick Start

```bash
# Install dependencies
yarn install
cd client && yarn install && cd ..

# Development
yarn dev

# Production build
cd client && yarn build && cd ..
yarn start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `DB_PATH` | SQLite database path | `./data/chess.db` |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `ENCRYPTION_KEY` | Data encryption key | Auto-generated & persisted in DB |

## Deployment (Render)

1. Set build command: `cd client && yarn install && yarn build && cd .. && yarn install`
2. Set start command: `yarn start`
3. Add a persistent disk mounted at `/data` and set `DB_PATH=/data/chess.db`
4. The encryption keys and user data persist across restarts via SQLite

## Privacy & Security

- No third-party analytics, ads, or tracking
- Passwords hashed with bcrypt (12 rounds)
- Secure HTTP-only cookies with SameSite strict
- JWT tokens with 7-day expiry
- SQLite WAL mode for data integrity
- All encryption keys stored persistently in database

## Legal

- [Privacy Policy](/privacy)
- [Terms of Service](/terms)

## License

MIT - UCX Project, 2023
