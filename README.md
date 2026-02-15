# Product Browser + Cart

A React Native mobile application for browsing products and managing a shopping cart. Built with TypeScript, React Navigation, and Zustand for state management.

## Features

- **Product Catalog**: Browse products in a responsive 2-column grid
- **Product Details**: View product images, descriptions, and select variants (size, color, etc.)
- **Shopping Cart**: Add items, adjust quantities, view totals
- **Offline Support**: Browse cached products and retain cart when offline
- **Accessibility**: Full VoiceOver/TalkBack support with semantic labels

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
└── __tests__/             # Unit tests
    ├── components/
    │   └── VariantSelector.test.tsx
    ├── store/
    │   ├── cartStore.test.ts
    │   └── productStore.test.ts
    └── utils/
        ├── availability.test.ts
        └── currency.test.ts
```

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- Watchman (macOS)
- Xcode 15+ (iOS development)
- Android Studio (Android development)
- CocoaPods (iOS dependencies)

### Environment Variables

No environment variables are required. The product API URL is configured in `src/api/config.ts` and points to a hosted JSON feed.

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

## Technical Constraints Met

- ✅ **Pure React Native** (no Expo) - Bare CLI project
- ✅ **TypeScript** - Strict typing throughout
- ✅ **Type-safe Navigation** - React Navigation with typed params
- ✅ **Predictable State** - Zustand with testable stores
- ✅ **Local Persistence** - AsyncStorage for cache and cart
- ✅ **Unit Tests** - Jest tests for stores and utilities
- ✅ **Accessibility** - VoiceOver/TalkBack labels and roles

## Tradeoffs & Known Limitations

1. **react-native-fast-image omitted**: Peer dependency conflict with React 19. Using native `Image` component as fallback. See `DECISION_LOG.md` for details.

2. **No E2E tests**: Detox setup requires additional configuration. Unit tests cover core business logic.

3. **No checkout flow**: Scope limited to browsing and cart management per requirements.

4. **Single currency assumption**: Price formatting assumes CAD. Would need locale detection for multi-currency.

## License

MIT
