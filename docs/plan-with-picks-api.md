# Plan-with-picks API spec

Users can select activities/places from the 3 itineraries and add their own Google Maps links, then request the AI to build a custom plan and get a quote.

---

## Endpoint

- **Method:** `POST`
- **Path:** `/itinerary/plan-with-picks`

---

## Request body

```json
{
  "picks": [
    { "label": "Tsukiji market", "google_maps_url": "https://www.google.com/maps/search/Tsukiji+Tokyo" },
    { "label": "My café", "google_maps_url": "https://www.google.com/maps/place/..." }
  ]
}
```

| Field  | Type  | Required | Description |
|--------|-------|----------|-------------|
| `picks` | array | Yes     | List of places the user chose. Each item: `label` (string), `google_maps_url` (string, optional). |

You may also receive `trip_id` in the request if the app sends it (to persist picks or scope the plan to a trip).

---

## Response

Return an option id so the app can navigate to the quote page with that selection:

```json
{
  "option_id": "custom_abc123",
  "option": { ... }
}
```

| Field       | Type   | Required | Description |
|------------|--------|----------|-------------|
| `option_id`| string | Yes      | Id to use for the quote/checkout flow (e.g. `custom_abc123` or a new row in `itinerary_options`). |
| `option`   | object | No       | Full itinerary option object (same shape as in [itinerary-api-output.md](./itinerary-api-output.md)) so the app can show the custom plan. |

Backend should:

1. Optionally save picks to `trip_picks` (see SQL script).
2. Use picks (and any trip context) to generate one custom itinerary (e.g. via AI).
3. Optionally save the result to `itinerary_options` and return its id as `option_id`.
4. Return `option_id` so the frontend can open the quote page with that id.
