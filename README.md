# C Code Quest

A single-player pixel-art C programming adventure starter. Built with React, Phaser 3, Monaco Editor, Express, Judge0 CE and optional Supabase guest-progress sync.

## Requirements
- Node.js 20+
- A Judge0 CE instance/API key (for actual C compilation)
- Optional Supabase project for cloud guest saves

## Quick start

### 1. Install
```bash
npm install
npm run install:all
```

### 2. Configure
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Set `JUDGE0_URL` and `JUDGE0_API_KEY` in `server/.env`. For Supabase cloud saves, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `client/.env`, and enable Anonymous Sign-ins under Authentication > Providers, then run `supabase/schema.sql` in the Supabase SQL editor.

### 3. Run
```bash
npm run dev
```
Client: http://localhost:5173  
API: http://localhost:4000

Without Supabase, the game still runs and saves progress in browser localStorage. Actual C code execution requires a reachable Judge0 instance.

## Scripts
- `npm run dev` starts client and API concurrently
- `npm run build` builds the client
- `npm start` starts the API

## Game controls
- Move: WASD / arrow keys
- Interact with a glowing quest stone: E / Space
- Select a challenge, write C code, then Run Code
- Pass all hidden tests to earn XP and coins

## Deployment
1. Deploy `server/` as a Node web service (Render, Railway, Fly.io or similar). Set its environment variables and expose port 4000.
2. Deploy `client/` to Vercel. Set `VITE_API_URL` to the deployed API URL.
3. Configure CORS with `CLIENT_ORIGIN` on the API.
4. Optional: configure Supabase and run the schema.
5. For production, use a private/self-hosted Judge0 instance or a trusted hosted provider. Never expose the Judge0 API key in the browser.

## Security notes
- C submissions are sent only to the server, then forwarded to Judge0.
- Never compile or execute user code directly inside the Express process or on the web server.
- Use Judge0 sandbox limits and restrict network access on a self-hosted runner.
- Cloud guest saves use Supabase Anonymous Auth; enable it in the dashboard. Add rate limiting and abuse monitoring for production.
