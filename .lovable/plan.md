

## Plan: Add Search History Page

### What
Add a `/history` page that shows a log of all past searches the user has made (industry, location, service, timestamp). Clicking a history entry re-runs that search and navigates to results — showing leads from that specific search, not all leads.

### Key Behavior
- Each search the user performs is saved as a history entry (persisted via Zustand/localStorage)
- History page shows entries in reverse chronological order with industry, location, service, and timestamp
- Clicking an entry navigates to `/search` with fields pre-filled, OR directly re-triggers the search
- Results page is updated to filter leads by the current search parameters (industry + city) so only relevant leads show — not the entire database

### Changes

**1. Update session store (`src/lib/session-store.ts`)**
- Add `searchHistory` array: `{ industry, location, service, timestamp }[]`
- Add `addSearchHistory()` action that pushes a new entry (called on each search)
- Add `clearHistory()` action
- Keep existing `lastSearch` for backward compat

**2. Create History page (`src/pages/History.tsx`)**
- Dark themed, consistent with existing pages
- Header with Client Muse branding + nav link back to search
- List of search history cards showing: industry, location, service, relative time ("2 hours ago")
- Each card has a "Search Again" button that navigates to `/search` with pre-filled params
- Empty state if no history
- "Clear History" button

**3. Update SearchIntake (`src/pages/SearchIntake.tsx`)**
- On successful search, call `addSearchHistory()` to log the search

**4. Update Results page (`src/pages/Results.tsx`)**
- Filter fetched leads by `lastSearch` params (match industry + city) so only the most recent search's leads display
- Fallback: show all leads if no `lastSearch` is set

**5. Update routing (`src/App.tsx`)**
- Add `/history` route
- Add History nav link in headers

**6. Update header nav**
- Add a "History" link (Clock icon) in the SearchIntake and Results page headers

### No database changes needed — history is stored client-side via Zustand persist.

