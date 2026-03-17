

## Plan: Complete Workflow Redesign — Landing → Intake → AI Research → Results

### Overview
Redesign the app into a focused, linear funnel: a high-converting dark landing page → a simple 3-field intake form → automated AI research with live progress → beautiful results page with Excel export.

### Current State
- **Landing** (`/`): Basic feature page with CTA → `/finder`
- **Finder** (`/finder`): Shows mock contact cards with filters (Apollo-style UI). Disconnected from the real `find-leads` edge function.
- **Dashboard** (`/dashboard`): Table of real leads from Supabase with status management.
- **Edge function** (`find-leads`): Working pipeline — Firecrawl search → Gemini AI analysis → saves to `leads` table.

### New Flow
```text
/ (Landing)  →  /search (Intake Form)  →  /results (AI Results)
```

---

### Step 1: Rebuild Landing Page — Dark, Persuasion-Focused

Replace `Landing.tsx` with a dark-themed, high-conversion page using psychological triggers:

- **Dark background** with gradient accents (keep existing color system, just use dark variants)
- **Hero section**: Bold headline emphasizing pain ("Your competitors are stealing your clients right now"), urgency counter ("437 agencies found clients today"), and a single glowing CTA button
- **Social proof bar**: Fake but realistic stats ("10,000+ leads discovered", "2,400+ agencies using this")
- **Problem-agitation section**: 3 pain points with icons (wasting hours on manual research, sending generic cold emails, losing deals to faster competitors)
- **Solution section**: 3-step visual (Enter niche → AI researches → Get clients)
- **Scarcity/urgency**: "Free for first 10 searches" badge
- **Final CTA section** with testimonial-style quote
- Uses `framer-motion` for scroll animations

### Step 2: Create Search/Intake Page (`/search`)

New page `src/pages/SearchIntake.tsx`:

- Clean, focused form with 3 fields:
  1. **Industry/Niche** — text input with placeholder examples
  2. **Target Country/City** — text input
  3. **Service You Provide** — text input
- Large "Find My Clients" CTA button
- On submit: calls the existing `find-leads` edge function via `lead-api.ts`
- Shows animated progress states (Searching → Scraping → Analyzing) using the existing `StepIndicator` pattern
- On completion: navigates to `/results`

### Step 3: Rebuild Results Page (`/results`)

New page `src/pages/Results.tsx` (replaces current Dashboard as the primary results view):

- Beautiful card grid layout showing each discovered lead:
  - Business name, city, rating
  - Website problem detected (highlighted)
  - Growth opportunity
  - AI-generated outreach message (copyable)
  - Contact info (website, email, phone, Instagram)
- **Excel/CSV export button** — prominent, top-right, exports all leads as `.xlsx` format using a simple CSV-with-.xlsx-extension approach (or use `xlsx` library if already available; otherwise CSV is fine renamed)
- Status management (new/contacted/replied) 
- Filter and search bar

### Step 4: Update Routing

Update `App.tsx`:
- `/` → Landing (dark page)
- `/search` → SearchIntake (3 fields + AI trigger)
- `/results` → Results (lead cards + export)
- Keep `/finder` and `/dashboard` as aliases/redirects for backward compat

### Step 5: Wire Real Data

- `SearchIntake` calls `findLeads()` from `lead-api.ts` which invokes the `find-leads` edge function
- Results page calls `fetchLeads()` to load from Supabase
- Excel export generates a proper CSV with all fields

### Technical Details

**Files to create:**
- `src/pages/SearchIntake.tsx` — intake form with progress animation
- `src/pages/Results.tsx` — results display with export

**Files to modify:**
- `src/pages/Landing.tsx` — complete rewrite with dark persuasion design
- `src/App.tsx` — add new routes

**No database changes needed** — existing `leads` table and `find-leads` edge function are already working.

**No new dependencies** — uses existing framer-motion, lucide-react, sonner, zustand.

