import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { ItineraryCards } from '@/components/itinerary-cards'
import { TripCustomizer } from '@/components/trip-customizer'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function Plan() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)

  const handleContinueToQuote = () => {
    navigate('/quote', { state: { selectedItineraryId: selectedId || 'opt_2' } })
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
            Choose or customise your itinerary
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Pick one of the AI options below, or create a different one with your own places.
          </p>
        </div>

        <div className="mb-8">
          <ItineraryCards selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div className="mb-8">
          <TripCustomizer />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Create a different itinerary</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Add your own places (e.g. Google Maps links). We&apos;ll recalculate cabs, timing and logistics.
          </p>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Recalculate with my choices
          </Button>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            className="gap-2"
            onClick={handleContinueToQuote}
          >
            Continue to Quote
          </Button>
        </div>
      </main>
    </div>
  )
}
