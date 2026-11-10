# TrackMyPurse — Product & Build Plan

## Context

The user wants **TrackMyPurse**, a personal finance app with two parts:
1. An **iOS mobile app** that photographs receipts, extracts the data (vendor, amount, date), auto-categorizes the expense, and syncs it to a shared dashboard — plus recurring-expense tracking, reminders, quick to-dos/shopping notes, and everyday account features (lock, backup, currency, tags, CSV export).
2. A **web app** that is view-only for the dashboard — financial position, spend vs. income, and monthly/yearly budgets.

Reference/inspiration: [easy-expense.com](https://www.easy-expense.com/) and its [App Store listing](https://apps.apple.com/us/app/receipt-scanner-easy-expense/id1528787066), plus two UI mood-board screenshots the user saved locally ([Expense Tracker _ Ref 01.png](Expense%20Tracker%20_%20Ref%2001.png), [Expense Tracker _ Ref 02.png](Expense%20Tracker%20_%20Ref%2002.png)) showing a dark-card balance/budget home screen, a numeric-keypad "add transaction" screen, and a daily/weekly/monthly income-vs-expense bar chart — the screen list below is designed to match that visual style.

Easy Expense is built for **freelancers/small businesses and taxes** (tax-deductible categories, mileage tracking, expense reports for reimbursement, bank/card linking). TrackMyPurse stays **personal-finance focused**: no mileage tracker, no tax categories, no expense-report/reimbursement workflow, no bank linking for the MVP — scan/log an expense, track recurring bills, stay under budget, on both a phone and a browser.

This is a **greenfield project** (empty directory, no existing code), so this plan defines the product scope, tech stack, and full page/screen inventory for both apps before any code is written. The user has already confirmed the main feature set aligns with their idea and added a round of features (recurring expenses, reminders, to-dos, app security/backup/tags) plus switched the OCR approach to the Claude API. This plan reflects that latest scope; once approved, its output should also be written as `PLAN.md` in the project root.

## Decisions made (with the user)

- **Mobile + web stack:** Cross-platform mobile via **React Native (Expo)**, web via **Next.js/React** — so business logic, data models, and API calls can be shared between the two, and Android is a near-free option later.
- **Receipt data extraction: Claude API (vision), not on-device OCR.** The user changed their mind from on-device ML Kit OCR to calling the Claude API with the receipt photo, because it reads messy/crumpled/handwritten receipts far better and can return structured JSON (vendor, amount, date, suggested category) plus a suggested tag in one pass. Tradeoffs to design around: it costs a small fee per scan, requires internet at scan time (queue-and-retry when offline), and the API key must live server-side, never in the mobile app bundle.
- **Backend:** **Supabase** (Postgres + Auth + Storage + Realtime + Edge Functions). Real SQL aggregation suits budgets/analytics/recurring-due queries, Row Level Security isolates each user's data, Storage holds receipt images, Realtime powers instant mobile→web sync, and an Edge Function is where the Claude API call and the recurring-reminder scheduler live (keeping secrets off the client).
- **Sync scope for MVP:** Receipt-to-dashboard sync only. No bank/credit-card account linking (Phase 2 item) — every transaction originates from a scanned receipt, a manual entry, or an auto-generated recurring transaction.

## Tech stack summary

| Layer | Choice |
|---|---|
| iOS/Android app | React Native + Expo |
| Web app | Next.js (React) + Tailwind |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions, pg_cron) |
| Receipt data extraction | Claude API (vision) called from a Supabase Edge Function — mobile never calls Claude directly |
| Recurring reminders | pg_cron scheduled Edge Function → Expo push notifications |
| App lock | Local biometric/PIN via Expo LocalAuthentication (device-level, not server-side) |
| Charts | A React Native chart lib (mobile) + a React charts lib (web), sharing the same color/category palette |
| Auth | Supabase Auth: email/password + Sign in with Apple (recommended for iOS UX and App Store policy) |

## Data model (Supabase/Postgres)

