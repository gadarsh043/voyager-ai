import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sparkles, Check, Link2, Share2, Copy,
  Calendar, Bookmark, ChevronLeft, ChevronRight, X,
  Plane, Hotel, Utensils, Map as MapIcon, ExternalLink
} from 'lucide-react'
import { generateItinerary, planWithPicks, createShareableTrip } from '@/lib/api'
import { FlightsSection } from '@/components/flights-section'
import { ItineraryExploreView } from '@/components/itinerary-explore-view'
import { PlacesMap } from '@/components/places-map'
import { cn } from '@/lib/utils'

import './Plan.css'

function pickId(pick) {
  return `${pick.label}|${pick.google_maps_url || ''}`
}

const OPTION_TIERS = [
  { key: 'budget', label: 'Budget', icon: '💰', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'balanced', label: 'Balanced', icon: '⚖️', color: 'text-primary', bg: 'bg-primary/10', recommended: true },
  { key: 'premium', label: 'Premium', icon: '💎', color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

const EXPLORE_TABS = [
  { id: 'go', label: 'Where to Go', icon: MapIcon },
  { id: 'eat', label: 'Where to Eat', icon: Utensils },
  { id: 'stay', label: 'Where to Stay', icon: Hotel },
  { id: 'flight', label: 'About your flight', icon: Plane },
]

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
  const [customPlanning, setCustomPlanning] = useState(false)
  const [customPlanError, setCustomPlanError] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareCode, setShareCode] = useState('')
  const [shareLoading, setShareLoading] = useState(false)
  const [shareError, setShareError] = useState('')
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('go')
  const [mapPlaces, setMapPlaces] = useState([])

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
        setGenerateError(err?.message || 'Something went wrong loading your itineraries. Please try again.')
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
    const label = url.includes('google.com/maps') ? 'My place' : url.slice(0, 40)
    addPick({ label, google_maps_url: url })
    setCustomUrl('')
  }

  const handleContinueToQuote = () => {
    const selected = options.find((o) => o.id === (selectedId || options[0]?.id)) || options[0]
    if (!selected) return
    navigate('/quote', {
      state: {
        selectedItineraryId: selected.id,
        selectedOption: selected,
        user_plan_id: location.state?.user_plan_id,
        origin: planOrigin,
        destination: planDestination,
        start_date: planStartDate,
        end_date: planEndDate,
        shareCode
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
          start_date: planMeta.start_date,
          end_date: planMeta.end_date,
          shareCode
        },
      })
    } catch (err) {
      setCustomPlanError(err?.message || 'Something went wrong building your plan. Please try again.')
    } finally {
      setCustomPlanning(false)
    }
  }

  const planMeta = location.state || {}
  const planOrigin = planMeta.origin || ''
  const planDestination = planMeta.destination || ''
  const planStartDate = planMeta.start_date || ''
  const planEndDate = planMeta.end_date || ''

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
        setShareError(err?.message || 'Something went wrong creating the invite code. Please try again.')
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

  const selectedOption = options.find((o) => o.id === (selectedId || options[0]?.id)) || options[0]

  return (
    <div className="plan-page">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <div className="plan-layout">

        {/* ── LEFT: My Picks sidebar ── */}
        <div className={cn('sidebar-container', sidebarOpen ? 'open' : 'closed')}>
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="flex items-center gap-2">
                <h3 className="sidebar-header-title">
                  <Bookmark className="h-5 w-5 text-primary" />
                  My Picks
                </h3>
                <span className="sidebar-header-badge">
                  {picks.length} item{picks.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close My Picks"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="sidebar-form">
              <label className="sidebar-form-label">Add Custom Place</label>
              <div className="flex flex-col gap-2">
                <textarea
                  className="sidebar-form-textarea"
                  placeholder="Paste Google Maps links here..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <button type="button" onClick={addCustomPlace} className="sidebar-form-button">
                  <Link2 className="h-4 w-4" />
                  Add to List
                </button>
              </div>
            </div>

            <div className="sidebar-list">
              <div className="sidebar-list-header">
                <h4 className="sidebar-list-title">Current Picks</h4>
                {picks.length > 0 && (
                  <button type="button" onClick={() => setPicks([])} className="sidebar-list-clear">
                    Clear All
                  </button>
                )}
              </div>

              {picks.length === 0 ? (
                <div className="sidebar-empty">
                  <Bookmark className="sidebar-empty-icon" />
                  <p className="sidebar-empty-title">No picks yet.</p>
                  <p className="sidebar-empty-desc">Add items from the plan or paste a Google Maps link above.</p>
                </div>
              ) : (
                picks.map((p) => (
                  <div key={p.id} className="sidebar-item group">
                    <div className="sidebar-item-icon">
                      <MapIcon className="h-6 w-6" />
                    </div>
                    <div className="sidebar-item-content">
                      <div className="sidebar-item-header">
                        <h4 className="sidebar-item-title">{p.label}</h4>
                        <button type="button" onClick={() => removePick(p.id)} className="sidebar-item-remove">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {p.google_maps_url && (
                        <a href={p.google_maps_url} target="_blank" rel="noopener noreferrer" className="sidebar-item-link">
                          <ExternalLink className="h-3 w-3" />
                          Google Maps
                        </a>
                      )}
                      <span className="sidebar-item-badge">NEW</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="sidebar-footer">
              {customPlanError && <p className="sidebar-error">{customPlanError}</p>}
              <button
                type="button"
                disabled={picks.length === 0 || customPlanning}
                onClick={handleGetAIPlanAndQuote}
                className="sidebar-cta"
              >
                {customPlanning ? (
                  <>
                    <span className="sidebar-cta-spinner" />
                    Generating plan…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Get AI plan &amp; quote
                  </>
                )}
              </button>
              <p className="sidebar-footer-text">AI will optimize the route based on your picks.</p>
            </div>
          </div>
        </div>

        {/* ── CENTER: Map panel ── */}
        <div className="maps-section">
          <PlacesMap destination={planDestination} places={mapPlaces} className="h-full w-full" />
        </div>

        {/* ── RIGHT: Itinerary Panel ── */}
        <div className={cn('itinerary-panel')}>
          <div className="itinerary-header">
            <div className="itinerary-header-badge-row">
              <span className="itinerary-header-badge">Active Trip</span>
              {(planStartDate || planEndDate) && (
                <span className="itinerary-header-date">
                  <Calendar className="h-3 w-3" />
                  {planStartDate}{planEndDate && planStartDate !== planEndDate ? ` – ${planEndDate}` : ''}
                </span>
              )}
            </div>
            <h1 className="itinerary-header-title">
              {planDestination ? `Your ${planDestination} Adventure` : 'Your Trip Adventure'}
            </h1>
            <p className="itinerary-header-subtitle">
              Generated by Voyager AI{planOrigin && planDestination ? ` for ${planOrigin} → ${planDestination}` : ''}.
            </p>
          </div>

          <div className="itinerary-scrollable-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-icon-wrapper">
                  <span className="loading-spinner" />
                </div>
                <p className="loading-title">Loading plans…</p>
                <p className="loading-subtitle">Fetching your itineraries</p>
              </div>
            ) : generateError && options.length === 0 ? (
              <div className="error-container">
                <p className="error-text">{generateError}</p>
                <Button onClick={fetchPlans}>Try again</Button>
              </div>
            ) : (
              <>
                {suggestedDaysForTrip != null && (
                  <div className="suggested-days-banner">
                    <Calendar className="h-5 w-5 shrink-0 text-primary" />
                    <p className="suggested-days-banner-text">
                      AI suggests <span className="suggested-days-highlight">{suggestedDaysForTrip} day{suggestedDaysForTrip !== 1 ? 's' : ''}</span> for this trip
                    </p>
                  </div>
                )}

                <div className="option-cards-grid">
                  {options.map((option, index) => {
                    const tier = OPTION_TIERS[index] || OPTION_TIERS[1]
                    const isSelected = selectedId === option.id
                    return (
                      <div
                        key={option.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(option.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedId(option.id)}
                        className={cn('option-card group', isSelected ? 'selected' : 'default')}
                      >
                        {tier.recommended && <div className="option-card-recommended">Recommended</div>}
                        <div className="option-card-header">
                          <span className={cn('option-card-title', isSelected ? 'selected' : 'default')}>
                            {option.label || tier.label}
                          </span>
                          <span className="text-base">{tier.icon}</span>
                        </div>
                        <div className="option-card-price">
                          ${(option.total_estimated_cost ?? 0).toLocaleString()}
                        </div>
                        <div className="option-card-meta">
                          <span className="option-card-meta-item"><Plane className="h-3 w-3" /> {option.flight_info || 'Flight included'}</span>
                          <span className="option-card-meta-item"><Hotel className="h-3 w-3" /> {option.hotel_info || 'Hotel included'}</span>
                        </div>
                        {isSelected && (
                          <div className="option-card-check"><Check className="h-3 w-3 text-white" /></div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {planOrigin && planDestination && (
                  <div className="flights-section-wrapper">
                    <FlightsSection origin={planOrigin} destination={planDestination} date={planStartDate} />
                  </div>
                )}

                <div className="explore-tabs-container">
                  {EXPLORE_TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn('explore-tab-button', activeTab === tab.id ? 'active' : 'default')}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {selectedOption && (
                  <ItineraryExploreView
                    option={selectedOption}
                    destination={planDestination}
                    origin={planOrigin}
                    onAddPick={addPick}
                    activeTab={activeTab}
                    onPlacesReady={setMapPlaces}
                  />
                )}
              </>
            )}
          </div>

          <div className="bottom-action-bar">
            <div className="bottom-action-wrapper">
              {/* Sidebar toggle moved to action bar */}
              <Button
                variant="outline"
                className="mr-auto flex items-center gap-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle My Picks"
              >
                <Bookmark className="h-4 w-4" />
                {sidebarOpen ? 'Hide Picks' : 'My Picks'}
              </Button>

              <Dialog open={shareOpen} onOpenChange={handleShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="share-button" disabled={loading || options.length === 0}>
                    <Share2 className="h-4 w-4" />
                    Share Trip
                    {shareCode && <span className="share-code-badge">{shareCode}</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share this trip</DialogTitle>
                    <DialogDescription>Share the invite code with others. They can enter it under Join Trip.</DialogDescription>
                  </DialogHeader>
                  {shareLoading ? (
                    <p className="share-dialog-loading">Creating invite code…</p>
                  ) : shareError ? (
                    <p className="share-dialog-error">{shareError}</p>
                  ) : shareCode ? (
                    <div className="share-dialog-code-container">
                      <p className="share-dialog-code-label">Invite code</p>
                      <div className="share-dialog-code-box">
                        <code className="share-dialog-code-text">{shareCode}</code>
                        <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopyCode} aria-label="Copy code">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {copied && <p className="share-dialog-code-success">Copied to clipboard.</p>}
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>

              <button
                type="button"
                onClick={handleContinueToQuote}
                disabled={!selectedOption}
                className="continue-quote-button"
              >
                Continue to Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
