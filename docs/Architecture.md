# Architecture Documentation

## Overview

NEXASTREAM is a modern streaming application built with React, TypeScript, and Vite. The architecture follows a layered approach with clear separation of concerns.

## Project Structure

```
src/
├── api/              # API integrations (TMDB, Sports, Daraja)
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable UI components
│   ├── Home/         # Home page components
│   ├── Details/      # Details page components
│   ├── Player/       # Video player components
│   └── shared/       # Shared components
├── hooks/            # Custom React hooks
│   └── shared/       # Consolidated shared hooks
├── pages/            # Page components
├── services/         # Service layer for API calls
├── store/            # State management (Zustand)
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── lib/              # Third-party library configurations
├── styles/           # Global styles
└── test/             # Test utilities
```

## Architecture Layers

### Presentation Layer
- **Components**: Reusable UI components organized by feature
- **Pages**: Route-level components that compose features
- **Hooks**: Custom React hooks for stateful logic

### Business Logic Layer
- **Services**: API service layer with retry logic and caching
- **Hooks**: Business logic hooks (useAuth, useMyList, etc.)
- **Store**: Global state management with Zustand

### Data Layer
- **API**: External API integrations (TMDB, Sports, etc.)
- **Utils**: Data transformation and validation utilities
- **Types**: TypeScript interfaces and type definitions

### Infrastructure Layer
- **Lib**: Third-party library configurations (Supabase, Firebase)
- **Utils**: Cross-cutting concerns (error handling, monitoring)

## Key Patterns

### Service Layer Pattern
All API calls go through the service layer which provides:
- Retry logic with exponential backoff
- Response caching
- Error handling and logging
- Request/response transformation

```typescript
// src/services/apiService.ts
export const tmdbService = new ApiService(
  import.meta.env.DEV ? 'https://api.themoviedb.org/3' : '/api/tmdb'
)
```

### Custom Hooks Pattern
Business logic is encapsulated in custom hooks:
- State management hooks (useAuth, useMyList)
- Data fetching hooks (useContinueWatching, useRecommendations)
- UI interaction hooks (useKeyboardHandler, useSwipeGestures)

### Shared Hooks Pattern
Common patterns are consolidated in shared hooks:
- `useStorage`: Unified localStorage/sessionStorage
- `useDebounce`: Debounce and throttle utilities
- `useNetwork`: Network status monitoring
- `useAsync`: Async state management

### Error Handling Pattern
Centralized error handling with custom error types:
```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  code: string
  statusCode?: number
  context?: Record<string, unknown>
}
```

## State Management

### Local State
- React useState/useReducer for component-local state
- Custom hooks for shared component logic

### Global State
- Zustand for global application state
- Persistent state via localStorage
- Real-time sync with Supabase/Firebase

### Server State
- API response caching
- Optimistic updates for user actions
- Background refetching for stale data

## Data Flow

```
User Action → Component → Hook → Service → API
                ↓              ↓
            Local State → Global State
                ↓              ↓
            UI Update ← Cache Update
```

## Security Architecture

### API Security
- Backend proxy for sensitive API keys (Cloudflare Functions)
- Rate limiting on all API endpoints
- CORS policies configured per environment

### Authentication
- Supabase Auth for user authentication
- JWT tokens stored securely
- Row-level security on database

### Data Protection
- Environment variables for secrets
- No sensitive data in client-side code
- Input validation and sanitization

## Performance Architecture

### Code Splitting
- Route-based splitting with React.lazy
- Manual chunk splitting for vendor libraries
- Dynamic imports for heavy components

### Caching Strategy
- Service worker caching for static assets
- API response caching with TTL
- Image optimization with WebP format

### Rendering Optimization
- React.memo for expensive components
- Virtual scrolling for long lists
- Lazy loading for images and videos

## Monitoring & Observability

### Error Tracking
- Centralized error handling
- Sentry integration (placeholder)
- Error logging with context

### Performance Monitoring
- Web Vitals tracking
- API performance metrics
- Custom performance events

## Deployment Architecture

### Frontend
- Static site deployment to GitHub Pages
- Automated CI/CD pipeline
- Environment-specific builds

### Backend
- Cloudflare Functions for API proxy
- Supabase for database and auth
- Firebase for additional services

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for routing

### Backend Services
- Cloudflare Functions (API proxy)
- Supabase (Database, Auth, Real-time)
- Firebase (Analytics, Messaging)

### Testing
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

### Development Tools
- ESLint for linting
- Prettier for formatting
- Husky for git hooks
- Dependabot for dependency updates

## Scalability Considerations

### Horizontal Scaling
- Stateless architecture
- CDN for static assets
- Serverless functions for backend

### Vertical Scaling
- Code splitting for faster initial load
- Lazy loading for on-demand features
- Progressive enhancement for slow connections

### Data Scaling
- Pagination for large datasets
- Caching to reduce API calls
- Optimistic updates for perceived performance

## Future Improvements

### Architecture
- Consider full feature-based folder structure
- Implement micro-frontends for large features
- Add GraphQL for efficient data fetching

### Performance
- Implement edge computing with Cloudflare Workers
- Add server-side rendering for SEO
- Optimize bundle size further

### Security
- Add content security policy
- Implement request signing
- Add rate limiting per user

## Documentation

- [API Documentation](./API-Documentation.md)
- [Video Player API](./VideoPlayer-API.md)
- [Component Documentation](./Components.md) (to be added)
