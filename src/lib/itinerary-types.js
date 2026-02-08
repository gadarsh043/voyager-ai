/**
 * API shape for itinerary options (e.g. from POST /itinerary/generate).
 * Use for timeline display and Supabase storage.
 * See docs/itinerary-api-output.md for the full API output spec.
 *
 * @typedef {{
 *   from_location: string
 *   to_location?: string
 *   start_time: string
 *   reach_by: string
 * }} FlightLeg
 *
 * @typedef {{
 *   name: string
 *   check_in: string
 *   check_out: string
 *   image_url?: string
 *   google_maps_url?: string
 * }} HotelStayItem
 *
 * @typedef {{
 *   start_from: string
 *   start_time: string
 *   reach_time: string
 *   time_to_spend: string
 *   image_url?: string
 *   google_maps_url?: string
 * }} ActivityItem
 *
 * @typedef {{
 *   day: number
 *   activities: ActivityItem[]
 * }} DayPlan
 *
 * @typedef {{
 *   flight_from_source?: FlightLeg
 *   flight_to_origin?: FlightLeg
 *   hotel_stay?: HotelStayItem[]
 *   days: DayPlan[]
 * }} DailyPlan
 *
 * @typedef {{
 *   id: string
 *   label: string
 *   daily_plan: DailyPlan
 *   total_estimated_cost: number
 * }} ItineraryOption
 *
 * @typedef {{ options: ItineraryOption[] }} ItineraryOptionsResponse
 */

export const ITINERARY_OPTION_SHAPE = /** @type {const} */ ({
  id: '',
  label: '',
  daily_plan: {
    flight_from_source: { from_location: '', start_time: '', reach_by: '' },
    flight_to_origin: { from_location: '', to_location: '', start_time: '', reach_by: '' },
    hotel_stay: [{ name: '', check_in: '', check_out: '' }],
    days: [{ day: 1, activities: [{ start_from: '', start_time: '', reach_time: '', time_to_spend: '' }] }],
  },
  total_estimated_cost: 0,
})
