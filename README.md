# NEXASTREAM

A premium streaming platform combining Live Sports, Movies, TV Series, Anime, and Live TV with a cinematic dark-theme design.

## Features

- **Live Sports Streaming** - Football, NBA, UFC, Formula 1, Cricket
- **Movies & TV Series** - TMDB-based content with Vidking integration
- **Anime** - Dedicated anime section
- **Live TV** - Live television channels
- **Premium UI** - Glassmorphism, smooth animations, hero carousels
- **Responsive Design** - Mobile-first with bottom navigation
- **LocalStorage** - Watch progress, favorites, continue watching

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- Framer Motion
- Axios

## Required environment variables

This project depends on several Vite environment variables for API access and integrations:

- `VITE_TMDB_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_SENTRY_DSN`
- `VITE_STREAM_PROXY_URL`

### Secure setup

- Copy `.env.example` to `.env.local` for local development.
- Never commit `.env`, `.env.local`, or real secrets to GitHub.
- For Cloudflare Pages, add the same variables in the Pages project settings under Build & Deploy > Environment variables.
- If you deploy from GitHub Actions, store the values in GitHub Secrets and inject them into the build step.

> Only variables prefixed with `VITE_` are exposed to the frontend bundle. If something must stay truly private, keep it on a server-side endpoint or Cloudflare Worker instead of the client app.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. Deploy the `dist` folder to GitHub Pages

### Cloudflare Pages

1. Build the project: `npm run build`
2. Set the build output directory to `dist`
3. In Cloudflare Pages, add the required environment variables under Build & Deploy > Environment variables, including:
   - `VITE_TMDB_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_SENTRY_DSN`
   - `VITE_STREAM_PROXY_URL`

This is required for features like the TMDB API, authentication, and Live TV stream proxying to work correctly.

## API Integration

### Sports API (streamed.pk)

- Base URL: `https://streamed.pk/api`
- Live Matches: `/matches/live`
- Streams: `/stream/{source}/{id}`

### Vidking API

- Movies: `https://www.vidking.net/embed/movie/{tmdbId}`
- TV: `https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}`

## Color Palette

- Deep Black: `#0A0A0A`
- Primary Red: `#E50914`
- Accent Gold: `#FFD700`
- White: `#ffffff`

## License

MIT
