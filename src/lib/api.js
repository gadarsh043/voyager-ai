/**
 * API layer: set USE_MOCK to true for React mock data; when false, hits real backend.
 * Saved plans (existing plans) are always stored in Supabase, not mock.
 */
import { supabase } from '@/lib/supabase'

const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const ITINERARY_API_BASE = import.meta.env.VITE_ITINERARY_API_BASE || 'http://127.0.0.1:8000'

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms))

// --- Mock data (trips, itinerary, quote only; auth is Supabase) ---
const mockTrips = [
  {
    id: 'trip_1',
    team_id: 'team_1',
    team_name: 'Tokyo 2026',
    destination: 'Tokyo, Japan',
    start_date: '2026-03-15',
    end_date: '2026-03-19',
    budget_total: 3000,
    status: 'DRAFT',
  },
  {
    id: 'trip_2',
    team_id: 'team_2',
    team_name: 'Solo Trip',
    destination: 'Paris',
    start_date: '2026-04-01',
    end_date: '2026-04-07',
    budget_total: 2500,
    status: 'BOOKED',
  },
]

// Itinerary options for /plan — timeline shape (matches API and Supabase content)
const mockItineraryOptions = [
  {
    id: 'opt_1',
    label: 'Itinerary Plan 1',
    daily_plan: {
      flight_from_source: {
        from_location: 'SFO',
        start_time: '2026-03-15T08:00:00Z',
        reach_by: '2026-03-16T14:30:00Z',
      },
      flight_to_origin: {
        from_location: 'NRT',
        to_location: 'SFO',
        start_time: '2026-03-19T10:00:00Z',
        reach_by: '2026-03-19T18:00:00Z',
      },
      hotel_stay: [
        {
          name: 'Aman Tokyo',
          check_in: '2026-03-16',
          check_out: '2026-03-19',
          image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&h=150&fit=crop',
          google_maps_url: 'https://www.google.com/maps/search/Aman+Tokyo',
        },
      ],
      days: [
        {
          day: 1,
          activities: [
            { start_from: 'NRT', start_time: '14:30', reach_time: '16:00', time_to_spend: '1h 30m' },
            { start_from: 'Hotel', start_time: '18:00', reach_time: '18:30', time_to_spend: '2h' },
          ],
        },
        {
          day: 2,
          activities: [
            { start_from: 'Hotel', start_time: '09:00', reach_time: '09:45', time_to_spend: '2h' },
            {
              start_from: 'Tsukiji',
              start_time: '12:00',
              reach_time: '12:15',
              time_to_spend: '1h 30m',
              image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Tsukiji+market+Tokyo',
            },
            {
              start_from: 'TeamLab',
              start_time: '15:00',
              reach_time: '15:30',
              time_to_spend: '2h',
              image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/teamLab+Borderless+Tokyo',
            },
          ],
        },
        {
          day: 3,
          activities: [
            { start_from: 'Hotel', start_time: '08:00', reach_time: '10:30', time_to_spend: '4h' },
            {
              start_from: 'Mt. Fuji',
              start_time: '15:00',
              reach_time: '18:00',
              time_to_spend: '—',
              image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Mt+Fuji',
            },
          ],
        },
      ],
    },
    total_estimated_cost: 5500,
  },
  {
    id: 'opt_2',
    label: 'Itinerary Plan 2',
    daily_plan: {
      flight_from_source: {
        from_location: 'SFO',
        start_time: '2026-03-15T10:00:00Z',
        reach_by: '2026-03-16T16:00:00Z',
      },
      flight_to_origin: {
        from_location: 'HND',
        to_location: 'SFO',
        start_time: '2026-03-19T18:00:00Z',
        reach_by: '2026-03-19T12:00:00Z',
      },
      hotel_stay: [
        {
          name: 'The Gate Hotel Asakusa',
          check_in: '2026-03-16',
          check_out: '2026-03-19',
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop',
          google_maps_url: 'https://www.google.com/maps/search/The+Gate+Hotel+Asakusa',
        },
      ],
      days: [
        {
          day: 1,
          activities: [
            { start_from: 'HND', start_time: '16:00', reach_time: '17:30', time_to_spend: '1h' },
            {
              start_from: 'Shibuya',
              start_time: '19:00',
              reach_time: '19:30',
              time_to_spend: '2h',
              image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Shibuya+Crossing+Tokyo',
            },
          ],
        },
        {
          day: 2,
          activities: [
            { start_from: 'Hotel', start_time: '09:00', reach_time: '09:30', time_to_spend: '1h 30m' },
            {
              start_from: 'Harajuku',
              start_time: '11:00',
              reach_time: '11:20',
              time_to_spend: '2h',
              image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Harajuku+Tokyo',
            },
            {
              start_from: 'Ginza',
              start_time: '14:00',
              reach_time: '14:30',
              time_to_spend: '2h',
              image_url: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Ginza+Tokyo',
            },
          ],
        },
        {
          day: 3,
          activities: [
            { start_from: 'Hotel', start_time: '08:30', reach_time: '09:00', time_to_spend: '3h' },
          ],
        },
      ],
    },
    total_estimated_cost: 2840,
  },
  {
    id: 'opt_3',
    label: 'Itinerary Plan 3',
    daily_plan: {
      flight_from_source: {
        from_location: 'SFO',
        start_time: '2026-03-15T23:00:00Z',
        reach_by: '2026-03-16T06:00:00Z',
      },
      flight_to_origin: {
        from_location: 'NRT',
        to_location: 'SFO',
        start_time: '2026-03-18T22:00:00Z',
        reach_by: '2026-03-18T16:00:00Z',
      },
      hotel_stay: [
        {
          name: 'Hotel Mystays Asakusa',
          check_in: '2026-03-16',
          check_out: '2026-03-19',
          image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=150&fit=crop',
          google_maps_url: 'https://www.google.com/maps/search/Mystays+Asakusa',
        },
      ],
      days: [
        {
          day: 1,
          activities: [
            { start_from: 'NRT', start_time: '06:00', reach_time: '08:30', time_to_spend: '2h' },
            {
              start_from: 'Asakusa',
              start_time: '10:00',
              reach_time: '10:15',
              time_to_spend: '3h',
              image_url: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Senso-ji+Temple+Asakusa',
            },
          ],
        },
        {
          day: 2,
          activities: [
            { start_from: 'Hotel', start_time: '07:00', reach_time: '07:30', time_to_spend: '2h' },
            {
              start_from: 'Ueno Park',
              start_time: '10:00',
              reach_time: '10:20',
              time_to_spend: '3h',
              image_url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=200&h=150&fit=crop',
              google_maps_url: 'https://www.google.com/maps/search/Ueno+Park+Tokyo',
            },
          ],
        },
      ],
    },
    total_estimated_cost: 1420,
  },
]

