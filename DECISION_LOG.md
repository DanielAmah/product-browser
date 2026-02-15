# Decision Log

I'm documenting the key architectural and implementation decisions I made during development, including the context, alternatives I considered, and my rationale.

---

## 1. State Management: Zustand over Redux/Context

**Date**: 2026-02-14  
**Status**: Accepted

### Context
I needed predictable state management for products and cart with persistence capabilities.

### Options I Considered
1. **Redux Toolkit** - Industry standard, excellent DevTools
2. **React Context + useReducer** - Built-in, no dependencies
3. **Zustand** - Minimal API, built-in persistence
4. **Jotai/Recoil** - Atomic state model

### Decision
I chose **Zustand** for the following reasons:

- **Minimal boilerplate**: I didn't need action creators, reducers, or providers
- **Built-in persist middleware**: First-class AsyncStorage integration out of the box
- **Excellent TypeScript support**: Full type inference without extra wiring
- **Testability**: I can reset stores and test them in isolation
- **Small bundle size**: ~1KB gzipped — keeps the app lean

### Consequences
- Less ecosystem tooling compared to Redux
- Team members familiar with Redux may need a bit of adjustment
- Works well for this app's scale; I'd reconsider for a significantly larger app

---

## 2. Navigation: React Navigation v7

**Date**: 2026-02-14  
**Status**: Accepted

### Context
I needed type-safe navigation between screens with bottom tabs and stack navigation.

### Decision
I went with **React Navigation** using:
- `@react-navigation/native` - Core navigation
- `@react-navigation/bottom-tabs` - Tab navigator
- `@react-navigation/native-stack` - Native stack for performance

### Type Safety Implementation
```typescript
// Centralized param list types
export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: {productId: string};
};

// Composite screen props for nested navigators
export type ProductDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;
```

### Consequences
- I get full compile-time type checking for navigation
- Autocomplete for route names and params
- It does require careful type setup for nested navigators, but the safety is worth it

---

## 3. Image Loading: Native Image vs react-native-fast-image

**Date**: 2026-02-14  
**Status**: Accepted (with tradeoff)

### Context
I needed efficient image loading with caching for offline support.

### Issue I Encountered
```
npm error code ERESOLVE
react-native-fast-image@8.6.3 requires react@"^17 || ^18"
Project uses react@19.2.3
```

### Decision
I decided to **omit react-native-fast-image** and use the native `Image` component instead.

### My Rationale
1. React Native 0.84 ships with React 19
2. react-native-fast-image hasn't been updated for React 19 compatibility
3. The native `Image` component has improved significantly in recent RN versions
4. Blocking on this dependency would have delayed the entire project

### Mitigation
- Native `Image` provides basic caching via HTTP cache headers
- For production, I'd consider:
  - Waiting for react-native-fast-image React 19 support
  - Using `expo-image` (if Expo becomes acceptable)
  - Implementing a custom native image caching module

### Consequences
- Slightly less optimal image caching
- No progressive loading or priority queue
- Acceptable for this assessment's scope

---

## 4. Caching Strategy: Stale-While-Revalidate

**Date**: 2026-02-14  
**Status**: Accepted

### Context
The app must work offline with the most recently loaded catalog.

### Decision
I implemented a **stale-while-revalidate** pattern:

```typescript
// 1. Show cached data immediately
const cached = await readProductsCache();
if (cached) {
  set({products: cached.data, fetchState: 'success'});
}

// 2. Fetch fresh data in background
const fresh = await fetchProducts();
set({products: fresh, fetchState: 'success'});
writeProductsCache(fresh);
```

### Benefits
- Instant UI with cached data — the user never stares at a blank screen
- Background refresh keeps things fresh
- Graceful offline degradation

### Consequences
- Users may briefly see stale data
- I'd need to handle cache invalidation for significant catalog changes

---

## 5. Cart Item Denormalization

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Cart items reference products that may change (price updates, availability).

### Decision
I chose to store **denormalized snapshots** in the cart:

```typescript
interface CartItem {
  variantId: string;
  productId: string;
  title: string;           // Snapshot at add time
  variantTitle: string;    // Snapshot at add time
  price: Money;            // Snapshot at add time
  quantity: number;
  image: MediaImage | null;
}
```

### My Rationale
- **Price consistency**: The user sees the price they agreed to when they added the item
- **Offline resilience**: The cart works without needing the product data available
- **Audit trail**: Clear record of what was added and at what price

### Tradeoffs
- Cart items won't reflect subsequent product updates
- Slightly larger storage footprint
- I consider this acceptable for standard e-commerce cart semantics

---

## 6. Variant Selection Algorithm

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Products have multiple option axes (Color, Size) with variant availability constraints.

