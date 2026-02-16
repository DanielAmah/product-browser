# Ticket Breakdown

**Project:** Reactiv-assessment
**Assignee:** Daniel Amah
**Tracker:** Linear (REA project)

Full ticket breakdown as tracked in Linear, exported here so reviewers without Linear access have visibility into scope, dependencies, and status.

---

## Phase 1 — Foundation

### REA-5: Project Initialization & Configuration
**P0 · Setup · 1pt · ✅ Done**
Branch: `dnlamah1/rea-5-ticket-001-project-initialization-configuration`

Init bare React Native CLI project with TypeScript template. Configure path aliases (`@api`, `@components`, `@hooks`, `@screens`, `@store`, `@theme`, `@apptypes`, `@utils`), ESLint, Prettier. Verify builds on iOS and Android sims.

- [x] RN CLI project (no Expo), strict TS
- [x] Path aliases in tsconfig + babel
- [x] ESLint + Prettier
- [x] Builds on both platforms
- [x] Git repo + .gitignore

---

### REA-6: Domain Type Definitions
**P0 · Feature · 1pt · ✅ Done**
Branch: `dnlamah1/rea-6-ticket-002-domain-type-definitions`
Depends on: REA-5

TypeScript interfaces for all domain entities based on the product feed JSON. `product.ts` (Money, ProductImage, MediaImage, SelectedOption, ProductOption, Variant, Product), `cart.ts` (CartItem, CartItemInput), `api.ts` (CacheEntry, FetchState, NetworkError).

- [x] All types defined and compiling
- [x] Barrel export

---

### REA-7: Theme System
**P0 · Feature · 1pt · ✅ Done**
Branch: `dnlamah1/rea-7-ticket-003-theme-system-setup`
Depends on: REA-5

Semantic color tokens, 4px spacing grid, typography scale (font families, sizes, weights, predefined text styles). All type-safe constants with barrel export.

---

## Phase 2 — Infrastructure

### REA-8: Navigation Structure
**P0 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-8-ticket-004-navigation-structure`
Depends on: REA-5, REA-6

React Navigation with type-safe bottom tabs (Products, Cart) and nested stacks. `native-stack` for native perf. Custom tab bar icons with cart badge count. Deep linking config. Full type safety — no `any` types.

- [x] Bottom tabs + nested stacks
- [x] Type-safe navigation params
- [x] Cart badge on tab icon
- [x] Deep linking
- [x] Composite screen props for nested navigators

---

### REA-9: API Layer & Caching
**P0 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-9-ticket-005-api-layer-caching`
Depends on: REA-5, REA-6

`fetchWithRetry` with timeout + exponential backoff, typed AsyncStorage wrapper, product API module with stale-while-revalidate caching. NetworkError class distinguishes timeout vs network failures.

- [x] Retry with configurable timeout/backoff
- [x] Typed storage wrapper
- [x] fetchProducts, readProductsCache, writeProductsCache
- [x] Unit tests for retry utility

---

### REA-10: Product Store
**P0 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-10-ticket-006-product-store`
Depends on: REA-9

Zustand store: products[], fetchState (discriminated union), error, lastFetched, isHydrated. Actions: hydrateFromCache(), fetchProducts(). Request deduplication. Loading vs refreshing distinction for stale-while-revalidate UX.

- [x] Store with all state + actions
- [x] Request dedup
- [x] Unit tests

---

### REA-11: Cart Store with Persistence
**P0 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-11-ticket-007-cart-store-with-persistence`
Depends on: REA-6

Zustand + persist middleware backed by AsyncStorage. items[] with addItem, removeItem, updateQuantity, clearCart. Derived selectors: subtotal, totalItems, cartItemByVariant. Auto-removes items when qty hits 0. Versioned migration support.

- [x] Persist middleware with partialize
- [x] All CRUD actions
- [x] Derived selectors
- [x] Unit tests

---

## Phase 3 — Components

### REA-12: Network Status Hook & Banner
**P1 · Feature · 1pt · ✅ Done**
Branch: `dnlamah1/rea-12-ticket-008-network-status-hook-banner`
Depends on: REA-5

`useNetworkStatus` hook wrapping NetInfo. `OfflineBanner` component that appears when offline. Accessible.

