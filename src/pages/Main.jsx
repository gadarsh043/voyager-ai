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

  // When redirected after "Join Trip", open Existing Plans tab
  useEffect(() => {
    const openTab = location.state?.openTab
    if (openTab === 'existing-plans') {
      setActiveTab('existing-plans')
      getSavedPlans()
        .then((r) => setSavedPlans(r.plans || []))
        .catch(() => setSavedPlans([]))
      navigate(location.pathname, { replace: true, state: {} }) // clear state
    }
  }, [location.state?.openTab, location.pathname, navigate])

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
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        {activeTab === 'new-trip' && (
          <TripInputForm onSubmit={handleGenerateDone} />
        )}

        {activeTab === 'join-trip' && (
          <JoinTrip />
        )}

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
                  <p className="mt-1 text-sm text-muted-foreground">Generate a trip (e.g. Dallas to Houston) and it will be added here.</p>
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
