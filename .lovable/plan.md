

## Plan: Client Muse SaaS Upgrade — Phase-by-Phase

### Current State Assessment

The app already has:
- Landing page with dark psychology design
- Auth (email/password, no Google OAuth yet)
- Search intake form (industry, location, service)
- Results page with lead cards and CSV export
- History page (client-side via Zustand)
- Saved Leads page (database-backed)
- Pipeline CRM page (Kanban-style, 7 status columns)
- Client Intelligence page (per-lead detail with AI emails, reply handler)
- Reel Library page
- Dashboard with stats cards
- Sidebar layout with navigation
- Edge functions: find-leads, analyze-client, classify-reply
- Database tables: leads, profiles, saved_leads, search_history, client_pipeline, reel_library
- RLS policies on all tables

### What's Missing (from the request)

1. **Google OAuth** — not implemented
2. **Onboarding flow** — no post-signup onboarding step
3. **Stripe subscription billing** — no payment integration
4. **Saved Searches** page — search parameters bookmarking for re-run
5. **Analytics page** — charts and metrics
6. **Settings page** — profile editing, account management, plan info
7. **History using database** — currently client-side only, should use `search_history` table with full results stored
8. **Upgrade/pricing page** inside dashboard
9. **Usage gating** — plan-based feature limits with upgrade modals
10. **Follow-up reminders** — date pickers and reminder tracking
11. **Activity log** per client — timestamped events

### Implementation Plan (7 phases, sequential)

---

#### Phase 1: Database Schema Updates

Add new tables and modify existing ones:

- **`saved_searches`** — user_id, label, industry, country, service, filters_json, is_alert, created_at
- **`user_subscriptions`** — user_id, plan, stripe_customer_id, stripe_subscription_id, status, current_period_end, searches_used_this_month, searches_reset_at
- **`client_activity`** — client_id, user_id, activity_type, description, created_at
- Update `profiles` to add `onboarding_complete` boolean
- Update `search_history` to store `results_json` (jsonb) and `filters_json` (jsonb)

All tables get user-scoped RLS policies. Add trigger to auto-create `user_subscriptions` row on signup (free plan).

---

#### Phase 2: Google OAuth + Onboarding

- Add Google OAuth using Lovable Cloud managed OAuth (no API key needed)
- Create `/onboarding` page — 4-step wizard: industry, country, service, display name
- On completion: update `profiles` with selections, set `onboarding_complete = true`, redirect to `/dashboard`
- Update `ProtectedRoute` to redirect to `/onboarding` if `onboarding_complete` is false

---

#### Phase 3: Stripe Integration

- Enable Stripe via the Lovable Stripe tool
- Create 4 products/prices: Free, Solo ($19/mo), Pro ($49/mo), Agency ($99/mo)
- Create edge function `create-checkout-session` for plan upgrades
- Create edge function `stripe-webhook` to handle subscription lifecycle events
- Create `useSubscription` hook that fetches user plan and usage
- Create `usageGuard` utility that shows upgrade modal when limits hit
- Build `/dashboard/upgrade` pricing comparison page

---

#### Phase 4: History + Saved Searches (Database-Backed)

- Rewrite History page to fetch from `search_history` table instead of Zustand
- Store full `results_json` in search_history on each search
- Expandable results view per history entry with "Add to Pipeline" buttons
- Create Saved Searches page (`/dashboard/saved-searches`):
  - List bookmarked search parameter sets
  - "Run Search" button to re-execute
  - Alert toggle for weekly notifications

---

#### Phase 5: Analytics Page

- Create `/dashboard/analytics` with Recharts:
  - Line chart: leads added per week (12 weeks)
  - Pie chart: pipeline stage distribution
  - Bar chart: leads by industry
  - Metric cards: total searches, avg fit score, leads converted
- Data fetched from existing tables (leads, client_pipeline, search_history)

---

#### Phase 6: Settings Page

- Create `/dashboard/settings` with tabs:
  - **Profile**: edit name, industry, country, service
  - **Account**: change password
  - **Notifications**: toggle email alerts (UI only initially)
  - **Subscription**: current plan, usage stats, upgrade button
  - **Danger Zone**: delete account

---

#### Phase 7: Activity Log + Follow-up Reminders

- Add activity logging to pipeline actions (stage changes, notes, outreach)
- Show activity timeline in Client Intelligence page
- Add follow-up date picker to client cards
- Show upcoming follow-ups on Dashboard

---

### Technical Details

**Files to create:**
- `src/pages/Onboarding.tsx`
- `src/pages/Analytics.tsx`
- `src/pages/Settings.tsx`
- `src/pages/SavedSearches.tsx`
- `src/pages/Upgrade.tsx`
- `src/hooks/useSubscription.ts`
- `src/components/shared/UpgradeModal.tsx`
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Files to modify:**
- `src/App.tsx` — new routes
- `src/components/shared/AppSidebar.tsx` — new nav items (Analytics, Settings, Upgrade)
- `src/pages/Auth.tsx` — add Google OAuth button
- `src/pages/History.tsx` — rewrite to use database
- `src/pages/SearchIntake.tsx` — save results_json to DB, add "Save Search" button
- `src/pages/Dashboard.tsx` — add follow-up reminders section
- `src/pages/ClientIntelligence.tsx` — add activity log and follow-up date picker
- `src/components/ProtectedRoute.tsx` — onboarding redirect check

**Database migrations:** 1 migration with all new tables + column additions.

**No new npm dependencies** — Recharts is already available via shadcn/ui chart component.

### Execution Note
This is too large for a single implementation pass. I recommend starting with **Phase 1 + Phase 2** (database + onboarding + Google OAuth), then proceeding phase by phase. Each phase is self-contained and deployable.

