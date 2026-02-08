import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { CheckoutSidebar } from '@/components/checkout-sidebar'
import { getQuote, generateTripDocument, createBooking } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plane, Building2, MapPin, TrendingDown, CreditCard } from 'lucide-react'

export default function Quote() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedOption = location.state?.selectedOption
  const selectedId = location.state?.selectedItineraryId
  const userPlanId = location.state?.user_plan_id
  const origin = location.state?.origin
  const destination = location.state?.destination
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  useEffect(() => {
    if (!selectedOption) {
      setLoading(false)
      setQuote(null)
      return
    }
    setLoading(true)
    setError(null)
    getQuote(selectedOption)
      .then(setQuote)
      .catch((e) => {
        setError(e?.message || 'Failed to load quote')
        setQuote(null)
      })
      .finally(() => setLoading(false))
  }, [selectedOption])

  const selectedPlanPrice = quote?.subtotal ?? quote?.total ?? null
  const bestCard = quote?.points_optimization?.best_card_to_use ?? quote?.best_card_to_use
  const potentialPoints = quote?.points_optimization?.potential_points_earned ?? quote?.potential_points_earned

  const handleSingleShotBook = async () => {
    if (!selectedOption || !quote) return
    setBookingError(null)
    setBookingInProgress(true)
    try {
      const dp = selectedOption?.daily_plan || {}
      const inferredOrigin = origin || dp.flight_from_source?.from_location || dp.flight_to_origin?.to_location || ''
      const inferredDestination = destination || dp.flight_from_source?.to_location || dp.flight_to_origin?.from_location || ''
      const { content } = await generateTripDocument({
        option: selectedOption,
        quote,
        origin: inferredOrigin,
        destination: inferredDestination,
      })
      const { booking_id } = await createBooking({ user_plan_id: userPlanId || undefined, content })
      navigate('/success', { state: { booking_id } })
    } catch (e) {
      setBookingError(e?.message || 'Booking failed')
    } finally {
      setBookingInProgress(false)
    }
  }

  if (!selectedOption && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Select a plan on the Plan page to get an in-depth quote.</p>
            <Button onClick={() => navigate('/plan')}>Go to Plan</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Quote &amp; Book</h1>
          <p className="mt-2 text-muted-foreground">
            In-depth quote for your selected plan. Review every place, hotel, flight and points optimization.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm text-muted-foreground">Analyzing plan and building quote…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {quote && (
                <>
                  {/* Summary */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Price summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium tabular-nums">${quote.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform fee</span>
                        <span className="font-medium tabular-nums">${quote.platform_fee ?? 15}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold tabular-nums">${quote.total?.toLocaleString()}</span>
                      </div>
                      {quote.per_person != null && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Per person (2 travellers)</span>
                          <span className="tabular-nums">${Number(quote.per_person).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* In-depth breakdown by category */}
                  {quote.breakdown && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="mb-4 text-sm font-semibold text-foreground">In-depth breakdown</h3>
                      <div className="space-y-5">
                        {quote.breakdown.flights?.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Plane className="h-3.5 w-3.5" />
                              Flights
                            </div>
                            <ul className="space-y-1.5">
                              {quote.breakdown.flights.map((item, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                  <span className="text-foreground">{item.description}</span>
                                  <span className="tabular-nums font-medium">${item.amount?.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {quote.breakdown.hotels?.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5" />
                              Hotels
                            </div>
                            <ul className="space-y-1.5">
                              {quote.breakdown.hotels.map((item, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                  <span className="text-foreground">{item.description}</span>
                                  <span className="tabular-nums font-medium">${item.amount?.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {quote.breakdown.activities?.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              Activities &amp; other
                            </div>
                            <ul className="space-y-1.5">
                              {quote.breakdown.activities.map((item, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                  <span className="text-foreground">{item.description}</span>
                                  <span className="tabular-nums font-medium">${item.amount?.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Points Optimization */}
                  {(quote.points_optimization || bestCard) && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30 p-5">
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        <TrendingDown className="h-4 w-4" />
                        Points optimization
                      </h3>
                      <div className="space-y-4">
                        {(quote.points_optimization?.best_card_to_use ?? bestCard) && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                              Best card to use: {quote.points_optimization?.best_card_to_use ?? bestCard}
                            </span>
                          </div>
                        )}
                        {potentialPoints != null && (
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Potential points earned: <strong>{Number(potentialPoints).toLocaleString()}</strong>
                          </p>
                        )}
                        {quote.points_optimization?.suggestions?.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">Suggestions</p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                              {quote.points_optimization.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {quote.points_optimization?.transfer_partners?.length > 0 && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">Transfer partners</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                              {quote.points_optimization.transfer_partners.join(' · ')}
                            </p>
                          </div>
                        )}
                        {quote.points_optimization?.redemption_tips?.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">Redemption tips</p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                              {quote.points_optimization.redemption_tips.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-2">
              {bookingError && (
                <p className="text-sm text-destructive">{bookingError}</p>
              )}
              <CheckoutSidebar
                selectedPlanPrice={selectedPlanPrice}
                onBook={handleSingleShotBook}
                bookingInProgress={bookingInProgress}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
