# Number Nexus

Number Nexus is an original, offline-first mathematical logic puzzle game for Android phones and tablets. It combines a lightweight HTML/CSS interface with procedural Three.js diagrams, category-based progression, daily play, stars, hints, local progress, accessibility settings, programmatic audio, optional haptics, and optional rewarded-ad hooks.

The visual and puzzle systems were created specifically for this project. The repository does not include copied screens, branding, artwork, or level data from another game.

## Technology

- Three.js with an orthographic camera and procedural canvas-text sprites
- Strict TypeScript and Vite
- Vanilla HTML/CSS UI optimized for touch
- Capacitor 7 for Android packaging, lifecycle, haptics, splash screen, and status bar
- LocalStorage with versioned migrations
- Vitest for puzzle, progression, streak, answer, and migration tests
- Vite PWA plugin for installability and offline caching
- ESLint and Prettier

## Included game content

- 6 unlocked categories / play styles
- 320 levels per category, for 1,920 total bundled levels
- Difficulty bands inside every category: Easy levels 1–80, Normal 81–160, Advanced 161–240, Expert 241–320
- Category-local progression: every category starts unlocked, but levels progress sequentially inside that category
- Numeric keypad, multiple-choice, operator-selection, and drag-and-drop answer modes
- Sequences, alternating patterns, shape codes, triangles, equations, input/output machines, grids, counting-style logic, rings, balances, and symbol values
- Three progressive hints and a step-by-step explanation for every generated level
- 1–3 stars based on hint use; attempts never reduce stars
- Offline deterministic daily puzzle and streak history
- Replay, statistics, star milestones, and hint-token rewards
- Optional rewarded-ad buttons for free hints and post-level bonus hint tokens
- Phone portrait and tablet portrait/landscape layouts
- Large text, high contrast, reduced motion, sound volume, music volume, and vibration controls
- Development-only puzzle debugger and full campaign validator

## Categories

| Category | Levels | Focus |
|---|---:|---|
| Number Sequences | 320 | Trails, gaps, alternating rules, and position patterns |
| Shape Logic | 320 | Triangles, corners, and visual number codes |
| Equation Machines | 320 | Inputs, outputs, missing operators, and reverse rules |
| Grid Puzzles | 320 | Rows, columns, and compact logic tables |
| Number Rings | 320 | Opposites, circles, and clock-like relationships |
| Mixed Logic | 320 | Symbols, balances, drag puzzles, and expert vaults |

All categories are available from the start. Completing a level unlocks the next level only inside that same category, so players can freely choose the puzzle style they want without being forced through a chapter chain.

## Puzzle uniqueness model

The expanded library is generator-backed rather than manually typed one-by-one. Each generated level receives:

- a unique puzzle ID
- a unique category and level number
- a difficulty band
- procedural puzzle data
- one or more accepted answers
- three hints
- an explanation
- solution steps
- a normalized signature

`validateCampaign()` checks duplicate IDs, duplicate level numbers inside a category, missing difficulty metadata, missing signatures, duplicate choices, missing answers, invalid hints, and duplicate normalized signatures. This prevents exact duplicate generated levels and catches repeated signatures before shipping.

## Optional ads and monetization

The game has no forced advertisements. Categories, levels, hints, solving, and progress are not ad-gated.

Rewarded placements are optional only:

- free hint when the player has no hint tokens
- post-level bonus for +2 hint tokens

The current implementation uses `MockRewardedAdProvider` in `src/monetization/RewardedAds.ts`. It simulates a completed rewarded ad so the game remains buildable and testable without bundling a real ad SDK. Replace this provider with Google AdMob or another rewarded-ad provider when preparing the Android release.

## Project layout

```text
src/
├── app/                 navigation, lifecycle, and screen composition
├── core/                Three.js, audio, and haptics services
├── monetization/        rewarded-ad abstraction and mock provider
├── progression/         stars, unlocking, statistics, and daily streak logic
├── puzzles/
│   ├── data/            generated category library and campaign registry
│   ├── renderers/       reusable procedural Three.js puzzle renderer
│   ├── AnswerValidator.ts
│   ├── PuzzleRegistry.ts
│   ├── PuzzleTypes.ts
│   └── PuzzleValidator.ts
├── storage/             save schema, defaults, persistence, and migration
├── tests/               Vitest suites
├── ui/                  DOM helpers
├── main.ts
└── styles.css
```