### Decision
I implemented cross-option availability checking:

```typescript
// For each option, check what values are available given other selections
function getOptionAvailability(
  variants: Variant[],
  options: ProductOption[],
  selectedOptions: Record<string, string>
): Record<string, Record<string, boolean>>
```

### Algorithm
1. For each option axis (e.g., Size)
2. For each value in that axis (e.g., S, M, L)
3. I check if any variant exists with:
   - That value selected
   - All other current selections
   - `availableForSale === true`

### Consequences
- O(options × values × variants) complexity
- Perfectly acceptable for typical product variant counts (<100)
- I could optimize with a pre-computed availability matrix if needed down the road

---

## 7. FetchState as Discriminated Union

**Date**: 2026-02-14  
**Status**: Accepted

### Context
I needed to represent loading states without allowing impossible combinations.

### Decision
I used a **discriminated union** instead of boolean flags:

```typescript
// Instead of:
interface State {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// I use:
type FetchState = 'idle' | 'loading' | 'refreshing' | 'success' | 'error';
```

### Benefits
- **Type safety**: Can't be loading AND error simultaneously
- **Exhaustive checks**: TypeScript ensures I handle all states
- **Clear semantics**: The `refreshing` vs `loading` distinction lets me show cached data during a background refresh

---

## 8. Path Alias: @apptypes instead of @types

**Date**: 2026-02-14  
**Status**: Accepted

### Context
I wanted TypeScript path aliases for cleaner imports.

### Issue I Encountered
```
TS6137: Cannot import type declaration files.
Consider importing 'product' instead of '@types/product'.
```

### Root Cause
`@types` conflicts with TypeScript's built-in type resolution for DefinitelyTyped packages.

### Decision
I renamed the alias from `@types` to `@apptypes`:

```json
{
  "paths": {
    "@apptypes/*": ["src/types/*"]
  }
}
```

### Consequences
- Slightly less intuitive naming
- Avoids the TypeScript resolution conflict entirely
- Consistent with the principle of avoiding reserved namespaces

---

## 9. Testing Strategy

**Date**: 2026-02-14  
**Status**: Accepted

### Context
I needed testable code with reasonable coverage for the assessment.

### Decision
I focused on **unit tests** for:
- Zustand stores (cartStore, productStore)
- Utility functions (currency, availability)
- Key components (VariantSelector)

### Tools
- Jest (built-in with React Native)
- @testing-library/react-native

### What I Didn't Include
- E2E tests (Detox) — requires additional setup beyond the assessment scope
- Snapshot tests — I find them brittle for rapid iteration
- Integration tests — covered by manual testing for now

### Coverage Achieved
- Stores: ~90%+ coverage
- Utilities: 100% coverage
- Components: Key interactions tested

---

## 10. Accessibility Implementation

**Date**: 2026-02-14  
**Status**: Accepted

### Context
The app must support VoiceOver (iOS) and TalkBack (Android).

### My Implementation
1. **Semantic roles**: I set `accessibilityRole` on all interactive elements
2. **State announcements**: `accessibilityState` for selected/disabled states
3. **Labels**: `accessibilityLabel` for non-text content like images and icons
4. **Live announcements**: `AccessibilityInfo.announceForAccessibility` for cart updates

### Example
```tsx
<Pressable
  accessibilityRole="radio"
  accessibilityState={{
    selected: isSelected,
    disabled: !isAvailable,
  }}
  accessibilityLabel={`${value}${!isAvailable ? ', unavailable' : ''}`}
>
```

### Consequences
- Fully navigable with screen readers
- Price announcements in natural language ("28 dollars and 96 cents")
- Cart updates announced to assistive technology

---

## 11. List Performance: FlashList over FlatList

**Date**: 2026-02-15  
**Status**: Accepted

### Context
The product grid and cart list need smooth scrolling, especially as the catalog grows.

### Options I Considered
1. **FlatList** - Built-in React Native list, cell-based virtualisation
2. **@shopify/flash-list** - RecyclerView-backed list with cell recycling

### Decision
I migrated both `ProductListScreen` and `CartScreen` from `FlatList` to **@shopify/flash-list v2**.

### My Rationale
- **Cell recycling**: FlashList reuses native views instead of creating/destroying them, reducing JS ↔ native bridge traffic
- **Faster mount times**: Shopify's benchmarks show up to 5× improvement for large lists
- **Drop-in API**: Props are nearly identical to FlatList, so the migration effort was minimal
- **v2 simplifications**: `estimatedItemSize` was removed; the new architecture handles layout measurement automatically

