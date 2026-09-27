# morabaraba

[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-~57.0.24-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Design System](https://img.shields.io/badge/Design_System-60--30--10_Rule-E5A93C)](https://shields.io/)
[![Market](https://img.shields.io/badge/Target_Market-Southern_Africa-10B981)](https://shields.io/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-Direct_Native_APK-2088FF?logo=githubactions&logoColor=white)](https://github.com/thulanesigasa/competitor/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Morabaraba is a premier competitive two-player mobile strategy game built with React Native, Expo (managed workflow), and TypeScript. Steeped in centuries of authentic Southern African tactical heritage (known as Morabaraba or Mbalavala), the game is completely safe from IP/copyright infringements while delivering high-stakes tactical gameplay across South Africa, Zimbabwe, Zambia, Botswana, Malawi, Lesotho, and Eswatini.

---

## Architecture & System Overview

```
                                +-----------------------------------+
                                |            Morabaraba             |
                                +-----------------------------------+
                                                  |
                  +-------------------------------+-------------------------------+
                  |                                                               |
    +---------------------------+                                   +---------------------------+
    |   Onboarding & Identity   |                                   |     Core Game Engine      |
    +---------------------------+                                   +---------------------------+
    | * 3-Screen Carousel       |                                   | * 24-Vertex Graph         |
    | * Swipe-to-Sign-Up Slider |                                   | * 20 Collinear Mills      |
    | * 3-Step Wizard           |                                   | * Phase 1: Placing        |
    | * 8+ Char Password Meter  |                                   | * Phase 2: Moving         |
    | * Southern African Regs   |                                   | * Phase 3: Flying (3 cows)|
    +---------------------------+                                   +---------------------------+
                  |                                                               |
                  +-------------------------------+-------------------------------+
                                                  |
                                    +---------------------------+
                                    |     Main Navigation       |
                                    +---------------------------+
                                    | * Battleground (2P Local) |
                                    | * Offline Arena (vs CPU)  |
                                    | * Regional Leaderboard    |
                                    | * Gamer Tag Profile       |
                                    +---------------------------+
```

---

## Key Features

### 1. Authentic Morabaraba Game Engine
- **Mathematical Board Modeling:** 24 vertices spanning three concentric squares connected by orthogonal and diagonal lines.
- **20 Mill Triplets:** Full automated detection of 3-in-a-row mills (*umphahlo*).
- **Three Progressive Phases:**
  - **Placing Phase:** 12 cows per player placed sequentially; forming a mill unlocks immediate cow shooting.
  - **Moving Phase:** Sliding cows along connected lines to adjacent open vertices.
  - **Flying Phase (*Ku-fofa*):** When a competitor is reduced to 3 cows, their cows gain the ability to fly to any empty board intersection.
- **Victory Evaluation:** A player wins when the opponent has fewer than 3 cows in the moving phase or has zero legal moves available.

### 2. Intelligent Offline AI Arena (Solo Mode)
- **Heuristic & Minimax Engine:**
  - **Novice (*Dumela*):** Balanced learning AI that recognizes basic mills with casual play.
  - **Warrior (*Inkosi*):** 2-ply search minimax evaluating material advantage, mill potential, and blocking traps.
  - **Grandmaster (*Isangoma*):** Deep alpha-beta pruning minimax with tactical board dominance evaluation.
- **Zero Internet Requirement:** Completely operational offline without consuming cellular data.

### 3. Zero-Data Local Battleground (2-Player Duel)
- **Same-Device Pass & Play:** Interactive tabletop mode for direct head-to-head dueling on one screen.
- **Local Wi-Fi Match:** Direct peer room creation with 4-digit PIN exchange over local Wi-Fi or mobile hotspots without cloud dependencies.

### 4. Full-Bleed 3-Screen Onboarding & Gesture Slider
- High-impact visual introduction to heritage, zero-data competitive modes, and regional ranking rendered directly on the pure white body canvas without card/div box wrappers.
- Custom interactive **Swipe to Sign Up** gesture slider with pan tracking.
- Seamless authentication toggle leading to direct Sign In.

### 5. Multi-Step Registration with Split Phone Input & Zero Sanitizer
- **Step 1 (Personal Details):** Name, surname, date of birth, and split cellphone input group:
  - Left dedicated dropdown button (`+27 ▼`) opening a modal picker of Southern African regional codes.
  - Automatic leading zero sanitization (`082 123 4567` automatically converted to clean regional format `821234567` for storage without duplicate zeros).
  - Navigation stack preservation ensuring back button on Step 1 takes the competitor back to onboarding screens without closing the app.
- **Step 2 (Location & Gamer Tag):** Country selector, dynamically populated regional province selector, town/city input, and unique Gamer Tag.
- **Step 3 (Security & Credentials):** Email verification and real-time password strength meter requiring 8+ characters with alphanumeric/symbol requirements.

### 6. Regional Leaderboard & Gamer Profile
- Southern African regional ranking filterable across all 7 nations.
- Gamer Tag identity card tracking matches played, victories, win rate percentage, mills formed, cows captured, and Elo rating.

---

## Design System & Theme Architecture (Strict 60-30-10 & Tab-Only SVGs)

[![Colors](https://img.shields.io/badge/60--30--10-Background_%23FFFFFF_|_Surface_%23FFFFFF_|_Accent_%23E5A93C-E5A93C)](https://shields.io/)
[![Typography](https://img.shields.io/badge/Typography-Custom_Type_Scale-0F172A)](https://shields.io/)
[![Tab Icons](https://img.shields.io/badge/Bottom_Nav-Dedicated_SVGs-61DAFB)](https://shields.io/)
[![Verification](https://img.shields.io/badge/Verification-App_Logo_Emblem-E5A93C)](https://shields.io/)

- **60% Dominant Background:** Crisp Pure White (`#FFFFFF`) providing a clean, high-contrast, modern application canvas.
- **30% Panel & Surface:** Pure White (`#FFFFFF`) & Soft Slate Surface (`#F8FAFC`) with hairline borders (`rgba(15, 23, 42, 0.08)`) and subtle elevation shadows (`shadow.sm`, `shadow.md`, `shadow.pill`).
- **10% Accent:** Radiant Gold / Orange (`#E5A93C` / `#D97706`) strictly reserved for active states, primary CTAs, and winning moves.
- **Bottom Navigation Tab SVGs (`TabIcons.tsx`):** Strictly reserved for the bottom navigation pill bar (`BattlegroundTabSvg`, `OfflineTabSvg`, `LeaderboardTabSvg`, `ProfileTabSvg`) with 16px compact geometry and dynamic focused tint.
- **Status Verification with App Logo:** For validation and verified status checkpoints (e.g. valid cellphone verification, completed step verification), the app's brand logo emblem (`assets/icon.png` with `borderRadius: 0`) is used.
- **Pure Text Throughout Application:** All other screens, forms, headers, alerts, and buttons use crisp native typography and typographic indicators (`→`, `←`, `▼`, `SHOW` / `HIDE`).
- **Typography Component (`Typography.tsx`):** Standardized `<Text>` abstraction with variants (`h1`, `h2`, `h3`, `body`, `caption`, `label`), font weights (`400`, `500`, `600`, `700`, `800`, `900`), and automatic color defaults.
- **Multiples-of-8 Spacing (Rule 15):** Strict `spacing` system (`sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`, `nav: 56`, `huge: 64`).
- **Zero Card/Div Box Wrappers:** Onboarding and authentication content flows directly on the full-bleed body canvas.
- **Themed Popup System:** All user dialogs, errors, and alerts are rendered via custom `ThemedAlert` modals matching the 60-30-10 palette.
- **Unrounded Brand Logos:** All app brand logo displays maintain sharp, unrounded geometry (`borderRadius: 0`) across all screens and modals.
- **Centered Floating Pill Bottom Navigation (`CustomTabBar.tsx`):** Rule 20 compliant floating curved bottom navigation bar (`width: 280`, `height: 50`) with dynamic horizontal centering via `useWindowDimensions()` (`left: (width - 280) / 2`) to guarantee mathematically perfect horizontal centering across all Android and iOS display widths.
- **Optimized Asset Pipeline:**
  - **Onboarding Assets (`assets/onboarding/1.png`, `2.png`, `3.png`):** Standard non-progressive PNGs with clean, space-free filenames, eliminating Android Fresco image decode crashes.
  - **Cold-Start Splash Canvas (`assets/splash.png`):** Calibrated 512x512 canvas with centered 240px brand glyph on #FFFFFF, reducing native startup memory consumption by over 90% compared to raw full-screen assets.

---

## Directory Structure

```text
competitor/
|-- .github/
|   `-- workflows/
|       |-- build-native-apk.yml       # Direct GitHub Actions runner APK compilation with dynamic app.json versioning
|       `-- eas-ota-update.yml         # Dual-channel EAS OTA workflow
|-- assets/
|   |-- android-icon-foreground.png    # 512x512 canvas with 96px centered glyph (Rule 15/19)
|   |-- favicon.png                    # Web favicon
|   |-- icon.png                       # 1024x1024 canvas with 532x532 brand emblem
|   |-- splash.png                     # Calibrated 512x512 splash screen with 240px glyph
|   `-- onboarding/                    # Optimized PNG illustration cards (1.png, 2.png, 3.png)
|-- scripts/
|   `-- generate_assets.py             # Rule 15/19 asset calibration generator
|-- src/
|   |-- components/
|   |   |-- Card.tsx                   # Surface card with shadow.sm and radius tokens
|   |   |-- Typography.tsx             # Standardized Text component with variants & weights
|   |   |-- common/
|   |   |   |-- Header.tsx             # Standard header with 24x24 brand logo (0 border radius)
|   |   |   |-- PasswordStrengthMeter.tsx # 4-segment 8+ char password validator
|   |   |   |-- SwipeToSignUp.tsx      # Custom pan-responder swipe slider
|   |   |   |-- ThemedAlert.tsx        # 60-30-10 modal alert system replacing OS alerts
|   |   |   `-- UpdateModal.tsx        # Rule 21 dual-action OTA update modal
|   |   |-- game/
|   |   |   `-- MorabarabaBoard.tsx    # 24-vertex board layout and interactive pieces
|   |   `-- navigation/
|   |       |-- CustomTabBar.tsx       # Centered floating pill tab bar with active indicator dot
|   |       `-- TabIcons.tsx           # 16px bottom tab bar SVGs (Rule 20)
|   |-- constants/
|   |   |-- regions.ts                 # Southern African countries, provinces, and towns
|   |   `-- theme.ts                   # Legacy theme metrics re-exported to src/theme
|   |-- engine/
|   |   |-- ai.ts                      # Heuristic & Minimax AI across 3 difficulties
|   |   `-- morabaraba.ts              # Mathematical board model and rule validator
|   |-- navigation/
|   |   |-- RootNavigator.tsx          # Auth stack and main app coordinator
|   |   `-- TabNavigator.tsx           # Rule 20 floating pill bottom navigation with CustomTabBar
|   |-- screens/
|   |   |-- auth/
|   |   |   |-- LoginScreen.tsx        # Gamer Tag/Email credential sign in with Typography
|   |   |   `-- SignUpScreen.tsx       # 3-step progressive Southern African registration with step connectors
|   |   |-- battleground/
|   |   |   `-- BattlegroundScreen.tsx # 2-Player Pass & Play and Wi-Fi match setup
|   |   |-- leaderboard/
|   |   |   `-- LeaderboardScreen.tsx  # Regional Southern African rankings
|   |   |-- offline/
|   |   |   `-- OfflineScreen.tsx      # Solo 1P vs CPU AI arena
|   |   |-- onboarding/
|   |   |   `-- OnboardingScreen.tsx   # 3-slide crossfade art canvas, liquid sliding pill & SwipeToStartButton
|   |   `-- profile/
|   |       `-- ProfileScreen.tsx      # Gamer Tag career stats and settings
|   |-- store/
|   |   `-- gameStore.ts               # Local persistence via AsyncStorage
|   |-- theme/
|   |   |-- colors.ts                  # 60-30-10 color palette tokens
|   |   `-- index.ts                   # Spacing (multiples of 8), platformSpecs, radius, shadow
|   `-- types/
|       |-- auth.ts                    # User profile and registration models
|       `-- game.ts                    # Game state, phase, player, and board types
|-- .gitignore                         # Excludes .agents, node_modules, android/
|-- .npmrc                             # legacy-peer-deps=true (Rule 21)
|-- app.json                           # Locked runtimeVersion 1.0.0, dynamic versionCode, owner thulanesigasa0
|-- App.tsx                            # Root application entry with SafeAreaProvider
|-- eas.json                           # Dual-channel EAS configuration (development, preview, production)
|-- index.ts                           # Expo root registration
|-- package.json                       # Dependencies and pinned port 8082 dev scripts
|-- tsconfig.json                      # Extends expo/tsconfig.base.json (Rule 21)
`-- README.md                          # Architecture, shields.io badges, and specifications
```

---

## Development Setup

### Prerequisites
- Node.js 22 LTS or newer
- npm 11 or newer

### Installation
```bash
# Clone the repository
git clone https://github.com/thulanesigasa/competitor.git
cd competitor

# Install dependencies using pinned peer dependencies flag
npm install --legacy-peer-deps --prefer-offline --no-audit
```

### Running Locally
```bash
# Start with concurrently on pinned port 8082 (Rule 15)
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Re-generate calibrated assets (Rule 15 & 19)
npm run generate:assets

# Or start directly
npm start
```

---

## CI/CD & Native Compilation (Rule 21)
### Direct GitHub Actions Native Compilation (Version-Driven)
Native Android APK binaries compile directly on GitHub Actions runners without consuming cloud build credits, triggered **strictly when a new native version is needed**:
- **Trigger Policy:** Only runs when `app.json` is modified on `main` (declaring a new native version e.g. `1.0.1`, `1.0.2`), when a version tag (`v*`) is pushed, or via manual `workflow_dispatch`. Standard codebase updates bypass native compilation and flow through OTA.
- **Runner Environment:** `ubuntu-latest`
- **JDK:** Eclipse Temurin Java 17 (`actions/setup-java@v5`)
- **Android SDK:** Command-line tools and build-tools (`android-actions/setup-android@v3`)
- **Prebuild:** `npx expo prebuild --platform android --no-install`
- **Gradle:** `./gradlew assembleRelease -Pexpo.inlineModules.watchedDirectories="[]" -x lint -x test --no-daemon --stacktrace`
- **Release Distribution:** Automatically uploads compiled APK to GitHub Releases via `gh release upload` and saves CI build artifacts.

### Dual-Channel Over-The-Air (OTA) Updates (Continuous Delivery)
- **Continuous Deployment:** Every regular commit and pull request merged to `main` immediately publishes an OTA JavaScript and asset update to the `production` channel in ~45 seconds.
- **EAS CLI:** Strictly reserved for OTA JavaScript bundle updates (`eas update`), never for building native binaries.
- **EAS Configuration (`eas.json`):** Defines `development`, `preview`, and `production` channels with auto-increment.
- **Prebuild Embedding:** Native APKs embed `updates.url` and `projectId` in their build manifests so installed standalone APKs continuously check for and download OTA updates.
- **In-App Modal (`UpdateModal.tsx`):** Dual-action update prompt (Update Now / Remind Me Later) triggered on app launch and foreground resume (`AppState`), with 30-minute snooze timestamp persisted in `AsyncStorage` and 0-border-radius unrounded brand emblem. Tapping "Update Now" instantly reloads the runtime with the fresh update bundle.

### Managed Workflow & Ephemeral Android Directory Architecture
The repository operates under a standard **Expo Managed Workflow**:
- **Zero Local Native Bloat:** The `android/` and `ios/` folders are intentionally omitted from version control and strictly covered by `.gitignore`. The entire application code, UI components, and game logic reside in TypeScript and Expo configuration (`app.json`).
- **On-Demand CI Native Generation:** The `android/` directory is created dynamically on the GitHub Actions runner during the APK compilation step via `npx expo prebuild --platform android --no-install`. The runner compiles the release binary and discards the transient directory after artifact upload.
- **Local Development Cleanliness:** If `npx expo prebuild` or native commands are executed locally during debugging, an `android/` directory is generated in the workspace. Because it is gitignored, it does not pollute the git repository and can be safely purged at any time with `Remove-Item -Recurse -Force android` without affecting project source code.

