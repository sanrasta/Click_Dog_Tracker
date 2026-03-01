---
project_name: 'click_dog_track'
user_name: 'tiago'
date: '2026-02-27'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules']
existing_patterns_found: 12
status: 'in_progress'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **React Native** 0.81.5 — New Architecture enabled (`newArchEnabled: true`)
- **Expo SDK** ~54.0.33 — Managed workflow (no `/ios` or `/android` directories)
- **React** 19.1.0
- **TypeScript** ~5.9.2 — `strict: true` via `expo/tsconfig.base`
- **React Navigation** v7 — native-stack + bottom-tabs
- **TanStack React Query** ^5.90.21 — server state management
- **Firebase** ^12.9.0 — modular SDK (v9+ imports), Auth + Firestore + Storage
- **Reanimated** ~4.1.1 | **Gesture Handler** ~2.28.0
- **Expo Image** ~3.0.11 | **Expo Haptics** ~15.0.8 | **Expo Image Picker** ~17.0.10
- **n8n** — external webhook for sticker engine (remove.bg background removal)

> **Version constraint:** Expo SDK 54 pins React Native and companion library versions. Always check Expo compatibility before upgrading any dependency.

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict mode is mandatory** — `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`. Never use `any` without justification.
- **Type-only imports** — Use `import type { Foo }` when importing types that are erased at runtime (e.g., navigation param lists, interfaces).
- **Service namespace imports** — Import service modules as namespaces: `import * as dogService from '../services/dogService'`. Do NOT destructure service imports.
- **Default exports for components** — Screens and components use `export default`. Services, utilities, types, and constants use named exports.
- **External imports first** — Order: (1) React/React Native, (2) Expo packages, (3) third-party libs, (4) internal imports via relative paths.
- **No absolute/alias imports** — All internal imports use relative paths (`../`, `./`). No path aliases configured.
- **Firebase Timestamp type** — Always import `Timestamp` from `firebase/firestore` for date fields. Never use raw `Date` objects in Firestore documents.
- **Functional state updates** — When new state depends on previous state, always use the callback form: `setState(prev => ...)` instead of `setState(newValue)`.

### Framework-Specific Rules

#### React Native / Expo
- **Functional components only** — No class components. All components are functions using hooks.
- **`expo-image` over `<Image>`** — Use `import { Image } from 'expo-image'` for all image rendering, not React Native's built-in `Image`.
- **Haptic feedback** — Use `expo-haptics` (`Haptics.impactAsync()`) for tactile feedback on interactive elements like activity buttons.
- **StyleSheet at bottom** — Define `const styles = StyleSheet.create({...})` at the end of each component file, never inline objects.
- **Theme-aware styling** — Access colors via `const { colors } = useTheme()`. Apply dynamic styles as array: `style={[styles.container, { backgroundColor: colors.background }]}`.
- **No native directories** — This is Expo managed workflow. Never create `/ios` or `/android` folders. All native config goes through `app.json`.

#### React Query (TanStack Query v5)
- **Query key factories** — Define key factories per domain as objects: `export const dogKeys = { all: (userId) => ['dogs', userId] as const, active: (userId) => ['dogs', userId, 'active'] as const }`.
- **Custom hooks wrap queries** — Every query/mutation lives in a `useXxxQueries.ts` file under `src/queries/`. Components never call `useQuery`/`useMutation` directly.
- **Cache invalidation on mutation success** — All `useMutation` hooks must invalidate related query keys in `onSuccess`.
- **`enabled` guard** — Queries depending on auth must include `enabled: !!user` to prevent firing before authentication.
- **DEV_MODE branching** — Query hooks check `DEV_MODE` and return mock data in dev, real service calls in production. Maintain this pattern for all new queries.

#### Firebase (Modular SDK v9+)
- **Modular imports only** — Always use `import { getDoc, setDoc } from 'firebase/firestore'`. Never use the compat/namespaced API (`firebase.firestore()`).
- **Firestore subcollection structure** — Data lives under: `users/{userId}/dogs/{dogId}` and `users/{userId}/dogs/{dogId}/logs/{logId}`. Always scope queries to the authenticated user.
- **Collection helper functions** — Each service defines ref helpers (e.g., `getUserDogsRef(userId)`) at the top. Reuse these instead of repeating `collection(db, ...)` calls.
- **`serverTimestamp()` for creation** — Use `serverTimestamp()` when writing `createdAt` to Firestore. Use `Timestamp.now()` only in dev mode mock data.
- **Storage path convention** — Files stored at `users/{userId}/dogs/{dogId}/{filename}`. Match this pattern for any new storage uploads.
- **Services are pure functions** — Service files export async functions only. No state, no hooks, no side effects beyond the Firebase operation.

#### Context Pattern
- **`createContext` + Provider + `useHook`** — Each context follows: (1) `createContext<T | undefined>(undefined)`, (2) `XxxProvider` component, (3) `useXxx()` hook that throws if used outside provider.
- **Memoize context values** — Always wrap context value in `useMemo` and callbacks in `useCallback` to prevent unnecessary re-renders.

#### Navigation (React Navigation v7)
- **Type-safe navigation** — All navigators have typed param lists in `src/navigation/types.ts`. Always add new routes there first.
- **Structure** — `RootNavigator` (stack) handles auth/onboarding/main flow. `MainTabNavigator` (bottom tabs) handles app screens.
