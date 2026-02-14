# Decision Log

This document captures key architectural and implementation decisions made during development, including context, alternatives considered, and rationale.

---

## 1. State Management: Zustand over Redux/Context

**Date**: 2026-02-14  
**Status**: Accepted

### Context
The app requires predictable state management for products and cart with persistence capabilities.

### Options Considered
1. **Redux Toolkit** - Industry standard, excellent DevTools
2. **React Context + useReducer** - Built-in, no dependencies
3. **Zustand** - Minimal API, built-in persistence
4. **Jotai/Recoil** - Atomic state model

### Decision
Chose **Zustand** for the following reasons:

- **Minimal boilerplate**: No action creators, reducers, or providers needed
- **Built-in persist middleware**: First-class AsyncStorage integration
- **Excellent TypeScript support**: Full type inference
- **Testability**: Stores can be reset and tested in isolation
- **Small bundle size**: ~1KB gzipped

### Consequences
- Less ecosystem tooling compared to Redux
- Team members familiar with Redux may need adjustment
- Works well for this app's scale; might reconsider for larger apps

---

## 2. Navigation: React Navigation v7

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Need type-safe navigation between screens with bottom tabs and stack navigation.

### Decision
Used **React Navigation** with:
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
- Full compile-time type checking for navigation
- Autocomplete for route names and params
- Requires careful type setup for nested navigators

---

## 3. Image Loading: Native Image vs react-native-fast-image

**Date**: 2026-02-14  
**Status**: Accepted (with tradeoff)

### Context
Product images need efficient loading with caching for offline support.

### Issue Encountered
```
npm error code ERESOLVE
react-native-fast-image@8.6.3 requires react@"^17 || ^18"
Project uses react@19.2.3
```

### Decision
**Omit react-native-fast-image** and use native `Image` component as fallback.

### Rationale
1. React Native 0.84 ships with React 19
2. react-native-fast-image hasn't been updated for React 19 compatibility
3. Native `Image` component has improved significantly in recent RN versions
4. Blocking on this dependency would delay the entire project

### Mitigation
- Native `Image` provides basic caching via HTTP cache headers
- For production, consider:
  - Waiting for react-native-fast-image React 19 support
  - Using `expo-image` (if Expo becomes acceptable)
  - Implementing custom native image caching module

### Consequences
- Slightly less optimal image caching
- No progressive loading or priority queue
- Acceptable for assessment scope

---

## 4. Caching Strategy: Stale-While-Revalidate

**Date**: 2026-02-14  
**Status**: Accepted

### Context
App must work offline with most recently loaded catalog.

### Decision
Implemented **stale-while-revalidate** pattern:

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
- Instant UI with cached data
- Background refresh for freshness
- Graceful offline degradation

### Consequences
- Users may briefly see stale data
- Need to handle cache invalidation for significant changes

---

## 5. Cart Item Denormalization

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Cart items reference products that may change (price updates, availability).

### Decision
Store **denormalized snapshots** in cart:

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

### Rationale
- **Price consistency**: User sees price they agreed to
- **Offline resilience**: Cart works without product data
- **Audit trail**: Clear record of what was added

### Tradeoffs
- Cart items don't reflect product updates
- Slightly larger storage footprint
- Acceptable for e-commerce cart semantics

---

## 6. Variant Selection Algorithm

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Products have multiple option axes (Color, Size) with variant availability constraints.

### Decision
Implemented cross-option availability checking:

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
3. Check if any variant exists with:
   - That value selected
   - All other current selections
   - `availableForSale === true`

### Consequences
- O(options × values × variants) complexity
- Acceptable for typical product variant counts (<100)
- Could optimize with pre-computed availability matrix if needed

---

## 7. FetchState as Discriminated Union

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Need to represent loading states without impossible combinations.

### Decision
Used **discriminated union** instead of boolean flags:

```typescript
// Instead of:
interface State {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// Use:
type FetchState = 'idle' | 'loading' | 'refreshing' | 'success' | 'error';
```

### Benefits
- **Type safety**: Can't be loading AND error simultaneously
- **Exhaustive checks**: TypeScript ensures all states handled
- **Clear semantics**: `refreshing` vs `loading` distinction

---

## 8. Path Alias: @apptypes instead of @types

**Date**: 2026-02-14  
**Status**: Accepted

### Context
TypeScript path aliases for cleaner imports.

### Issue Encountered
```
TS6137: Cannot import type declaration files.
Consider importing 'product' instead of '@types/product'.
```

### Root Cause
`@types` conflicts with TypeScript's built-in type resolution for DefinitelyTyped packages.

### Decision
Renamed alias from `@types` to `@apptypes`:

```json
{
  "paths": {
    "@apptypes/*": ["src/types/*"]
  }
}
```

### Consequences
- Slightly less intuitive naming
- Avoids TypeScript resolution conflicts
- Consistent with avoiding reserved namespaces

---

## 9. Testing Strategy

**Date**: 2026-02-14  
**Status**: Accepted

### Context
Need testable code with reasonable coverage for assessment.

### Decision
Focus on **unit tests** for:
- Zustand stores (cartStore, productStore)
- Utility functions (currency, availability)
- Key components (VariantSelector)

### Tools
- Jest (built-in with React Native)
- @testing-library/react-native

### Not Included
- E2E tests (Detox) - requires additional setup
- Snapshot tests - brittle for rapid iteration
- Integration tests - covered by manual testing

### Coverage Achieved
- Stores: ~90%+ coverage
- Utilities: 100% coverage
- Components: Key interactions tested

---

## 10. Accessibility Implementation

**Date**: 2026-02-14  
**Status**: Accepted

### Context
App must support VoiceOver (iOS) and TalkBack (Android).

### Implementation
1. **Semantic roles**: `accessibilityRole` on interactive elements
2. **State announcements**: `accessibilityState` for selected/disabled
3. **Labels**: `accessibilityLabel` for non-text content
4. **Live announcements**: `AccessibilityInfo.announceForAccessibility`

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
