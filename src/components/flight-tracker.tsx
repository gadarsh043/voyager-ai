"use client"

import { useState } from "react"
import { Plane, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { trackFlight } from "@/lib/api"
import { cn } from "@/lib/utils"

export function FlightTracker() {
  const [flightNumber, setFlightNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    status?: string
    departure?: { airport?: string; time?: string }
    arrival?: { airport?: string; time?: string }
  } | null>(null)

  const handleTrack = async () => {
    const code = flightNumber.trim().toUpperCase()
    if (!code) return
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await trackFlight(code)
      setResult(res)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not track flight"
      setError(
        msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Backend not reachable. Start your API and set VITE_ITINERARY_API_BASE."
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Plane className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Track a flight</h3>
            <p className="text-xs text-muted-foreground">Enter airline code + number (e.g. UA1234)</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <Label htmlFor="flight-number" className="sr-only">Flight number</Label>
            <Input
              id="flight-number"
              placeholder="e.g. UA1234, AA456"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className="h-11"
            />
          </div>
          <Button
            onClick={handleTrack}
            disabled={loading || !flightNumber.trim()}
            className="shrink-0"
          >
            {loading ? (
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              "Track"
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {result && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            {result.status && (
              <p className="text-sm font-medium text-foreground capitalize">{result.status}</p>
            )}
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              {result.departure && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Departure</p>
                    <p className="text-muted-foreground">{result.departure.airport || "—"}</p>
                    {result.departure.time && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {result.departure.time}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {result.arrival && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Arrival</p>
                    <p className="text-muted-foreground">{result.arrival.airport || "—"}</p>
                    {result.arrival.time && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {result.arrival.time}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