---

### REA-13: Shared UI Components — Part 1
**P1 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-13-ticket-009-shared-ui-components-part-1`
Depends on: REA-7

LoadingSkeleton (grid of placeholder cards), EmptyState (icon + title + message + optional CTA), ErrorState (message + retry), ErrorBoundary (top-level crash fallback with expandable details). All with a11y labels. Memoized where it matters.

---

### REA-14: Shared UI Components — Part 2
**P1 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-14-ticket-010-shared-ui-components-part-2`
Depends on: REA-7

Badge (numeric count, 99+ cap), PriceDisplay (current + compare-at with sale styling), QuantityStepper (inc/dec, trash icon at qty=1), ImageCarousel (horizontal pager with counter + thumbnail strip). All accessible.

---

### REA-15: Variant Selector
**P1 · Feature · 2pt · ✅ Done**
Branch: `dnlamah1/rea-15-ticket-011-variant-selector-component`
Depends on: REA-6, REA-7

Availability utilities (findVariantByOptions, getOptionAvailability, getDefaultSelections), `useVariantSelection` hook, `VariantSelector` component with radio-group pills. Cross-option availability checking — selecting Black shows which Sizes are still purchasable.

- [x] Availability utils + tests
- [x] Hook with full selection state machine
- [x] Pill UI with selected/unavailable states
- [x] a11y: radio group semantics

---

## Phase 4 — Screens

### REA-22: App Entry Point
**P0 · Feature · 1pt · ✅ Done**
Branch: `dnlamah1/rea-22-ticket-018-app-entry-point-error-boundary`
Depends on: REA-8, REA-13

App.tsx with SafeAreaProvider, ErrorBoundary, RootNavigator. Launches clean on both platforms.

---

### REA-16: Product List Screen
**P0 · Feature · 3pt · ✅ Done**
Branch: `dnlamah1/rea-16-ticket-012-product-list-screen`
Depends on: REA-8, REA-10, REA-12, REA-13

2-column FlashList grid with ProductCard tiles. Pull-to-refresh, skeleton on initial load, error state with retry, empty state, offline banner. Navigation to ProductDetail on card tap. Performance-tuned with keyExtractor and stable renderItem callbacks.

---

### REA-17: Product Detail Screen
**P0 · Feature · 3pt · ✅ Done**
Branch: `dnlamah1/rea-17-ticket-013-product-detail-screen`
Depends on: REA-8, REA-10, REA-11, REA-14, REA-15

Image carousel, product info (vendor, title, description, tags), variant selector, price with sale indicator, sticky "Add to Cart" button. Button state reflects selection state (add / unavailable / select options). Cart quantity shown if item already in cart. Full a11y — prices read in natural language.

---

### REA-18: Cart Screen
**P0 · Feature · 3pt · ✅ Done**
Branch: `dnlamah1/rea-18-ticket-014-cart-screen`
Depends on: REA-8, REA-11, REA-14

FlashList of CartLineItem rows (thumbnail, title, variant, price, quantity stepper). Sticky bottom summary with subtotal + checkout. Empty state with "Browse Products" CTA. Quantity changes announced to assistive tech.

---

## Phase 5 — Polish

### REA-19: Accessibility Audit
**P1 · Enhancement · 2pt · ✅ Done**
Branch: `dnlamah1/rea-19-ticket-015-accessibility-audit-improvements`
Depends on: REA-16, REA-17, REA-18

Comprehensive pass: accessibilityRole on all interactives, accessibilityState for selected/disabled, natural-language price announcements, cart mutation announcements, tab navigation verified with screen readers.

Tested with VoiceOver (iOS) and TalkBack (Android).

---

### REA-20: Unit Tests
**P1 · Testing · 2pt · ✅ Done**
Branch: `dnlamah1/rea-20-ticket-016-unit-tests`
Depends on: REA-10, REA-11, REA-15

Jest + @testing-library/react-native. Tests for both stores (actions, selectors, edge cases), all utility functions (currency, availability, retry, storage, image), key components (interactions, a11y labels, conditional rendering), hooks, and screens.

All tests pass via `npm test`.

---

