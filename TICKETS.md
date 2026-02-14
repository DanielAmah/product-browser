# Product Browser + Cart - Ticket Breakdown

This document contains the ticket breakdown for implementing the Product Browser + Cart React Native application. Each ticket is scoped for ~1-2 days of work and includes acceptance criteria.

---

## Epic: Project Foundation

### TICKET-001: Project Initialization & Configuration
**Type**: Setup  
**Priority**: P0 - Blocker  
**Estimated**: 0.5 days

**Description**:
Initialize a bare React Native CLI project with TypeScript template and configure development tooling.

**Acceptance Criteria**:
- [ ] React Native CLI project created (no Expo)
- [ ] TypeScript configured with strict mode
- [ ] Path aliases configured in tsconfig.json and babel.config.js (@api, @components, @hooks, @navigation, @screens, @store, @theme, @apptypes, @utils)
- [ ] ESLint and Prettier configured
- [ ] Project builds successfully on iOS and Android simulators
- [ ] Git repository initialized with .gitignore

**Branch**: `feature/TICKET-001-project-init`

---

### TICKET-002: Domain Type Definitions
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 0.5 days

**Description**:
Define TypeScript interfaces for all domain entities based on the product feed JSON structure.

**Acceptance Criteria**:
- [ ] `src/types/product.ts` - Money, ProductImage, MediaImage, SelectedOption, ProductOption, Variant, Product interfaces
- [ ] `src/types/cart.ts` - CartItem, CartItemInput interfaces
- [ ] `src/types/api.ts` - CacheEntry, FetchState, NetworkError types
- [ ] Barrel export in `src/types/index.ts`
- [ ] All types compile without errors

**Branch**: `feature/TICKET-002-domain-types`

---

### TICKET-003: Theme System Setup
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 0.5 days

**Description**:
Create centralized theme constants for consistent UI styling across the app.

**Acceptance Criteria**:
- [ ] `src/theme/colors.ts` - Semantic color tokens (primary, background, text, border, etc.)
- [ ] `src/theme/spacing.ts` - 4px grid spacing scale and layout dimensions
- [ ] `src/theme/typography.ts` - Font families, sizes, weights, and predefined text styles
- [ ] Barrel export in `src/theme/index.ts`
- [ ] Theme values are type-safe constants

**Branch**: `feature/TICKET-003-theme-system`

---

## Epic: Navigation

### TICKET-004: Navigation Structure
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1 day

**Description**:
Set up React Navigation with type-safe bottom tabs and stack navigators.

**Acceptance Criteria**:
- [ ] Install @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/native-stack
- [ ] `src/navigation/types.ts` - Type definitions for all navigation params (ProductsStackParamList, CartStackParamList, RootTabParamList)
- [ ] `src/navigation/RootNavigator.tsx` - Bottom tab navigator with Products and Cart tabs
- [ ] ProductsStack with ProductList and ProductDetail screens
- [ ] CartStack with Cart screen
- [ ] Custom tab bar icons with cart badge
- [ ] Deep linking configuration
- [ ] Navigation is fully type-safe (no `any` types)

**Branch**: `feature/TICKET-004-navigation`

---

## Epic: Data Layer

### TICKET-005: API Layer & Caching
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1 day

**Description**:
Build the API layer with fetch utilities, retry logic, and AsyncStorage caching.

**Acceptance Criteria**:
- [ ] `src/api/config.ts` - API endpoints, timeouts, cache settings
- [ ] `src/utils/retry.ts` - fetchWithRetry with timeout and exponential backoff
- [ ] `src/utils/storage.ts` - Type-safe AsyncStorage wrapper
- [ ] `src/api/productApi.ts` - fetchProducts, readProductsCache, writeProductsCache, getErrorMessage
- [ ] NetworkError class for distinguishing timeout vs network errors
- [ ] Stale-while-revalidate caching pattern implemented
- [ ] Unit tests for retry utility

**Branch**: `feature/TICKET-005-api-layer`

---

### TICKET-006: Product Store
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1 day

