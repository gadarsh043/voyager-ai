"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Plane, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { searchFlights } from "@/lib/api"
import { cn } from "@/lib/utils"

interface FlightItem {
  flight_iata?: string
  flight_number?: string
  departure?: { airport?: string; iata?: string; scheduled?: string }
  arrival?: { airport?: string; iata?: string; scheduled?: string }
  status?: string
}

interface FlightsSectionProps {
  origin: string
  destination: string
  date?: string
  className?: string
}

export function FlightsSection({ origin, destination, date, className }: FlightsSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [flights, setFlights] = useState<FlightItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  const fetchFlights = useCallback(() => {
    if (!origin?.trim() || !destination?.trim()) return
    setLoading(true)
    setError(null)
    setApiMessage(null)
    searchFlights({ origin: origin.trim(), destination: destination.trim(), date })
      .then((res) => {
        setFlights(res?.flights ?? [])
        if ((!res?.flights || res.flights.length === 0) && (res?.message || res?.reason)) {
          setApiMessage(res.message || res.reason)
        }
      })
      .catch((e) => {
        setError(e?.message ?? "Could not fetch flights")
        setFlights([])
      })
      .finally(() => {
        setLoading(false)
        hasFetchedRef.current = true
      })
  }, [origin, destination, date])

  useEffect(() => {
    hasFetchedRef.current = false
    setFlights([])
    setError(null)
    setApiMessage(null)
  }, [origin, destination, date])

  useEffect(() => {
    if (expanded && !hasFetchedRef.current && !loading && origin?.trim() && destination?.trim()) {
      fetchFlights()
    }
  }, [expanded, origin, destination, date, loading, fetchFlights])

  const handleToggle = () => {
    const nextExpanded = !expanded
    setExpanded(nextExpanded)
    if (nextExpanded && !hasFetchedRef.current && !loading) {
      fetchFlights()
    }
  }

  const formatTime = (s: string | undefined) => {
    if (!s) return "—"
    try {
      const d = new Date(s)
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    } catch {
      return String(s).slice(11, 16) || "—"
    }
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Plane className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Real flights for your route</h3>
            <p className="text-xs text-muted-foreground">
              {origin} → {destination} {date ? `· ${date}` : ""}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Fetching flights…</span>
            </div>
          ) : error ? (
            <div className="py-2 space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="gap-1" onClick={fetchFlights}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : flights.length === 0 ? (
            <div className="py-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                {apiMessage || "No flights found. Aviation Stack free tier has limited routes."}
              </p>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={fetchFlights}>
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {flights.slice(0, 5).map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-3 py-3"
                >
                  <span className="text-sm font-medium tabular-nums">{f.flight_iata ?? f.flight_number ?? "—"}</span>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-muted-foreground">{f.departure?.airport ?? f.departure?.iata ?? "—"}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatTime(f.departure?.scheduled)}</span>
                    <span className="text-primary shrink-0">→</span>
                    <span className="truncate text-muted-foreground">{f.arrival?.airport ?? f.arrival?.iata ?? "—"}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatTime(f.arrival?.scheduled)}</span>
                  </div>
                  {f.status && (
                    <span className="text-xs capitalize text-muted-foreground shrink-0">{f.status}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