// In-depth quote: breakdown by category + points optimization (backend can analyze option and return this shape)
const DEFAULT_MOCK_QUOTE = {
  subtotal: 2840,
  platform_fee: 15,
  total: 2855,
  per_person: 1427.5,
  breakdown: {
    flights: [
      { description: 'Outbound: SFO → NRT (economy)', amount: 720 },
      { description: 'Return: NRT → SFO (economy)', amount: 680 },
    ],
    hotels: [
      { description: 'Aman Tokyo, 3 nights', amount: 980 },
    ],
    activities: [
      { description: 'Tsukiji market & TeamLab Borderless', amount: 120 },
      { description: 'Mt. Fuji day trip', amount: 180 },
      { description: 'Local transport & dining', amount: 160 },
    ],
  },
  points_optimization: {
    best_card_to_use: 'Amex Gold (4x on Dining/Flights)',
    potential_points_earned: 4800,
    suggestions: [
      'Book flights with Amex Platinum for 5x points; use Amex Gold for dining and groceries (4x).',
      'Transfer Chase Ultimate Rewards to United or Hyatt for better redemption value on this itinerary.',
      'Consider paying hotel with Chase Sapphire Reserve for 3x travel and primary rental car coverage.',
    ],
    transfer_partners: ['Chase → United, Hyatt', 'Amex → Delta, Marriott'],
    redemption_tips: [
      'United MileagePlus: good for SFO–NRT if saver space opens; check 30 days out.',
      'Hyatt: redeem for Aman Tokyo if points availability (high value per point).',
    ],
  },
}

