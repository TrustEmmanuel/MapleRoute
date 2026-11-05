# MapleRoute

MapleRoute is a step-by-step companion for applying for Canadian Permanent Residence. It is an independent guide — not legal or immigration advice, and not affiliated with IRCC or the Government of Canada.

The app is built with Expo (React Native + TypeScript) so one codebase runs on iOS, Android, and the web.

**Current status: Phase 1 — accounts and the CRS check.** You can create an account, answer the CRS questionnaire, and see a colour-coded score. The page-by-page Express Entry walkthrough comes in Phase 2, using screenshots supplied by the product owner.

## What Phase 1 includes

- **Sign in / sign up** with email and password, plus Google on the web. Sessions persist on the web; the native session layer moves to `expo-secure-store` before store submission.
- **Guarded routes.** Signed-out visitors go to `/login`; the Home and Settings tabs require a session.
- **CRS check** (`/crs`): a complete questionnaire covering age, education, first and second official language, Canadian and foreign work, spouse factors, skill transferability, and bonus points.
- **Colour-coded score** shown top-left on Home: green at or above the latest CEC cutoff, dim yellow within 49 points, red more than 49 points below.
- **Score breakdown** by section, with the rules version, last-verified date, and a link to the official canada.ca criteria.
- **Preview mode** when Supabase is not configured: the CRS check works, and the score is stored on the device only.
- **Desktop web layout**: a top navigation bar with the score, and the mobile bottom tabs below 900px.

## 1. Install

```bash
npm install
```

## 2. Connect Supabase

1. Create a project at https://supabase.com (or open the existing one).
2. In the Supabase dashboard, open **Project Settings → API**.
3. Copy the **Project URL** and the **anon public** key.
4. Create your local env file:

   ```bash
   cp .env.example .env
   ```

   On Windows Command Prompt: `copy .env.example .env`.

5. Edit `.env`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

6. Restart the dev server. Expo inlines `EXPO_PUBLIC_*` values when the bundle starts.

Use **only** the anon public key. Never put the `service_role` key in `.env` or anywhere in the client — it bypasses Row Level Security.

### Run the Phase 1 SQL

Open **SQL Editor** in the Supabase dashboard, paste the whole of:

```
supabase/migrations/20261029_phase1_auth_crs.sql
```

and run it. It creates:

| Table | Purpose | RLS |
| --- | --- | --- |
| `profiles` | One row per account, created automatically on sign-up | Read/update own row only |
| `crs_snapshots` | Every saved CRS score with inputs and breakdown | Read/insert/delete own rows only |

The migration is safe to rerun: policies are dropped and recreated.

### Auth providers

Email/password is on by default. To turn on Google:

1. In Google Cloud Console, create an OAuth 2.0 Web client.
2. Add the authorised redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`.
3. In Supabase, open **Authentication → Providers → Google**, enable it, and paste the client ID and secret.
4. In **Authentication → URL Configuration**, set the Site URL to your production URL and add these redirect URLs:
   - `http://localhost:8081`
   - `http://localhost:8081/**`
   - your production domain (and `/**`)

Until the env values exist, the app runs in preview mode and shows "Connect Supabase to turn on accounts" on the login screen.

## 3. Run it

### Website (local)

```bash
npm run web
```

Open http://localhost:8081. On desktop the content sits in a readable column under a top navigation bar; on a phone-width window the native bottom tabs appear.

### Phone with Expo Go

```bash
npm run start:go
```

Scan the QR code with the Camera app (iOS) or the Expo Go scanner (Android). If the network blocks the connection, use `npx expo start --go --tunnel`.

