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

The calculator implements IRCC's published CRS grid for the rules in force **until November 2, 2026** (grid version `2025-03-25`). The rules, benchmark, and source links live in `src/features/crs/rules.ts`; the scoring engine is `src/features/crs/calculate.ts`.

- **Not included:** job offer points, or the high-wage occupation points IRCC introduces on **November 3, 2026**. Both are disclosed in the form and the result screen rather than guessed at.
- **First official language is assumed to be English.** French is captured through the second-language section and the NCLB 7 bonus. A French-first applicant should read the result as an estimate.
- **It is an estimate.** IRCC calculates the official score after you submit an Express Entry profile. Always confirm on [canada.ca](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html).
- **Colour bands** compare against the latest Canadian Experience Class draw at the time of writing: **519 on October 15, 2026**, 2,500 invitations. Cutoffs change every draw, so the comparison is labelled with its date.
- The score is shown as **X / 1,200** with a percentage bar, not a misleading X/100.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server (dev client if installed) |
| `npm run start:go` | Start Expo and force Expo Go |
| `npm run web` | Start the web version in a browser |
| `npm run android` / `npm run ios` | Open on an emulator/simulator |
| `npm run typecheck` | TypeScript check with no output files |
| `npm run a11y:contrast` | Check design tokens against WCAG AA contrast ratios |

## Project structure

```
src/
  app/
    _layout.tsx            Providers: auth, CRS, fonts, splash
    login.tsx              Sign in / sign up, Google, preview mode
    crs.tsx                CRS questionnaire or saved result
    privacy.tsx            Public privacy policy
    terms.tsx              Public terms of use
    accessibility.tsx      Public accessibility statement
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
    crs/rules.ts           Official CRS grid, benchmark, bands, metadata
    crs/calculate.ts       Pure scoring engine (tested)
    crs/crs-provider.tsx   Load/save scores; Supabase + device fallback
    crs/crs-form.tsx       Questionnaire
    crs/crs-result.tsx     Score result and breakdown
  lib/
    supabase.ts            Client, config check, auth options
    device-storage.ts      Web localStorage fallback
    haptics.ts             Native haptics, no-op on web
  theme/tokens.json        Colours, radius, spacing
supabase/migrations/       SQL to paste into the Supabase SQL editor
assets/images/             App icon, adaptive icon, splash, favicon
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

## Troubleshooting

- **Login shows "Connect Supabase to turn on accounts"**: `.env` is missing or the dev server started before it was saved. Fix the file, stop the server, and start it again.
- **Google sign-in does nothing on the phone**: Google is web-only in Phase 1. Use email/password or preview mode on mobile.
- **A saved score is not in Supabase**: confirm the migration was run and that you are signed in, not in preview mode. The score is still cached on the device.
- **Port 8081 is busy**: close the other Metro process, or use `npx expo start --web --port 8082`.
- **Expo Go shows an incompatible SDK message**: update Expo Go — this project uses Expo SDK 58.

## Data and privacy boundaries

MapleRoute never asks for your IRCC password, UCI, or passport number. In the local build, the account email, CRS answers, guide progress, document dates and band scores are stored in the browser on the device. When Supabase is connected, the email and CRS snapshots are stored in your Supabase project with Row Level Security; guide and planner data stay local.

Settings → **Delete my account and data** clears every per-account key on the device and signs out. For hosted accounts it also deletes the auth user through `supabase/migrations/20261105_delete_own_account.sql`; run that after the Phase 1 SQL. The profiles and CRS snapshot rows are removed by the existing `on delete cascade` rules.

The privacy policy, terms and accessibility statement are public routes: `/privacy`, `/terms` and `/accessibility`.

`npm run a11y:contrast` checks the colour tokens against WCAG AA. Keyboard focus is visible, while mouse clicks do not leave a focus ring.

Immigration requirements, fees, and steps are stored as data with a `source_url` (canada.ca / IRCC), a `last_verified` date, and a version — not hardcoded in screens.
