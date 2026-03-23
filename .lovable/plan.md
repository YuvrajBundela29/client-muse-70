

## Plan: ClientMuse v2.0 — Pipeline CRM + AI Production Engine

### What This Is
Transform Client Muse from a lead finder into a full client lifecycle management system with pipeline tracking, dedicated client pages, AI-powered email construction, reply handling, and a reel library. All existing features (landing, search, results, history) remain untouched.

### What Gets Built

**5 new pages + 2 new database tables + 1 new edge function**

---

### New Database Tables

**1. `client_pipeline`** — extends leads with CRM pipeline data
- `id` (uuid, PK)
- `lead_id` (uuid, references leads)
- `pipeline_status` (text: `not_contacted`, `email_sent`, `replied`, `call_booked`, `closed`, `no_response`, `rejected`)
- `service_track` (text: nullable — `track_a`, `track_b`, `track_c`, `track_d`)
- `recommended_package` (text: nullable)
- `email_sent_date` (timestamptz, nullable)
- `follow_up_day` (int, nullable — tracks follow-up sequence position)
- `notes` (text, nullable)
- `priority_rank` (int, nullable)
- `created_at` / `updated_at`
- RLS: public read/write (no auth yet)

**2. `reel_library`** — tracks completed reels for reuse
- `id` (uuid, PK)
- `reel_code` (text, e.g. `REEL_001`)
- `description` (text)
- `industry_tags` (text[] — searchable)
- `keywords` (text[] — for matching)
- `drive_link` (text)
- `created_at`
- RLS: public read/write

---

### New Pages

**1. `/pipeline` — Pipeline Manager** (kanban-style board)
- Shows all leads as cards organized by status columns (NOT CONTACTED → EMAIL SENT → REPLIED → CALL BOOKED → CLOSED / NO RESPONSE / REJECTED)
- Each card: business name, confidence score (color-coded), urgency tag, intent signal, email indicator
- Priority ranking: has email > confidence score > intent signal priority > urgency
- Drag-to-change-status or click to update
- CSV upload button: parses CSV, creates leads + pipeline entries, detects duplicates by business name
- Bulk export

**2. `/pipeline/:id` — Client Intelligence Page**
- Section A: Client Brief (all lead data, confidence, intent, pain points)
- Section B: Service Track Detection — auto-assigns track based on industry keywords (beauty→Track A, fashion→Track B, promo/ecommerce→Track C, IT→Track D)
- Section C: Reel Decision Check — queries `reel_library` for matches by industry/keywords. Shows REUSE or BUILD NEW decision
- Section D: AI Email Construction — button triggers edge function that:
  - Analyzes the lead's website via Firecrawl
  - Generates 3 email variants (professional, friendly, aggressive) personalized to the brand
  - Classifies email address type (hello@, press@, name-specific) and suggests LinkedIn backup if generic
  - Shows follow-up sequence (Day 4, 7, 10 templates)
- Section E: Reply Handler — text area to paste client reply → AI classifies reply type (WARM INTEREST, PRICING REQUEST, OBJECTION, etc.) and generates exact response
- Section F: Actions — mark contacted, update status, copy emails, export

**3. `/reel-library` — Reel Library Management**
- List of all reels with description, industry tags, drive link
- Add new reel form
- Search/filter by industry

**4. Update nav** — add Pipeline and Reel Library links to all page headers

---

### New Edge Function: `analyze-client`
- Input: lead_id
- Fetches lead data from DB
- Scrapes the lead's website via Firecrawl (if URL exists)
- Uses AI (Gemini) to:
  - Generate personalized email (3 tones) referencing specific brand intel
  - Classify email type
  - Generate follow-up sequence
  - Detect service track + package recommendation
- Returns structured JSON

### New Edge Function: `classify-reply`
- Input: reply text + lead context
- Uses AI to classify reply type and generate appropriate response
- Returns classification + suggested reply

---

### Pricing Data
Stored as static constants in a `src/lib/pricing.ts` file — no DB needed. Contains all 4 tracks with Starter/Pro/Bundle/Retainer packages and prices.

### Service Track Detection
Pure client-side logic in a utility function — maps industry keywords to tracks (beauty→A, fashion→B, etc.)

---

### Implementation Order
1. Database migration (2 tables)
2. `src/lib/pricing.ts` + `src/lib/service-tracks.ts` (static data + detection logic)
3. Pipeline page with cards + status management + CSV upload
4. Client Intelligence page (brief, track detection, reel check)
5. `analyze-client` edge function (email construction with Firecrawl + AI)
6. `classify-reply` edge function (reply handling)
7. Wire email construction + reply handler into client page
8. Reel Library page (CRUD)
9. Update routing + navigation

### Technical Notes
- CSV upload uses `FileReader` + manual parsing on the client, then batch-inserts into `leads` + `client_pipeline`
- Duplicate detection: check `business_name` match before inserting
- Pipeline status updates use `updateLeadStatusInDb` pattern (already exists)
- All new components follow existing dark theme, Lucide icons, framer-motion animations
- No new npm dependencies needed

