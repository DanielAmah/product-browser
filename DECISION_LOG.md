# Decision Log

Key architectural and implementation decisions I made during the build, with context and rationale.

---

## 1. Zustand over Redux / Context

I needed state management for products and cart, with persistence. Considered Redux Toolkit (great DevTools, but way too much ceremony for an app this size), plain Context + useReducer (no persistence story), and Zustand.

Went with **Zustand**:
- Tiny API surface — no action creators, no providers, no reducers
- Built-in `persist` middleware that wraps AsyncStorage out of the box
- Full TypeScript inference without extra type plumbing
- Dead simple to test — `create()` a fresh store per test
- ~1KB gzipped

**Tradeoffs:** less ecosystem tooling than Redux, and anyone used to Redux patterns will need to adjust. Fine at this scale; I'd revisit for a much larger app.

---

## 2. React Navigation v7

Went with `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack`. The native-stack variant gives us native UINavigationController on iOS for better perf.

Type safety was the main focus. Centralized all param lists in `navigation/types.ts` with `CompositeScreenProps` for screens that need both stack and tab navigation. Every `navigation.navigate()` call is compile-time checked.

The type setup for nested navigators is verbose, but catching route bugs at compile time is worth it.

---

## 3. Native Image instead of react-native-fast-image

Ran into a peer dependency wall:

```
npm error code ERESOLVE
react-native-fast-image@8.6.3 requires react@"^17 || ^18"
```

RN 0.84 ships React 19 and fast-image hasn't caught up. Decided to move forward with the native `Image` component rather than block on it. Recent RN versions have improved `Image` significantly, and HTTP cache headers give us basic caching.

For production, I'd watch for fast-image React 19 support, or look at `expo-image` if Expo becomes acceptable. Could also write a thin native module for disk caching if needed.

---

## 4. Stale-While-Revalidate caching

The app needs to work offline with whatever we last loaded. I went with stale-while-revalidate:

1. On launch, hydrate from AsyncStorage immediately — user sees cached products instantly
2. Fire off a network fetch in the background
3. If fetch succeeds, swap in fresh data and update the cache
4. If fetch fails and we have cached data, just keep showing it

This means users might briefly see stale prices, but they never stare at a blank screen. For a real product catalog I'd add cache invalidation on significant changes, but this is fine for the assessment scope.

---

## 5. Denormalized cart items

Cart items store a snapshot of price, title, variant info, and image at the time of add. They don't reference the product store.

Why:
- **Price consistency** — user sees the price they agreed to, not one that silently changed
- **Offline resilience** — cart works without needing products loaded
- **Audit trail** — clear record of what was added and at what price

The downside is cart items won't reflect subsequent product updates (e.g. if a price drops). In production I'd reconcile on checkout, but for cart-display purposes this is standard e-commerce semantics.

---

## 6. Variant selection algorithm

Products have multiple option axes (Color, Size). When a user picks Black, I need to show which Sizes are still available in Black.

```typescript
function getOptionAvailability(
  variants: Variant[],
  options: ProductOption[],
  selectedOptions: Record<string, string>
): Record<string, Record<string, boolean>>
```

For each option axis, for each value, check if any variant exists with that value + the other current selections + `availableForSale === true`. O(options × values × variants) — perfectly fine for typical product variant counts. Could pre-compute an availability matrix if this ever needs to handle hundreds of variants.

---

## 7. FetchState discriminated union

Instead of the classic `{ isLoading, isError, isSuccess }` boolean soup (which allows impossible states like `isLoading && isError`), I used a string union:

```typescript
type FetchState = 'idle' | 'loading' | 'refreshing' | 'success' | 'error';
```

The `refreshing` vs `loading` distinction is the key win — it lets me show cached data with a background spinner vs. a full-screen skeleton. TypeScript enforces exhaustive handling.

---

## 8. @apptypes alias (not @types)

Tried `@types/*` as a path alias for `src/types/*` and immediately hit:

```
TS6137: Cannot import type declaration files.
```

`@types` collides with TypeScript's built-in DefinitelyTyped resolution. Renamed to `@apptypes` — slightly less obvious, but avoids the namespace collision entirely.

---

## 9. Testing strategy

Focused on unit tests for the areas with the most logic density:
- Zustand stores (cart + product) — state transitions, selectors, edge cases
- Utility functions (currency, availability, retry) — pure functions, easy to cover exhaustively
- Key components — interactions, a11y labels, conditional rendering

Skipped snapshot tests (brittle during rapid iteration), E2E (Detox setup was out of scope), and integration tests (covered by manual testing for now).

Tools: Jest + @testing-library/react-native. Coverage: stores and utils at 90%+, components tested for key interactions.

---

## 10. Accessibility approach

