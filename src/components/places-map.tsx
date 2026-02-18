"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, ExternalLink, Loader2 } from "lucide-react"
import { loadGoogleMaps, getGoogleMapsApiKey } from "@/lib/google-maps"

interface Place {
  name: string
  google_maps_url?: string
}

interface PlacesMapProps {
  destination: string
  places: Place[]
  className?: string
}

/** Google Maps with markers for each place. Uses Geocoding to resolve coordinates. */
export function PlacesMap({ destination, places, className = "" }: PlacesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markersRef = useRef<{ setMap: (m: null) => void }[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  const key = getGoogleMapsApiKey()
  const searchUrl = `https://www.google.com/maps/search/places+near+${encodeURIComponent(destination)}`

  const placesKey = places.map((p) => p.name).join("|")

  useEffect(() => {
    if (!key || !mapRef.current) return

    let cancelled = false
    setStatus("loading")

    const init = async () => {
      const ok = await loadGoogleMaps()
      if (!ok || cancelled || !mapRef.current) {
        setStatus("error")
        setErrorMsg("Maps JavaScript API unavailable. Enable it in Google Cloud Console and ensure billing is set up.")
        return
      }

      const g = (window as unknown as { google?: { maps: { Map: new (...a: unknown[]) => unknown; Marker: new (...a: unknown[]) => unknown; Geocoder: new () => { geocode: (req: unknown, cb: (res: unknown[], st: string) => void) => void }; LatLngBounds: new () => { extend: (loc: { lat: () => number; lng: () => number }) => void } }; LatLng: new (lat: number, lng: number) => { lat: () => number; lng: () => number } } }).google
      if (!g?.maps) {
        setStatus("error")
        setErrorMsg("Maps JavaScript API not ready. Check console for details.")
        return
      }

      const Geocoder = g.maps.Geocoder
      const geocoder = new (Geocoder as new () => { geocode: (req: { address: string }, cb: (results: { geometry?: { location: { lat: () => number; lng: () => number } } }[], status: string) => void) => void })()

      const geocode = (query: string): Promise<{ lat: () => number; lng: () => number } | null> =>
        new Promise((resolve) => {
          geocoder.geocode({ address: query }, (results: { geometry?: { location: { lat: () => number; lng: () => number } } }[], status: string) => {
            if (status === "OK" && results?.[0]?.geometry?.location) {
              resolve(results[0].geometry!.location)
            } else {
              resolve(null)
            }
          })
        })

      const centerOn = destination || (places[0]?.name ?? "")
      const centerResult = await geocode(centerOn)
      const center = centerResult ? { lat: centerResult.lat(), lng: centerResult.lng() } : { lat: 0, lng: 0 }

      const MapClass = g.maps.Map as new (el: HTMLDivElement, opts: { center: { lat: number; lng: number }; zoom: number }) => { fitBounds: (b: unknown, o?: unknown) => void }
      const map = new MapClass(mapRef.current, { center, zoom: 12 }) as { fitBounds: (b: unknown, o?: unknown) => void }
      mapInstanceRef.current = map

      const LatLngBounds = g.maps.LatLngBounds as new () => { extend: (loc: { lat: () => number; lng: () => number }) => void }
      const bounds = new LatLngBounds()
      const Marker = g.maps.Marker as new (opts: { position: { lat: number; lng: number }; map: unknown; title: string }) => { setMap: (m: null) => void; addListener: (ev: string, fn: () => void) => void }

      const addMarker = (location: { lat: () => number; lng: () => number }, title: string, url?: string) => {
        const pos = { lat: location.lat(), lng: location.lng() }
        const marker = new Marker({ position: pos, map, title })
        if (url) marker.addListener("click", () => window.open(url, "_blank"))
        markersRef.current.push(marker)
        bounds.extend(location)
      }

      if (centerResult) addMarker(centerResult, destination || "Destination", undefined)

      for (let i = 0; i < places.length; i++) {
        if (cancelled) break
        const place = places[i]
        const query = `${place.name}, ${destination}`.trim()
        const loc = await geocode(query)
        if (loc) {
          addMarker(loc, place.name, place.google_maps_url)
        }
        if (i < places.length - 1) await new Promise((r) => setTimeout(r, 150))
      }

      if (markersRef.current.length > 1) {
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
      }

      if (!cancelled) setStatus("ready")
    }

    init()
    return () => {
      cancelled = true
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
      mapInstanceRef.current = null
    }
  }, [key, destination, placesKey])

  if (!key) {
    return (
      <div className={`flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted/30 p-6 ${className}`}>
        <MapPin className="h-10 w-10 text-muted-foreground" />
        <p className="text-center text-sm text-muted-foreground">Explore {destination} on Google Maps</p>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </a>
      </div>
    )
  }

  if (status === "error") {
    const embedUrl = key ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(destination)}` : null
    return (
      <div className={`overflow-hidden rounded-2xl border border-border bg-muted/30 ${className}`}>
        <div className="flex h-8 items-center justify-between border-b border-border bg-card/50 px-3">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Explore {destination}
          </span>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Google Maps
          </a>
        </div>
        {embedUrl ? (
          <div className="relative h-[380px] min-h-[300px]">
            <iframe
              title={`Map of ${destination}`}
              src={embedUrl}
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              className="h-full w-full border-0"
            />
            {places.length > 0 && (
              <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
                For place pins, enable Maps JavaScript API + Geocoding API in Google Cloud Console.
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6">
            <p className="text-center text-sm text-muted-foreground">Map unavailable. Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Open in Google Maps →
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-muted/30 ${className}`}>
      <div className="flex h-8 items-center gap-2 border-b border-border bg-card/50 px-3">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {places.length > 0 ? `${places.length + 1} places on map` : `Explore ${destination}`}
        </span>
      </div>
      <div className="relative h-[380px] min-h-[300px]">
        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>
    </div>
  )
}
