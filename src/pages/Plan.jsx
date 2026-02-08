import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { ItineraryTimeline } from '@/components/itinerary-timeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Check, Plus, Trash2, ExternalLink } from 'lucide-react'
import { generateItinerary, planWithPicks } from '@/lib/api'
import { cn } from '@/lib/utils'

function pickId(pick) {
  return `${pick.label}|${pick.google_maps_url || ''}`
}

export default function Plan() {
  const navigate = useNavigate()
  const location = useLocation()
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [picks, setPicks] = useState([])
  const [customUrl, setCustomUrl] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [customPlanning, setCustomPlanning] = useState(false)

  useEffect(() => {
    const stateOptions = location.state?.options
    if (Array.isArray(stateOptions) && stateOptions.length > 0) {
      setOptions(stateOptions)
      setSelectedId((prev) => (prev || stateOptions[0]?.id) ?? null)
      setLoading(false)
      return
    }
    generateItinerary({})
      .then((res) => {
        if (res?.options && Array.isArray(res.options)) {
          setOptions(res.options)
          setSelectedId((prev) => (prev || res.options[0]?.id) ?? null)
        }
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false))
  }, [location.state?.options])

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
    navigate('/quote', { state: { selectedItineraryId: selectedId || (options[0]?.id) || 'opt_1' } })
  }

  const handleGetAIPlanAndQuote = async () => {
    if (picks.length === 0) return
    setCustomPlanning(true)
    try {
      const res = await planWithPicks({ picks: picks.map((p) => ({ label: p.label, google_maps_url: p.google_maps_url })) })
      navigate('/quote', { state: { selectedItineraryId: res?.option_id || 'custom_from_picks' } })
    } catch (err) {
      setCustomPlanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
            Choose or build your itinerary
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Pick one of the three plans, or select activities and add your own places — then get an AI plan and quote.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10">
              <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">Loading plans…</p>
            <p className="text-sm text-muted-foreground">Fetching your itineraries</p>
          </div>
        ) : (
          <div className="mb-8 grid gap-6 md:grid-cols-3 md:items-stretch">
            {options.map((option, index) => {
              const isSelected = selectedId === option.id
              return (
                <div
                  key={option.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(option.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(option.id)}
                  className={cn(
                    'flex h-full min-h-[440px] flex-col rounded-2xl border-2 bg-card p-5 transition-all hover:shadow-lg cursor-pointer',
                    isSelected ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-primary/30'
                  )}
                >
                  <div className="mb-3 flex shrink-0 items-center justify-between">
                    <h3 className="font-semibold text-foreground">Plan {index + 1}</h3>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="mb-2 shrink-0 text-sm text-muted-foreground">{option.label}</p>
                  <div className="mb-3 shrink-0">
                    <span className="text-xl font-bold tabular-nums text-foreground">
                      ${(option.total_estimated_cost ?? 0).toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground"> estimated</span>
                  </div>
                  <div className="min-h-0 max-h-[360px] flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-muted/30 p-4">
                    <ItineraryTimeline option={option} onAddPick={addPick} />
                  </div>
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className="mt-4 w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(option.id)
                    }}
                  >
                    {isSelected ? 'Selected' : 'Choose Plan'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 text-lg font-semibold text-foreground">My picks</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Add activities from the plans above, or paste Google Maps links for places you like. Then request an AI plan and quote.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] space-y-1">
              <Label htmlFor="custom_url" className="text-xs">Google Maps or place URL</Label>
              <Input
                id="custom_url"
                type="url"
                placeholder="https://www.google.com/maps/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="w-40 space-y-1">
              <Label htmlFor="custom_label" className="text-xs">Label (optional)</Label>
              <Input
                id="custom_label"
                type="text"
                placeholder="e.g. My café"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" size="sm" className="gap-1 h-9" onClick={addCustomPlace}>
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

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="gap-2"
              disabled={picks.length === 0 || customPlanning}
              onClick={handleGetAIPlanAndQuote}
            >
              <Sparkles className="h-4 w-4" />
              {customPlanning ? 'Planning…' : 'Get AI plan & quote'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {picks.length === 0 ? 'Add at least one place to use this.' : `Using ${picks.length} place(s).`}
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="gap-2" onClick={handleContinueToQuote}>
            Continue to Quote
          </Button>
        </div>
      </main>
    </div>
  )
}
