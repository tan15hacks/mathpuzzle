# Category Expansion

Number Nexus now uses six always-available play-style categories instead of gated chapters.

## Campaign scale

- 6 categories
- 320 levels per category
- 1,920 total levels
- 80 Easy, 80 Normal, 80 Advanced, and 80 Expert levels in every category

Categories are selectable immediately. Progression remains sequential inside each chosen category so difficulty rises naturally.

## Content uniqueness

Every generated level includes a unique ID and a rule-and-parameter signature. Campaign validation rejects duplicate IDs, duplicate level numbers, duplicate signatures, and duplicate rendered problem fingerprints.

The campaign intentionally reuses broad puzzle mechanics, such as sequences and grids, while varying the exact numbers, layouts, rules, parameters, prompts, and answers so exact problems are not duplicated.

## Monetization

Only opt-in rewarded advertising is supported. Players may voluntarily watch a rewarded video for two hint tokens. There are no forced interstitial advertisements.

Production releases require the developer's AdMob application configuration and `VITE_ADMOB_REWARDED_ANDROID_ID`. Development builds use Google's Android rewarded test unit.