All interactive elements get `accessibilityRole`. All buttons and pressables get `accessibilityLabel`. Form controls (variant pills) use `accessibilityState` for selected/disabled. Prices read as natural language ("28 dollars and 96 cents Canadian") via a dedicated `formatPriceForVoiceOver` function. Cart mutations trigger `AccessibilityInfo.announceForAccessibility`.

Tested with VoiceOver on iOS and TalkBack on Android.

---

## 11. FlashList over FlatList

Migrated both `ProductListScreen` and `CartScreen` to `@shopify/flash-list` v2.

FlashList reuses native views via cell recycling instead of creating/destroying them, cutting JS-to-native bridge traffic. Shopify benchmarks show up to 5x improvement for large lists. The API is nearly identical to FlatList, so migration was minimal.

Migration notes:
- `columnWrapperStyle` isn't supported — I handle column gap via card-level margins
- `contentContainerStyle` takes a plain object, not a StyleSheet ref
- `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize` — all gone, FlashList manages draw distance internally

Requires a native rebuild after install. Gives me real performance headroom when the catalog grows.

---

## 12. Screen-as-orchestrator refactoring

My three main screens were 350-380 lines each, mixing data fetching, business logic, and UI. Broke them down:

| Layer | Responsibility | Examples |
|-------|---------------|----------|
| **Hooks** | Data, state, actions | `useProducts`, `useCart`, `useAddToCart` |
| **Components** | Pure UI with props | `ProductCard`, `CartLineItem`, `CartSummary` |
| **Screens** | Compose hooks + components, handle navigation | `ProductListScreen` (~160 lines) |

Screens dropped from ~370 to ~100-160 lines. Hooks are testable without rendering. Components are testable with shallow props. More files to navigate, but barrel exports keep imports clean.

---

## 13. Shopify CDN image URL transformation

Product images from the API embed `_1180x400` in the filename — a Shopify CDN resize parameter that serves landscape crops. Product photos are actually square (confirmed in `media` metadata: 2048×2048 / 5000×5000).

Built `getSquareImageUrl` to replace the dimension:

```typescript
export function getSquareImageUrl(url: string, size = 600): string {
  return url.replace(/_\d+x\d+(?=\.\w+(\?|$))/, `_${size}x${size}`);
}
```

Grid thumbnails get `_600x600` (smaller payloads), detail carousel gets `_1200x1200`. Confirmed the Shopify CDN honours modified parameters via 200 response. Single utility, one place to update if the URL format ever changes.

---

## 14. Client-side pagination

The API returns everything in one array (static gist). I implemented client-side pagination in `useProducts` anyway:

```typescript
const PAGE_SIZE = 10;
const displayedProducts = products.slice(0, displayCount);
```

`onEndReached` reveals the next page with a 300ms simulated delay. Pull-to-refresh resets to page 1.

The 300ms delay is artificial with a local array, but it means swapping to a server-side paginated API later only requires changing the hook internals — the screen interface stays the same. With 4 products in the current feed, pagination is invisible, but the infrastructure is ready.

---

## 15. How I used AI

I used AI as a pair-programming tool throughout development. Not a code generator I accepted blindly — every suggestion was reviewed, tested, and often rewritten.

**Where it saved time:**
- Scaffolding repetitive boilerplate (store shapes, nav type definitions, test fixtures)
- Debugging the iOS `NetworkExtension` linker error and the Podfile `post_install` hook
- Spotting that the JSON feed was a top-level array instead of `{ products: [] }`
- Identifying the `_1180x400` Shopify CDN resize parameter

**What I changed or rejected:**
- AI suggested Redux Toolkit — rejected it for Zustand given the app's scale
- AI generated snapshot tests — removed them (brittle, low value during rapid iteration)
- AI proposed react-native-fast-image — rejected due to React 19 peer dep conflict (see #3)
- AI used `@types` as a path alias — caught the DefinitelyTyped collision, renamed to `@apptypes`
- AI-generated component code was often too verbose — trimmed and consolidated

Rule: I never committed output I couldn't explain in a code review.

---

## 16. What I'd improve with more time

**Performance** — Proper image caching (expo-image or native module) once React 19 compat stabilises. Profile FlashList draw distance with a larger dataset (100+ products). Add shimmer animation to LoadingSkeleton.

**Testing** — E2E with Detox for critical flows (browse → detail → add → cart). Hook tests with renderHook. Automated a11y audits with jest-axe.

**UX** — Shared-element transitions between grid and detail screen. Haptic feedback on cart actions. Animated cart badge. Dark mode (theme layer is already structured for it). Toast after pull-to-refresh.

**Architecture** — Server-side cursor pagination when the API supports it (useProducts is structured for the swap). Price reconciliation on checkout. Multi-currency support. Sentry integration. Expanded persist migration system for schema evolution.
