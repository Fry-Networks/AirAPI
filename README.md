# AirAPI

Minimal API exposing device credentials management only.

Endpoints:

- GET `/api/credentials/:miner_key` — get credentials by `miner_key`.
- PUT `/api/credentials/:miner_key` — add or update credentials for `miner_key`.
  - Body: `{ "type": string, "address?": string, "credentials?": object }`
- DELETE `/api/credentials/:miner_key` — delete credentials by `miner_key`.

Run in dev: `npm run dev`

Environment:
- `MONGO_URI` — MongoDB connection string
- `PORT` — server port (default 3000)
