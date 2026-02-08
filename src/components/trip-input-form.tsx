"use client"

import { useState } from "react"
import { CalendarDays, Globe, DollarSign, Gauge, Accessibility, UtensilsCrossed, Sparkles, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { updateUserPreferences } from "@/lib/auth"
import { useAuth } from "@/context/AuthContext"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface TripInputFormProps {
  onSubmit: () => void
}

const paceOptions = [
  { value: "slow", label: "Slow", description: "Relaxed with downtime" },
  { value: "moderate", label: "Moderate", description: "Balanced mix" },
  { value: "fast", label: "Fast", description: "Pack it all in" },
]

const interestOptions = ["Food", "Temple", "Nightlife", "Nature"] as const

export function TripInputForm({ onSubmit }: TripInputFormProps) {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [numPersons, setNumPersons] = useState(2)
  const [accommodationType, setAccommodationType] = useState("hotel")
  const [passport, setPassport] = useState("")
  const [budget, setBudget] = useState([3000])
  const [perPersonBudget, setPerPersonBudget] = useState([1000])
  const [pace, setPace] = useState("moderate")
  const [disability, setDisability] = useState(false)
  const [dietary, setDietary] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      onSubmit()
    }, 2000)
  }

  const handleToggleInterest = (option: (typeof interestOptions)[number]) => {
    setInterests((prev) => {
      const next = prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
      if (user?.id) {
        updateUserPreferences(user.id, next).catch((error: unknown) => {
          console.error("Failed to update interests", error)
        })
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground font-display text-balance">
          Plan your perfect trip
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Tell us about your travel preferences and our AI will craft personalized itineraries.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* From / Origin */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Travel from
            </Label>
            <Input
              placeholder="e.g. San Francisco"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </Label>
            <Input
              placeholder="e.g. Tokyo, Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Interests */}
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Interests
            </Label>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((option) => {
                const isSelected = interests.includes(option)
                return (
                  <Button
                    key={option}
                    type="button"
                    onClick={() => handleToggleInterest(option)}
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    className="h-11 px-4"
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date()}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
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
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="sg">Singapore</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Budget */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total Budget
              </span>
              <span className="tabular-nums text-foreground">${budget[0].toLocaleString()}</span>
            </Label>
            <Slider
              value={budget}
              onValueChange={setBudget}
              max={20000}
              min={500}
              step={100}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$500</span>
              <span>$20,000</span>
            </div>
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
            <div className="grid grid-cols-3 gap-3">
              {paceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPace(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 text-center transition-all",
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
            className="h-12 w-full gap-2 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
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