### Migration Notes
- `columnWrapperStyle` isn't supported in FlashList; I handle column gap via card-level margins instead
- `contentContainerStyle` accepts a plain object (not a `StyleSheet` reference)
- `removeClippedSubviews`, `maxToRenderPerBatch`, and `windowSize` are no longer needed — FlashList manages draw distance via its own `drawDistance` prop

### Consequences
- Requires a native rebuild after install (`pod install`)
- Slightly different scroll-physics tuning than FlatList
- Gives me significant performance headroom for larger catalogs

---

## 12. Screen Refactoring: Component Extraction & Custom Hooks

**Date**: 2026-02-15  
**Status**: Accepted

### Context
My three main screens (`ProductListScreen`, `CartScreen`, `ProductDetailScreen`) were 350–385 lines each, mixing data fetching, business logic, UI rendering, and styles in a single file. I wanted to break them down for clarity and testability.

### Decision
I applied a **screen-as-orchestrator** pattern:

| Layer | Responsibility | Examples |
|-------|---------------|----------|
| **Hooks** | Data fetching, state, actions | `useProducts`, `useCart`, `useAddToCart` |
| **Components** | Pure UI with props | `ProductCard`, `CartLineItem`, `CartSummary`, `ProductInfo`, `AddToCartButton` |
| **Screens** | Compose hooks + components, handle navigation | `ProductListScreen` (163 lines), `CartScreen` (98 lines) |

### Hooks I Extracted
- `useProducts` — hydration, fetch, client-side pagination, refresh
- `useCart` — cart selectors, actions, formatted totals
- `useAddToCart` — add-to-cart logic, button state, accessibility labels

### Components I Extracted
- `ProductCard` — grid tile with image, vendor, title, price, sale badge
- `CartLineItem` — cart row with thumbnail, quantity stepper, line total
- `CartSummary` — sticky bottom panel with subtotal, total, checkout button
- `ProductInfo` — vendor, title, price, variants, description, tags
- `AddToCartButton` — sticky bottom CTA with icon and disabled states

### My Rationale
- **Single Responsibility**: Each file has one reason to change
- **Testability**: I can test hooks without rendering and components with shallow props
- **Reusability**: `AddToCartButton` and `CartSummary` are ready to reuse across future screens
- **Readability**: Screens now read as a clean, declarative composition

