# Number Nexus

Number Nexus is an original, offline-first mathematical logic puzzle game for Android phones and tablets. It combines a touch-first HTML/CSS interface with procedural Three.js diagrams, category-based progression, daily play, stars, hints, local progress, accessibility settings, programmatic audio, optional haptics, and optional rewarded ads.

The project does not copy another game's branding, screens, artwork, wording, level arrangement, or puzzle data.

## Current content

- 6 always-available play-style categories
- 320 levels per category
- 1,920 total campaign levels
- 5,760 maximum campaign stars
- 80 Easy, 80 Normal, 80 Advanced, and 80 Expert levels per category
- Numeric input, multiple choice, operator selection, and drag-and-drop answers
- Three progressive hints, explanations, and solution steps for every level
- Deterministic offline daily puzzle and streak tracking
- Phone portrait and tablet portrait/landscape layouts
- Large text, high contrast, reduced motion, sound, music, and vibration settings
- Optional rewarded ads only; no forced interstitial ads

## Categories

1. **Number Patterns** — sequences, gaps, alternating rules, recurrences, and polynomial patterns
2. **Shape Logic** — triangles, squares, diamonds, crosses, and center-value relationships
3. **Equation Machines** — input/output rules, hidden operations, reverse calculations, and operators
4. **Grid Logic** — row, column, diagonal, and table relationships
5. **Number Rings** — opposite pairs, circular transformations, and rotational relationships
6. **Logic Mix** — symbols, balance puzzles, codes, mixed equations, and advanced combinations

Every category can be selected immediately. Progression happens independently inside each category: level 1 is available, and solving a level unlocks the next level in that same category. Difficulty tiers unlock naturally after the preceding 80 levels.

## Unique-level system

Campaign content is generated deterministically at build time from a curated set of rule families and parameter ranges. It is not an endless random generator.

Each puzzle contains:

- a unique puzzle ID
- a unique rule-and-parameter signature
- a unique rendered-content fingerprint
- one intended rule and clear answer
- three progressive hints
- an explanation and step-by-step solution

`validateCampaign()` rejects duplicate IDs, duplicate signatures, duplicate puzzle content, duplicate level numbers, repeated choices, missing answers, invalid hints, and categories with fewer than 300 levels.

## Technology

- Three.js with an orthographic camera and procedural canvas text sprites
- Strict TypeScript and Vite
- Vanilla HTML/CSS optimized for touch
- Capacitor 7 for Android packaging and lifecycle integration
- `@capacitor-community/admob` 7 for optional rewarded ads and consent flow
- LocalStorage with versioned save migrations
- Vitest for puzzle, progression, answer, daily, and save tests
- Vite PWA plugin for installability and offline caching
- ESLint and Prettier

## Project layout

```text
src/
├── app/                    navigation, lifecycle, and screen composition
├── core/                   Three.js, audio, haptics, and rewarded ads
├── progression/            stars, category progression, statistics, and daily streaks
├── puzzles/
│   ├── data/
│   │   ├── categoryGenerators.ts
│   │   ├── campaign.ts
│   │   └── helpers.ts
│   ├── renderers/          reusable procedural Three.js renderer
│   ├── AnswerValidator.ts
│   ├── PuzzleRegistry.ts
│   ├── PuzzleTypes.ts
│   └── PuzzleValidator.ts
├── storage/                save schema, defaults, persistence, and migration
├── tests/                  Vitest suites
├── ui/                     DOM helpers
├── main.ts
└── styles.css
```

The older `chapter1.ts` through `chapter6.ts` files are retained as legacy reference content but are no longer registered in the live campaign.

## Install and run

Node.js 22 or newer is recommended.

```bash
npm install
npm run dev
```

Vite prints a LAN address that can be opened on a phone or tablet on the same network.

## Verify

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Android setup

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

### Package ID and app name

Edit `capacitor.config.ts` before publishing:

```ts
appId: 'com.yourcompany.numbernexus',
appName: 'Number Nexus'
```

If the Android project was already generated, regenerate it after changing the package ID.

## Optional rewarded ads

The game never forces an advertisement between puzzles. Rewarded-ad buttons are voluntary and grant two hint tokens only after the rewarded video finishes.

Rewarded ads are offered in these places:

- main menu reward button
- puzzle action panel
- no-hint-token dialog

### 1. Create AdMob IDs

Create an Android app in AdMob and create a **Rewarded** ad unit. You need two different values:

- AdMob application ID
- Rewarded ad unit ID

### 2. Configure Android application ID

After generating the Android platform, add this under `<application>` in `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="@string/admob_app_id" />
```

Add this in `android/app/src/main/res/values/strings.xml`:

```xml
<string name="admob_app_id">YOUR_ADMOB_APPLICATION_ID</string>
```

### 3. Configure the rewarded ad unit

Create `.env.production` in the project root:

```env
VITE_ADMOB_REWARDED_ANDROID_ID=ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
```

Do not commit real monetization IDs when working from a public template repository unless that is intentional.

Development builds use Google's official Android rewarded test unit. Production Android builds do not fall back to a test reward when the environment variable is missing.

### 4. Sync Android

```bash
npm install
npm run android:sync
```

### 5. Consent and privacy

The ad manager requests consent information before requesting a native ad. Settings includes an **Ad privacy choices** action that can reopen the consent flow. Before release, configure your AdMob privacy messages, publish a privacy policy, complete the Google Play Data safety form, and verify whether the game is intended for children or mixed audiences.

## Save data

Progress is stored under the browser key `number-nexus-save` and includes:

- schema and app version
- per-level completion, stars, hints, and attempts
- hint-token balance
- last played level
- daily completion and reward dates
- current and longest streaks
- rewarded-ad count
- statistics and accessibility/audio settings

Schema version 3 migrates old chapter-based saves into the matching category IDs while preserving completed levels and best stars.

## Add or modify campaign content

The live campaign is assembled in `src/puzzles/data/categoryGenerators.ts`.

Each category contains rule-family generators for all four tiers. When adding a family:

1. Produce deterministic inputs.
2. Assign a new `uniquenessKey` pattern.
3. Keep the solution rule explicit.
4. Provide three hints and solution steps.
5. Avoid parameter ranges already used by another family.
6. Run the full test and validation suite.

The development-only puzzle debugger lists all 1,920 levels and reports validation issues.

## Build an APK or App Bundle

In Android Studio:

1. Open the generated `android/` project.
2. Use **Build → Generate App Bundles or APKs**.
3. Choose APK for local testing or Android App Bundle for Google Play.
4. Create and securely store a release signing key.
5. Test the signed release on multiple phones and tablets.
6. Test ads using test configuration before switching to the production ad unit.

## Publishing checklist

- Replace the temporary package ID
- Replace placeholder icons and final branding if needed
- Add AdMob application and rewarded-unit IDs
- Configure AdMob privacy messages
- Publish a privacy policy
- Complete Google Play Data safety and ads declarations
- Test phone portrait and tablet portrait/landscape layouts
- Test offline launch and save migration
- Run typecheck, lint, tests, and production build
- Generate and test a signed Android App Bundle

## Known limitations

- Progress is device-local; there is no account or cloud synchronization.
- Daily puzzles are selected from bundled content rather than downloaded from a server.
- The native Android directory is generated locally and is not committed.
- Real ad revenue requires valid AdMob IDs, consent configuration, store declarations, and an approved published app.
