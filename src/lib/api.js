/**
 * API layer: set USE_MOCK to true for React mock data; when false, hits real backend.
 */
const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

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

const mockItineraryOptions = [
  {
    id: 'opt_1',
    label: 'Luxury & Leisure',
    daily_plan: [
      { day: 1, activities: ['Arrive NRT', 'Private transfer', 'Senso-ji Temple'], hotel: 'Aman Tokyo' },
      { day: 2, activities: ['Tsukiji', 'TeamLab Borderless', 'Michelin dinner'], hotel: 'Aman Tokyo' },
    ],
    total_estimated_cost: 5500,
  },
  {
    id: 'opt_2',
    label: 'Balanced Comfort',
    daily_plan: [
      { day: 1, activities: ['Arrive HND', 'Train to city', 'Shibuya'], hotel: 'The Gate Hotel' },
      { day: 2, activities: ['Meiji Shrine', 'Harajuku', 'Ginza'], hotel: 'The Gate Hotel' },
    ],
    total_estimated_cost: 2840,
  },
  {
    id: 'opt_3',
    label: 'Budget Explorer',
    daily_plan: [
      { day: 1, activities: ['Arrive', 'Asakusa walk', 'Street food'], hotel: 'Mystays Asakusa' },
      { day: 2, activities: ['Tsukiji outer market', 'Ueno Park'], hotel: 'Mystays Asakusa' },
    ],
    total_estimated_cost: 1420,
  },
]

const mockQuote = {
  subtotal: 2840,
  platform_fee: 15,
  total: 2855,
  best_card_to_use: 'Amex Gold (4x on Dining/Flights)',
  potential_points_earned: 4800,
  per_person: 1427.5,
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
  if (USE_MOCK) {
    await delay(2000)
    return { options: mockItineraryOptions }
  }
  return request('POST', '/itinerary/generate', params)
}

export async function customiseItinerary(id, payload) {
  if (USE_MOCK) {
    await delay(1500)
    return { id, ...payload }
  }
  return request('PATCH', `/itinerary/${id}/customise`, payload)
}

export async function getQuote(itineraryId) {
  if (USE_MOCK) {
    await delay(400)
    return mockQuote
  }
  return request('GET', `/itinerary/${itineraryId}/quote`)
}

export async function checkout(itineraryId) {
  if (USE_MOCK) {
    await delay(800)
    return {
      booking_id: 'book_1',
      pdf_url: '#',
      itinerary_summary: mockItineraryOptions[1],
      bill_summary: mockQuote,
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
  getQuote,
  checkout,
}
