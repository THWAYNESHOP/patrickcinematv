# Video Player API Documentation (VidCore)

Complete developer documentation for VidCore video player embeds, TMDB ID routing, player options, events, and examples.

## Developer intent
Embed a movie or TV player using a predictable URL structure and optional query parameters.

## Base endpoints
- Movie: `/embed/movie/{tmdbId}`
- TV episode: `/embed/tv/{tmdbId}/{season}/{episode}`

These endpoints accept TMDB numeric IDs or IMDB IDs (with `tt` prefix) where supported by the provider.

## Common options (query parameters)
- `autoPlay` — `true|false` (boolean) — enable/disable autoplay
- `startAt` — float (seconds) — start playback at timestamp
- `resumeAt` — float (seconds) — alias for `startAt` to resume playback
- `theme` / `primaryColor` — hex color (e.g. `38bdf8`) — UI theme color
- `sub` / `sub_url` — subtitle URL (.srt/.vtt)
- `hideServer` — `true|false` — hide server chooser UI
- `title` — string (URL-encoded) — override displayed title
- `poster` — URL — override poster/thumbnail
- `fullscreenButton` — `true|false` — show/hide fullscreen button
- `controls` — `true|false` — show/hide player controls
- `overlay` — `true|false` — show/hide hover overlay

## Player events (postMessage)
The iframe posts `PLAYER_EVENT` messages to the parent window containing playback state and media info. Listen for events like `play`, `pause`, `seeked`, `ended`, `timeupdate`, and `playerstatus` via `window.postMessage`.

Example event structure (payload under `data.data`):

```json
{
  "player_info": {
    "imdb": "tt23779058",
    "tmdb": 27205,
    "mediaType": "movie",
    "season": null,
    "episode": null,
    "title": "Example Movie",
    "poster": "https://..."
  },
  "player_status": "playing",
  "player_progress": 125.4,
  "player_duration": 7200,
  "quality": { "label": "1080p", "width": 1920, "height": 1080 },
  "availableQualities": ["1080p","720p","480p"]
}
```

### Listening for events (example)

```js
window.addEventListener('message', ({ data }) => {
  if (data?.type !== 'PLAYER_EVENT') return
  const payload = data.data
  // handle payload.player_status, payload.player_progress, etc.
  console.log('PLAYER_EVENT', payload)
})
```

## Examples
- Movie (TMDB): `GET /embed/movie/27205?autoPlay=false&theme=38bdf8`
- TV episode: `GET /embed/tv/1396/1/1?sub=en`

Embed via iframe example:

```html
<iframe
  src="https://example-embed-host/embed/movie/27205?autoPlay=1"
  width="100%" height="100%"
  frameborder="0" allowfullscreen
></iframe>
```

## Notes & best practices
- Use `resumeAt` to restore user playback position.
- When embedding cross-origin, ensure `postMessage` origin validation is performed.
- Some providers enforce domain whitelisting and `frame-ancestors` CSP; use a proxy only if permitted by provider terms.

---
Generated documentation for VidCore-style embeds. If you want this page linked from the README, I can add an entry. 