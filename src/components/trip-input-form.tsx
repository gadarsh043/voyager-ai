"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { CalendarDays, Globe, DollarSign, Gauge, Accessibility, UtensilsCrossed, Sparkles, MapPin, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useIsMobile } from "@/components/ui/use-mobile"
import { INTEREST_OPTIONS } from "@/lib/constants"
import { COUNTRY_NAMES } from "@/lib/countries"
import { generateItinerary, saveSavedPlan } from "@/lib/api"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CityAutocomplete } from "@/components/city-autocomplete"
import { SnakeGame } from "@/components/snake-game"

interface TripInputFormProps {
  onSubmit: (result?: {
    options: unknown[];
    origin?: string;
    destination?: string;
    start_date?: string;
    end_date?: string;
    suggested_days_for_trip?: number;
  }) => void
}

const paceOptions = [
  { value: "slow", label: "Slow", description: "Relaxed with downtime" },
  { value: "moderate", label: "Moderate", description: "Balanced mix" },
  { value: "fast", label: "Fast", description: "Pack it all in" },
]

const TRIP_FORM_DRAFT_KEY = "trip_form_draft"

function loadDraft() {
  try {
    const s = sessionStorage.getItem(TRIP_FORM_DRAFT_KEY)
    if (s) return JSON.parse(s) as Record<string, unknown>
  } catch {
    /* ignore */
  }
  return null
}