### Consequences
- More files to navigate (I mitigated this with barrel exports)
- Some prop-drilling in a few places (acceptable given the app's scale)
- Screens dropped from ~370 lines to ~100–160 lines each

---

## 13. Shopify CDN Image URL Transformation

**Date**: 2026-02-15  
**Status**: Accepted

### Context
I discovered that product images from the API embed a `_1180x400` Shopify CDN resize parameter in the filename. This caused images to be served as landscape crops (2.95:1 ratio), cutting off the top and bottom of product photos when displayed in my square containers.

### Decision
I created a shared `getSquareImageUrl` utility that replaces the `_WIDTHxHEIGHT` portion of Shopify CDN URLs with a square dimension:

```typescript
// src/utils/image.ts
export function getSquareImageUrl(url: string, size = 600): string {
  return url.replace(/_\d+x\d+(?=\.\w+(\?|$))/, `_${size}x${size}`);
}
```

### How I Use It
- **Grid thumbnails**: `getSquareImageUrl(url)` → `_600x600` (smaller, faster loads)
- **Detail carousel**: `getSquareImageUrl(url, 1200)` → `_1200x1200` (high-res)

### My Rationale
- The original source images are actually square (2048×2048 / 5000×5000) per the `media` metadata
- I confirmed the Shopify CDN accepts modified size parameters via an `HTTP 200` response
- A shared utility avoids duplicating the regex in `ProductCard` and `ImageCarousel`

### Consequences
- Relies on Shopify CDN honouring the resize parameter (I confirmed it works)
- If the URL format changes, I only need to update one utility
- Smaller square crops reduce bandwidth compared to the original landscape images

---

## 14. Client-Side Pagination Strategy

**Date**: 2026-02-15  
**Status**: Accepted

### Context
The product API returns all items in a single JSON array (static gist). I wanted the architecture to support pagination for when the catalog grows or a paginated API is introduced.

### Decision
I implemented **client-side pagination** in my `useProducts` hook:

```typescript
const PAGE_SIZE = 10;
const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

const displayedProducts = useMemo(
  () => products.slice(0, displayCount),
  [products, displayCount],
);
```

### Behaviour
- First render shows up to `PAGE_SIZE` products
- `onEndReached` reveals the next page with a 300ms simulated delay (footer spinner)
- Pull-to-refresh resets to page 1
- Pagination counter resets when the product array changes (fresh fetch)

### My Rationale
- **Future-proof**: Swapping to a server-side paginated API only requires changing the hook internals; the screen and component interfaces stay the same
- **UX consistency**: Users experience the same infinite-scroll pattern regardless of backend
- **Performance**: Even with a full local array, rendering only a page at a time keeps initial mount fast

### Tradeoffs
- The 300ms delay is artificial for a local array, but it provides visual feedback that feels intentional
- With only 4 products in the current feed, pagination is invisible — but the infrastructure is ready for when it matters

---

## 15. How I Used AI

**Date**: 2026-02-14 — 2026-02-15  
**Status**: Documented

### My Approach
I used AI as a pair-programming partner throughout this project — not as a code generator I blindly accepted. Every suggestion was reviewed, tested, and often modified before merging.

### Where AI Helped Most
1. **Scaffolding boilerplate**: Initial store shapes, navigation type definitions, and test fixtures. These are high-effort, low-creativity tasks where AI saves real time.
2. **Debugging iOS build issues**: The `NetworkExtension` linker error and Podfile `post_install` hook — AI helped identify the missing framework and draft the Ruby script to fix corrupted `OTHER_LDFLAGS`.
3. **API response diagnosis**: When the product list returned empty, AI quickly identified that the JSON feed was a top-level array rather than the expected `{ products: [] }` wrapper.
4. **Shopify CDN URL analysis**: AI spotted the `_1180x400` resize parameter in image URLs and proposed the `getSquareImageUrl` regex utility.
5. **Refactoring patterns**: AI suggested the "screen-as-orchestrator" extraction pattern (hooks for logic, components for UI, screens for composition).

### What I Changed or Rejected
- **AI suggested Redux Toolkit** initially — I rejected this in favour of Zustand given the app's scale and the persistence story.
- **AI generated snapshot tests** — I removed them because they're brittle during rapid iteration and don't add meaningful confidence for this scope.
- **AI proposed `react-native-fast-image`** — I rejected it due to a React 19 peer dependency conflict and documented the tradeoff (Decision #3).
- **AI suggested server-side pagination** — I opted for client-side pagination since the API is a static gist, but I structured the hook so swapping to server-side is a one-file change.
- **AI initially used `@types` as a path alias** — I caught the DefinitelyTyped conflict and renamed it to `@apptypes` (Decision #8).
- **AI-generated component code was often too verbose** — I trimmed styles, consolidated similar components, and removed unnecessary abstractions to keep the codebase lean.

### My Rule
I never committed AI output without understanding it. If I couldn't explain a line during a review, I rewrote it.

---

## 16. What I Would Improve with More Time

**Date**: 2026-02-15  
**Status**: Documented

### Performance
- **Image caching**: Integrate a proper image caching library (e.g., `expo-image` or a custom native module) once React 19 compatibility stabilises. The native `Image` component works but lacks progressive loading, priority queues, and disk-level cache control.
- **Skeleton animations**: Add pulsing/shimmer animation to `LoadingSkeleton` for a more polished loading experience.
- **List item recycling tuning**: Profile FlashList's `drawDistance` and layout metrics with a larger dataset (100+ products) to fine-tune scroll performance.

### Testing
- **E2E tests with Detox**: Cover critical user flows (browse → detail → add to cart → view cart) end-to-end.
- **Hook tests**: Unit test `useProducts`, `useCart`, and `useAddToCart` with `renderHook` from `@testing-library/react-hooks`.
- **Integration tests**: Test navigation flows between screens with a mock navigation container.
- **Accessibility audits**: Automated a11y testing with `jest-axe` or manual screen reader regression tests.

### UX Polish
- **Animated transitions**: Add shared-element transitions between the product grid and detail screen for visual continuity.
- **Haptic feedback**: Trigger subtle haptics on add-to-cart and quantity changes using `react-native-haptic-feedback`.
- **Cart badge animation**: Animate the tab bar badge count when items are added.
- **Pull-to-refresh feedback**: Add a success/failure toast after a pull-to-refresh completes.
- **Dark mode**: The theme layer is structured for it — I'd add a dark colour palette and respect `useColorScheme`.

### Architecture
- **Server-side pagination**: Replace client-side slicing with cursor-based pagination once the API supports it — the `useProducts` hook is already structured for this swap.
- **Price reconciliation**: On app launch, compare persisted cart prices against current catalog prices and surface a "price changed" warning to the user.
- **Multi-currency support**: Replace the hardcoded `CAD` formatter with locale-aware currency detection.
- **Error reporting**: Integrate Sentry for crash and performance monitoring in production.
- **State persistence versioning**: Expand the migration system in `cartStore.ts` to handle more complex schema evolutions as the cart data model grows.
