"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, ExternalLink, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getDestinations, getPlaceImage } from "@/lib/api"
import { cn } from "@/lib/utils"

/** Fallback destinations when API is unavailable - each has unique image */
const FALLBACK_DESTINATIONS = [
  { id: "tokyo", name: "Tokyo", country: "Japan", query: "Tokyo, Japan" },
  { id: "paris", name: "Paris", country: "France", query: "Paris, France" },
  { id: "bali", name: "Bali", country: "Indonesia", query: "Bali, Indonesia" },
  { id: "new-york", name: "New York", country: "USA", query: "New York, USA" },
  { id: "rome", name: "Rome", country: "Italy", query: "Rome, Italy" },
  { id: "barcelona", name: "Barcelona", country: "Spain", query: "Barcelona, Spain" },
]

type Destination = {
  id: string
  name: string
  country?: string
  query: string
  image?: string
  description?: string
}

interface DestinationsExplorerProps {
  onSelectDestination?: (destination: string, query: string) => void
  compact?: boolean
  hideHeading?: boolean
}

export function DestinationsExplorer({ onSelectDestination, compact, hideHeading }: DestinationsExplorerProps) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDestinations()
      .then(async (res) => {
        const list = res?.destinations
        const raw = Array.isArray(list) && list.length > 0
          ? list
          : FALLBACK_DESTINATIONS.map((d) => ({ id: d.id, name: d.name, country: d.country, query: d.query, image: undefined }))

        const withImages = await Promise.all(
          raw.map(async (d: Record<string, unknown>) => {
            const query = String(d.query ?? d.name ?? "")
            const image = d.image ? String(d.image) : await getPlaceImage(query)
            return {
              id: String(d.id ?? d.name ?? Math.random()),
              name: String(d.name ?? "Unknown"),
              country: d.country ? String(d.country) : undefined,
              query: query || String(d.name ?? ""),
              image,
              description: d.description ? String(d.description) : undefined,
            }
          })
        )
        if (!cancelled) setDestinations(withImages)
      })
      .catch(() => {
        if (!cancelled) {
          Promise.all(
            FALLBACK_DESTINATIONS.map(async (d) => ({
              ...d,
              image: await getPlaceImage(d.query),
            }))
          ).then((withImages) => {
            if (!cancelled) setDestinations(withImages)
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleSelect = (dest: Destination) => {
    setSelectedId(dest.id)
    if (onSelectDestination) {
      onSelectDestination(dest.name, dest.query)
    } else {
      navigate("/", {
        state: { prefillDestination: dest.query },
      })
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          destinations.slice(0, 6).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleSelect(d)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <MapPin className="h-3.5 w-3.5" />
              {d.name}
            </button>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!hideHeading && (
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Explore destinations
        </h3>
      )}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <Card
              key={dest.id}
              className={cn(
                "overflow-hidden cursor-pointer rounded-2xl border border-border transition-all hover:shadow-md hover:border-primary/30 group",
                selectedId === dest.id && "ring-2 ring-primary border-primary"
              )}
              onClick={() => handleSelect(dest)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="font-semibold text-white drop-shadow">{dest.name}</h4>
                  <p className="text-sm text-white/90">{dest.country ?? "Travel"}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(dest.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground hover:bg-white hover:text-foreground"
                  aria-label="View on Google Maps"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan a trip</span>
                <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
