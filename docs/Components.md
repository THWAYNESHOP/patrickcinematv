# Component Documentation

## Overview

NEXASTREAM uses a component-based architecture with reusable UI components organized by feature. This document describes the key components and their usage.

## Component Categories

### Layout Components

#### Layout
**Location:** `src/components/Layout/Layout.tsx`

Main layout wrapper that provides the app structure including navbar, footer, and content area.

**Props:** None

**Usage:**
```tsx
<Layout>
  <App />
</Layout>
```

#### Navbar
**Location:** `src/components/Layout/Navbar.tsx`

Desktop navigation bar with logo, navigation links, and user menu.

**Props:** None

**Features:**
- Responsive design
- Active route highlighting
- User authentication status

#### MobileNav
**Location:** `src/components/Layout/MobileNav.tsx`

Bottom navigation bar for mobile devices with icon-based navigation.

**Props:** None

**Features:**
- Fixed position at bottom
- Active route highlighting
- Haptic feedback support

#### Footer
**Location:** `src/components/Layout/Footer.tsx`

Application footer with links and legal information.

**Props:** None

### Home Components

#### HeroSlider
**Location:** `src/components/Home/HeroSlider.tsx`

Featured content carousel with auto-rotation and navigation controls.

**Props:**
```tsx
interface HeroSliderProps {
  items: HeroItem[]
  autoPlay?: boolean
  interval?: number
}
```

**Features:**
- Auto-rotation with configurable interval
- Keyboard navigation
- Touch swipe support
- Optimized with React.memo

#### ContentCarousel
**Location:** `src/components/Home/ContentCarousel.tsx`

Horizontal scrolling carousel for content items.

**Props:**
```tsx
interface ContentCarouselProps {
  title: string
  items: ContentItem[]
  type: 'movie' | 'tv' | 'anime' | 'sports'
}
```

**Features:**
- Horizontal scroll with snap
- Lazy loading
- Memoized carousel cards

### Details Components

#### DetailHero
**Location:** `src/components/Details/DetailHero.tsx`

Hero section for content details with backdrop and metadata.

**Props:**
```tsx
interface DetailHeroProps {
  item: DetailItem
  onPlay?: () => void
  onAddToList?: () => void
}
```

#### MediaRail
**Location:** `src/components/Details/MediaRail.tsx`

Horizontal list of related media items (similar, recommendations, cast).

**Props:**
```tsx
interface MediaRailProps {
  title: string
  items: MediaItem[]
  type: 'similar' | 'recommendations' | 'cast'
}
```

**Features:**
- Optimized with React.memo
- Lazy loading
- Horizontal scroll

#### CastRail
**Location:** `src/components/Details/CastRail.tsx`

Horizontal list of cast members with photos and names.

**Props:**
```tsx
interface CastRailProps {
  cast: CastMember[]
}
```

#### DetailActions
**Location:** `src/components/Details/DetailActions.tsx`

Action buttons for content (play, add to list, share, etc.).

**Props:**
```tsx
interface DetailActionsProps {
  item: DetailItem
  onPlay?: () => void
  onAddToList?: () => void
}
```

### Player Components

#### StreamingPlayer
**Location:** `src/components/Player/StreamingPlayer.tsx`

Main video player component with streaming support.

**Props:**
```tsx
interface StreamingPlayerProps {
  streamUrl: string
  poster?: string
  title?: string
  onEnded?: () => void
}
```

**Features:**
- HLS streaming support
- Custom controls
- Server selection
- Quality selection

#### CustomVideoPlayer
**Location:** `src/components/Player/CustomVideoPlayer.tsx`

Custom video player with enhanced controls.

**Props:**
```tsx
interface CustomVideoPlayerProps {
  src: string
  poster?: string
  autoplay?: boolean
}
```

#### PlayerControls
**Location:** `src/components/Player/PlayerControls.tsx`

Custom video player controls (play, pause, seek, volume, etc.).

**Props:**
```tsx
interface PlayerControlsProps {
  videoRef: RefObject<HTMLVideoElement>
  onPlayPause?: () => void
  onFullscreen?: () => void
}
```

#### ServerSelector
**Location:** `src/components/Player/ServerSelector.tsx`

Dropdown for selecting streaming servers.

**Props:**
```tsx
interface ServerSelectorProps {
  servers: Server[]
  selectedServer: string
  onSelect: (server: string) => void
}
```

### Auth Components

#### AuthModal
**Location:** `src/components/Auth/AuthModal.tsx`

Modal for user authentication (sign in/sign up).

**Props:**
```tsx
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultView?: 'signin' | 'signup'
}
```

#### EmailVerificationBanner
**Location:** `src/components/Auth/EmailVerificationBanner.tsx`

