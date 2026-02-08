# Existing Plans – Frontend & Backend

## What the frontend does

- **Save:** After the user clicks "Generate AI Itineraries" and the backend returns `{ options: [...] }`, the frontend saves that trip to Supabase (table `user_plans`) with origin, destination, dates, and the 3 options. No extra backend call.
- **List:** The "Existing Plans" tab loads plans from Supabase via `getSavedPlans()` (direct Supabase client).
- **Open:** Clicking a plan navigates to `/plan` with `state: { options: plan.options }`. The Plan page renders those 3 itineraries without calling the AI again.

So **existing plans use only Supabase**; no new backend endpoint is required.

---

## Backend prompt (for your Python/backend repo)

Use this when you want to align the backend with this behaviour:

---

**Prompt:**

- **Existing plans:** No backend changes are needed. The app stores and loads "existing plans" in Supabase (table `user_plans`). The backend is not called for listing or opening saved plans.
- **Itinerary generation:** The only backend endpoint used for plans is **POST `/itinerary/generate`**. It must accept the same trip parameters (origin, destination, start_date, end_date, budget, etc.) and return JSON in this shape:
  ```json
  { "options": [ { "id": "...", "label": "...", "daily_plan": { ... }, "total_estimated_cost": number }, ... ] }
  ```
  Typically 3 options. See `docs/itinerary-api-output.md` in the frontend repo for the full response spec.
- **CORS:** Allow the frontend origin (e.g. `http://localhost:5173`) for POST requests to `/itinerary/generate`.

No new endpoints (e.g. GET/POST saved plans) are required; the frontend uses Supabase for that.

---

## Supabase setup

Run the SQL in **`supabase-user-plans.sql`** in the Supabase SQL Editor once. It creates:

- Table `public.user_plans`: `id`, `user_id`, `origin`, `destination`, `start_date`, `end_date`, `options` (jsonb), `created_at`
- RLS so users can only read/insert/delete their own rows

After that, the Existing Plans UI will work without any backend changes.