- `users` — Supabase Auth user + profile (display name, currency, avatar)
- `categories` — `id, user_id (nullable = global default), name, icon, color, is_default`
- `tags` — `id, user_id, name, color` (free-form, independent of category — e.g. "Trip to Goa", "Reimbursable")
- `transactions` — `id, user_id, type (income|expense), amount, currency, category_id, vendor, date, payment_method, notes, receipt_image_url, source (scan|manual|recurring), recurring_id (nullable), created_at`
- `transaction_tags` — join table `transaction_id, tag_id` (many-to-many)
- `recurring_transactions` — `id, user_id, title, amount, currency, category_id, type (income|expense), frequency (weekly|monthly|yearly), next_due_date, reminder_days_before, auto_create (bool), active (bool)`
- `budgets` — `id, user_id, period (monthly|yearly), scope (overall|category_id), amount, start_date`
- `todos` — `id, user_id, list_type (todo|shopping), text, is_done, created_at`
- Storage bucket `receipts/` for captured receipt photos, referenced by `transactions.receipt_image_url`

Default categories (seeded, editable/extendable): Food & Drink, Shopping, Transport, Bills & Utilities, Subscriptions, Health, Entertainment, Travel, Education, Others. Tags are separate and unconstrained (a transaction keeps exactly one category but can carry multiple tags).

## Receipt capture → categorization pipeline (Claude API)

