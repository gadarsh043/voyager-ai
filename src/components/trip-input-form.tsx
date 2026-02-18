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

interface TripInputFormProps {
  onSubmit: (result?: { options: unknown[] }) => void
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
      const msg = err instanceof Error ? err.message : "Failed to generate itineraries"
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

  return (
    <div className="relative mx-auto max-w-3xl">
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background backdrop-blur-sm px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10">
            <span className="inline-flex h-9 w-9 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
          <div className="max-w-sm space-y-2 text-center">
            <p className="text-xl font-semibold text-foreground">Generating AI itineraries</p>
            <p className="text-sm text-muted-foreground">
              The AI is building your plans. This often takes <strong>8–10 minutes</strong>. Please stay on this page and don’t refresh.
            </p>
          </div>
        </div>
      )}
      {generateError && (
        <div
          ref={errorBannerRef}
          className="sticky top-0 z-40 mb-4 flex flex-col gap-4 rounded-xl border-2 border-destructive/60 bg-destructive/15 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-destructive flex-1">{generateError}</p>
          <Button
            className="gap-2 shrink-0"
            onClick={() => { setGenerateError(null); handleGenerate() }}
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {/* From / Origin (city or place) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Travel from
            </Label>
            <Input
              placeholder="e.g. Houston, Dallas, London"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="h-11 min-h-[44px]"
            />
          </div>

          {/* Destination (city or place) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </Label>
            <Input
              placeholder="e.g. Dallas, New York, Tokyo"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-11 min-h-[44px]"
            />
          </div>

          {/* Interests */}
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Interests
            </Label>
            <div className="flex flex-wrap gap-3">
              {INTEREST_OPTIONS.map((option) => {
                const isSelected = interests.includes(option)
                return (
                  <Button
                    key={option}
                    type="button"
                    onClick={() => handleToggleInterest(option)}
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    className="h-11 min-h-[44px] px-4 touch-manipulation"
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Number of persons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">No. of persons</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={numPersons}
              onChange={(e) => setNumPersons(Number(e.target.value) || 1)}
              className="h-11"
            />
          </div>

          {/* Accommodation type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Accommodation</Label>
            <Select value={accommodationType} onValueChange={setAccommodationType}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-primary" />
              Trip Dates
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-11 w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
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

          {/* Passport Origin */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-primary" />
              Passport Origin
            </Label>
            <Select value={passport} onValueChange={setPassport}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_NAMES.map((name: string) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Per Person Budget */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Per Person
              </span>
              <span className="tabular-nums text-foreground">${perPersonBudget[0].toLocaleString()}</span>
            </Label>
            <Slider
              value={perPersonBudget}
              onValueChange={setPerPersonBudget}
              max={10000}
              min={200}
              step={50}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$200</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Trip Pace */}
          <div className="space-y-3 md:col-span-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="h-4 w-4 text-primary" />
              Trip Pace
            </Label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {paceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPace(option.value)}
                  className={cn(
                    "flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-all touch-manipulation sm:px-4",
                    pace === option.value
                      ? "border-primary bg-accent text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted"
                  )}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-xs">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Accessibility className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Accessibility Needs</p>
                  <p className="text-xs text-muted-foreground">Person with disability accommodations</p>
                </div>
              </div>
              <Switch checked={disability} onCheckedChange={setDisability} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Dietary Restrictions</p>
                  <p className="text-xs text-muted-foreground">Vegetarian, vegan, halal, etc.</p>
                </div>
              </div>
              <Switch checked={dietary} onCheckedChange={setDietary} />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8">
            <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-12 min-h-[48px] w-full gap-2 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation"
            size="lg"
          >
            {isGenerating ? (
              <>
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Generating Itineraries...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Itineraries
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
