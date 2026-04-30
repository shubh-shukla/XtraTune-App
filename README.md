<div align="center">

# XtraTune

**A modern, cross-platform music streaming client built with React Native, Expo Router, and TypeScript.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-See%20LICENSE-blue.svg)](./LICENSE)

</div>

---

## Overview

XtraTune is the official mobile client for the XtraTune music platform. It delivers a fluid, gesture-driven listening experience across iOS, Android, and the web from a single TypeScript codebase. The app supports background playback, persistent playlists and favourites, on-device session security, and a fully themed UI with light/dark/system modes.

This client is designed as a thin, opinionated front end over the XtraTune Next.js backend, with strong separation between presentation, state, networking, and platform concerns.

## Highlights

- **Cross-platform** — iOS, Android, and Web from one codebase (`react-native-web`).
- **File-based routing** — [Expo Router](https://docs.expo.dev/router/introduction/) v4 with typed routes, drawer + tab navigation, and deep links via the `xtratune://` scheme.
- **Background audio** — `expo-av` with iOS `UIBackgroundModes` and Android `FOREGROUND_SERVICE` for uninterrupted playback.
- **Robust state** — Redux Toolkit + `redux-persist` for player, likes, and settings; SWR for server-state caching and revalidation.
- **Secure auth** — Session and CSRF tokens stored in `expo-secure-store`; OAuth via `expo-auth-session` and `expo-web-browser`.
- **First-class UX** — Reanimated 3, gesture handler, haptics, blur, linear gradients, Lottie animations, and skeleton loaders.
- **New Architecture enabled** — Fabric + TurboModules (`newArchEnabled: true`).
- **Theming** — Centralised theme with automatic system-preference support.

## Tech Stack

| Layer            | Technology                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Runtime          | React Native 0.76, React 18.3, Expo SDK 52                                 |
| Language         | TypeScript 5.3 (strict)                                                    |
| Navigation       | Expo Router 4 (typed routes), React Navigation 7 (drawer)                  |
| State (client)   | Redux Toolkit, React Redux, redux-persist                                  |
| State (server)   | SWR                                                                        |
| Networking       | Axios with auth + CSRF interceptors                                        |
| Audio            | `expo-av`                                                                  |
| Storage          | `expo-secure-store`, `@react-native-async-storage/async-storage`           |
| Auth             | `expo-auth-session`, `expo-crypto`, `expo-web-browser`                     |
| UI / Animations  | Reanimated 3, Gesture Handler, Lottie, Expo Blur, Linear Gradient, SVG     |
| Tooling          | Yarn 4 (Berry), ESLint, EAS Build                                          |

## Architecture

```
app/                         Expo Router routes (file-based)
├── _layout.tsx              Root providers (Redux, Theme, Audio, Auth)
├── (drawer)/                Authenticated drawer scope
│   ├── (tabs)/              Home, Categories, Search, Radio, Favourites
│   ├── playlists.tsx
│   └── settings.tsx
├── album/[id].tsx           Dynamic detail screens
├── artist/[id].tsx
├── playlist/[id].tsx
├── category/[slug].tsx
├── search/[query].tsx
├── player.tsx               Full-screen player (modal)
├── queue.tsx
├── add-to-playlist.tsx
└── auth.tsx

src/
├── api/                     Axios client + endpoint definitions
├── components/              Feature-grouped UI (player, search, common, …)
├── hooks/                   Domain hooks (useAudioPlayer, useAuth, useFavorites, …)
├── navigation/              Custom drawer content
├── store/                   Redux slices: player, likes, settings
├── theme/                   Tokens + ThemeProvider
├── types/                   Shared TS types
└── utils/                   Helpers
```

**Design principles**

- **Routes are thin.** Screens compose hooks and components; logic lives in `src/`.
- **Server vs. client state are separate.** SWR owns remote data; Redux owns user-driven, persisted state.
- **Side-effects are isolated.** Audio playback, secure storage, and auth are encapsulated behind hooks (`useAudioPlayer`, `useAuth`).
- **Theming is a token system.** All colours flow through `src/theme` — no hard-coded hex in components.

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Yarn** 4 (Berry) — the repo pins `packageManager: yarn@4.6.0`
- **Xcode 15+** (iOS) / **Android Studio + JDK 17** (Android)
- **Expo CLI** via `npx expo`
- A running instance of the XtraTune backend (Next.js)

### Installation

```bash
git clone <your-repo-url> XtraTune-App
cd XtraTune-App
yarn install
```

### Environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                        | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`           | Production backend URL (e.g. `https://api.xtratune.com`).         |
| `EXPO_PUBLIC_DEV_HOST_FALLBACK` | LAN IP fallback when Expo cannot infer one (e.g. `192.168.1.20`). |
| `EXPO_PUBLIC_DEV_PORT`          | Dev backend port (default `3000`).                                |

> The Axios client (`src/api/client.ts`) automatically prefers the Expo `hostUri` in development and falls back to these values.

### Run

```bash
yarn start            # Expo dev server + QR code
yarn ios              # Open in iOS Simulator
yarn android          # Open in Android Emulator
yarn web              # Run as a web app
```

## Quality

```bash
yarn lint             # ESLint (TS/TSX)
npx tsc --noEmit      # Strict type-check
```

## Production Builds

Builds are produced through [EAS Build](https://docs.expo.dev/eas/):

```bash
yarn prebuild         # Generate native projects (if needed)
yarn build:ios        # eas build --platform ios
yarn build:android    # eas build --platform android
```

Configure profiles in `eas.json` and authenticate with `eas login` before building.

## Permissions & Capabilities

| Platform | Capability                | Reason                               |
| -------- | ------------------------- | ------------------------------------ |
| iOS      | `UIBackgroundModes: audio`| Continue playback when backgrounded. |
| Android  | `FOREGROUND_SERVICE`      | Reliable background playback.        |
| Both     | Secure Store              | Persist session & CSRF tokens.       |

## Security

- Tokens are stored exclusively in `expo-secure-store` (Keychain / Keystore) — never in AsyncStorage.
- All authenticated requests carry a CSRF header (`x-csrf-token`) and session cookie.
- Production URLs must be HTTPS; HTTP is only permitted for `__DEV__` LAN access.
- Do not commit `.env` — only `.env.example` is tracked.

## Contributing

1. Create a feature branch from `main`.
2. Keep changes scoped; prefer small, reviewable PRs.
3. Run `yarn lint` and `npx tsc --noEmit` before opening a PR.
4. Follow the existing folder conventions (`src/` for logic, `app/` for routes only).

## License

See [LICENSE](./LICENSE) for details.