1. User taps **Scan Receipt**; camera opens with a live edge-detection guide (or picks a photo from the gallery).
2. Photo is cropped/perspective-corrected on-device, then uploaded to Supabase Storage.
3. Mobile calls a **Supabase Edge Function** with the image reference; the Edge Function calls the **Claude API** (vision) with the receipt image and a prompt asking for structured JSON: vendor, total amount, currency, date, a suggested category (from the user's category list), and a suggested tag if one applies.
4. If the device is offline, the scan is queued locally and the Edge Function call retries automatically once back online.
5. **Receipt Review screen** shows the parsed fields pre-filled and editable — user confirms or corrects, then saves. (Kept even with a smarter model, since totals/dates on real-world receipts still warrant a glance before saving.)
6. On save, the transaction + receipt image reference persist in Postgres; Realtime pushes the change so the web dashboard updates without a manual refresh.
7. Vendor→category corrections the user makes are remembered per vendor to bias future suggestions (both the Claude prompt and a local override table).

## Recurring expenses & reminders

- User can mark any transaction "Recurring" (weekly/monthly/yearly) or create one directly from the Recurring screen — e.g. rent, subscriptions, EMIs.
- A `pg_cron` job (server-side) scans `recurring_transactions` daily; `reminder_days_before` a due date it sends an Expo push notification ("Netflix ₹649 due in 3 days"), and on the due date itself either auto-creates the transaction (if `auto_create` is on) or prompts the user to confirm it happened.
- Recurring items surface on the mobile Home ("Upcoming Bills," matching the mood-board reference) and have their own management screen.

## Mobile app (iOS) — screens

Bottom tab bar: **Home · Transactions · Scan (center button) · Analytics · Profile** (matching the reference mockups' nav layout). To-Dos/Shopping Notes and Recurring sit one level in from Home, not on the tab bar, to keep it uncluttered.

1. **Onboarding** (first launch only) — 3–4 slides on the value prop, permissions priming (camera, notifications, Face ID)
2. **Sign Up / Log In** — email+password, Sign in with Apple; **Log Out** in Profile
3. **App Lock** — PIN or Face/Touch ID gate on app open (toggle + setup in Settings)
4. **Home / Dashboard** — balance/net position, this month's income vs. expense, monthly budget progress bar, upcoming recurring bills, recent transactions, "Scan Receipt" / "Add Manual Transaction" quick actions
5. **Scan Receipt** — live camera with receipt-edge guide, flash toggle, import-from-gallery option
6. **Receipt Review** — captured image + Claude-extracted fields (vendor, amount, date, category, tag suggestion, payment method, notes), editable before saving
7. **Add/Edit Manual Transaction** — numeric-keypad entry screen (income or expense, category + tag picker, date picker, optional "make recurring" toggle) — matches the mood-board's keypad screen
8. **Transactions List** — full history, filter by date range/category/tag/type, search
9. **Transaction Detail** — view/edit a single transaction, view its receipt image full-screen, delete
10. **Receipt Gallery** — all scanned receipt images on their own, searchable (useful for returns/warranty lookup)
11. **Recurring Transactions** — list of recurring bills/subscriptions with next-due dates; add/edit a recurring rule (amount, frequency, reminder lead time, auto-create toggle)
12. **Analytics / Insights** — spend-by-category chart, income-vs-expense trend, with a **weekly/monthly/yearly frequency toggle** and per-category trend drill-down (matches the mood-board's "Overview" chart screen)
13. **Budgets** — set/edit overall monthly and yearly budget with progress bar and over/under-budget indicator
14. **Categories** — manage default + custom categories (name, icon, color)
15. **Tags** — manage custom tags independent of category
16. **To-Do List** — simple checklist for random to-dos (add, check off, delete)
17. **Shopping Notes** — simple checklist for shopping items (same UI pattern as To-Do, separate list)
18. **Notifications** — budget-threshold alerts, recurring-bill reminders, weekly spend summary
19. **Profile / Settings** — account info, currency setting, app-lock toggle, backup & restore, export data to CSV, notification preferences, dark mode, log out, delete account

## Web app — pages (view + budget management, no camera)

1. **Login / Sign up / Logout** — same Supabase Auth backend
2. **Dashboard (Overview)** — net position, this month's income vs. expense, budget progress, upcoming recurring bills, recent transactions, category breakdown snapshot
3. **Transactions** — sortable/filterable table (date, category, tag, amount, type), search, click a row to view the receipt image + edit/delete
4. **Recurring** — view/manage recurring bills and their next due dates (same data as mobile)
5. **Analytics** — category breakdown, spend-over-time trend with weekly/monthly/yearly toggle, income vs. expense comparison
6. **Reports/Export** — pick a date range, export data to CSV
7. **Budgets** — set/edit monthly & yearly budgets, see historical budget-vs-actual by month
8. **Categories & Tags** — manage both (kept in sync with mobile)
9. **Settings** — profile, currency, backup status, data export, delete account

## Phased feature scope

**MVP (build first):**
- Auth: sign up/login/logout (email+password + Sign in with Apple)
- Scan → Claude API extraction → review/edit → save, with offline queueing
- Manual transaction entry (income/expense)
- Transactions list/detail/edit/delete with receipt image
- Default + custom categories, plus independent custom tags
- Recurring transactions with due-date reminders (push notifications) and optional auto-create
- To-Do list and Shopping Notes (simple standalone checklists)
- Mobile dashboard with month summary, upcoming bills, overall budget progress
- Overall monthly/yearly budget (not yet per-category)
- Analytics with weekly/monthly/yearly frequency toggle and category-wise trends
- App lock (PIN/biometric)
- Backup & restore (cloud-backed by Supabase; manual "back up now" + restore status in Settings)
- Currency setting
- Export data to CSV
- Web dashboard: overview, transactions table, recurring, analytics, budgets, categories/tags, settings
- Realtime sync between mobile writes and web reads

**Phase 2 (explicitly deferred):**
- Per-category budgets and alerts
- PDF export / polished report generation
- Bank/credit-card account linking (Plaid-style) for auto-imported transactions
- Multi-currency conversion (vs. today's single-currency-per-user setting)
- Cost controls/caching on Claude API usage (e.g. downscale images, cache repeat vendors) once real usage volume is known
- Android build from the same React Native codebase
- Shared/family accounts

## Verification (once building starts)

Since this plan produces no code yet, acceptance for the MVP should be checked end-to-end after implementation:
1. Sign up on mobile, sign in on web with the same account; set an app lock PIN and confirm it gates reopening the app.
2. Scan a real receipt on mobile → confirm the Claude-extracted fields are reasonable, edit if needed, save; try one scan with the device offline and confirm it syncs once back online.
3. Confirm the transaction appears on the web Transactions table within a few seconds (Realtime sync working), with the receipt image viewable.
4. Create a recurring monthly bill with a 3-day reminder; confirm a push notification arrives 3 days before the due date and (if auto-create is on) the transaction appears automatically on the due date.
5. Add a few To-Do and Shopping Note items on mobile; confirm they persist across app restarts.
6. Set a monthly budget; confirm the progress bar/percentage on both mobile Home and web Dashboard match and update as new transactions are added.
7. Check the Analytics screens on both platforms show matching category/income-vs-expense totals for the same period, and that switching the weekly/monthly/yearly toggle changes the numbers correctly.
8. Export a CSV from web (or mobile) and confirm it opens cleanly with the expected columns.
9. Confirm currency setting change reflects across dashboard, transactions, and budgets consistently.
