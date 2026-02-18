"use client"

import { useEffect, useRef } from "react"
import { loadGoogleMaps, getGoogleMapsApiKey } from "@/lib/google-maps"
import { MapPin } from "lucide-react"

interface TripMapProps {
  origin: string
  destination: string
  waypoints?: string[]
  className?: string
}

/** Google Maps embed showing route from origin to destination. Enable "Maps Embed API" in Google Cloud. */
export function TripMap({ origin, destination, waypoints = [], className = "" }: TripMapProps) {
  const key = getGoogleMapsApiKey()
  if (!key || !origin || !destination) return null

  const originEnc = encodeURIComponent(origin)
  const destEnc = encodeURIComponent(destination)
  const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${originEnc}&destination=${destEnc}`

  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-muted/30 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Your route: {origin} → {destination}</span>
      </div>
      <div className="aspect-video w-full">
        <iframe
          title="Trip route map"
          src={embedUrl}
          width="100%"
          height="100%"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  )
}
