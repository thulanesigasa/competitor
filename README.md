# morabaraba

[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-~57.0.24-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Native Version](https://img.shields.io/badge/Native_Version-1.0.4-E5A93C)](https://github.com/thulanesigasa/competitor/releases)
[![Runtime Version](https://img.shields.io/badge/Runtime_Version-1.0.0-0F172A)](https://expo.dev/)
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

### 1. Authentic Morabaraba Game Engine & Pure Line Board
- **Mathematical Board Modeling:** 24 vertices spanning three concentric squares connected by orthogonal and diagonal lines.
- **Pure Line Intersection Board Architecture (`MorabarabaBoard.tsx`):** Empty board vertices are pure line intersections with zero circle backgrounds or borders, keeping the aesthetic focused strictly on the authentic grid lines.
- **Authentic Pure Circular Tokens (`MorabarabaPiece.tsx`):** Hand-crafted multi-layered circular game pieces with zero background artifacts, featuring edge-to-edge outer stone rims, deep terracotta/slate concentric rings, inner shadow grooves, and centered concentric bullseyes.
- **20 Mill Triplets:** Full automated detection of 3-in-a-row mills (*umphahlo*).
- **Three Progressive Phases:**
  - **Placing Phase:** 12 cows per player placed sequentially; forming a mill unlocks immediate cow shooting.
  - **Moving Phase:** Sliding cows along connected lines to adjacent open vertices.
  - **Flying Phase (*Ku-fofa*):** When a competitor is reduced to 3 cows, their cows gain the ability to fly to any empty board intersection.
- **Victory Evaluation:** A player wins when the opponent has fewer than 3 cows in the moving phase or has zero legal moves available.

### 2. Transparent In-Game Coin Toss & Pattern 1 Mutual Exclusion (`CoinTossModal.tsx`)
- **Seamless Game Integration:** Rendered as a transparent overlay directly over the live board with zero card/div enclosures, keeping the competitor immersed in the game arena.
- **Pattern 1 Role-Based Calling Protocol:** In online matches, prevents coin side selection clashes between simultaneous participants through deterministic mutual exclusion:
  - **Challenger Calls:** The incoming challenger is designated as the caller and presented with the interactive Heads / Tails selection buttons.
  - **Host Receives Complement:** The host's interface displays a waiting status indicator (*"WAITING FOR [CHALLENGER] TO CALL..."*) with disabled manual selection. As soon as the challenger calls, the host is automatically assigned the opposite side.
  - **Sub-50ms WebSocket Broadcast:** The challenger's selection is broadcast via `gameSyncService.broadcastCoinCall()`. Both clients lock in their assigned sides simultaneously and execute the synchronized 3D flip animation.
- **Dynamic 'H' and 'T' Metallic Face Animation:** Rapidly alternates between bold metallic **'H'** (Heads) and **'T'** (Tails) throughout the 1500ms 3D flip rotation, strictly settling on the winning face ('H' or 'T') with zero placeholder or brand artifacts.
- **Instant 1-Tap Trigger:** In local Pass & Play or solo arenas, competitors tap Heads or Tails to immediately launch the 3D coin flip without intermediate confirmation steps.
- **Realistic 3D Physics Flip:** Randomized 50/50 flip animation with smooth perspective rotation, scale dynamics, and gold/bronze metallic styling.
- **Automatic Head-Back-To-Game Transition:** Upon landing on the winning face and announcing the starting player, the coin toss automatically dismisses after 1.2s and heads directly into the live match.
- **In-Game Re-Toss:** Competitors can trigger a new coin toss at any time from the match header controls or during victory rematch flows.

### 3. Intelligent Offline AI & Pass & Play Arena (`OfflineScreen.tsx`)
- **Dual Offline Modes:**
  - **VS CPU (AI Engine):** Solo arena with 3 skill tiers:
    - **Novice (*Dumela*):** Balanced learning AI that recognizes basic mills with casual play.
    - **Warrior (*Inkosi*):** 2-ply search minimax evaluating material advantage, mill potential, and blocking traps.
    - **Grandmaster (*Isangoma*):** Deep alpha-beta pruning minimax with tactical board dominance evaluation.
    - **Autonomous First-Move AI:** When the offline competitor loses the coin toss, the CPU takes the first move automatically.
  - **Pass & Play (2-Player Local Duel):** 1-on-1 tabletop battle on the same device with Player 1 (Gold) vs Player 2 (Charcoal), fair coin toss turn decider, and live scoreboard.
- **Dynamic Cross-Screen Rerouting:** Starting a Pass & Play match from the Battleground automatically switches tabs and navigates directly to the Offline arena with match parameters and instant coin toss initialization.
- **Zero Internet Requirement:** Completely operational offline without consuming cellular data.

### 4. Zero-Data Local Battleground & Pure Live Online Rooms (`BattlegroundScreen.tsx`)
- **Pass & Play Rerouting:** Initiating a local offline duel seamlessly transfers the session to the dedicated `OfflineScreen`.
- **Pure Live Cloud Matchmaking (Zero Mock Fallbacks):**
  - **Collision-Free Cloud PIN Generation:** Automatically generates a 4-digit numeric code validated against active rooms in PostgreSQL (`public.battle_rooms`), ensuring zero duplicate active battle codes.
  - **Unclipped High-Legibility Code Display:** Calibrated with explicit line height (`lineHeight: 56`), Android native font padding elimination (`includeFontPadding: false`), and comfortable container headroom (`minHeight: 104`), ensuring numeric digits are 100% visible without clipping at top or bottom.
  - **Public Room Hosting (`'host_waiting_room_public'`):** Instantly inserts a room into Supabase with `room_type = 'public'` and `status = 'waiting'`. Real-time PostgreSQL changes (`battle_room_events:${roomId}`) stream genuine incoming challenger arrivals directly to the host's screen with profile cards and Accept/Decline actions. Zero simulated mock timer challengers.
  - **Private Room Hosting (`'host_private_share'` & `'host_waiting_room_private'`):** Generates a dynamic 4-digit battle code with one-tap clipboard copy and native share sheet triggering (`Share.share`), followed by a private waiting room awaiting the PIN connection and genuine challenger profile inspection.
  - **Realtime Public Lobby Joining (`'join_public_lobby'`):** Realtime WebSocket feed (`public_battle_rooms_feed`) streaming active regional hosts directly to joiners as soon as rooms are created. If no public rooms are active, displays a clean 60-30-10 empty state with direct "Host a Room Now" action.
  - **Private PIN Joining (`'join_private_enter_code'` & `'join_waiting_approval'`):** Dedicated 4-digit numeric code entry querying active rooms directly from Supabase, linking the challenger to the host and awaiting real-time approval.
  - **Competitor Profile Inspection Card (`CompetitorProfileCard.tsx`):** Unified 60-30-10 component showcasing initials avatar, gamer tag, dynamic 10-tier competitive title chip, Southern African province/country, win rate percentage, total victories, and match volume.
  - **Hardware Back & Edge Swipe-Back Gestures:** Both Android hardware back button events (`BackHandler`) and touch rightward edge swipes (`PanResponder`) are cleanly intercepted in nested host/join flows to return safely to the previous screen without exiting the application.
  - **Streamlined Menu Header:** Purged redundant logged-in competitor status tags and tier chips from the Battleground menu to maintain a clean, distraction-free lobby canvas.

### 5. Full-Bleed 3-Screen Onboarding & Gesture Slider
- High-impact visual introduction to heritage, zero-data competitive modes, and regional ranking rendered directly on the pure white body canvas without card/div box wrappers.
- Custom interactive **Swipe to Sign Up** gesture slider with pan tracking.
- Seamless authentication toggle leading to direct Sign In.

### 6. Multi-Step Registration with DatePicker & Seamless Keyboard Navigation
- **Step Progression Indicator:** Sequential 3-step navigation preserving bold step numbers across active and completed states with solid accent fill and crisp white typography on completed steps, ensuring clear numeric progress tracking without image replacements.
- **Step 1 (Personal Details):**
  - **Interactive Native DatePicker:** Date of birth input uses `@react-native-community/datetimepicker` with a clean button trigger displaying `SELECT \/` or formatted calendar dates (`YYYY-MM-DD`), preventing manual entry errors.
  - **Sequential Keyboard Navigation:** Pressing keyboard `Next` automatically transfers cursor focus from First Name to Surname, then to Phone number.
  - **Numeric Keypad:** Cellphone input explicitly opens `keyboardType="number-pad"` for smooth, dedicated numeric input.
  - **Split Phone Input Group:** Left dedicated dropdown button (`+27 \/`) opening a modal picker of Southern African regional country codes.
  - **Automatic Leading Zero Sanitization:** Inputs like `082 123 4567` are automatically sanitized to `821234567` for storage without duplicate zeros.
  - **Navigation Stack Preservation:** Back button on Step 1 takes the competitor back to onboarding screens without closing the app.
- **Step 2 (Location & Gamer Tag):** Sleek, reusable **ThemedDropdown** menus for both Country and Province / Region selection. Clean province names are displayed without extraneous town counts, featuring SVG chevrons, active checkmark indicators, accent focus styling, and dynamic province population based on the chosen nation, alongside Town/City and unique Gamer Tag inputs.
- **Step 3 (Security & Credentials):** Email, email confirmation, password, and password confirmation with `returnKeyType="next"` advancing sequentially to password submission (`handleFinalSubmit`), paired with a real-time password strength meter requiring 8+ characters.

### 7. 10-Tier Southern African Ranking System & Dynamic Ranks (`ranks.ts`, `LeaderboardScreen.tsx`, `ProfileScreen.tsx`)
- **10 Distinct Progressive Competitive Tiers:** Based on career Win Rate percentage, victories, and match volume:
  - **Tier 1: Novice Scout (*Umfana*):** Starting rank (0% WR, 0 wins, 0 matches) for newcomers learning board intersections.
  - **Tier 2: Apprentice (*Murwisi*):** 35%+ WR, 3+ wins, 5+ matches.
  - **Tier 3: Warrior (*Iqhawe*):** 45%+ WR, 6+ wins, 10+ matches.
  - **Tier 4: Vanguard (*Umlweli*):** 52%+ WR, 12+ wins, 18+ matches.
  - **Tier 5: Tactician (*Ingcweti*):** 58%+ WR, 20+ wins, 28+ matches.
  - **Tier 6: Commander (*Induna*):** 64%+ WR, 30+ wins, 40+ matches.
  - **Tier 7: Warrior Chief (*Mambo*):** 70%+ WR, 45+ wins, 55+ matches.
  - **Tier 8: Champion (*Shasha*):** 76%+ WR, 65+ wins, 75+ matches.
  - **Tier 9: Grandmaster (*Isangoma*):** 82%+ WR, 90+ wins, 100+ matches.
  - **Tier 10: Supreme Paramount (*Kgosi*):** 88%+ WR, 120+ wins, 130+ matches - legendary undisputed sovereign.
- **Pure Live Regional Leaderboard:** Direct queries against Supabase PostgreSQL `career_stats` joined with `profiles`. Mock fallback data has been eradicated; if a region has no recorded matches, a clean empty state invites the player to claim the #1 spot.
- **Streamlined Gamer Profile Header:** Displays the competitor's competitive rank title in clean brand accent orange directly beneath their residence location (town, province, and country), removing redundant backend tier lists and status banners for a modern, focused presentation.

### 8. Backend & Cloud Infrastructure (Supabase)
- **Zero-Exposure Credential Architecture (`.env` & `.env.example`):** Supabase endpoint URLs and public anon keys are strictly injected via `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`. Privileged service role keys and administrative clients have been completely purged from the client distribution bundle.
- **Supabase Client Integration (`src/lib/supabase.ts`):** Initialized using `@supabase/supabase-js` and `react-native-url-polyfill`, configured with `AsyncStorage` session persistence and auto-token refreshing using strictly the public anonymous key.
- **Instant Authentication (`authService.ts`):** Players register and sign in seamlessly using either their Gamer Tag or email address. Standard client authentication issues valid JWT sessions immediately, with email confirmation bypass configured on the backend provider (Confirm email = Off).
- **Live Southern African Regional Leaderboards (`leaderboardService.ts`):** Direct queries against `public.career_stats` joined with `public.profiles`, supporting real-time ranking and filtering across South Africa, Zimbabwe, Zambia, Botswana, Malawi, Lesotho, and Eswatini.
- **Online Matchmaking & Battle Rooms (`battlegroundService.ts`):** Enables dynamic creation of public regional rooms and private 4-digit PIN rooms, complete with challenger profile inspection and live lobby discovery.
- **Sub-50ms Realtime Broadcasting (`gameSyncService.ts`):** Low-latency WebSockets broadcast channel (`room:${roomId}`) for synchronized turn dispatch, cow placement, moves, and transparent coin toss results.
- **Relational PostgreSQL Schema (`supabase/migrations/20260927113651_new-migration.sql`):**
  - `public.profiles`: UUID-keyed identity linked to Supabase Auth (`auth.users`), storing Gamer Tag, personal details, date of birth, cellphone, regional location, and competitive title.
  - `public.career_stats`: Persistent tracking of ELO ratings, match records, victories, defeats, win streak, best win streak, win rate %, mills formed, and cows captured.
  - `public.battle_rooms`: Realtime matchmaking for public broadcast and private PIN battle rooms.
  - `public.match_logs`: Comprehensive turn history and board state snapshots.
- **Automated ELO & Stats Stored Procedure (`handle_match_completion`):** Automatically computes win rate, updates win streaks, and recalculates ELO ratings upon match completion.
- **Automated Profile Initializer (`handle_new_user`):** Automatically provisions a profile and career statistics record when a user signs up.

### 9. Settings, Privacy & Security Enclave Architecture (`v1.0.4`)
- **Gamer Tag & Challenge Arena Customization (`ProfileScreen.tsx`, `ChallengeArenaScreen.tsx`):**
  - **Dynamic Gamer Tag Editing:** Competitors can update their public handle with real-time uniqueness validation against PostgreSQL `profiles.gamer_tag` and local store synchronization.
  - **Target Challenge Arena Full-Screen Route (`ChallengeArenaScreen.tsx`):** Replaces modal dialogs with a dedicated full screen in pure body typography (zero card divs), allowing competitors to configure their preferred province and city/town matchmaking territory with direct text updates.
- **Privacy & Safety Settings (`PrivacyScreen.tsx`, `BlockedUsersScreen.tsx`):**
  - **Private Matchmaking Mode (Incognito):** Masks competitor gamer tags during casual public battles to prevent targeted scouting.
  - **Public Leaderboard Discoverability:** Controls public visibility in regional rankings.
  - **Public Career Statistics:** Toggles public visibility of win rates %, victories, and mill formation counts on profile cards.
  - **Blocked Competitors Management:** Restricts specific competitors from challenging the player or entering hosted battle rooms, with quick unblock actions.
- **Access Controls, Biometric Authentication & Terminal Security (`SecurityScreen.tsx`, `SecurityPinScreen.tsx`, `InactivityLockScreen.tsx`, `TerminalLockGate.tsx`):**
  - **Root Terminal Lock Gate (`TerminalLockGate.tsx`):** Sits unconditionally at the application root (`App.tsx`) to safeguard game states, wallet balances, and user credentials. Gating is automatically invoked on initial application startup and upon returning from background after the selected inactivity period.
  - **Dual Unlock Architecture (Fingerprint & 4-Digit PIN):** Provides competitors with flexible, instantaneous unlocking:
    - **Native Biometric Scanning (`biometricService.ts`, `expo-local-authentication`):** Seamless hardware fingerprint scan automatically triggered upon launch or foreground resume, with a dedicated re-scan button and SVG indicator for on-demand sensor triggering.
    - **4-Digit Security PIN Enclave:** Pure TypeScript SHA-256 (FIPS 180-4) with 256-bit cryptographic salt, interactive keypad, dot indicators, non-trivial passcode validation (restricting 4 identical digits), and brute-force lockout safeguards (5 failed attempts = 30s lockout, 10 failed attempts = 5m lockout).
  - **Inactivity Auto-Lock:** Configurable timeout (Immediate, 1 Minute, 5 Minutes, 15 Minutes, 30 Minutes, Never) triggering security verification when the terminal is left unattended.
  - **App Switcher Privacy Shield:** Real-time `AppState` listener that immediately renders an opaque white branded privacy card when the competitor switches tasks or minimizes to background, concealing live game boards and financial balances from OS multitasker snapshots.
- **Data Ownership & Cryptography (`ExportDataScreen.tsx`, `encryptionService.ts`):**
  - **Hardware-Encrypted (AES-256-CBC) Backup:** Pure TypeScript implementation of FIPS 197 standard AES-256-CBC with PKCS#7 padding and SHA-256 HMAC integrity verification, presented directly in screen body typography with zero card divs or SVGs.
  - **Standard Open JSON Export:** Human-readable ECMA-404 JSON archive of profile and career statistics with direct text action export.
- **Device Sessions & Security Audit (`DeviceSessionsScreen.tsx`, `sessionSecurityService.ts`):**
  - **Active Terminal Session Info:** Inspects current hardware model, operating system, app build, and session token.
  - **Remote Session Revocation:** Terminate all remote competitor sessions with one tap.
  - **Immutable Security Audit Trail:** Persistent log tracking PIN events, data exports, challenge region updates, and session revocations.
- **Permanent Account Deletion (`DeleteAccountScreen.tsx`):**
  - POPIA and GDPR Article 17 (Right to Erasure) compliant data purge requiring explicit checkbox acknowledgment and typing "DELETE" to verify.
- **Legal & Fair Play Standards (`PrivacyPolicyScreen.tsx`, `TermsOfServiceScreen.tsx`):**
  - Dedicated transparent screens for Privacy Policy and Terms of Service covering traditional Morabaraba rules, anti-cheating, disconnection forfeits, and sportsmanship.

### 10. Strict Gameplay Rules, Anti-Cheat Engine & Tactical Rule Validator (`morabarabaValidator.ts`, `RuleTipModal.tsx`)
- **Centralized Tactical Validator (`src/engine/morabarabaValidator.ts`):** Enforces strict authentic Southern African Morabaraba rules across both Offline (vs CPU / Pass & Play) and Online Battleground arenas.
- **Anti-Bot Reaction Speed Throttler (`validateHumanReactionRate`):** Intercepts input bursts registered faster than human physical touch latency (< 260ms), blocking automated click bots, macro injection, and scripted execution.
- **Threefold Repetition Stalling Loop Breaker (`validateThreefoldRepetition`):** Forbids moving the same cow back and forth across identical intersections 3 consecutive times, preventing artificial bot deadlocks and infinite stalling.
- **Sacred Mill Shoot Protection (*Umphahlo*):** Enforces the authentic rule where cows inside an opponent's active mill are sacred and protected from capture unless all opponent cows on the board are locked in mills; forbids friendly fire and empty intersection shooting.
- **Connected Adjacency & Flight Gating (*Ku-fofa*):** Sliding is strictly limited to connected lines along the authentic board graph; flight across vacant intersections is restricted until a herd is reduced to exactly 3 cows and the hand is empty.
- **Peer Packet Verification:** Validates every incoming WebSocket move payload before updating local state, rejecting tampered, forged, or out-of-turn packets.
- **Anti-AI Deliberation Clock:** 60-second deliberation timer preventing external solver/AI assistance and stalling tactics in ranked battles.
- **Educational Rule Tip Modal (`RuleTipModal.tsx`):** Unobtrusive 60-30-10 modal that surfaces authentic rule tips only when a user or script attempts to violate a rule, explaining why the action was rejected without cluttering the screen during normal gameplay.

### 11. Tournament & Subscription Engine: R500 Weekly Tournaments & VIP Pro Tournament Pass (`tournamentService.ts`, `VipPassScreen.tsx`, `LeaderboardScreen.tsx`)
- **R500 Weekly Tournament Engine (`tournamentService.ts`):**
  - Continuous weekly tournament cycles starting **Monday 00:00:00 SAST** and freezing on **Sunday 23:59:59 SAST**.
  - Live ticking countdown timer ticking down to Sunday midnight settlement embedded directly on the Regional Leaderboard banner.
  - **R500 Grand Prize Pool Distributed to Top 8 Global Leaderboard Competitors:**
    - **Rank 1:** R200 (Grand Champion)
    - **Rank 2:** R100 (Runner-Up)
    - **Rank 3:** R60 (Podium Bronze)
    - **Rank 4:** R40 (Contender Elite)
    - **Rank 5:** R30 (Challenger Rank)
    - **Rank 6:** R30 (Challenger Rank)
    - **Rank 7:** R20 (Arena Warrior)
    - **Rank 8:** R20 (Arena Warrior)
  - **Automated Sunday Settlement & Winner Notification:**
    - Standings lock automatically at Sunday 23:59:59 SAST.
    - Verified Top 8 winners receive automated email disbursement notifications for payout processing.
- **Strategy Games Section under Profile (`ProfileScreen.tsx`, `GameDetailScreen.tsx`):**
  - **Morabaraba:** Full traditional Southern African board strategy guide, board setup (24 vertices, 3 concentric squares), placing/moving/flying phases, and tactical advice with direct entry to the live battleground.
  - **Chess:** Classic 64-square grandmaster strategy guide covering piece dynamics, special rules, opening principles, and "COMING SOON" Season 2 launch announcement.
  - **Checkers / Draughts:** 8x8 diagonal strategy guide covering mandatory multi-jump sequences, king crowning, tactical sacrifices, and "COMING SOON" tournament launch announcement.
  - **Pure Body Architecture:** All game guides and screens follow pure body typography without card enclosures or panel divs.
- **Streamlined Battleground (`BattlegroundScreen.tsx`):**
  - Pure body action rows on `#FFFFFF` canvas for **Host Public Room**, **Browse Public Lobby**, **Create 4-Digit PIN**, and **Join Private PIN**.
  - Purged boxed card divs, multi-game tabs, and tournament notices from the battleground lobby.
- **Clean Leaderboard Standings (`LeaderboardScreen.tsx`):**
  - Removed tournament banners and prize pills from competitor rank rows, presenting clean, live Southern African standings.
- **VIP Pro Tournament Pass (`VipPassScreen.tsx`):**
  - Consolidates the R500.00 Weekly Tournament prize pool and Top 8 cash allocations.
  - Designed in pure body typography with subtle hairline dividers, completely free of card div wrappers (`statusCard`, `prizeGrid`).
  - Monthly subscription model granting exclusive qualification to claim Top 8 Weekly Tournament cash prizes.

---


## Design System & Theme Architecture (Strict 60-30-10 & Tab-Only SVGs)

[![Colors](https://img.shields.io/badge/60--30--10-Background_%23FFFFFF_|_Surface_%23FFFFFF_|_Accent_%23E5A93C-E5A93C)](https://shields.io/)
[![Typography](https://img.shields.io/badge/Typography-Custom_Type_Scale-0F172A)](https://shields.io/)
[![Tab Icons](https://img.shields.io/badge/Bottom_Nav-Dedicated_SVGs-61DAFB)](https://shields.io/)
[![Verification](https://img.shields.io/badge/Verification-App_Logo_Emblem-E5A93C)](https://shields.io/)

- **60% Dominant Background:** Crisp Pure White (`#FFFFFF`) providing a clean, high-contrast, modern application canvas.
- **30% Panel & Surface:** Pure White (`#FFFFFF`) & Soft Slate Surface (`#F8FAFC`) with hairline borders (`rgba(15, 23, 42, 0.08)`) and subtle elevation shadows (`shadow.sm`, `shadow.md`, `shadow.pill`).
- **10% Accent:** Radiant Gold / Orange (`#E5A93C` / `#D97706`) strictly reserved for active states, primary CTAs, and winning moves.
- **Themed Dropdown Menus (`ThemedDropdown.tsx`):** Reusable aesthetic selection menus with 52px touchable trigger boxes, SVG chevron indicators, 60-30-10 active focus rings, and scrollable option lists featuring SVG checkmarks and regional badge indicators.
- **Bottom Navigation Tab SVGs (`TabIcons.tsx`):** Strictly reserved for the bottom navigation pill bar (`BattlegroundTabSvg`, `OfflineTabSvg`, `LeaderboardTabSvg`, `ProfileTabSvg`) with 16px compact geometry and dynamic focused tint.
- **Status Verification with App Logo:** For validation and verified status checkpoints (e.g. valid cellphone verification, completed step verification), the app's brand logo emblem (`assets/icon.png` with `borderRadius: 0`) is used.
- **Pure Text Throughout Application:** All other screens, forms, headers, alerts, and buttons use crisp native typography and typographic indicators (`→`, `←`, `▼`, `SHOW` / `HIDE`).
- **Typography Component (`Typography.tsx`):** Standardized `<Text>` abstraction with variants (`h1`, `h2`, `h3`, `body`, `caption`, `label`), font weights (`400`, `500`, `600`, `700`, `800`, `900`), and automatic color defaults.
- **Multiples-of-8 Spacing (Rule 15):** Strict `spacing` system (`sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`, `nav: 56`, `huge: 64`).
- **Complete Body Canvas Streamlining (Zero Divs / Zero Enclosing Cards):** All screens across the application (Battleground local duels, Offline Solo Arena, Regional Leaderboard, and Gamer Profile) eliminate card boxes, nested panel divs, and rounded container wrappers in favor of continuous body rows with subtle hairline dividers (`borderBottomColor: 'rgba(15, 23, 42, 0.08)'`).
- **Unrounded Body Images (0 Border Radius):** All images and brand emblems maintain zero border radius (`borderRadius: 0`) and unclipped bounds, seamlessly integrating into the dominant `#FFFFFF` body canvas.
- **Themed Popup System:** All user dialogs, errors, and alerts are rendered via custom `ThemedAlert` modals matching the 60-30-10 palette.
- **Centered Floating Pill Bottom Navigation (`CustomTabBar.tsx`):** Rule 20 compliant floating curved bottom navigation bar (`width: 280`, `height: 50`) with dynamic horizontal centering via `useWindowDimensions()` (`left: (width - 280) / 2`) to guarantee mathematically perfect horizontal centering across all Android and iOS display widths.
- **Calibrated Asset Pipeline (Build 13 Specifications):**
  - **Onboarding Assets (`assets/onboarding/1.png`, `2.png`, `3.png`):** Standard non-progressive PNGs with clean, space-free filenames, eliminating Android Fresco image decode crashes.
  - **Launcher, Icon & Splash Assets:** Restored to Build 13 specifications (`android-icon-foreground.png`, `favicon.png`, `icon.png`, `icon-original.png`, and `splash.png`) with crisp rendering and solid white canvas backgrounds.

---

## Directory Structure

```text
competitor/
|-- .github/
|   `-- workflows/
|       |-- build-native-apk.yml       # Direct GitHub Actions runner APK compilation with dynamic app.json versioning
|       `-- eas-ota-update.yml         # Dual-channel EAS OTA workflow
|-- assets/
|   |-- android-icon-foreground.png    # Build 13 Android launcher foreground asset
|   |-- favicon.png                    # Web favicon
|   |-- icon.png                       # Build 13 in-app and store brand emblem
|   |-- icon-original.png              # Build 13 raw high-resolution brand asset
|   |-- splash.png                     # Build 13 splash screen asset
|   `-- onboarding/                    # Optimized PNG illustration cards (1.png, 2.png, 3.png)
|-- scripts/
|   `-- generate_assets.py             # Rule 15/19 asset calibration generator
|-- src/
|   |-- components/
|   |   |-- Typography.tsx             # Standardized Text component with variants & weights
|   |   |-- common/
|   |   |   |-- AppSwitcherShield.tsx  # Multitasking privacy shield with Morabaraba branding
|   |   |   |-- ErrorBoundary.tsx      # Graceful crash shield with reload & cache reset actions
|   |   |   |-- Header.tsx             # Standard header with 24x24 brand logo (0 border radius)
|   |   |   |-- PasswordStrengthMeter.tsx # 4-segment 8+ char password validator
|   |   |   |-- SvgIcons.tsx           # Pure SVG icon suite for Settings, Security, and Legal (including FingerprintSvg)
|   |   |   |-- SwipeToSignUp.tsx      # Custom pan-responder swipe slider
|   |   |   |-- TerminalLockGate.tsx   # Root application lock gate with dual biometric/PIN authentication
|   |   |   |-- ThemedAlert.tsx        # 60-30-10 modal alert system replacing OS alerts
|   |   |   |-- ThemedDropdown.tsx     # Reusable 60-30-10 dropdown with SVG indicators
|   |   |   |-- UiverseSwitch.tsx      # 60-30-10 animated toggle switch
|   |   |   `-- UpdateModal.tsx        # Rule 21 dual-action on-demand OTA update modal
|   |   |-- game/
|   |   |   |-- CoinTossModal.tsx      # Fair animated 3D coin toss turn decider (alternates H/T)
|   |   |   |-- CompetitorProfileCard.tsx # 60-30-10 player profile inspection card with stats & actions
|   |   |   |-- MorabarabaBoard.tsx    # 24-vertex pure line intersection board layout
|   |   |   |-- MorabarabaPiece.tsx    # Authentic concentric carved African tokens
|   |   |   `-- RuleTipModal.tsx       # Unobtrusive 60-30-10 tactical rule violation tip modal
|   |   `-- navigation/
|   |       |-- CustomTabBar.tsx       # Centered floating pill tab bar with active indicator dot
|   |       `-- TabIcons.tsx           # 16px bottom tab bar SVGs (Rule 20)
|   |-- constants/
|   |   |-- ranks.ts                   # 10-tier Southern African ranking system & dynamic title evaluation
|   |   |-- regions.ts                 # Southern African countries, provinces, and towns
|   |   `-- theme.ts                   # Legacy theme metrics re-exported to src/theme
|   |-- engine/
|   |   |-- ai.ts                      # Heuristic & Minimax AI across 3 difficulties
|   |   |-- morabaraba.ts              # Mathematical board model and mill triplets
|   |   `-- morabarabaValidator.ts     # Strict rules, anti-bot speed limiter, and violation tips
|   |-- navigation/
|   |   |-- RootNavigator.tsx          # Dynamic initialRoute auth coordinator & unconditional stack screens
|   |   `-- TabNavigator.tsx           # Rule 20 floating pill bottom navigation with CustomTabBar
|   |-- screens/
|   |   |-- auth/
|   |   |   |-- LoginScreen.tsx        # Gamer Tag/Email credential sign in with Typography
|   |   |   `-- SignUpScreen.tsx       # 3-step progressive Southern African registration with step connectors
|   |   |-- battleground/
|   |   |   `-- BattlegroundScreen.tsx # 2-Player Pass & Play, stake selection, and online battleground
|   |   |-- games/
|   |   |   `-- GameDetailScreen.tsx   # Comprehensive guides for Morabaraba, Chess, and Checkers with coming soon state
|   |   |-- leaderboard/
|   |   |   `-- LeaderboardScreen.tsx  # Regional Southern African rankings
|   |   |-- legal/
|   |   |   |-- PrivacyPolicyScreen.tsx # Comprehensive POPIA/GDPR data rights & telemetry policy
|   |   |   `-- TermsOfServiceScreen.tsx # Authentic Morabaraba rules, anti-cheating & fair play
|   |   |-- offline/
|   |   |   `-- OfflineScreen.tsx      # Solo 1P vs CPU AI and 2-Player Pass & Play arena with route syncing
|   |   |-- onboarding/
|   |   |   `-- OnboardingScreen.tsx   # 3-slide crossfade art canvas, liquid sliding pill & SwipeToStartButton
|   |   |-- profile/
|   |   |   `-- ProfileScreen.tsx      # Gamer Tag career stats, wallet, and settings body rows
|   |   |-- wallet/
|   |   |   `-- VipPassScreen.tsx      # Dedicated VIP Pro Tournament Pass benefits, prize eligibility, and text activation
|   |   `-- settings/
|   |       |-- BlockedUsersScreen.tsx # Manage and unblock restricted competitors
|   |       |-- ChallengeArenaScreen.tsx # Dedicated target challenge arena province & town configuration
|   |       |-- DeleteAccountScreen.tsx # POPIA / GDPR irreversible account purge
|   |       |-- DeviceSessionsScreen.tsx # Terminal hardware specs & security audit trail
|   |       |-- ExportDataScreen.tsx   # Direct body typography AES-256 encrypted backup & open JSON export
|   |       |-- InactivityLockScreen.tsx # Inactivity lockout timer configuration
|   |       |-- PrivacyScreen.tsx      # Incognito matchmaking & public discoverability controls
|   |       `-- SecurityPinScreen.tsx  # 4-digit security PIN setup, change, and remove flows
|   |-- lib/
|   |   `-- supabase.ts                # Supabase client with AsyncStorage session persistence (anon key only)
|   |-- services/
|   |   |-- authService.ts             # Direct authentication with gamer tag / email credential login & updates
|   |   |-- battlegroundService.ts     # Public & private battle room creation & lobby discovery
|   |   |-- biometricService.ts        # Native biometric hardware inspection and authentication via expo-local-authentication
|   |   |-- encryptionService.ts       # Pure TypeScript FIPS 197 AES-256-CBC hardware encryption engine
|   |   |-- gameSyncService.ts         # High-frequency WebSocket match move & coin call broadcasting
|   |   |-- leaderboardService.ts      # Live regional Southern African leaderboard queries & stats
|   |   |-- pinSecurityService.ts      # Pure TypeScript SHA-256 PIN hashing with brute-force lockout
|   |   |-- privacyService.ts          # Matchmaking privacy, discovery, blocked accounts, and challenge regions
|   |   |-- sessionSecurityService.ts  # Device session specs, audit logging, and remote session revocation
|   |   |-- tournamentService.ts       # Weekly Monday-Sunday tournament cycle calculation, R500 Top 8 prize breakdown, and automated winner settlement
|   |   `-- walletService.ts           # VIP Pro Tournament Pass subscription management
|   |-- store/
|   |   `-- gameStore.ts               # Local persistence via AsyncStorage
|   |-- theme/
|   |   |-- colors.ts                  # 60-30-10 color palette tokens
|   |   `-- index.ts                   # Spacing (multiples of 8), platformSpecs, radius, shadow
|   `-- types/
|       |-- auth.ts                    # User profile and registration models
|       `-- game.ts                    # Game state, phase, player, and board types
|-- supabase/
|   |-- config.toml                    # Supabase local and remote configuration
|   `-- migrations/
|       `-- 20260927113651_new-migration.sql # Profiles, career_stats, battle_rooms, and match_logs schema
|-- .env.example                       # Template for client-safe EXPO_PUBLIC environment variables
|-- .gitignore                         # Excludes .agents, .env, node_modules, android/
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

# Configure environment variables
cp .env.example .env
# Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env

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
- **In-App Modal (`UpdateModal.tsx`):** Dual-action update prompt (Update Now / Remind Me Later) triggered on app launch and foreground resume (`AppState`), with 30-minute snooze timestamp persisted in `AsyncStorage` and 0-border-radius unrounded brand emblem. Bundle downloads are strictly deferred until the competitor confirms "Update Now", eliminating corrupted partial background cache builds.
- **Application Crash Shield (`ErrorBoundary.tsx`):** Root-level ErrorBoundary protecting against OS crash popups ("Morabaraba keeps stopping"), offering instant reload and cache reset actions.

### Managed Workflow & Ephemeral Android Directory Architecture
The repository operates under a standard **Expo Managed Workflow**:
- **Zero Local Native Bloat:** The `android/` and `ios/` folders are intentionally omitted from version control and strictly covered by `.gitignore`. The entire application code, UI components, and game logic reside in TypeScript and Expo configuration (`app.json`).
- **On-Demand CI Native Generation:** The `android/` directory is created dynamically on the GitHub Actions runner during the APK compilation step via `npx expo prebuild --platform android --no-install`. The runner compiles the release binary and discards the transient directory after artifact upload.
- **Local Development Cleanliness:** If `npx expo prebuild` or native commands are executed locally during debugging, an `android/` directory is generated in the workspace. Because it is gitignored, it does not pollute the git repository and can be safely purged at any time with `Remove-Item -Recurse -Force android` without affecting project source code.

