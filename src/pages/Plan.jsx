import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sparkles, Check, Plus, Trash2, ExternalLink, Share2, Copy, Calendar } from 'lucide-react'
import { generateItinerary, planWithPicks, createShareableTrip } from '@/lib/api'
import { FlightsSection } from '@/components/flights-section'
import { ItineraryExploreView } from '@/components/itinerary-explore-view'
import { cn } from '@/lib/utils'

function pickId(pick) {
  return `${pick.label}|${pick.google_maps_url || ''}`
}

export default function Plan() {
  const navigate = useNavigate()
  const location = useLocation()
  const [options, setOptions] = useState([])
  const [suggestedDaysForTrip, setSuggestedDaysForTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generateError, setGenerateError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [picks, setPicks] = useState([])
  const [customUrl, setCustomUrl] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [customPlanning, setCustomPlanning] = useState(false)
  const [customPlanError, setCustomPlanError] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareCode, setShareCode] = useState('')
  const [shareLoading, setShareLoading] = useState(false)
  const [shareError, setShareError] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchPlans = useCallback(() => {
    setGenerateError(null)
    setLoading(true)
    generateItinerary({})
      .then((res) => {
        if (res?.options && Array.isArray(res.options)) {
          setOptions(res.options)
          setSelectedId((prev) => (prev || res.options[0]?.id) ?? null)
          if (res.suggested_days_for_trip != null) setSuggestedDaysForTrip(res.suggested_days_for_trip)
          else setSuggestedDaysForTrip(null)
        } else {
          setOptions([])
          setSuggestedDaysForTrip(null)
        }
      })
      .catch((err) => {
        setOptions([])
        setSuggestedDaysForTrip(null)
        setGenerateError(err?.message || 'Failed to load itineraries')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const stateOptions = location.state?.options
    if (Array.isArray(stateOptions) && stateOptions.length > 0) {
      setOptions(stateOptions)
      setSelectedId((prev) => (prev || stateOptions[0]?.id) ?? null)
      if (location.state?.suggested_days_for_trip != null) setSuggestedDaysForTrip(location.state.suggested_days_for_trip)
      else setSuggestedDaysForTrip(null)
      setLoading(false)
      return
    }
    fetchPlans()
  }, [location.state?.options, location.state?.suggested_days_for_trip, fetchPlans])

  const addPick = useCallback((pick) => {
    const id = pickId(pick)
    setPicks((prev) => (prev.some((p) => pickId(p) === id) ? prev : [...prev, { id, ...pick }]))
  }, [])

  const removePick = useCallback((id) => {
    setPicks((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addCustomPlace = () => {
    const url = customUrl.trim()
    if (!url) return
    const label = customLabel.trim() || (url.includes('google.com/maps') ? 'My place' : url.slice(0, 40))
    addPick({ label, google_maps_url: url })
    setCustomUrl('')
    setCustomLabel('')
  }

  const handleContinueToQuote = () => {
    const selected = options.find((o) => o.id === (selectedId || options[0]?.id)) || options[0]
    if (!selected) return
    navigate('/quote', {
      state: {
        selectedItineraryId: selected.id,
        selectedOption: selected,
        user_plan_id: location.state?.user_plan_id,
        origin: location.state?.origin,
        destination: location.state?.destination,
      },
    })
  }

  const handleGetAIPlanAndQuote = async () => {
    if (picks.length === 0) return
    setCustomPlanError(null)
    setCustomPlanning(true)
    try {
      const planMeta = location.state || {}
      const res = await planWithPicks({
        picks: picks.map((p) => ({ label: p.label, google_maps_url: p.google_maps_url })),
        origin: planMeta.origin,
        destination: planMeta.destination,
        start_date: planMeta.start_date,
        end_date: planMeta.end_date,
      })
      navigate('/quote', {
        state: {
          selectedItineraryId: res.option_id,
          selectedOption: res.option,
          user_plan_id: planMeta.user_plan_id,
          origin: planMeta.origin,
          destination: planMeta.destination,
        },
      })
    } catch (err) {
      setCustomPlanError(err?.message || 'Failed to generate plan from picks')
    } finally {
      setCustomPlanning(false)
    }
  }

  const planMeta = location.state || {}
  const planOrigin = planMeta.origin || ''
  const planDestination = planMeta.destination || ''
  const planStartDate = planMeta.start_date || ''

  const handleShareOpen = async (open) => {
    setShareOpen(open)
    if (open && !shareCode) {
      setShareError('')
      setShareLoading(true)
      try {
        const res = await createShareableTrip({
          origin: planOrigin,
          destination: planDestination,
          start_date: planMeta.start_date,
          end_date: planMeta.end_date,
          options,
        })
        setShareCode(res.invite_code || '')
      } catch (err) {
        setShareError(err?.message || 'Failed to create invite code')
      } finally {
        setShareLoading(false)
      }
    }
  }

  const handleCopyCode = () => {
    if (!shareCode) return
    navigator.clipboard?.writeText(shareCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center page-enter">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            Choose or build your itinerary
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base px-1">
            Pick one of the three plans, or select activities and add your own places — then get an AI plan and quote.
          </p>
        </div>

        {planOrigin && planDestination && (
          <div className="mb-8 page-enter">
            <FlightsSection origin={planOrigin} destination={planDestination} date={planStartDate} />
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10">
              <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">Loading plans…</p>
            <p className="text-sm text-muted-foreground">Fetching your itineraries</p>
          </div>
        ) : generateError && options.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8">
            <p className="text-center text-sm text-destructive">{generateError}</p>
            <Button onClick={fetchPlans}>Try again</Button>
          </div>
        ) : (
          <div className="mb-6 sm:mb-8 space-y-6 page-enter">
            {suggestedDaysForTrip != null && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Suggested trip length: {suggestedDaysForTrip} {suggestedDaysForTrip === 1 ? 'day' : 'days'}
                  </p>
                  <p className="text-sm text-muted-foreground">AI-recommended duration for {planOrigin && planDestination ? `${planOrigin} → ${planDestination}` : 'this trip'}</p>
                </div>
              </div>
            )}
            {/* Plan selector pills */}
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => {
                const isSelected = selectedId === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedId(option.id)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left transition-all',
                      isSelected ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <span className="font-semibold">Plan {index + 1}</span>
                    <span className="text-sm text-muted-foreground">{option.label}</span>
                    <span className="font-bold tabular-nums text-primary">${(option.total_estimated_cost ?? 0).toLocaleString()}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                )
              })}
            </div>

            {/* imean.ai style: Where to Go / Eat / Stay / Flight tabs + map */}
            {(() => {
              const selected = options.find((o) => o.id === (selectedId || options[0]?.id)) || options[0]
              if (!selected) return null
              return (
                <div className={cn(
                  'rounded-2xl border-2 p-4 sm:p-6 transition-colors',
                  selectedId === selected.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                )}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-foreground">{selected.label}</h2>
                    <Button
                      variant={selectedId === selected.id ? 'secondary' : 'default'}
                      className={cn(
                        'gap-1.5',
                        selectedId === selected.id && 'ring-2 ring-primary ring-offset-2'
                      )}
                      onClick={() => setSelectedId(selected.id)}
                    >
                      <Check className="h-4 w-4" />
                      {selectedId === selected.id ? 'Selected' : 'Choose this plan'}
                    </Button>
                  </div>
                  <ItineraryExploreView
                    option={selected}
                    destination={planDestination}
                    origin={planOrigin}
                    onAddPick={addPick}
                  />
                </div>
              )
            })()}
          </div>
        )}

        <div className="mb-6 sm:mb-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h3 className="mb-1 text-base font-semibold text-foreground sm:text-lg">My picks</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Add activities from the plans above, or paste Google Maps links for places you like. Then request an AI plan and quote.
          </p>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <Label htmlFor="custom_url" className="text-xs">Google Maps or place URL</Label>
              <Input
                id="custom_url"
                type="url"
                placeholder="https://www.google.com/maps/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="h-10 sm:h-9 min-h-[44px]"
              />
            </div>
            <div className="w-full sm:w-40 space-y-1">
              <Label htmlFor="custom_label" className="text-xs">Label (optional)</Label>
              <Input
                id="custom_label"
                type="text"
                placeholder="e.g. My café"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="h-10 sm:h-9 min-h-[44px]"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" size="sm" className="gap-1 h-10 min-h-[44px] sm:h-9 w-full sm:w-auto" onClick={addCustomPlace}>
                <Plus className="h-3.5 w-3.5" />
                Add place
              </Button>
            </div>
          </div>

          {picks.length > 0 && (
            <ul className="mb-4 space-y-2">
              {picks.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground truncate">{p.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.google_maps_url && (
                      <a
                        href={p.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        aria-label="Open in Google Maps"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removePick(p.id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {customPlanError && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-destructive">{customPlanError}</p>
              <Button variant="outline" size="sm" onClick={() => { setCustomPlanError(null); handleGetAIPlanAndQuote() }}>
                Try again
              </Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="gap-2 min-h-[44px]"
              disabled={picks.length === 0 || customPlanning}
              onClick={handleGetAIPlanAndQuote}
            >
              {customPlanning ? (
                <>
                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Generating plan…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get AI plan & quote
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {picks.length === 0 ? 'Add at least one place to use this.' : `Using ${picks.length} place(s).`}
            </span>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
          <Dialog open={shareOpen} onOpenChange={handleShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 min-h-[44px] w-full sm:w-auto" disabled={loading || options.length === 0}>
                <Share2 className="h-4 w-4 shrink-0" />
                Share trip
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share this trip</DialogTitle>
                <DialogDescription>
                  Share the invite code with others. They can enter it under Join Trip and the plan will appear in their Existing Plans.
                </DialogDescription>
              </DialogHeader>
              {shareLoading ? (
                <p className="py-4 text-sm text-muted-foreground">Creating invite code…</p>
              ) : shareError ? (
                <p className="py-2 text-sm text-destructive">{shareError}</p>
              ) : shareCode ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Invite code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3 text-lg font-mono tracking-widest">
                      {shareCode}
                    </code>
                    <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopyCode} aria-label="Copy code">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-sm text-emerald-600">Copied to clipboard.</p>}
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
          <Button className="gap-2 min-h-[44px] w-full sm:w-auto" onClick={handleContinueToQuote}>
            Continue to Quote
          </Button>
        </div>
      </main>
    </div>
  )
}