async function request(method, path, body) {
  if (USE_MOCK) return null
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(body && { body: JSON.stringify(body) }) },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// --- Auth & Profile (real backend only; app auth uses Supabase via @/lib/auth) ---
export async function signup(data) {
  return request('POST', '/auth/signup', data)
}

export async function signInWithGoogle() {
  return request('POST', '/auth/google')
}

export async function getProfile() {
  return request('GET', '/profile')
}

export async function updateProfile(payload) {
  if (USE_MOCK) {
    await delay(300)
    return payload
  }
  return request('PATCH', '/profile', payload)
}

// --- Home & Teams ---
export async function getTrips() {
  if (USE_MOCK) {
    await delay(400)
    return { trips: mockTrips }
  }
  return request('GET', '/trips')
}

export async function joinTeam(inviteCode) {
  if (USE_MOCK) {
    await delay(500)
    if (!inviteCode || inviteCode.length < 4) throw new Error('Invalid invite code')
    return { team: { id: 'team_new', name: 'Joined Trip' }, role: 'EDITOR' }
  }
  return request('POST', '/teams/join', { invite_code: inviteCode })
}

// --- Itinerary ---
export async function generateItinerary(params) {
  const url = `${ITINERARY_API_BASE}/itinerary/generate`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params ?? {}),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Itinerary API error ${res.status}`)
  }
  const data = await res.json()
  if (!data || !Array.isArray(data.options)) {
    throw new Error('Invalid response: expected { options: [...] }')
  }
  return data
}

export async function customiseItinerary(id, payload) {
  if (USE_MOCK) {
    await delay(1500)
    return { id, ...payload }
  }
  return request('PATCH', `/itinerary/${id}/customise`, payload)
}

/**
 * Request AI to build a custom itinerary from user's picks (selected activities + custom Google links) and get quote.
 * @param {{ picks: Array<{ label: string, google_maps_url?: string }> }} payload
 * @returns {{ option_id: string, option?: object }} option_id for quote page
 */
export async function planWithPicks(payload) {
  if (USE_MOCK) {
    await delay(2000)
    return { option_id: 'custom_from_picks', option: mockItineraryOptions[0] }
  }
  return request('POST', '/itinerary/plan-with-picks', payload)
}

/**
 * Get an in-depth quote for the selected itinerary option. Backend analyzes the plan (flights, hotels, activities)
 * and returns itemized breakdown + points optimization suggestions.
 * @param {object} option - The selected itinerary option (id, label, daily_plan, total_estimated_cost, etc.)
 * @returns {Promise<{ subtotal, platform_fee, total, per_person?, breakdown?, points_optimization? }>}
 */
export async function getQuote(option) {
  if (USE_MOCK) {
    await delay(600)
    const cost = option?.total_estimated_cost ?? 2840
    const subtotal = cost
    const platform_fee = 15
    const total = subtotal + platform_fee
    return {
      subtotal,
      platform_fee,
      total,
      per_person: (total / 2).toFixed(2),
      breakdown: DEFAULT_MOCK_QUOTE.breakdown,
      points_optimization: DEFAULT_MOCK_QUOTE.points_optimization,
    }
  }
  const url = `${ITINERARY_API_BASE}/itinerary/quote`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option: option || {} }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Quote API error ${res.status}`)
  }
  return res.json()
}

// --- Saved plans (Supabase only; no mock) ---
/**
 * Fetch the current user's saved plans (origin, destination, dates, options).
 * @returns {{ plans: Array<{ id: string, origin: string, destination: string, start_date?: string, end_date?: string, options: array, created_at: string }> }}
 */