### Native development build (later)

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --profile development --platform android
```

The EAS profiles in `eas.json` are `development` (day-to-day), `preview` (testers), and `production` (stores).

## The CRS calculator: scope and limits

The calculator implements IRCC's published CRS grid for the rules in force **from November 3, 2026** (rules version `2026-11-03`). The rules and source links live in `src/features/crs/rules.ts`; the scoring engine is `src/features/crs/calculate.ts`. The latest draw shown on the home and result screens comes from `content/draws.json`.

- **Labour Market Integration.** Canadian work experience in a high-wage occupation and a qualifying high-wage job offer are scored in the same factor, and the higher of the two is used — never both. Tiers and point values follow the IRCC CRS criteria page. The old arranged-employment (LMIA) points are gone.
- **First official language is assumed to be English.** French is captured through the second-language section and the NCLB 7 bonus. A French-first applicant should read the result as an estimate.
- **It is an estimate.** IRCC calculates the official score after you submit an Express Entry profile. Always confirm on [canada.ca](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html).
- **Colour bands** compare against the latest Express Entry draw in `content/draws.json` (**477 on October 28, 2026**, Transport Occupations, 2026-Version 2). Cutoffs change every draw, so the comparison is labelled with its date and stream. If draws are paused or the latest draw is more than 14 days old, the screens show IRCC's paused-draws note instead of implying a current cutoff.
- The score is shown as **X / 1,270** with a percentage bar, not a misleading X/100. The maximum is 1,270 with or without a spouse.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server (dev client if installed) |
| `npm run start:go` | Start Expo and force Expo Go |
| `npm run web` | Start the web version in a browser |
| `npm run android` / `npm run ios` | Open on an emulator/simulator |
| `npm run typecheck` | TypeScript check with no output files |
| `npm test` | Run the CRS unit tests with Vitest |
| `npm run a11y:contrast` | Check design tokens against WCAG AA contrast ratios |

## Project structure

```
src/
  app/
    _layout.tsx            Providers: auth, CRS, guide, PWA, fonts, splash
    login.tsx              Sign in / sign up, Google, preview mode
    crs.tsx                CRS questionnaire or saved result
    privacy.tsx            Public privacy policy
    terms.tsx              Public terms of use
    accessibility.tsx      Public accessibility statement
    share.tsx              Public progress card; opens without an account
    (tabs)/
      _layout.tsx          Auth guard, tabs, desktop web header
      index.tsx            Home: score badge, next action, journey
      settings.tsx         Account, app details, privacy, disclaimer
  components/
    brand.tsx              Maple leaf mark and brand lockup
    crs-score-badge.tsx    Score badge, band chip, score bar
    web-nav.tsx            Desktop top navigation
    disclaimer.tsx         Independent-guide notice
    screen.tsx             Shared page frame
    ui/                    Text, Button, Card, fields, SelectField, ChoiceGroup
  features/
    account/clear-account-data.ts  Per-account storage cleanup for deletion
    auth/auth-provider.tsx Session, sign in/up/out, delete, preview mode
    crs/rules.ts           Official CRS grid, bands, metadata
    crs/draws.ts           Latest draw data loaded from content/draws.json
    crs/calculate.ts       Pure scoring engine (tested)
    crs/crs-provider.tsx   Load/save scores; Supabase + device fallback
    crs/crs-form.tsx       Questionnaire
    crs/crs-result.tsx     Score result and breakdown
    pwa/pwa-provider.tsx   Install prompt, offline status, service worker
    pwa/install-card.tsx   Install card on Home and Settings
    share/share-link.ts    Share text, URL and WhatsApp helpers
    share/share-progress.tsx  Share button and fallback dialog
  lib/
    supabase.ts            Client, config check, auth options
    device-storage.ts      Web localStorage fallback
    haptics.ts             Native haptics, no-op on web
  theme/tokens.json        Colours, radius, spacing
supabase/migrations/       SQL to paste into the Supabase SQL editor
assets/images/             App icon, adaptive icon, splash, favicon
public/                    PWA manifest, service worker, install icons, guide screenshots
```

Design tokens live in `src/theme/tokens.json` and feed both `tailwind.config.js` and TypeScript. Change a colour once and both pick it up.

## Web build and hosting

```bash
npx expo export --platform web
```

The output goes to `dist/`. Expo web is a single-page app, so a static host must rewrite unknown paths to `index.html`. On Netlify, add `netlify.toml` at the project root:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Install and offline reading

The web build is an installable app. `public/manifest.webmanifest` sets the home-screen name, icons and shortcuts, and launches the guide, so an installed app opens at the step saved for the account. `public/sw.js` caches the app shell, hashed JS/CSS/fonts and guide screenshots.

- The service worker registers only in production builds (`npx expo export`), not in `npm run web`.
- Step text ships inside the cached JS bundle. Screenshots are saved when their section is opened and served cache-first.
- Offline navigation falls back to the cached app shell; a guide opened offline resumes at the last saved step.
- Bump `VERSION` in `public/sw.js` when the shell or a screenshot at an existing path changes, so devices fetch the new copy.
- The install card appears on Home (phones) and in Settings, and disappears once the app is installed. iPhone and iPad instructions point to Safari's Add to Home Screen.

## Shareable progress card

Once the guide has started or a CRS score is saved, the home score card offers **Share my progress**. It opens the phone's share sheet when the browser supports it; otherwise it opens a dialog with WhatsApp and copy-link actions. The message reads like `My Express Entry plan — 12 of 53 steps, CRS 512.` followed by the link.

The link points to `/share?done=12&total=53&score=512`. That page is public: it does not read the account or require a login, and it renders only the two counts and the score from the query string. It never contains an email, a name or any answers. The page ends with a **Build my own plan** button that opens the guide.

## Troubleshooting

- **Login shows "Connect Supabase to turn on accounts"**: `.env` is missing or the dev server started before it was saved. Fix the file, stop the server, and start it again.
- **Google sign-in does nothing on the phone**: Google is web-only in Phase 1. Use email/password or preview mode on mobile.
- **A saved score is not in Supabase**: confirm the migration was run and that you are signed in, not in preview mode. The score is still cached on the device.
- **Port 8081 is busy**: close the other Metro process, or use `npx expo start --web --port 8082`.
- **Expo Go shows an incompatible SDK message**: update Expo Go — this project uses Expo SDK 58.

## Data and privacy boundaries

MapleRoute never asks for your IRCC password, UCI, or passport number. In the local build, the account email, CRS answers, guide progress, document dates and band scores are stored in the browser on the device. When Supabase is connected, the email and CRS snapshots are stored in your Supabase project with Row Level Security; guide and planner data stay local.

Settings → **Delete my account and data** clears every per-account key on the device and signs out. For hosted accounts it also deletes the auth user through `supabase/migrations/20261105_delete_own_account.sql`; run that after the Phase 1 SQL. The profiles and CRS snapshot rows are removed by the existing `on delete cascade` rules.

The privacy policy, terms and accessibility statement, and progress-card page are public routes: `/privacy`, `/terms`, `/accessibility` and `/share`.

`npm run a11y:contrast` checks the colour tokens against WCAG AA. Keyboard focus is visible, while mouse clicks do not leave a focus ring.

Immigration requirements, fees, and steps are stored as data with a `source_url` (canada.ca / IRCC), a `last_verified` date, and a version — not hardcoded in screens.
