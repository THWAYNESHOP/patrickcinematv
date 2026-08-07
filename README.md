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
- `DARAJA_ENV`
- `DARAJA_CONSUMER_KEY`
- `DARAJA_CONSUMER_SECRET`
- `DARAJA_BUSINESS_SHORT_CODE`
- `DARAJA_PASSKEY`
- `DARAJA_CALLBACK_URL`
- `AI_PROVIDER`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GROK_API_KEY`
- `GROK_MODEL`

### Secure setup

- Copy `.env.example` to `.env.local` for local development.
- Never commit `.env`, `.env.local`, or real secrets to GitHub.
- For Cloudflare Pages, add the same variables in the Pages project settings under Build & Deploy > Environment variables.
- If you deploy from GitHub Actions, store the values in GitHub Secrets and inject them into the build step.
- For Firebase email verification, add your production domain to Firebase Authentication > Settings > Authorized domains.

> Only variables prefixed with `VITE_` are exposed to the frontend bundle. If something must stay truly private, keep it on a server-side endpoint or Cloudflare Worker instead of the client app.

### AI chat setup

The chatbot calls the server-side `/api/ai` endpoint, so AI keys must stay in `.env.local` locally and in Cloudflare Pages environment variables for production.

- For Gemini, use `AI_PROVIDER=gemini`, set `GEMINI_API_KEY`, and set `GEMINI_MODEL=gemini-3.6-flash`.
- For Grok, use `AI_PROVIDER=grok`, set `GROK_API_KEY`, and set `GROK_MODEL`.
- You only need the key for the provider selected by `AI_PROVIDER`; Gemini does not require a Grok key, and Grok does not require a Gemini key.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts Vite and the local support API together. The AI chat uses the local `/api/ai` proxy during development, so use `npm run dev` instead of starting Vite alone.

## Build

```bash
npm run build
```

## Testing

```bash
npm test
npm run test:e2e:chromium
```

Use `npm run test:e2e:chromium` for a quick local browser smoke test with the installed Chromium browsers. The full cross-browser suite is still available with `npm run test:e2e`; run `npx playwright install` first if Firefox or WebKit are missing locally.

## Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. Deploy the `dist` folder to GitHub Pages

### Cloudflare Pages

1. Build the project: `npm run build`
2. Set the build output directory to `dist`
3. Ensure the `functions` directory is deployed with the project. Cloudflare Pages will expose the function routes under `/api/support`.
4. In Cloudflare Pages, add the required environment variables under Build & Deploy > Environment variables, including:
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
   - `DARAJA_ENV`
   - `DARAJA_CONSUMER_KEY`
   - `DARAJA_CONSUMER_SECRET`
   - `DARAJA_BUSINESS_SHORT_CODE`
   - `DARAJA_PASSKEY`
   - `DARAJA_CALLBACK_URL`

This is required for features like the TMDB API, authentication, live TV stream proxying, and the STK Push support flow to work correctly.

> For the DARAJA callback URL, use the Pages URL for the new function endpoint, for example: `https://<your-site>.pages.dev/api/support/callback`.

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

## Contributing

We welcome contributions to NEXASTREAM! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/nexastream.git`
3. Navigate to the project: `cd nexastream`
4. Install dependencies: `npm install`
5. Create a branch: `git checkout -b feature/your-feature-name`

### Development Workflow

1. Make your changes following the code style guidelines
2. Test your changes thoroughly
3. Run the linter: `npm run lint`
4. Run tests: `npm run test`
5. Commit your changes with descriptive messages
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a pull request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused
- Use the shared hooks in `src/hooks/shared/` instead of creating duplicates
- Follow the existing error handling patterns using `src/utils/errorHandler.ts`

### Commit Message Format

Follow conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### Testing

- Write unit tests for new utilities and hooks
- Write component tests for new UI components
- Ensure all tests pass before submitting PR
- Test on multiple browsers and devices

### Pull Request Guidelines

- Describe what your PR does and why
- Link related issues
- Include screenshots for UI changes
- Ensure all CI checks pass
- Request review from maintainers

### Documentation

- Update relevant documentation for your changes
- Add JSDoc comments for public functions
- Update the README if needed
- Add examples for new features

### Issues

When reporting issues:
- Use the issue template
- Provide steps to reproduce
- Include browser and device information
- Add screenshots if applicable
- Check for existing issues first

## Documentation

- [Architecture Documentation](docs/Architecture.md)
- [API Documentation](docs/API-Documentation.md)
- [State Management](docs/StateManagement.md)
- [Video Player API](docs/VideoPlayer-API.md)

## License

MIT