**Description**:
Create Zustand store for product state management with caching integration.

**Acceptance Criteria**:
- [ ] `src/store/productStore.ts` with Zustand
- [ ] State: products[], fetchState (discriminated union), error, lastFetched, isHydrated
- [ ] Actions: hydrateFromCache(), fetchProducts()
- [ ] Selectors: getProductById()
- [ ] Request deduplication for concurrent fetches
- [ ] Proper loading vs refreshing state distinction
- [ ] Unit tests for store actions and selectors

**Branch**: `feature/TICKET-006-product-store`

---

### TICKET-007: Cart Store with Persistence
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1 day

**Description**:
Create Zustand store for cart management with AsyncStorage persistence.

**Acceptance Criteria**:
- [ ] `src/store/cartStore.ts` with Zustand persist middleware
- [ ] State: items[]
- [ ] Actions: addItem(), removeItem(), updateQuantity(), clearCart()
- [ ] Selectors: selectSubtotal(), selectTotalItems(), selectCartItemByVariant()
- [ ] Auto-remove items when quantity reaches 0
- [ ] Cart persists across app restarts
- [ ] Versioned migration support
- [ ] Unit tests for store actions and selectors

**Branch**: `feature/TICKET-007-cart-store`

---

## Epic: Shared Components

### TICKET-008: Network Status Hook & Banner
**Type**: Feature  
**Priority**: P1 - High  
**Estimated**: 0.5 days

**Description**:
Implement network connectivity detection and offline indicator.

**Acceptance Criteria**:
- [ ] Install @react-native-community/netinfo
- [ ] `src/hooks/useNetworkStatus.ts` - Hook returning isConnected, isInternetReachable
- [ ] `src/components/OfflineBanner.tsx` - Visual indicator when offline
- [ ] Banner appears/disappears based on network state
- [ ] Accessible announcement when connectivity changes

**Branch**: `feature/TICKET-008-network-status`

---

### TICKET-009: Shared UI Components - Part 1
**Type**: Feature  
**Priority**: P1 - High  
**Estimated**: 1 day

**Description**:
Build reusable UI components for loading, error, and empty states.

**Acceptance Criteria**:
- [ ] `src/components/LoadingSkeleton.tsx` - Grid of placeholder cards
- [ ] `src/components/EmptyState.tsx` - Icon, title, message, optional CTA button
- [ ] `src/components/ErrorState.tsx` - Error message with retry button
- [ ] `src/components/ErrorBoundary.tsx` - Top-level error boundary with fallback UI
- [ ] All components have accessibility labels
- [ ] Components are memoized where appropriate

**Branch**: `feature/TICKET-009-shared-components-1`

---

### TICKET-010: Shared UI Components - Part 2
**Type**: Feature  
**Priority**: P1 - High  
**Estimated**: 1 day

**Description**:
Build reusable UI components for product display and cart interactions.

**Acceptance Criteria**:
- [ ] `src/components/Badge.tsx` - Numeric badge for cart count
- [ ] `src/components/PriceDisplay.tsx` - Price with optional compare-at price (sale indicator)
- [ ] `src/components/QuantityStepper.tsx` - Increment/decrement with trash icon at qty=1
- [ ] `src/components/ImageCarousel.tsx` - Horizontal image pager with pagination dots
- [ ] All components have accessibility support
- [ ] Unit tests for QuantityStepper interactions

**Branch**: `feature/TICKET-010-shared-components-2`

---

### TICKET-011: Variant Selector Component
**Type**: Feature  
**Priority**: P1 - High  
**Estimated**: 1 day

**Description**:
Build the variant selection component with availability logic.

**Acceptance Criteria**:
- [ ] `src/utils/availability.ts` - findVariantByOptions, isVariantPurchasable, getOptionAvailability, getDefaultSelections
- [ ] `src/hooks/useVariantSelection.ts` - State machine for variant selection
- [ ] `src/components/VariantSelector.tsx` - Option pills with selected/unavailable states
- [ ] Cross-option availability checking (e.g., selecting Black shows which sizes are available)
- [ ] Accessibility: radio group semantics, unavailable state announced
- [ ] Unit tests for availability utilities and VariantSelector

