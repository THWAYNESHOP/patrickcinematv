# API Documentation

## Overview

NEXASTREAM integrates with multiple external APIs to provide streaming content, user authentication, and payment processing. This document describes each API integration, their usage, and security considerations.

## Table of Contents

- [TMDB API](#tmdb-api)
- [Sports API](#sports-api)
- [Supabase](#supabase)
- [Firebase](#firebase)
- [Daraja/MPESA](#darajampesa)
- [Stream Proxy](#stream-proxy)

---

## TMDB API

### Purpose
The Movie Database (TMDB) API provides movie and TV show metadata including posters, backdrops, ratings, and detailed information.

### Base URL
- **Development**: `https://api.themoviedb.org/3`
- **Production**: `/api/tmdb` (proxied through Cloudflare Functions)

### Authentication
Uses API key authentication. The API key is stored in environment variables:

```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### Security
- **Development**: API key is exposed to client (acceptable for development)
- **Production**: API calls are proxied through Cloudflare Functions to hide the API key
- **Rate Limiting**: TMDB enforces rate limits (40 requests per 10 seconds)
- **Caching**: Responses are cached for 5 minutes to reduce API calls

### Key Endpoints

#### Get Popular Movies
```typescript
const movies = await tmdbApi.getPopularMovies()
```

#### Get Trending Movies
```typescript
const movies = await tmdbApi.getTrendingMoviesToday()
```

#### Search Content
```typescript
const results = await tmdbApi.searchMulti('action')
```

#### Get Movie Details
```typescript
const details = await tmdbApi.getMovieDetails('12345')
```

### Data Models

```typescript
interface MovieSummary {
  id: string | number
  title: string
  poster: string
  backdrop?: string
  overview?: string
  rating: string
  year?: number
  type?: 'movie' | 'tv' | 'anime'
}

interface MovieDetails extends MovieSummary {
  genres: string[]
  runtime: number
  cast: CastMember[]
  similar: MovieSummary[]
}
```

---

## Sports API

### Purpose
The Streamed.pk API provides live sports matches, upcoming schedules, and streaming links for various sports.

### Base URL
- **Development**: `https://streamed.pk/api`
- **Production**: `/api/sports` (proxied through Cloudflare Functions)

### Authentication
No authentication required for public endpoints.

### Security
- **Rate Limiting**: 100 requests per minute per IP (enforced by Cloudflare Functions)
- **CORS**: Configured to allow requests from the application domain
- **Fallback**: Returns mock data when API is unavailable

### Key Endpoints

#### Get Live Matches
```typescript
const matches = await sportsApi.getLiveMatches()
```

#### Get Upcoming Matches
```typescript
const matches = await sportsApi.getUpcomingMatches()
```

#### Get Stream Links
```typescript
const streams = await sportsApi.getStreams('sport', 'matchId')
```

### Data Models

```typescript
interface Match {
  id: string
  title: string
  homeTeam: string
  awayTeam: string
  sport: string
  startTime: string
  isLive: boolean
}

interface Stream {
  id: string
  streamNo: number
  language: string
  hd: boolean
  embedUrl: string
  source: string
}
```

---

## Supabase

### Purpose
Supabase provides backend services including PostgreSQL database, authentication, and real-time subscriptions.

### Configuration
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Security
- **Row Level Security (RLS)**: Enabled on all tables
- **Anon Key**: Public key with restricted permissions
- **Service Role Key**: Never exposed to client (used only in server-side functions)
- **Authentication**: JWT-based with secure token storage

### Key Features

#### Authentication
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

#### Database Queries
```typescript
// Query with RLS
const { data, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)

// Real-time subscription
const subscription = supabase
  .channel('custom-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
    console.log('New notification:', payload)
  })
  .subscribe()
```

---

## Firebase

### Purpose
Firebase provides additional backend services including analytics, crash reporting, and push notifications.

### Configuration
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here
```

### Security
- **Security Rules**: Firestore and Storage rules restrict access to authenticated users
- **API Key**: Public key with restricted permissions (acceptable for Firebase)
- **Service Account**: Never exposed to client

### Key Features

#### Analytics
```typescript
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

// Log event
import { logEvent } from 'firebase/analytics'
logEvent(analytics, 'video_play', { video_id: '123' })
```

#### Cloud Messaging (Push Notifications)
```typescript
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const messaging = getMessaging()

// Request permission
const permission = await Notification.requestPermission()

// Get token
const token = await getToken(messaging, { vapidKey: 'your_vapid_key' })

// Listen for messages
onMessage(messaging, (payload) => {
  console.log('Received message:', payload)
})
```

---

## Daraja/MPESA

### Purpose
Daraja API provides M-PESA mobile payment integration for support payments in Kenya.

### Configuration
```bash
DARAJA_ENV=sandbox
DARAJA_CONSUMER_KEY=your_daraja_consumer_key
DARAJA_CONSUMER_SECRET=your_daraja_consumer_secret
DARAJA_BUSINESS_SHORT_CODE=your_business_short_code
DARAJA_PASSKEY=your_daraja_passkey
DARAJA_CALLBACK_URL=https://yourdomain.com/api/support/callback
```

### Security
- **Server-Side Only**: All Daraja API calls are made through Cloudflare Functions
- **Never Exposed**: Consumer key, secret, and passkey are never exposed to the client
- **HTTPS Required**: All communications use HTTPS
- **Callback Validation**: Callbacks are validated to prevent fraud

### Key Endpoints

#### STK Push (Request Payment)
```typescript
// Client-side (calls backend endpoint)
const response = await requestSupportPayment({
  phone: '254712345678',
  amount: 100,
  accountReference: 'Support'
})

// Server-side (Cloudflare Function)
// POST /api/support/stk-push
```

#### Callback Handler
```typescript
// Server-side (Cloudflare Function)
// POST /api/support/callback
```

### Data Models

```typescript
interface SupportPaymentRequest {
  phone: string
  amount: number
  accountReference: string
}

interface SupportPaymentResponse {
  success: boolean
  message: string
  merchantRequestID?: string
  checkoutRequestID?: string
}
```

---

## Stream Proxy

### Purpose
The stream proxy provides secure access to video streams, bypassing CORS restrictions and adding authentication.

### Base URL
```bash
VITE_STREAM_PROXY_URL=https://patrick-cinema-tv.patrickcinematv.workers.dev/api/stream
```

### Security
- **Authentication**: Proxy validates requests before forwarding
- **CORS**: Handles CORS headers for streaming endpoints
- **Rate Limiting**: Prevents abuse of streaming resources

### Usage
```typescript
const streamUrl = `${VITE_STREAM_PROXY_URL}/${videoId}`
```

---

## Error Handling

All API calls use a centralized error handling system:

```typescript
import { handleError, logError } from '../utils/errorHandler'

try {
  const data = await apiCall()
} catch (error) {
  const appError = handleError(error)
  logError(appError, 'API call failed')
  
  // Handle specific error types
  if (appError.code === 'NETWORK_ERROR') {
    // Show offline message
  } else if (appError.code === 'RATE_LIMIT_ERROR') {
    // Show rate limit message
  }
}
```

---

## Caching Strategy

### API Response Caching
- **TMDB**: 5 minutes
- **Sports**: 1 minute
- **User Data**: 10 minutes
- **Static Data**: 1 hour

### Service Worker Caching
- **Images**: 30 days (CacheFirst)
- **API Responses**: 1 hour (NetworkFirst)
- **Static Assets**: 7 days (StaleWhileRevalidate)

---

## Monitoring

All API calls are monitored for performance and errors:

```typescript
import { trackPerformance, trackError } from '../utils/monitoring'

// Track API performance
trackPerformance('tmdb_api_call', 'get_popular_movies')

// Track errors
trackError(error, { endpoint: '/api/tmdb/popular' })
```

---

## Best Practices

1. **Always use the service layer** - Don't make direct API calls from components
2. **Handle errors gracefully** - Use the centralized error handling
3. **Implement loading states** - Show loading indicators during API calls
4. **Cache responses** - Reduce unnecessary API calls
5. **Respect rate limits** - Implement exponential backoff for retries
6. **Validate data** - Validate API responses before using them
7. **Log errors** - Use the monitoring system to track issues
8. **Use environment variables** - Never hardcode API keys or secrets

---

## Testing

API integrations are tested with:

- **Unit Tests**: Test individual API functions
- **Integration Tests**: Test API interactions with real services
- **E2E Tests**: Test complete user flows involving APIs

Run tests:
```bash
npm run test              # Unit tests
npm run test:e2e         # E2E tests
```
