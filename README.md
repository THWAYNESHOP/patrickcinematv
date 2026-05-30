# PATRICK CINEMA TV

A premium streaming platform combining Live Sports, Movies, TV Series, Anime, and Live TV with a futuristic cyberpunk design.

## Features

- **Live Sports Streaming** - Football, NBA, UFC, Formula 1, Cricket
- **Movies & TV Series** - TMDB-based content with Vidking integration
- **Anime** - Dedicated anime section
- **Live TV** - Live television channels
- **Premium UI** - Glassmorphism, neon glows, smooth animations
- **Responsive Design** - Mobile-first with bottom navigation
- **LocalStorage** - Watch progress, favorites, continue watching

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- Framer Motion
- Axios

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
2. Deploy the `dist` folder to Cloudflare Pages

## API Integration

### Sports API (streamed.pk)

- Base URL: `https://streamed.pk/api`
- Live Matches: `/matches/live`
- Streams: `/stream/{source}/{id}`

### Vidking API

- Movies: `https://www.vidking.net/embed/movie/{tmdbId}`
- TV: `https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}`

## Color Palette

- Deep Black: `#050505`
- Neon Pink: `#ff008c`
- White: `#ffffff`

## License

MIT
