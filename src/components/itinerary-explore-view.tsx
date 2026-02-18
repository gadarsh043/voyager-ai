"use client"

import { useState } from "react"
import { MapPin, Hotel, Plane, Utensils, ExternalLink, Star, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PlacesMap } from "@/components/places-map"

function formatTime(s) {
  if (!s || typeof s !== "string") return "—"
  return s.slice(0, 16).replace("T", " ")
}

function formatDate(s) {
  if (!s || typeof s !== "string") return "—"
  return s.slice(0, 10)
}

/** Place card in imean.ai style - rating, hours, duration, description, Google Maps link */
function PlaceCard({ place, type = "attraction", onAddPick }) {
  const mapUrl = place.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent(place.name || place.start_from || "")}`
  return (
    <Card className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-4 p-4">
        {place.image_url && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 overflow-hidden rounded-lg border border-border"
          >
            <img src={place.image_url} alt="" className="h-24 w-28 object-cover" />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground">{place.name || place.start_from || "Place"}</h4>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md p-1.5 text-primary hover:bg-primary/10"
              aria-label="Open in Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {(place.rating || place.time_to_spend || place.start_time) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              {place.rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {place.rating}{place.reviews ? ` (${place.reviews})` : ""}
                </span>
              )}
              {place.rating && place.time_to_spend && <span>·</span>}
              {place.time_to_spend && <span>Visit: {place.time_to_spend}</span>}
            </p>
          )}
          {place.start_time && place.reach_time && (
            <p className="text-sm text-muted-foreground">
              {place.start_time} – {place.reach_time}
              {place.time_to_spend ? ` · ${place.time_to_spend}` : ""}
            </p>
          )}
          {place.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{place.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              Open in Google Maps
            </a>
            {onAddPick && (
              <button
                type="button"
                onClick={() => onAddPick({ label: place.name || place.start_from || "Place", google_maps_url: place.google_maps_url || mapUrl })}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add to picks
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ItineraryExploreView({ option, destination = "", origin = "", onAddPick }) {
  const [activeTab, setActiveTab] = useState("go")
  const dp = option?.daily_plan || {}

  /** Group activities by day for timeline */
  const daysWithActivities = (dp.days || []).map((d) => ({
    day: d.day ?? 0,
    activities: (d.activities || []).map((a) => ({
      ...a,
      name: a.start_from || a.name,
    })),
  }))
  const activities = daysWithActivities.flatMap((d) => d.activities.map((a) => ({ ...a, day: d.day })))

  const hotels = (dp.hotel_stay || []).map((h) => ({ ...h, type: "hotel" }))
  const flightOut = dp.flight_from_source
  const flightReturn = dp.flight_to_origin

  const allPlacesForMap = [
    ...activities.map((a) => ({ name: a.start_from || a.name, google_maps_url: a.google_maps_url })),
    ...hotels.map((h) => ({ name: h.name, google_maps_url: h.google_maps_url })),
  ].filter((p) => p.name)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      <div className="min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex h-12 w-full justify-start rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="go" className="gap-2 rounded-lg px-4">
              <MapPin className="h-4 w-4" />
              Where to Go
            </TabsTrigger>
            <TabsTrigger value="eat" className="gap-2 rounded-lg px-4">
              <Utensils className="h-4 w-4" />
              Where to Eat
            </TabsTrigger>
            <TabsTrigger value="stay" className="gap-2 rounded-lg px-4">
              <Hotel className="h-4 w-4" />
              Where to Stay
            </TabsTrigger>
            <TabsTrigger value="flight" className="gap-2 rounded-lg px-4">
              <Plane className="h-4 w-4" />
              About Your Flight
            </TabsTrigger>
          </TabsList>

          <TabsContent value="go" className="mt-0">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">No activities in this plan.</p>
            ) : (
              <div className="relative flex flex-col">
                {daysWithActivities.map((dayBlock, dayIdx) => (
                  <div key={dayBlock.day ?? dayIdx} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                        <span className="text-sm font-bold text-primary">D{dayBlock.day ?? dayIdx + 1}</span>
                      </div>
                      {dayIdx < daysWithActivities.length - 1 && (
                        <div className="mt-1 w-px flex-1 min-h-[12px] bg-border" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-4 pt-0.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Day {dayBlock.day ?? dayIdx + 1}
                      </p>
                      {dayBlock.activities.map((act, aIdx) => (
                        <PlaceCard key={`${dayIdx}-${aIdx}`} place={act} type="attraction" onAddPick={onAddPick} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="eat" className="mt-0 space-y-4">
            <p className="text-sm text-muted-foreground py-8">
              Restaurant recommendations will appear here when available. Check &quot;Where to Go&quot; for dining spots in your activities.
            </p>
          </TabsContent>

          <TabsContent value="stay" className="mt-0 space-y-4">
            {hotels.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">No hotels in this plan.</p>
            ) : (
              hotels.map((h, i) => (
                <Card key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex gap-4 p-4">
                    {h.image_url && (
                      <a
                        href={h.google_maps_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 overflow-hidden rounded-lg border border-border"
                      >
                        <img src={h.image_url} alt="" className="h-24 w-28 object-cover" />
                      </a>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">{h.name}</h4>
                        {h.google_maps_url && (
                          <a
                            href={h.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md p-1.5 text-primary hover:bg-primary/10"
                            aria-label="Open in Google Maps"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Check-in {formatDate(h.check_in)} · Check-out {formatDate(h.check_out)}
                      </p>
                      {h.google_maps_url && (
                        <a
                          href={h.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="flight" className="mt-0 space-y-4">
            {!flightOut && !flightReturn ? (
              <p className="text-sm text-muted-foreground py-8">No flight info in this plan.</p>
            ) : (
              <div className="space-y-4">
                {flightOut && (
                  <Card className="rounded-xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outbound</p>
                    <p className="font-medium text-foreground">
                      {flightOut.from_location || origin} → {flightOut.to_location || destination}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(flightOut.start_time)} → {formatTime(flightOut.reach_by)}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(flightOut.from_location || "")}+airport`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View airport on Google Maps
                    </a>
                  </Card>
                )}
                {flightReturn && (
                  <Card className="rounded-xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Return</p>
                    <p className="font-medium text-foreground">
                      {flightReturn.from_location || destination} → {flightReturn.to_location || origin}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(flightReturn.start_time)} → {formatTime(flightReturn.reach_by)}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(flightReturn.from_location || "")}+airport`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View airport on Google Maps
                    </a>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:block sticky top-4">
        <PlacesMap destination={destination} places={allPlacesForMap} />
      </div>
    </div>
  )
}