### REA-21: Documentation
**P2 · Docs · 1pt · ✅ Done**
Branch: `dnlamah1/rea-21-ticket-017-documentation`
Depends on: everything

README with project overview, architecture diagram, setup instructions, testing instructions, constraints, tradeoffs. DECISION_LOG with architectural rationale.

---

## Post-MVP

### REA-23: Pull-to-Refresh on Product Catalog
**Medium · Enhancement · ✅ Done**
Branch: `dnlamah1/rea-23-implement-pull-to-refresh-on-product-catalog`

Pull-to-refresh gesture on the product list. Resets pagination to page 1 on refresh. Already wired via RefreshControl on FlashList + `useProducts.handleRefresh`. Would add a brief auto-dismiss toast for success/failure feedback as a follow-up.

---

### REA-24: Enhance OfflineBanner
**Medium · Enhancement · Backlog**
Branch: `dnlamah1/rea-24-enhance-offlinebanner-with-icon-animation-and-dismiss-action`

Current banner is a static orange bar. Improvements:
- WifiOff icon
- Slide-in/out animations on connectivity change
- Secondary "Showing cached data" text
- Dismiss button
- a11y announcements on connectivity change

---

### REA-25: Card Grid Spacing
**Medium · Enhancement · ✅ Done**
Branch: `dnlamah1/rea-25-add-spacing-between-product-cards-in-grid`

Product cards had no gaps. Added consistent row/column spacing, adjusted card width calc to account for gaps. No visual regression on badges or content.

---

### REA-26: Responsive Price Sizing
**Medium · Enhancement · ✅ Done**
Branch: `dnlamah1/rea-26-responsive-price-font-sizing-for-iphone-and-ipad`

Price text was too large on iPhone (crowded) and too small on iPad. Added responsive font sizing based on device form factor. Applied to both ProductCard and PriceDisplay.

---

## Summary

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| REA-5 | Project Init | P0 | Foundation | Done |
| REA-6 | Domain Types | P0 | Foundation | Done |
| REA-7 | Theme System | P0 | Foundation | Done |
| REA-8 | Navigation | P0 | Infrastructure | Done |
| REA-9 | API + Caching | P0 | Infrastructure | Done |
| REA-10 | Product Store | P0 | Infrastructure | Done |
| REA-11 | Cart Store | P0 | Infrastructure | Done |
| REA-12 | Network Status | P1 | Components | Done |
| REA-13 | Shared UI (Part 1) | P1 | Components | Done |
| REA-14 | Shared UI (Part 2) | P1 | Components | Done |
| REA-15 | Variant Selector | P1 | Components | Done |
| REA-22 | App Entry Point | P0 | Screens | Done |
| REA-16 | Product List Screen | P0 | Screens | Done |
| REA-17 | Product Detail Screen | P0 | Screens | Done |
| REA-18 | Cart Screen | P0 | Screens | Done |
| REA-19 | Accessibility Audit | P1 | Polish | Done |
| REA-20 | Unit Tests | P1 | Polish | Done |
| REA-21 | Documentation | P2 | Polish | Done |
| REA-23 | Pull-to-Refresh | Med | Post-MVP | Done |
| REA-24 | OfflineBanner Polish | Med | Post-MVP | Backlog |
| REA-25 | Card Grid Spacing | Med | Post-MVP | Done |
| REA-26 | Responsive Pricing | Med | Post-MVP | Done |

**Total**: 34 story points (MVP) · 21/22 tickets done · 1 backlogged

---

## Dependency Graph

```
Foundation
  REA-5 → REA-6 → REA-9 → REA-10
                 → REA-11
                 → REA-15
         → REA-7 → REA-13, REA-14
         → REA-12

Infrastructure
  REA-5, REA-6 → REA-8

Screens
  REA-8 + REA-13 → REA-22
  REA-8 + REA-10 + REA-12 + REA-13 → REA-16
  REA-8 + REA-10 + REA-11 + REA-14 + REA-15 → REA-17
  REA-8 + REA-11 + REA-14 → REA-18

Polish
  REA-16 + REA-17 + REA-18 → REA-19
  REA-10 + REA-11 + REA-15 → REA-20
  Everything → REA-21
```
