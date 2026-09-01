# Railway deploy guide for this project

## 1) What I verified

I checked the project configuration in [package.json](package.json) and [api/package.json](api/package.json). Both are configured as Next.js apps (`next dev`, `next build`, `next start`), not as a plain Express + React build.

This matters because Railway does not fail because of the framework itself; it fails when the app does not bind to the port that Railway exposes, or when a Node server is not serving the React build correctly.

The usual error:

- `Not Found / The train has not arrived at the station`

usually means:

- the app is not listening on `0.0.0.0` and `process.env.PORT`
- Railway is targeting a different port than the app is actually bound to
- a frontend router route is being hit without a fallback to `index.html`

---

## 2) If you are using Next.js (this repo)

Use the framework native runtime, not Express.

### package.json

```json
{
  "scripts": {
    "dev": "next dev --hostname 0.0.0.0 --port 3000",
    "build": "next build",
    "start": "next start --hostname 0.0.0.0 --port ${PORT:-3000}"
  }
}
```

Railway exposes the port in `process.env.PORT`. Use that value in the start command. If the app is already a Next.js app, you usually do not need a custom `server.js`.

Set in Railway:

- `PORT` = Railway-provided value
- `NODE_ENV` = `production`

In Railway project Settings > Networking, the target port must match the port your app listens on. In the normal Next.js case, the port is whatever Railway assigns to `PORT`.

---

## 3) If you are using React + Express

This is the exact pattern for a production React build served by Express.

### server.js

```js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

### package.json

```json
{
  "scripts": {
    "build": "react-scripts build",
    "start": "node server.js"
  }
}
```

For Vite, the same idea works but the folder is usually `dist`:

```js
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
```

---

## 4) Railway checklist

In the Railway dashboard:

1. Open the project.
2. Go to Settings > Networking.
3. Set the target port to the same port used by your app.
4. Make sure your server binds to `0.0.0.0` and `process.env.PORT`.
5. Keep the app process alive with the correct start command.
6. Verify the app responds on the public URL.

Important:

- If your app listens on `3001`, then Railway target port must be `3001`.
- If your app listens on `PORT` from Railway, then Railway target port must match that variable.
- Do not set the target port to a value that your app does not bind to.

---

## 5) Quick diagnosis

If the app still says `Not Found`, the most common root cause is:

- `app.listen(process.env.PORT, '0.0.0.0')` is missing
- `PORT` is not configured in Railway
- the frontend fallback is not returning `index.html` for React routes
- Railway is exposing a port different from the one your Node server listens on

## 6) Required environment variables

Configure these variables in Railway for the corresponding service. `NEXT_PUBLIC_API_URL` is read at frontend build time, so redeploy the frontend after changing it.

### Frontend service

```text
PORT=<Railway-provided port>
NEXT_PUBLIC_API_URL=https://<api-service>.up.railway.app
```

### API service

```text
PORT=<Railway-provided port>
DATABASE_URL=${{Postgres.DATABASE_URL}}
AUTH_SECRET=<at least 32 random characters>
BACKEND_URL=https://<api-service>.up.railway.app
FRONTEND_URL=https://<frontend-service>.up.railway.app
CORS_ORIGINS=https://<frontend-service>.up.railway.app
```

If the admin app is deployed separately, add its public URL to `CORS_ORIGINS`, separated by commas, and set the same `NEXT_PUBLIC_API_URL` in that service.

## 7) Recommended final setup for this repo

## 6) Recommended final setup for this repo

Because this project is a Next.js app, the correct path is to keep using Next.js and set Railway to use the built-in `next start` command with `PORT`.

Use this if you keep the repo as is:

```json
{
  "scripts": {
    "dev": "next dev --hostname 0.0.0.0 --port 3000",
    "build": "next build",
    "start": "next start --hostname 0.0.0.0 --port ${PORT:-3000}"
  }
}
```

Then in Railway, expose the runtime port via `PORT` and do not force a separate Express server unless you actually want that architecture.