**Branch**: `feature/TICKET-011-variant-selector`

---

## Epic: Screens

### TICKET-012: Product List Screen
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1.5 days

**Description**:
Build the main product catalog screen with grid layout and state handling.

**Acceptance Criteria**:
- [ ] `src/screens/ProductListScreen.tsx`
- [ ] 2-column FlatList grid with ProductCard items
- [ ] Pull-to-refresh functionality
- [ ] Loading skeleton on initial load
- [ ] Error state with retry button
- [ ] Empty state when no products
- [ ] Offline banner integration
- [ ] Navigation to ProductDetail on card press
- [ ] FlatList performance optimizations (keyExtractor, getItemLayout, windowSize)
- [ ] Accessibility: list semantics, card labels

**Branch**: `feature/TICKET-012-product-list-screen`

---

### TICKET-013: Product Detail Screen
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1.5 days

**Description**:
Build the product detail screen with variant selection and add-to-cart functionality.

**Acceptance Criteria**:
- [ ] `src/screens/ProductDetailScreen.tsx`
- [ ] Image carousel with pagination
- [ ] Product title, vendor, description
- [ ] Variant selector integration
- [ ] Price display with sale indicator
- [ ] "Add to Cart" button with state-dependent text ("Add to Cart" / "Added!" / "Unavailable")
- [ ] Button disabled when variant unavailable
- [ ] Cart quantity indicator if item already in cart
- [ ] Accessibility: all interactive elements labeled, price announced in natural language

**Branch**: `feature/TICKET-013-product-detail-screen`

---

### TICKET-014: Cart Screen
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 1.5 days

**Description**:
Build the cart screen with line items, quantity management, and summary.

**Acceptance Criteria**:
- [ ] `src/screens/CartScreen.tsx`
- [ ] FlatList of CartLineItem components
- [ ] Each line item shows: image, title, variant, price, quantity stepper
- [ ] Swipe-to-delete or remove button
- [ ] Cart summary: subtotal, total items count
- [ ] Empty cart state with "Browse Products" CTA
- [ ] Navigation to ProductDetail when tapping line item
- [ ] Accessibility: quantity changes announced, totals labeled

**Branch**: `feature/TICKET-014-cart-screen`

---

## Epic: Quality & Polish

### TICKET-015: Accessibility Audit & Improvements
**Type**: Enhancement  
**Priority**: P1 - High  
**Estimated**: 1 day

**Description**:
Comprehensive accessibility audit and improvements for VoiceOver/TalkBack.

**Acceptance Criteria**:
- [ ] All interactive elements have accessibilityRole
- [ ] All buttons/pressables have accessibilityLabel
- [ ] Form controls have accessibilityState (selected, disabled, checked)
- [ ] Price announcements in natural language ("28 dollars and 96 cents")
- [ ] Cart updates announced via AccessibilityInfo.announceForAccessibility
- [ ] Tab navigation works correctly with screen readers
- [ ] Manual testing with VoiceOver (iOS) and TalkBack (Android)

**Branch**: `feature/TICKET-015-accessibility`

---

### TICKET-016: Unit Tests
**Type**: Testing  
**Priority**: P1 - High  
**Estimated**: 1 day

**Description**:
Write unit tests for stores, utilities, and key components.

**Acceptance Criteria**:
- [ ] Jest and @testing-library/react-native configured
- [ ] cartStore tests: addItem, removeItem, updateQuantity, clearCart, selectors
- [ ] productStore tests: hydrateFromCache, fetchProducts, getProductById
- [ ] currency utility tests: parseMoney, formatPrice, formatPriceForVoiceOver, isOnSale
- [ ] availability utility tests: findVariantByOptions, getOptionAvailability, getDefaultSelections
- [ ] VariantSelector component tests: rendering, interactions
- [ ] All tests pass with `npm test`
- [ ] Coverage report generated

**Branch**: `feature/TICKET-016-unit-tests`

---