Banner prompting users to verify their email address.

**Props:**
```tsx
interface EmailVerificationBannerProps {
  email: string
  onResend: () => void
}
```

### Shared Components

#### OptimizedImage
**Location:** `src/components/OptimizedImage.tsx`

Lazy-loading image component with blur effect and WebP support.

**Props:**
```tsx
interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}
```

**Features:**
- Lazy loading
- Blur effect on load
- WebP format support
- Error handling

#### LoadingSkeleton
**Location:** `src/components/LoadingSkeleton.tsx`

Skeleton loading components for various UI patterns.

**Components:**
- `LoadingSkeleton`: Base skeleton component
- `CardSkeleton`: Card placeholder
- `HeroSkeleton`: Hero banner placeholder
- `CarouselSkeleton`: Carousel placeholder
- `TextSkeleton`: Text placeholder
- `ListSkeleton`: List placeholder

**Usage:**
```tsx
<CardSkeleton />
<HeroSkeleton />
<TextSkeleton lines={3} />
```

#### ErrorBoundary
**Location:** `src/components/ErrorBoundary.tsx`

Error boundary component to catch and handle React errors.

**Props:**
```tsx
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}
```

#### ErrorBanner
**Location:** `src/components/ErrorBanner.tsx`

Banner component for displaying error messages.

**Props:**
```tsx
interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info'
}
```

#### EmptyState
**Location:** `src/components/EmptyState.tsx`

Component for displaying empty states (no results, no favorites, etc.).

**Props:**
```tsx
interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}
```

#### NetworkStatusBanner
**Location:** `src/components/NetworkStatusBanner.tsx`

Banner showing network connection status.

**Props:** None

**Features:**
- Shows online/offline status
- Auto-dismisses when online
- Persistent when offline

#### KeyboardShortcutsModal
**Location:** `src/components/KeyboardShortcutsModal.tsx`

Modal displaying available keyboard shortcuts.

**Props:**
```tsx
interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}
```

#### MiniPlayer
**Location:** `src/components/MiniPlayer.tsx`

Mini video player for picture-in-picture mode.

**Props:**
```tsx
interface MiniPlayerProps {
  streamUrl: string
  title?: string
  onClose: () => void
}
```

### Utility Components

#### Avatar
**Location:** `src/components/Avatar.tsx`

User avatar component with fallback.

**Props:**
```tsx
interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  fallback?: string
}
```

#### ContentPreview
**Location:** `src/components/ContentPreview.tsx`

Preview card for content items.

**Props:**
```tsx
interface ContentPreviewProps {
  item: ContentItem
  onClick?: () => void
}
```

#### Filters
**Location:** `src/components/Filters.tsx`

Filter component for content filtering.

**Props:**
```tsx
interface FiltersProps {
  filters: Filter[]
  selectedFilters: string[]
  onFilterChange: (filters: string[]) => void
}
```

#### PageTransition
**Location:** `src/components/PageTransition.tsx`

Page transition wrapper with animation.

**Props:**
```tsx
interface PageTransitionProps {
  children: ReactNode
}
```

#### PageFallback
**Location:** `src/components/PageFallback.tsx`

Fallback component for page loading states.

**Props:**
```tsx
interface PageFallbackProps {
  type?: 'loading' | 'error' | 'not-found'
}
```

## Component Patterns

### Memoization
Components that are expensive to render use `React.memo`:
- HeroSlider
- MediaRail
- ContentCarousel cards

### Lazy Loading
Components that are not immediately needed use `React.lazy`:
- AuthModal
- KeyboardShortcutsModal
- MiniPlayer

### Error Boundaries
Critical sections are wrapped in ErrorBoundary:
- Player components
- Auth components
- API-heavy components

### Accessibility
All interactive components include:
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Best Practices

1. **Use TypeScript**: All components should have proper TypeScript interfaces
2. **Keep Components Small**: Single responsibility principle
3. **Use Props Interfaces**: Define clear prop interfaces
4. **Add Default Props**: Provide sensible defaults
5. **Handle Loading States**: Use LoadingSkeleton components
6. **Handle Errors**: Use ErrorBoundary for error-prone components
7. **Optimize Performance**: Use React.memo for expensive components
8. **Accessibility First**: Include ARIA labels and keyboard support
9. **Responsive Design**: Test on multiple screen sizes
10. **Test Components**: Write unit tests for complex components

## Testing

Component tests are located alongside components:
- `ComponentName.test.tsx` for unit tests
- Use React Testing Library
- Test user interactions
- Test error states
- Test loading states

## Future Improvements

- Add Storybook for component documentation
- Implement component composition patterns
- Add more shared components
- Improve component documentation with JSDoc
- Add component performance monitoring