export async function getSavedPlans() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plans: [] }
  const { data, error } = await supabase
    .from('user_plans')
    .select('id, origin, destination, start_date, end_date, options, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return { plans: data || [] }
}

/**
 * Save a new plan after generating itineraries (adds to "Existing plans").
 * @param {{ origin: string, destination: string, start_date?: string, end_date?: string, options: array }} payload
 * @returns {{ id: string }}
 */
export async function saveSavedPlan(payload) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to save a plan')
  const { origin, destination, start_date, end_date, options } = payload
  if (!origin || !destination || !Array.isArray(options) || options.length === 0) {
    throw new Error('origin, destination, and options (array) are required')
  }
  const { data, error } = await supabase
    .from('user_plans')
    .insert({
      user_id: user.id,
      origin: String(origin).trim(),
      destination: String(destination).trim(),
      start_date: start_date || null,
      end_date: end_date || null,
      options,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return { id: data.id }
}

// --- Share / Join trip (Supabase: shared_trips) ---
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateInviteCode(length = 6) {
  const arr = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256)
  }
  let s = ''
  for (let i = 0; i < length; i++) s += INVITE_CODE_CHARS[arr[i] % INVITE_CODE_CHARS.length]
  return s
}

/**
 * Create a shareable trip; returns an invite code others can use to join.
 * @param {{ origin: string, destination: string, start_date?: string, end_date?: string, options: array }} payload
 * @returns {{ invite_code: string }}
 */
export async function createShareableTrip(payload) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to share a trip')
  const { origin, destination, start_date, end_date, options } = payload
  if (!origin || !destination || !Array.isArray(options) || options.length === 0) {
    throw new Error('origin, destination, and options (array) are required')
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const invite_code = generateInviteCode(6)
    const { error } = await supabase.from('shared_trips').insert({
      invite_code,
      created_by_user_id: user.id,
      origin: String(origin).trim(),
      destination: String(destination).trim(),
      start_date: start_date || null,
      end_date: end_date || null,
      options,
    })
    if (!error) return { invite_code }
    if (error.code !== '23505') throw new Error(error.message) // 23505 = unique violation, retry
  }
  throw new Error('Could not generate unique invite code')
}

/**
 * Join a trip by invite code; adds the plan to the current user's Existing Plans and returns success.
 * @param {string} inviteCode
 * @returns {{ success: true }}
 */
export async function joinTripByCode(inviteCode) {
  const code = String(inviteCode).trim().toUpperCase()
  if (!code) throw new Error('Invite code is required')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to join a trip')
  const { data: trip, error: fetchError } = await supabase
    .from('shared_trips')
    .select('origin, destination, start_date, end_date, options')
    .eq('invite_code', code)
    .maybeSingle()
  if (fetchError) throw new Error(fetchError.message)
  if (!trip) throw new Error('Invalid or expired invite code')
  const { error: insertError } = await supabase.from('user_plans').insert({
    user_id: user.id,
    origin: trip.origin,
    destination: trip.destination,
    start_date: trip.start_date,
    end_date: trip.end_date,
    options: trip.options,
  })
  if (insertError) throw new Error(insertError.message)
  return { success: true }
}

export async function checkout(itineraryId) {
  if (USE_MOCK) {
    await delay(800)
    return {
      booking_id: 'book_1',
      pdf_url: '#',
      itinerary_summary: mockItineraryOptions[1],
      bill_summary: { subtotal: DEFAULT_MOCK_QUOTE.subtotal, platform_fee: DEFAULT_MOCK_QUOTE.platform_fee, total: DEFAULT_MOCK_QUOTE.total },
    }
  }
  return request('POST', `/itinerary/${itineraryId}/checkout`)
}

export const api = {
  USE_MOCK,
  signup,
  signInWithGoogle,
  getProfile,
  updateProfile,
  getTrips,
  joinTeam,
  generateItinerary,
  customiseItinerary,
  planWithPicks,
  getQuote,
  checkout,
  getSavedPlans,
  saveSavedPlan,
  createShareableTrip,
  joinTripByCode,
}
