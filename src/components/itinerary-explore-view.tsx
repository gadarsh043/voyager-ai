"use client"

import { useEffect } from "react"
import { MapPin, ExternalLink, Star, Plus, Hotel } from "lucide-react"
import { Card } from "@/components/ui/card"

import './itinerary-explore-view.css'

function formatTime(s: string | undefined | null) {
  if (!s || typeof s !== "string") return "—"
  return s.slice(0, 16).replace("T", " ")
}

function formatDate(s: string | undefined | null) {
  if (!s || typeof s !== "string") return "—"
  return s.slice(0, 10)
}

type Place = {
  name?: string
  start_from?: string
  google_maps_url?: string
  image_url?: string
  start_time?: string
  reach_time?: string
  time_to_spend?: string
  rating?: number | string
  description?: string
}

function PlaceCard({ place, onAddPick }: { place: Place; onAddPick?: (pick: { label: string; google_maps_url: string }) => void }) {
  const mapUrl = place.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent(place.name || place.start_from || "")}`
  const label = place.name || place.start_from || "Place"

  return (
    <div className="place-card group">
      {onAddPick && (
        <button
          type="button"
          onClick={() => onAddPick({ label, google_maps_url: place.google_maps_url || mapUrl })}
          className="place-add-button"
          title="Add to My Picks"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}

      {place.image_url ? (
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="place-thumbnail-link">
          <img src={place.image_url} alt="" className="place-thumbnail-img" />
        </a>
      ) : (
        <div className="place-thumbnail-placeholder">
          <MapPin className="h-6 w-6 opacity-40" />
        </div>
      )}

      <div className="place-content">
        <div className="place-header">
          <h4 className="place-title">{label}</h4>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="place-external-link" aria-label="Open in Google Maps">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {(place.start_time || place.time_to_spend) && (
          <p className="place-meta">
            {place.start_time && place.reach_time && <span>{place.start_time} – {place.reach_time}</span>}
            {place.time_to_spend && <span>· {place.time_to_spend}</span>}
          </p>
        )}

        {place.rating && (
          <span className="place-rating-badge">
            {place.rating} <Star className="h-3 w-3 fill-amber-400" />
          </span>
        )}

        {place.description && (
          <p className="place-description">{place.description}</p>
        )}

        <div className="place-actions">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="place-action-link">
            <MapPin className="h-3 w-3" /> Open in Google Maps
          </a>
          {onAddPick && (
            <button
              type="button"
              onClick={() => onAddPick({ label, google_maps_url: place.google_maps_url || mapUrl })}
              className="place-action-btn"
            >
              <Plus className="h-3 w-3" /> Add to picks
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StayCard({ stay }: { stay: any }) {
  return (
    <Card className="stay-card">
      <div className="stay-card-body">
        {stay.image_url ? (
          <a href={stay.google_maps_url || "#"} target="_blank" rel="noopener noreferrer" className="place-thumbnail-link">
            <img src={stay.image_url} alt="" className="place-thumbnail-img" />
          </a>
        ) : (
          <div className="place-thumbnail-placeholder">
            <Hotel className="h-6 w-6 opacity-40" />
          </div>
        )}
        <div className="stay-content">
          <div className="stay-header">
            <h4 className="stay-title">{stay.name}</h4>
            {stay.google_maps_url && (
              <a href={stay.google_maps_url} target="_blank" rel="noopener noreferrer" className="place-external-link" aria-label="Open in Google Maps">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="stay-meta">
            Check-in {formatDate(stay.check_in)} · Check-out {formatDate(stay.check_out)}
          </p>
          {stay.google_maps_url && (
            <a href={stay.google_maps_url} target="_blank" rel="noopener noreferrer" className="stay-map-link">
              <MapPin className="h-3.5 w-3.5" /> Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

type Props = {
  option: any
  destination?: string
  origin?: string
  onAddPick?: (pick: { label: string; google_maps_url: string }) => void
  activeTab?: string
  onPlacesReady?: (places: { name: string; google_maps_url?: string }[]) => void
}

export function ItineraryExploreView({ option, destination = "", origin = "", onAddPick, activeTab = "go", onPlacesReady }: Props) {
  const dp = option?.daily_plan || {}

  const daysWithActivities = (dp.days || []).map((d: any) => ({
    day: d.day ?? 0,
    activities: (d.activities || []).map((a: any) => ({ ...a, name: a.start_from || a.name })),
  }))
  const activities = daysWithActivities.flatMap((d: any) => d.activities.map((a: any) => ({ ...a, day: d.day })))
  const hotels = (dp.hotel_stay || []).map((h: any) => ({ ...h, type: "hotel" }))
  const flightOut = dp.flight_from_source
  const flightReturn = dp.flight_to_origin

  const daysWithDining = (dp.days || []).map((d: any) => ({
    day: d.day ?? 0,
    activities: (d.places_to_eat || []).map((a: any) => ({ ...a, name: a.start_from || a.name })),
  }))
  const dining = daysWithDining.flatMap((d: any) => d.activities.map((a: any) => ({ ...a, day: d.day })))

  const allPlacesForMap = [
    ...activities.map((a: any) => ({ name: a.start_from || a.name, google_maps_url: a.google_maps_url })),
    ...dining.map((a: any) => ({ name: a.start_from || a.name, google_maps_url: a.google_maps_url })),
    ...hotels.map((h: any) => ({ name: h.name, google_maps_url: h.google_maps_url })),
  ].filter((p: any) => p.name)

  useEffect(() => {
    onPlacesReady?.(allPlacesForMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option?.id])

  if (activeTab === "go") {
    return activities.length === 0 ? (
      <p className="explore-empty">No activities in this plan.</p>
    ) : (
      <div className="day-timeline">
        {daysWithActivities.map((dayBlock: any, dayIdx: number) => (
          <div key={dayBlock.day ?? dayIdx} className="day-block">
            <div className="day-indicator">
              <div className="day-badge">
                <span className="day-badge-text">D{dayBlock.day ?? dayIdx + 1}</span>
              </div>
              {dayIdx < daysWithActivities.length - 1 && (
                <div className="day-line" />
              )}
            </div>
            <div className="day-content">
              <p className="day-label">Day {dayBlock.day ?? dayIdx + 1}</p>
              {dayBlock.activities.map((act: any, aIdx: number) => (
                <PlaceCard key={`${dayIdx}-${aIdx}`} place={act} onAddPick={onAddPick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activeTab === "eat") {
    return dining.length === 0 ? (
      <p className="explore-empty">No dining spots in this plan.</p>
    ) : (
      <div className="day-timeline">
        {daysWithDining.map((dayBlock: any, dayIdx: number) => {
          if (dayBlock.activities.length === 0) return null;
          return (
            <div key={dayBlock.day ?? dayIdx} className="day-block">
              <div className="day-indicator">
                <div className="day-badge">
                  <span className="day-badge-text">D{dayBlock.day ?? dayIdx + 1}</span>
                </div>
                {dayIdx < daysWithDining.length - 1 && (
                  <div className="day-line" />
                )}
              </div>
              <div className="day-content">
                <p className="day-label">Day {dayBlock.day ?? dayIdx + 1}</p>
                {dayBlock.activities.map((act: any, aIdx: number) => (
                  <PlaceCard key={`${dayIdx}-${aIdx}`} place={act} onAddPick={onAddPick} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (activeTab === "stay") {
    return hotels.length === 0 ? (
      <p className="explore-empty">No hotels in this plan.</p>
    ) : (
      <div className="stay-list">
        {hotels.map((h: any, i: number) => (
          <StayCard key={i} stay={h} />
        ))}
      </div>
    )
  }

  if (activeTab === "flight") {
    return !flightOut && !flightReturn ? (
      <p className="explore-empty">No flight info in this plan.</p>
    ) : (
      <div className="flight-list">
        {flightOut && (
          <Card className="flight-card">
            <p className="flight-label">Outbound</p>
            <p className="flight-route">{flightOut.from_location || origin} → {flightOut.to_location || destination}</p>
            <p className="flight-time">{formatTime(flightOut.start_time)} → {formatTime(flightOut.reach_by)}</p>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(flightOut.from_location || "")}+airport`} target="_blank" rel="noopener noreferrer" className="flight-map-link">
              <ExternalLink className="h-3.5 w-3.5" /> View airport on Google Maps
            </a>
          </Card>
        )}
        {flightReturn && (
          <Card className="flight-card">
            <p className="flight-label">Return</p>
            <p className="flight-route">{flightReturn.from_location || destination} → {flightReturn.to_location || origin}</p>
            <p className="flight-time">{formatTime(flightReturn.start_time)} → {formatTime(flightReturn.reach_by)}</p>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(flightReturn.from_location || "")}+airport`} target="_blank" rel="noopener noreferrer" className="flight-map-link">
              <ExternalLink className="h-3.5 w-3.5" /> View airport on Google Maps
            </a>
          </Card>
        )}
      </div>
    )
  }

  return null
}