## Install and run

Node.js 22 or newer is recommended.

```bash
npm install
npm run dev
```

Vite prints a LAN address that can be opened on a phone or tablet connected to the same network.

## Verify the project

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

A production build is written to `dist/`. Preview it with:

```bash
npm run preview
```

## Android setup

The web application and Capacitor configuration are committed. Generate the native Android project after installing dependencies:

```bash
npm run android:add
npm run android:sync
npm run android:open
```

Equivalent direct commands:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio can then run the application on a device or emulator.

### Change the package ID and app name

Edit `capacitor.config.ts`:

```ts
appId: 'com.yourcompany.numbernexus',
appName: 'Number Nexus'
```

Change the package ID before publishing. After changing it, remove and regenerate the local `android/` directory if the platform was already created.

### Build an APK or App Bundle

In Android Studio:

1. Open the generated `android/` project.
2. Use **Build → Generate App Bundles or APKs**.
3. Choose APK for local testing or Android App Bundle for Google Play.
4. Create and securely store a release signing key.
5. Test the signed release on phones and tablets before upload.

## PWA and offline behavior

`vite-plugin-pwa` generates the service worker and web manifest during production builds. After the first successful installation or load, the application shell and puzzle content are available offline. The daily puzzle is selected deterministically from the bundled puzzle pool and does not require a server.

## Save data

Progress is stored under the browser key `number-nexus-save`. The save contains:

- schema and app version
- completed levels, best stars, hints, and attempts
- hint-token balance
- latest level
- daily completion and reward dates
- current and longest streak
- statistics and accessibility/audio settings

`migrateSave()` upgrades older shapes into schema version 2. Meaningful progress changes are saved immediately.

## Add or adjust generated puzzles

The generated category library lives in `src/puzzles/data/generatedCategories.ts`.

To add or adjust a category:

1. Add or edit a category generator function.
2. Add a `CategorySpec` entry with ID, title, subtitle, icon, accent, and generator.
3. Keep `LEVELS_PER_CATEGORY` at 320 or update tests and totals if the content target changes.
4. Ensure every generated puzzle has unique signature metadata.
5. Run `npm test` and confirm `validateCampaign()` reports no issues.

Every generated puzzle still needs:

- a unique ID
- valid category and level number
- type and answer mode
- procedural puzzle data
- one or more accepted answers
- three hints with levels 1, 2, and 3
- an explanation and solution steps
- difficulty band metadata
- a normalized signature

## Branding and assets

- App title and visible copy: `src/app/App.ts`
- Palette and component styling: `src/styles.css`
- PWA name and colors: `vite.config.ts`
- Android name and package: `capacitor.config.ts`
- Replaceable SVG icons: `public/icons/`

All current puzzle visuals are procedural. There are no required raster textures or paid assets.

## Audio

`src/core/AudioManager.ts` synthesizes short legal-to-use tones with Web Audio. It contains no sampled or copyrighted recordings. Replace it with licensed files later while keeping the same public `play()` interface.

## Development debugger

When `import.meta.env.DEV` is true, the main menu exposes a puzzle debugger. It can:

- list and open every puzzle
- run campaign validation
- show validation errors
- mark a selected puzzle complete
- reset a selected puzzle
- exercise every answer mode through the normal puzzle screen

It is excluded from normal production navigation.

## Known limitations

- The native `android/` directory is generated locally rather than committed, keeping the repository lightweight and avoiding machine-specific Gradle state.
- Progress is device-local; there is intentionally no account or cloud synchronization.
- Daily puzzles come from the bundled pool. Server-delivered live content can be added later without changing the campaign system.
- The rewarded-ad provider is a mock provider until you connect a real Android ad SDK such as AdMob.
- App-store screenshots, final brand illustrations, privacy-policy hosting, release signing, and store listing text remain publishing tasks rather than runtime code.

## Suggested future additions

- Real AdMob rewarded-ad provider for Android release builds
- Optional curated puzzle packs delivered as signed JSON
- Localization and right-to-left layout support
- Cloud backup as an opt-in feature
- Additional tablet-specific split-screen diagrams
- More accepted-answer explanations for intentionally open-ended puzzles