function saveDraft(data: Record<string, unknown>) {
  try {
    sessionStorage.setItem(TRIP_FORM_DRAFT_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(TRIP_FORM_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

export function TripInputForm({ onSubmit }: TripInputFormProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const location = useLocation()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [numPersons, setNumPersons] = useState(2)

  useEffect(() => {
    const saved = Array.isArray(user?.preferences) ? user.preferences.filter((p): p is string => typeof p === "string" && INTEREST_OPTIONS.includes(p)) : []
    setInterests(saved)
  }, [user?.id, user?.preferences])

  useEffect(() => {
    const prefill = (location.state as { prefillDestination?: string })?.prefillDestination
    if (prefill && typeof prefill === "string") {
      setDestination(prefill)
    }
  }, [location.state])
  const [accommodationType, setAccommodationType] = useState("hotel")
  const [passport, setPassport] = useState("")
  const [perPersonBudget, setPerPersonBudget] = useState([1000])
  const [pace, setPace] = useState("moderate")
  const [disability, setDisability] = useState(false)
  const [dietary, setDietary] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const errorBannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      if (typeof draft.origin === "string") setOrigin(draft.origin)
      if (typeof draft.destination === "string") setDestination(draft.destination)
      if (Array.isArray(draft.interests)) setInterests(draft.interests.filter((x): x is string => typeof x === "string"))
      if (typeof draft.numPersons === "number" && draft.numPersons >= 1) setNumPersons(draft.numPersons)
      if (typeof draft.accommodationType === "string") setAccommodationType(draft.accommodationType)
      if (Array.isArray(draft.perPersonBudget) && draft.perPersonBudget[0] != null) setPerPersonBudget([Number(draft.perPersonBudget[0])])
      if (typeof draft.pace === "string") setPace(draft.pace)
      if (typeof draft.disability === "boolean") setDisability(draft.disability)
      if (typeof draft.dietary === "boolean") setDietary(draft.dietary)
      if (draft.dateFrom && draft.dateTo) {
        const from = new Date(draft.dateFrom as string)
        const to = new Date(draft.dateTo as string)
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) setDateRange({ from, to })
      } else if (draft.dateFrom) {
        const from = new Date(draft.dateFrom as string)
        if (!isNaN(from.getTime())) setDateRange({ from, to: from })
      }
    }
  }, [])

  const handleGenerate = async () => {
    setGenerateError(null)
    setIsGenerating(true)
    const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
    const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
    saveDraft({
      origin: origin.trim(),
      destination: destination.trim(),
      interests,
      numPersons,
      accommodationType,
      perPersonBudget: [perPersonBudget[0]],
      pace,
      disability,
      dietary,
      dateFrom: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    })
    try {
      sessionStorage.setItem("itinerary_generating", "1")
      const res = await generateItinerary({
        origin: origin.trim() || undefined,
        destination: destination.trim() || undefined,
        start_date: startDate,
        end_date: endDate,
        per_person_budget: perPersonBudget[0],
        num_persons: numPersons,
        accommodation_type: accommodationType,
        pace,
        preferences: interests,
        disability,
        dietary,
      })
      if (res?.options?.length) {
        sessionStorage.removeItem("itinerary_generating")
        clearDraft()
        try {
          await saveSavedPlan({
            origin: origin.trim() || 'Unknown',
            destination: destination.trim() || 'Unknown',
            start_date: startDate,
            end_date: endDate,
            options: res.options,
          })
        } catch {
          // non-blocking: still navigate to plan even if save fails
        }
        onSubmit({
          options: res.options,
          origin: origin.trim() || 'Unknown',
          destination: destination.trim() || 'Unknown',
          start_date: startDate,
          end_date: endDate,
          suggested_days_for_trip: res.suggested_days_for_trip,
        })
      } else {
        sessionStorage.removeItem("itinerary_generating")
        onSubmit()
      }
    } catch (err) {
      sessionStorage.removeItem("itinerary_generating")
      const msg = err instanceof Error ? err.message : "Something went wrong generating your itinerary. Please try again."
      setGenerateError(msg)
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    } finally {
      sessionStorage.removeItem("itinerary_generating")
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (!isGenerating) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isGenerating])

  const handleToggleInterest = (option: (typeof INTEREST_OPTIONS)[number]) => {
    setInterests((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    )
  }

  // Derived display strings
  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : ""

  // Field wrapper style shared across all inputs/selects
  const fieldCls = "w-full h-12 pl-10 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
  const selectCls = "w-full h-12 pl-10 pr-8 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
  const iconCls = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
  const chevronCls = "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 ml-0.5"

  return (
    <div className="relative w-full">
      {isGenerating && (
        <div className="flex flex-col items-center justify-center w-full py-4 min-h-[400px]">
          <SnakeGame destination={destination} />
        </div>
      )}

      {!isGenerating && generateError && (
        <div
          ref={errorBannerRef}
          className="sticky top-0 z-40 mb-4 flex flex-col gap-4 rounded-xl border-2 border-destructive/60 bg-destructive/15 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-destructive flex-1">{generateError}</p>
          <Button className="gap-2 shrink-0" onClick={() => { setGenerateError(null); handleGenerate() }}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )}

      {!isGenerating && (
        <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleGenerate() }}>
          {/* Row 1: Origin | Destination | Trip Dates | No. of Persons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Origin */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Origin</label>
              <div className="relative flex items-center">
                <MapPin className={iconCls} />
                <CityAutocomplete
                  id="origin"
                  value={origin}
                  onChange={setOrigin}
                  placeholder="Starting Point"
                  className={fieldCls}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Destination</label>
              <div className="relative flex items-center">
                <MapPin className={cn(iconCls, "text-primary")} />
                <CityAutocomplete
                  id="destination"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Where to?"
                  className={fieldCls}
                />
              </div>
            </div>

            {/* Trip Dates */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Trip Dates</label>
              <div className="relative flex items-center">
                <CalendarDays className={iconCls} />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(fieldCls, "text-left cursor-pointer", !dateRange && "text-muted-foreground/60")}
                    >
                      {dateLabel || "Add dates"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 max-w-[min(100vw-2rem,380px)] sm:max-w-none" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={new Date()}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={isMobile ? 1 : 2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Number of Persons */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="num-persons" className={labelCls}>Number of Persons</label>
              <div className="relative flex items-center">
                <svg className={cn(iconCls, "h-4 w-4")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.48-.634-2.057M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.48.634-2.057M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="num-persons"
                  type="number"
                  min={1}
                  max={20}
                  value={numPersons}
                  onChange={(e) => setNumPersons(Number(e.target.value) || 1)}
                  className={fieldCls}
                  placeholder="2 Travelers"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Interests | Accommodation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interests (spans 2 columns) */}
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className={labelCls}>Travel Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((option: string) => (
                  <Button
                    key={option}
                    type="button"
                    variant={interests.includes(option) ? 'default' : 'outline'}
                    size="sm"
                    className={cn("h-9 px-3 text-xs sm:text-sm font-medium transition-colors", interests.includes(option) && "bg-primary text-primary-foreground")}
                    onClick={() => handleToggleInterest(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Accommodation (takes 1 column) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="accommodation-select" className={labelCls}>Accommodation</label>
              <div className="relative flex items-center">
                <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <select
                  id="accommodation-select"
                  className={selectCls}
                  value={accommodationType}
                  onChange={(e) => setAccommodationType(e.target.value)}
                >
                  <option value="hotel">Hotel</option>
                  <option value="hostel">Hostel</option>
                  <option value="resort">Resort</option>
                  <option value="apartment">Vacation Rental</option>
                </select>
                <svg className={chevronCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Row 3: Passport Origin | Trip Pace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Passport Origin */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="passport-select" className={labelCls}>Passport Origin</label>
              <div className="relative flex items-center">
                <Globe className={iconCls} />
                <select
                  id="passport-select"
                  className={selectCls}
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                >
                  <option value="" disabled>Country</option>
                  {COUNTRY_NAMES.map((name: string) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <svg className={chevronCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Trip Pace */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pace-select" className={labelCls}>Trip Pace</label>
              <div className="relative flex items-center">
                <Gauge className={iconCls} />
                <select
                  id="pace-select"
                  className={selectCls}
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                >
                  <option value="moderate">Moderate</option>
                  <option value="slow">Slow &amp; Relaxed</option>
                  <option value="fast">Fast &amp; Packed</option>
                </select>
                <svg className={chevronCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Row 3: Accessibility | Dietary | Budget Slider (2 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Accessibility Needs */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="accessibility-select" className={labelCls}>Accessibility Needs</label>
              <div className="relative flex items-center">
                <Accessibility className={iconCls} />
                <select
                  id="accessibility-select"
                  className={selectCls}
                  value={disability ? "yes" : "none"}
                  onChange={(e) => setDisability(e.target.value !== "none")}
                >
                  <option value="none">None</option>
                  <option value="yes">Wheelchair Accessible</option>
                  <option value="limited">Limited Mobility</option>
                  <option value="visual">Visual Aid Required</option>
                </select>
                <svg className={chevronCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dietary-select" className={labelCls}>Dietary Restrictions</label>
              <div className="relative flex items-center">
                <UtensilsCrossed className={iconCls} />
                <select
                  id="dietary-select"
                  className={selectCls}
                  value={dietary ? "vegetarian" : "none"}
                  onChange={(e) => setDietary(e.target.value !== "none")}
                >
                  <option value="none">None</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                </select>
                <svg className={chevronCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Per Person Budget — spans 2 cols */}
            <div className="md:col-span-2 flex flex-col justify-end pb-0.5">
              <div className="flex items-center justify-between mb-2">
                <label className={cn(labelCls, "mb-0")}>Per Person Budget</label>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  ${perPersonBudget[0].toLocaleString()}
                </span>
              </div>
              <div className="px-1">
                <Slider
                  value={perPersonBudget}
                  onValueChange={setPerPersonBudget}
                  max={10000}
                  min={0}
                  step={50}
                  className="py-1"
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono">
                  <span>$0</span>
                  <span>$10k+</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-60 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating Itineraries…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Personalized Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