### TICKET-017: Documentation
**Type**: Documentation  
**Priority**: P2 - Medium  
**Estimated**: 0.5 days

**Description**:
Write project documentation including setup instructions and architecture overview.

**Acceptance Criteria**:
- [ ] README.md with:
  - Project overview and features
  - Architecture diagram
  - Project structure
  - Setup instructions (prerequisites, installation, running)
  - Testing instructions
  - Technical constraints met
  - Tradeoffs and limitations
- [ ] DECISION_LOG.md with key architectural decisions and rationale

**Branch**: `feature/TICKET-017-documentation`

---

## Epic: App Shell

### TICKET-018: App Entry Point & Error Boundary
**Type**: Feature  
**Priority**: P0 - Blocker  
**Estimated**: 0.5 days

**Description**:
Set up the app entry point with providers and error handling.

**Acceptance Criteria**:
- [ ] App.tsx configured with SafeAreaProvider
- [ ] ErrorBoundary wrapping the app
- [ ] RootNavigator as main content
- [ ] App launches without errors on iOS and Android

**Branch**: `feature/TICKET-018-app-shell`

---

## Summary

| Ticket | Title | Priority | Estimate | Dependencies |
|--------|-------|----------|----------|--------------|
| TICKET-001 | Project Initialization | P0 | 0.5d | - |
| TICKET-002 | Domain Types | P0 | 0.5d | TICKET-001 |
| TICKET-003 | Theme System | P0 | 0.5d | TICKET-001 |
| TICKET-004 | Navigation | P0 | 1d | TICKET-001, TICKET-002 |
| TICKET-005 | API Layer | P0 | 1d | TICKET-001, TICKET-002 |
| TICKET-006 | Product Store | P0 | 1d | TICKET-005 |
| TICKET-007 | Cart Store | P0 | 1d | TICKET-002 |
| TICKET-008 | Network Status | P1 | 0.5d | TICKET-001 |
| TICKET-009 | Shared Components 1 | P1 | 1d | TICKET-003 |
| TICKET-010 | Shared Components 2 | P1 | 1d | TICKET-003 |
| TICKET-011 | Variant Selector | P1 | 1d | TICKET-002, TICKET-003 |
| TICKET-012 | Product List Screen | P0 | 1.5d | TICKET-004, TICKET-006, TICKET-008, TICKET-009 |
| TICKET-013 | Product Detail Screen | P0 | 1.5d | TICKET-004, TICKET-006, TICKET-007, TICKET-010, TICKET-011 |
| TICKET-014 | Cart Screen | P0 | 1.5d | TICKET-004, TICKET-007, TICKET-010 |
| TICKET-015 | Accessibility | P1 | 1d | TICKET-012, TICKET-013, TICKET-014 |
| TICKET-016 | Unit Tests | P1 | 1d | TICKET-006, TICKET-007, TICKET-011 |
| TICKET-017 | Documentation | P2 | 0.5d | All |
| TICKET-018 | App Shell | P0 | 0.5d | TICKET-004, TICKET-009 |

**Total Estimated Effort**: ~16 days

---

## Suggested Implementation Order

### Phase 1: Foundation (Days 1-2)
1. TICKET-001: Project Initialization
2. TICKET-002: Domain Types
3. TICKET-003: Theme System

### Phase 2: Infrastructure (Days 3-5)
4. TICKET-004: Navigation
5. TICKET-005: API Layer
6. TICKET-006: Product Store
7. TICKET-007: Cart Store

### Phase 3: Components (Days 6-8)
8. TICKET-008: Network Status
9. TICKET-009: Shared Components 1
10. TICKET-010: Shared Components 2
11. TICKET-011: Variant Selector

### Phase 4: Screens (Days 9-12)
12. TICKET-018: App Shell
13. TICKET-012: Product List Screen
14. TICKET-013: Product Detail Screen
15. TICKET-014: Cart Screen

### Phase 5: Polish (Days 13-16)
16. TICKET-015: Accessibility
17. TICKET-016: Unit Tests
18. TICKET-017: Documentation
