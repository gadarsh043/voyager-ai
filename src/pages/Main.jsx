import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { TripInputForm } from '@/components/trip-input-form'
import { JoinTrip } from '@/components/join-trip'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { getTrips } from '@/lib/api'

export default function Main() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('new-trip')
  const [trips, setTrips] = useState([])

  useEffect(() => {
    getTrips()
      .then((r) => setTrips(r.trips || []))
      .catch(() => setTrips([]))
  }, [])

  const handleGenerateDone = () => {
    navigate('/plan')
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {activeTab === 'new-trip' && (
          <TripInputForm onSubmit={handleGenerateDone} />
        )}

        {activeTab === 'join-trip' && (
          <JoinTrip />
        )}

        {activeTab === 'existing-plans' && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
                Existing Plans
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Your trips and favourites. Mark visited or open to edit.
              </p>
            </div>
            {trips.length === 0 ? (
              <Card className="rounded-2xl border border-border">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">No trips yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab('new-trip')}
                  >
                    Plan your first trip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {trips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="cursor-pointer rounded-2xl border border-border transition-colors hover:bg-muted/50"
                    onClick={() => navigate('/plan', { state: { tripId: trip.id } })}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{trip.destination}</span>
                      </div>
                      <Badge variant={trip.status === 'BOOKED' ? 'default' : 'secondary'}>
                        {trip.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {trip.start_date} – {trip.end_date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${trip.budget_total?.toLocaleString()}
                      </div>
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
