# Product Browser + Cart

A React Native mobile application for browsing products and managing a shopping cart. Built with TypeScript, React Navigation, and Zustand for state management.

## Features

- 2-column product grid with pull-to-refresh and infinite scroll
- Product detail with image carousel, variant selection, and add-to-cart
- Cart with quantity management, line totals, and subtotal
- Offline support — cached products + persisted cart
- Full VoiceOver / TalkBack accessibility

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Screens (Thin Orchestrators)                  │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ProductList  │  │ProductDetail    │  │CartScreen           │  │
│  │Screen       │  │Screen           │  │                     │  │
│  └──────┬──────┘  └────────┬────────┘  └──────────┬──────────┘  │
└─────────┼──────────────────┼───────────────────────┼─────────────┘
          │                  │                       │
┌─────────┴──────────────────┴───────────────────────┴─────────────┐
│                    Custom Hooks (Logic Layer)                      │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐   │
│  │ useProducts  │  │useVariantSelection│  │ useCart           │   │
│  │ useAddToCart  │  │useNetworkStatus   │  │                  │   │
│  └──────┬───────┘  └────────┬──────────┘  └──────┬───────────┘   │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
┌─────────┴──────────────────┴──────────────────────┴──────────────┐
│                    Shared Components (Pure UI)                     │
│  ProductCard, CartLineItem, CartSummary, ProductInfo,             │
│  AddToCartButton, VariantSelector, QuantityStepper,               │
│  ImageCarousel, Badge, PriceDisplay, EmptyState, ErrorState,      │
│  LoadingSkeleton, OfflineBanner, ErrorBoundary                    │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────┐
│                      State Layer (Zustand)                        │
│  ┌──────────────────────┐       ┌──────────────────────────┐     │
│  │  useProductStore     │       │  useCartStore            │     │
│  │  - products[]        │       │  - items[]               │     │
│  │  - fetchState        │       │  - addItem()             │     │
│  │  - fetchProducts()   │       │  - updateQuantity()      │     │
│  │  - hydrateFromCache()│       │  - persist middleware    │     │
│  └──────────┬───────────┘       └──────────────────────────┘     │
└─────────────┼────────────────────────────────────────────────────┘
              │
┌─────────────┴────────────────────────────────────────────────────┐
│                          Data Layer                               │
│  ┌──────────────────────┐       ┌──────────────────────────┐     │
│  │  productApi.ts       │       │  AsyncStorage            │     │
│  │  - fetchProducts()   │◄─────►│  - Product cache         │     │
│  │  - fetchWithRetry()  │       │  - Cart persistence      │     │
│  └──────────────────────┘       └──────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Zustand over Redux**: Minimal boilerplate, built-in persistence middleware, excellent TypeScript support
2. **Stale-While-Revalidate Caching**: Shows cached data immediately, updates in background
3. **Denormalized Cart Items**: Cart stores price/title snapshots to prevent silent price changes
4. **Discriminated Union for FetchState**: Type-safe state machine prevents impossible states

## Project Structure

```
src/
├── api/                    # API layer
│   ├── config.ts          # API configuration
│   └── productApi.ts      # Product fetching with caching
├── components/            # Reusable UI components
│   ├── AddToCartButton.tsx   # Sticky add-to-cart CTA
│   ├── Badge.tsx
│   ├── CartLineItem.tsx      # Cart item row with quantity stepper
│   ├── CartSummary.tsx       # Sticky cart totals & checkout
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorState.tsx
│   ├── ImageCarousel.tsx
│   ├── LoadingSkeleton.tsx
│   ├── OfflineBanner.tsx
│   ├── PriceDisplay.tsx
│   ├── ProductCard.tsx       # Product grid tile
│   ├── ProductInfo.tsx       # Product detail info block
│   ├── QuantityStepper.tsx
│   ├── VariantSelector.tsx
│   └── index.ts             # Barrel export
├── hooks/                 # Custom React hooks
│   ├── useAddToCart.ts    # Add-to-cart logic & button state
│   ├── useCart.ts         # Cart selectors, actions, formatting
│   ├── useNetworkStatus.ts
│   ├── useProducts.ts     # Product fetching & client-side pagination
│   ├── useVariantSelection.ts
│   └── index.ts           # Barrel export
├── navigation/            # React Navigation setup
│   ├── RootNavigator.tsx
│   └── types.ts
├── screens/               # Screen components (thin orchestrators)
│   ├── CartScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── ProductListScreen.tsx
│   └── index.ts
├── store/                 # Zustand stores
│   ├── cartStore.ts
│   └── productStore.ts
├── theme/                 # Design tokens
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── types/                 # TypeScript type definitions
│   ├── api.ts
│   ├── cart.ts
│   └── product.ts
├── utils/                 # Utility functions
│   ├── availability.ts    # Variant selection logic
│   ├── currency.ts        # Price formatting
│   ├── image.ts           # Shopify CDN image URL transforms
│   ├── retry.ts           # Fetch with retry
│   ├── storage.ts         # AsyncStorage wrapper
│   └── index.ts           # Barrel export
└── __tests__/             # Unit tests (33 suites, 203 tests)
    ├── api/               # API + config tests
    ├── components/        # All component tests
    ├── helpers/           # Shared fixtures
    ├── hooks/             # Hook tests
    ├── screens/           # Screen tests
    ├── store/             # Store tests
    └── utils/             # Utility tests
```

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- Watchman (macOS)
- Xcode 15+ (iOS development)
- Android Studio (Android development)
- CocoaPods (iOS dependencies)

### Environment Variables

None required. Product API URL is in `src/api/config.ts` (points to a hosted JSON feed).

### Installation

```bash
# Clone the repository
cd ProductBrowser

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Technical Constraints

- Pure React Native (no Expo) — bare CLI project
- TypeScript with strict mode
- Type-safe navigation via React Navigation composite screen props
- Zustand for state management with built-in persistence
- AsyncStorage for product cache + cart persistence
- 203 unit tests across 33 suites (Jest + @testing-library/react-native)
- Full VoiceOver / TalkBack support

## Tradeoffs & Known Limitations

- **react-native-fast-image omitted** — peer dependency conflict with React 19. Native `Image` as fallback. See DECISION_LOG.md #3.
- **No E2E tests** — Detox setup was out of scope. Unit tests cover business logic; manual testing covers flows.
- **No checkout flow** — scope limited to browsing and cart per requirements.
- **CAD-only pricing** — would need locale-aware currency detection for multi-currency.

## License

MIT
