import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { CheckoutSidebar } from '@/components/checkout-sidebar'
import { getQuote } from '@/lib/api'

const PLAN_PRICES = { budget: 1420, balanced: 2840, luxury: 5650 }

export default function Quote() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedId = location.state?.selectedItineraryId || 'balanced'
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    getQuote(selectedId)
      .then(setQuote)
      .catch(() => setQuote(null))
  }, [selectedId])

  const selectedPlanPrice = quote?.subtotal ?? PLAN_PRICES[selectedId] ?? PLAN_PRICES.balanced

  const handleSingleShotBook = () => {
    navigate('/success', { state: { quote, selectedPlanPrice } })
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Quote &amp; Book</h1>
          <p className="mt-2 text-muted-foreground">
            Review the total and book everything in one shot.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {quote && (
              <>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Price breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium tabular-nums">${quote.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform fee</span>
                      <span className="font-medium tabular-nums">${quote.platform_fee}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold tabular-nums">${quote.total?.toLocaleString()}</span>
                    </div>
                    {quote.per_person != null && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Per person (2 travellers)</span>
                        <span className="tabular-nums">${quote.per_person?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {quote.best_card_to_use && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Card benefits (Seat.aero)</h3>
                    <p className="text-sm text-muted-foreground">{quote.best_card_to_use}</p>
                    {quote.potential_points_earned != null && (
                      <p className="mt-2 text-sm font-medium text-foreground">
                        Potential points: {quote.potential_points_earned.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <CheckoutSidebar selectedPlanPrice={selectedPlanPrice} onBook={handleSingleShotBook} />
          </div>
        </div>
      </main>
    </div>
  )
}
