import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { TripInputForm } from '@/components/trip-input-form'
import { JoinTrip } from '@/components/join-trip'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin, Calendar, Plane, Building2, Route } from 'lucide-react'
import { getTrips, getSavedPlans, getBookingsForUser } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

/** Feature cards for the 'Why Use an AI Trip Planner' section — icon-based, no photos */
const FEATURE_CARDS = [
  {
    id: 'find-flights',
    label: 'Find Cheap Flights',
    description: 'AI scans flight deals and finds the lowest fares in seconds.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    action: 'focus-trip',
  },
  {
    id: 'book-hotels',
    label: 'Book the Best Hotels',
    description: 'Get hotel options tailored to your budget and style.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    action: 'focus-trip',
  },
  {
    id: 'generate-itinerary',
    label: 'Generate Itinerary',
    description: 'Day-by-day schedules personalized for you.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    action: 'focus-trip',
  },
]

/** Popular destinations with descriptions matching stitch */
const INSPIRATION_DESTINATIONS = [
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', flag: '\uD83C\uDDEF\uD83C\uDDF5', budget: 'From $1,800', description: 'Neon streets, ancient temples, and sushi.', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' },
  { id: 'paris', name: 'Paris', country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7', budget: 'From $900', description: 'Art, fashion, gastronomy and culture.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', flag: '\uD83C\uDDEE\uD83C\uDDE9', budget: 'From $800', description: 'Island of the Gods, beaches and yoga.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { id: 'rome', name: 'Rome', country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9', budget: 'From $1,100', description: 'The Eternal City, history and pasta.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
  { id: 'new-york', name: 'New York', country: 'USA', flag: '\uD83C\uDDFA\uD83C\uDDF8', budget: 'From $500', description: 'The city that never sleeps.', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80' },
  { id: 'london', name: 'London', country: 'UK', flag: '\uD83C\uDDEC\uD83C\uDDE7', budget: 'From $1,050', description: 'History, royalty, and modern culture.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', flag: '\uD83C\uDDE6\uD83C\uDDFA', budget: 'From $1,500', description: 'Harbour city, beaches and lifestyle.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
  { id: 'cape-town', name: 'Cape Town', country: 'South Africa', flag: '\uD83C\uDDFF\uD83C\uDDE6', budget: 'From $1,300', description: 'Nature, wine, and breathtaking views.', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80' },
  { id: 'santorini', name: 'Santorini', country: 'Greece', flag: '\uD83C\uDDEC\uD83C\uDDF7', budget: 'From $1,400', description: 'Sunsets, volcanoes and romance.', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
]

export default function Main() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('new-trip')
  const [trips, setTrips] = useState([])
  const [savedPlans, setSavedPlans] = useState([])
  const [bookings, setBookings] = useState([])
  const bookingIdsByPlanId = (bookings || []).reduce((acc, b) => {
    if (b.user_plan_id) acc[b.user_plan_id] = b.id
    return acc
  }, {})

  useEffect(() => {
    const openTab = location.state?.openTab
    const prefillDest = location.state?.prefillDestination
    if (openTab === 'existing-plans') {
      setActiveTab('existing-plans')
      getSavedPlans()
        .then((r) => setSavedPlans(r.plans || []))
        .catch(() => setSavedPlans([]))
      navigate(location.pathname, { replace: true, state: {} })
    } else if (prefillDest) {
      setActiveTab('new-trip')
      setTimeout(() => document.getElementById('trip-form')?.scrollIntoView({ behavior: 'smooth' }), 150)
    }
  }, [location.state?.openTab, location.state?.prefillDestination, location.pathname, navigate])

  useEffect(() => {
    getTrips()
      .then((r) => setTrips(r.trips || []))
      .catch(() => setTrips([]))
  }, [])

  useEffect(() => {
    getSavedPlans()
      .then((r) => setSavedPlans(r.plans || []))
      .catch(() => setSavedPlans([]))
  }, [])

  useEffect(() => {
    getBookingsForUser()
      .then((r) => setBookings(r.bookings || []))
      .catch(() => setBookings([]))
  }, [])

  const handleGenerateDone = (result) => {
    if (!result?.options) {
      navigate('/plan', {})
      return
    }
    navigate('/plan', {
      state: {
        options: result.options,
        origin: result.origin,
        destination: result.destination,
        start_date: result.start_date,
        end_date: result.end_date,
        suggested_days_for_trip: result.suggested_days_for_trip,
      },
    })
  }

  const handleQuickAction = (action) => {
    if (action === 'focus-trip') {
      setActiveTab('new-trip')
      setTimeout(() => document.getElementById('trip-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="w-full px-4 py-6 sm:py-10 lg:px-8" style={{minHeight: '80vh'}}>
        {activeTab === 'new-trip' && (
          <>
            {/* Hero — full-bleed mountain background matching stitch */}
            <div className="relative mb-12 overflow-hidden" style={{ minHeight: '420px' }}>
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80"
                alt="Mountain landscape"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
              <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-8 text-center sm:pt-20 sm:pb-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                  <span className="text-primary">✦</span> POWERED BY TRAVEL ENTHUSIASTS
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl font-display">
                  Your Entire Trip,
                </h1>
                <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl font-display">
                  Optimized by AI
                </h1>
                <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
                  Tell us where, when, and how much. We build the perfect itinerary in seconds.
                </p>
              </div>
              {/* Trip form — full width within hero */}
              <div id="trip-form" className="relative z-10 w-full px-4 pb-8 scroll-mt-8">
                <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl">
                  <TripInputForm onSubmit={handleGenerateDone} />
                </div>
              </div>
            </div>

            {/* Travel Inspiration grid — with descriptions */}
            <div className="mb-16 pt-12 border-t border-border">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">Travel Inspiration</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Curated destinations trending this week</p>
                </div>
                <span className="hidden text-sm text-primary hover:underline cursor-pointer sm:block" onClick={() => handleQuickAction('focus-trip')}>
                  View all destinations →
                </span>
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                {INSPIRATION_DESTINATIONS.map((dest) => (
                  <div
                    key={dest.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleQuickAction('focus-trip')}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAction('focus-trip')}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {/* Budget badge */}
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white/95">
                        {dest.budget}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base leading-none">{dest.flag}</span>
                          <h3 className="font-bold text-white text-sm drop-shadow-md">{dest.name}</h3>
                        </div>
                      </div>
                    </div>
                    {/* Description below image */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs text-muted-foreground leading-snug">{dest.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Use an AI Trip Planner - at bottom */}
            <div className="pt-12 border-t border-border">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-display">
                  Why Use an AI Trip Planner?
                </h2>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
                  Experience travel planning reimagined. Smarter, faster, and tailored just for you.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 page-enter">
                {FEATURE_CARDS.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleQuickAction(item.action)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAction(item.action)}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-muted aspect-[4/5] sm:aspect-[3/4] min-h-[280px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                      <h3 className="text-xl font-bold text-white drop-shadow-md sm:text-2xl">{item.label}</h3>
                      <p className="mt-2 text-sm text-white/90 drop-shadow sm:text-base">{item.description}</p>
                      <Button
                        className="mt-4 w-fit bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuickAction(item.action)
                        }}
                      >
                        Try now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'join-trip' && <JoinTrip />}

        {activeTab === 'existing-plans' && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
                Existing Plans
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Saved itineraries. Tap a plan to view the 3 options again — no waiting this time.
              </p>
            </div>
            {savedPlans.length === 0 ? (
              <Card className="rounded-2xl border border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                  <p className="text-muted-foreground">No saved plans yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a trip (e.g. Dallas to Houston) and it will be added here.
                  </p>
                  <Button
                    className="mt-4 min-h-[44px]"
                    onClick={() => setActiveTab('new-trip')}
                  >
                    Plan a new trip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {savedPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="cursor-pointer rounded-2xl border border-border transition-colors hover:bg-muted/50 active:bg-muted/50 touch-manipulation min-h-[44px]"
                    onClick={() => {
                      const hasBooking = bookingIdsByPlanId[plan.id]
                      if (hasBooking) {
                        navigate(`/booking/${hasBooking}`)
                      } else {
                        navigate('/plan', {
                          state: {
                            options: plan.options,
                            origin: plan.origin,
                            destination: plan.destination,
                            start_date: plan.start_date,
                            end_date: plan.end_date,
                            user_plan_id: plan.id,
                          },
                        })
                      }
                    }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">
                          {plan.origin} → {plan.destination}
                        </span>
                      </div>
                      {bookingIdsByPlanId[plan.id] && (
                        <Badge variant="default" className="shrink-0">Booked</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(plan.start_date || plan.end_date) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {plan.start_date && plan.end_date
                            ? `${plan.start_date} – ${plan.end_date}`
                            : plan.start_date || plan.end_date}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {Array.isArray(plan.options) ? plan.options.length : 0} itinerary options · click to open
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer — sticky, compact, matching stitch */}
      <footer className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">Voyager AI</span>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">© 2026 Voyager AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
