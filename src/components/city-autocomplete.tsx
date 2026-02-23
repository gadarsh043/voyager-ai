"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotonFeature {
  properties: {
    name: string
    city?: string
    state?: string
    country?: string
    type?: string
    osm_value?: string
  }
}

interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

function formatSuggestion(props: PhotonFeature["properties"]): string {
  const parts: string[] = []
  const name = props.name || ""
  const city = props.city || ""
  const state = props.state || ""
  const country = props.country || ""

  // The top-level "name" from Photon is the city/place name
  if (name) parts.push(name)
  // Add state if it's different from the name
  if (state && state !== name) parts.push(state)
  if (country) parts.push(country)

  return parts.join(", ")
}

function getDisplayLabel(props: PhotonFeature["properties"]): string {
  return props.name || props.city || ""
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Search for a city…",
  className,
  id,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Keep query in sync if parent resets value externally
  useEffect(() => {
    setQuery(value)
  }, [value])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    // Cancel previous request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&layer=city&layer=state`
      const res = await fetch(url, { signal: abortRef.current.signal })
      if (!res.ok) throw new Error("fetch failed")
      const data = await res.json()
      const features: PhotonFeature[] = (data.features || []).filter(
        (f: PhotonFeature) => f.properties?.name
      )
      // Deduplicate by formatted suggestion string
      const seen = new Set<string>()
      const unique = features.filter((f) => {
        const key = formatSuggestion(f.properties)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setSuggestions(unique)
      setOpen(unique.length > 0)
      setActiveIndex(-1)
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setSuggestions([])
        setOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    // If user clears the field, propagate immediately
    if (!q.trim()) {
      onChange("")
      setSuggestions([])
      setOpen(false)
    }
    // Debounce API call
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 300)
  }

  const handleSelect = (feature: PhotonFeature) => {
    const label = getDisplayLabel(feature.properties)
    setQuery(label)
    onChange(label)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleClear = () => {
    setQuery("")
    onChange("")
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true)
          }}
          placeholder={placeholder}
          className={cn(
            "flex h-11 min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1"
          )}
          style={{ background: "white" }}
        >
          {suggestions.map((feature, i) => {
            const label = formatSuggestion(feature.properties)
            const isActive = i === activeIndex
            return (
              <li
                key={`${label}-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // Prevent blur on input before click registers
                  e.preventDefault()
                  handleSelect(feature)
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "text-popover-foreground hover:bg-muted"
                )}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
