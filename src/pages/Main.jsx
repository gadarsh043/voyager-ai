import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { TripInputForm } from '@/components/trip-input-form'
import { JoinTrip } from '@/components/join-trip'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin, Calendar } from 'lucide-react'
import { getTrips, getSavedPlans, getBookingsForUser } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

/** Large feature cards for the 'Why Use an AI Trip Planner' section */
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

/** Popular destinations to inspire travel - static, no API call needed */
const INSPIRATION_DESTINATIONS = [
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', budget: 'from $1,800', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' },
  { id: 'paris', name: 'Paris', country: 'France', flag: '🇫🇷', budget: 'from $1,500', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', flag: '🇮🇩', budget: 'from $900', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { id: 'new-york', name: 'New York', country: 'USA', flag: '🇺🇸', budget: 'from $1,200', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80' },
  { id: 'rome', name: 'Rome', country: 'Italy', flag: '🇮🇹', budget: 'from $1,100', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', flag: '🇦🇪', budget: 'from $1,400', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', flag: '🇪🇸', budget: 'from $1,000', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80' },
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', flag: '🇯🇵', budget: 'from $1,600', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
  { id: 'maldives', name: 'Maldives', country: 'Maldives', flag: '🇲🇻', budget: 'from $2,500', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' },
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
        {activeTab === 'new-trip' && (
          <>
            {/* Hero + Trip form first */}
            <div className="mb-10 sm:mb-14 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-display">
                Smarter travel starts here
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
                Find flight deals, hotels, and personalized itineraries — all in one place.
              </p>
            </div>

            {/* Trip planning form */}
            <div id="trip-form" className="scroll-mt-8 mb-16">
              <TripInputForm onSubmit={handleGenerateDone} />
            </div>

            {/* Travel Inspiration grid */}
            <div className="mb-16 pt-12 border-t border-border">
              <div className="mb-8 text-center">
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Travel Inspiration</h2>
                <p className="mt-1 text-sm text-muted-foreground">Click any destination to plan your trip</p>
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
                {INSPIRATION_DESTINATIONS.map((dest) => (
                  <div
                    key={dest.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setActiveTab('new-trip')
                      setTimeout(() => {
                        document.getElementById('trip-form')?.scrollIntoView({ behavior: 'smooth' })
                        // Prefill destination via navigate state so TripInputForm can pick it up
                      }, 100)
                      handleQuickAction('focus-trip')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAction('focus-trip')}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-muted aspect-[4/3] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Budget badge */}
                    <div className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white/90">
                      {dest.budget}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg leading-none">{dest.flag}</span>
                        <h3 className="font-bold text-white text-base drop-shadow-md">{dest.name}</h3>
                      </div>
                      <p className="mt-0.5 text-xs text-white/80">{dest.country}</p>
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
                  Find flights, hotels, and personalized itineraries — all powered by AI.
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
                Saved itineraries. Tap a plan to view the 3 options again — no new AI call.
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
    </div>
  )
}
