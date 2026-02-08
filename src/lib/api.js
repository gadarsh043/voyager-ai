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

// Build quote breakdown from the selected option so mock quote matches the plan (not fixed Tokyo data)
function buildQuoteFromOption(option) {
  const cost = option?.total_estimated_cost ?? 2840
  const platform_fee = 15
  const subtotal = cost
  const total = subtotal + platform_fee
  const dp = option?.daily_plan || {}
  // Allocate cost roughly: flights 45%, hotels 35%, activities 20%
  const flightTotal = Math.round(cost * 0.45)
  const hotelTotal = Math.round(cost * 0.35)
  const activityTotal = cost - flightTotal - hotelTotal
  const flights = []
  if (dp.flight_from_source) {
    const from = dp.flight_from_source.from_location || 'Origin'
    const to = dp.flight_from_source.to_location || 'Destination'
    flights.push({ description: `Outbound: ${from} → ${to}`, amount: Math.round(flightTotal / 2) })
  }
  if (dp.flight_to_origin) {
    const from = dp.flight_to_origin.from_location || 'Destination'
    const to = dp.flight_to_origin.to_location || 'Origin'
    flights.push({ description: `Return: ${from} → ${to}`, amount: flightTotal - (flights[0]?.amount ?? 0) })
  }
  if (flights.length === 0 && flightTotal > 0) flights.push({ description: 'Flights', amount: flightTotal })
  const hotelList = dp.hotel_stay || []
  const hotels = hotelList.length
    ? hotelList.map((h, i) => {
        const each = Math.round(hotelTotal / hotelList.length)
        const amount = i < hotelList.length - 1 ? each : hotelTotal - each * (hotelList.length - 1)
        return {
          description: `${h.name}${h.check_in || h.check_out ? `, ${[h.check_in, h.check_out].filter(Boolean).join(' – ')}` : ''}`.trim(),
          amount,
        }
      })
    : hotelTotal > 0 ? [{ description: 'Accommodation', amount: hotelTotal }] : []
  const activities = []
  if (dp.days?.length && activityTotal > 0) {
    const perDay = Math.round(activityTotal / dp.days.length)
    dp.days.forEach((d, i) => {
      const dayLabel = d.activities?.length ? d.activities.map((a) => a.start_from || a.name || 'Activity').slice(0, 2).join(', ') : `Day ${d.day}`
      activities.push({ description: dayLabel || `Day ${d.day} activities`, amount: i < dp.days.length - 1 ? perDay : activityTotal - perDay * (dp.days.length - 1) })
    })
  }
  if (activities.length === 0 && activityTotal > 0) activities.push({ description: 'Activities & transport', amount: activityTotal })
  const potentialPoints = Math.round(cost * 1.5)
  return {
    subtotal,
    platform_fee,
    total,
    per_person: (total / 2).toFixed(2),
    breakdown: { flights, hotels, activities },
    points_optimization: {
      best_card_to_use: 'Use a travel rewards card (e.g. Amex Gold 4x on flights/dining) for this plan.',
      potential_points_earned: potentialPoints,
      suggestions: [
        `Book this itinerary with a card that earns bonus on travel to earn ~${potentialPoints.toLocaleString()} points.`,
        'Transfer points to airline or hotel partners for best redemption value.',
      ],
      transfer_partners: ['Chase → United, Hyatt', 'Amex → Delta, Marriott'],
      redemption_tips: ['Check saver award space 30 days out for flights.', 'Hotel points often give strong value for this trip.'],
    },
  }
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
 * Build a full timeline from user's picks (selected activities + custom Google links). Same backend family as /itinerary/generate.
 * No mock: calls ITINERARY_API_BASE. Returns one option so user can go to Quote and complete the flow.
 * @param {{ picks: Array<{ label: string, google_maps_url?: string }>, origin?: string, destination?: string, start_date?: string, end_date?: string }} payload
 * @returns {{ option_id: string, option: object }} option_id and full option (same shape as /itinerary/generate) for quote flow
 */
export async function planWithPicks(payload) {
  const url = `${ITINERARY_API_BASE}/itinerary/plan-with-picks`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Plan-with-picks API error ${res.status}`)
  }
  const data = await res.json()
  if (!data || !data.option_id) {
    throw new Error('Invalid response: expected { option_id, option }')
  }
  if (!data.option || typeof data.option !== 'object') {
    throw new Error('Invalid response: option (timeline) is required')
  }
  return { option_id: data.option_id, option: data.option }
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
    return buildQuoteFromOption(option)
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
      bill_summary: { subtotal: 2840, platform_fee: 15, total: 2855 },
    }
  }
  return request('POST', `/itinerary/${itineraryId}/checkout`)
}

// --- Trip document & bookings (one AI call for document; store in Supabase) ---
function buildTripDocumentContent(option, quote, origin = 'Origin', destination = 'Destination') {
  const dp = option?.daily_plan || {}
  const po = quote?.points_optimization || {}
  const lines = []
  lines.push('TRIP ITINERARY – DETAIL')
  lines.push('')
  lines.push(`${origin} → ${destination}`)
  lines.push(`Plan: ${option?.label || 'Your itinerary'}`)
  lines.push('')
  if (dp.flight_from_source) {
    lines.push('OUTBOUND FLIGHT')
    lines.push(`${dp.flight_from_source.from_location || ''} → ${dp.flight_from_source.to_location || ''}`)
    lines.push(`Dep: ${dp.flight_from_source.start_time || ''} | Arrive by: ${dp.flight_from_source.reach_by || ''}`)
    lines.push('')
  }
  if (dp.hotel_stay?.length) {
    lines.push('HOTELS')
    dp.hotel_stay.forEach((h) => {
      lines.push(`• ${h.name} | Check-in: ${h.check_in} | Check-out: ${h.check_out}`)
    })
    lines.push('')
  }
  if (dp.days?.length) {
    lines.push('DAILY ACTIVITIES')
    dp.days.forEach((d) => {
      lines.push(`Day ${d.day}`)
      ;(d.activities || []).forEach((a) => {
        lines.push(`  • ${a.start_from || ''} ${a.start_time || ''} – ${a.time_to_spend || ''} ${a.name || ''}`.trim())
      })
      lines.push('')
    })
  }
  if (dp.flight_to_origin) {
    lines.push('RETURN FLIGHT')
    lines.push(`${dp.flight_to_origin.from_location || ''} → ${dp.flight_to_origin.to_location || ''}`)
    lines.push(`Dep: ${dp.flight_to_origin.start_time || ''} | Arrive by: ${dp.flight_to_origin.reach_by || ''}`)
    lines.push('')
  }
  lines.push('---')
  lines.push('SUGGESTIONS')
  lines.push('')
  ;(po.suggestions || []).forEach((s) => lines.push(`• ${s}`))
  if (po.redemption_tips?.length) {
    lines.push('')
    lines.push('Redemption tips:')
    po.redemption_tips.forEach((t) => lines.push(`• ${t}`))
  }
  lines.push('')
  lines.push('---')
  lines.push('CURRENCY USAGE')
  lines.push('')
  lines.push('• Local currency: Carry some cash for markets and small vendors.')
  lines.push('• Card widely accepted; notify your bank before travel.')
  lines.push('• ATMs at airport and major areas; check fee with your bank.')
  lines.push('')
  lines.push('---')
  lines.push('MOBILE PLAN')
  lines.push('')
  lines.push('• Enable roaming or buy a local eSIM/data plan for maps and bookings.')
  lines.push('• Save offline maps and key addresses before you go.')
  lines.push('')
  lines.push('---')
  lines.push('CARD BENEFITS')
  lines.push('')
  lines.push(`Best card for this trip: ${po.best_card_to_use || 'Use a travel rewards card.'}`)
  if (po.potential_points_earned != null) {
    lines.push(`Potential points: ${po.potential_points_earned.toLocaleString()}`)
  }
  if (po.transfer_partners?.length) {
    lines.push('Transfer partners: ' + (Array.isArray(po.transfer_partners) ? po.transfer_partners.join('; ') : po.transfer_partners))
  }
  lines.push('')
  lines.push('---')
  lines.push('LOCAL LANGUAGE CHEAT SHEET')
  lines.push('')
  lines.push('Hello / Thank you / Please / Yes / No / Where is…? / How much?')
  lines.push('(Customize per destination in your PDF.)')
  lines.push('')
  lines.push('---')
  lines.push('EMERGENCY CONTACTS')
  lines.push('')
  lines.push('(When using the live backend, this section is filled by AI with destination-specific numbers and contacts.)')
  return lines.join('\n')
}

/**
 * Generate full trip document (itinerary, suggestions, currency, mobile, card, language).
 * Uses AI backend when VITE_ITINERARY_API_BASE is set; otherwise uses built-in mock (no extra AI calls).
 * @param {{ option: object, quote: object, origin?: string, destination?: string }} params
 * @returns {Promise<{ content: string }>}
 */
export async function generateTripDocument(params) {
  const { option, quote, origin, destination } = params || {}
  const useBackend = ITINERARY_API_BASE && ITINERARY_API_BASE !== ''
  if (useBackend) {
    const url = `${ITINERARY_API_BASE}/itinerary/trip-document`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: option || {}, quote: quote || {}, origin: origin || '', destination: destination || '' }),
    })
    if (!res.ok) throw new Error(await res.text() || 'Trip document API error')
    return res.json()
  }
  await delay(800)
  return { content: buildTripDocumentContent(option, quote, origin, destination) }
}

/**
 * Create a booking: store trip document content in Supabase and link to optional user_plan_id.
 * @param {{ user_plan_id?: string, content: string }} params
 * @returns {Promise<{ booking_id: string, trip_document_id: string }>}
 */
export async function createBooking(params) {
  const { user_plan_id, content } = params || {}
  if (!content) throw new Error('Document content is required')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to book')
  const { data: docRow, error: docErr } = await supabase
    .from('trip_documents')
    .insert({ user_id: user.id, content })
    .select('id')
    .single()
  if (docErr) throw new Error(docErr.message)
  const { data: bookRow, error: bookErr } = await supabase
    .from('bookings')
    .insert({ user_id: user.id, user_plan_id: user_plan_id || null, trip_document_id: docRow.id })
    .select('id')
    .single()
  if (bookErr) throw new Error(bookErr.message)
  return { booking_id: bookRow.id, trip_document_id: docRow.id }
}

/**
 * Fetch a single booking with its trip document content.
 * @param {string} bookingId
 * @returns {Promise<{ id: string, user_plan_id: string|null, trip_document_id: string, content: string, created_at: string }>}
 */
export async function getBooking(bookingId) {
  if (!bookingId) throw new Error('Booking ID required')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in')
  const { data: booking, error: bookErr } = await supabase
    .from('bookings')
    .select('id, user_plan_id, trip_document_id, created_at')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (bookErr) throw new Error(bookErr.message)
  if (!booking) return null
  const { data: doc, error: docErr } = await supabase
    .from('trip_documents')
    .select('content')
    .eq('id', booking.trip_document_id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (docErr || !doc) return null
  return { ...booking, content: doc.content }
}

/**
 * Fetch all bookings for the current user (to show "Booked" on plans).
 * @returns {Promise<{ bookings: Array<{ id: string, user_plan_id: string|null }> }>}
 */
export async function getBookingsForUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { bookings: [] }
  const { data, error } = await supabase
    .from('bookings')
    .select('id, user_plan_id')
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  return { bookings: data || [] }
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
  generateTripDocument,
  createBooking,
  getBooking,
  getBookingsForUser,
}
