"use client"

import { Plane, Hotel, MapPin, Clock, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PickItem = { label: string; google_maps_url?: string }

/** Normalized daily_plan from API (full shape with flight, hotel_stay, days) */
const hasFullDailyPlan = (dp) =>
  dp &&
  typeof dp === "object" &&
  "days" in dp &&
  Array.isArray(dp.days)

function formatTime(s) {
  if (!s || typeof s !== "string") return "—"
  const part = s.slice(0, 19).replace("T", " ")
  if (part.length <= 8) return part
  return part.slice(0, 10) + " " + part.slice(11, 16)
}

function formatDate(s) {
  if (!s || typeof s !== "string") return "—"
  return s.slice(0, 10)
}

export interface ItineraryOptionForTimeline {
  id: string
  label: string
  daily_plan: {
    flight_from_source?: { from_location?: string; start_time?: string; reach_by?: string }
    flight_to_origin?: { from_location?: string; to_location?: string; start_time?: string; reach_by?: string }
    hotel_stay?: Array<{ name?: string; check_in?: string; check_out?: string; image_url?: string; google_maps_url?: string }>
    days?: Array<{
      day?: number
      activities?: Array<{
        start_from?: string
        start_time?: string
        reach_time?: string
        time_to_spend?: string
        image_url?: string
        google_maps_url?: string
      }>
    }>
  }
  total_estimated_cost?: number
}

interface ItineraryTimelineProps {
  option: ItineraryOptionForTimeline
  className?: string
  onAddPick?: (pick: PickItem) => void
}

export function ItineraryTimeline({ option, className, onAddPick }: ItineraryTimelineProps) {
  const dp = option.daily_plan
  const full = hasFullDailyPlan(dp)
  const days = full && dp.days ? dp.days : []
  const flightOut = full && dp.flight_from_source ? dp.flight_from_source : null
  const flightReturn = full && dp.flight_to_origin ? dp.flight_to_origin : null
  const hotelStay = full && dp.hotel_stay && dp.hotel_stay.length ? dp.hotel_stay : null

  return (
    <div className={cn("space-y-0", className)}>
      <div className="relative flex flex-col">
        {/* Outbound flight */}
        {flightOut && (
          <div className="flex gap-4 pb-4">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                <Plane className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-1 w-px flex-1 bg-border" />
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outbound flight</p>
              <p className="font-medium text-foreground">{flightOut.from_location || "—"} → destination</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(flightOut.start_time)} → {formatTime(flightOut.reach_by)}
              </p>
            </div>
          </div>
        )}

        {/* Hotel */}
        {hotelStay && hotelStay.map((h, i) => (
          <div key={i} className="flex gap-4 pb-4">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                <Hotel className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-1 w-px flex-1 bg-border" />
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hotel</p>
              <div className="flex gap-3">
                {h.image_url && (
                  <a
                    href={h.google_maps_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 overflow-hidden rounded-lg border border-border"
                  >
                    <img src={h.image_url} alt="" className="h-16 w-20 object-cover" />
                  </a>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{h.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    Check-in {formatDate(h.check_in)} · Check-out {formatDate(h.check_out)}
                  </p>
                  {h.google_maps_url && (
                    <a
                      href={h.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Google Maps
                    </a>
                  )}
                  {onAddPick && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 gap-1 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onAddPick({ label: h.name || "Hotel", google_maps_url: h.google_maps_url })
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Add to picks
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Days & activities */}
        {days.map((dayBlock, dayIdx) => (
          <div key={dayBlock.day ?? dayIdx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-muted">
                <span className="text-xs font-semibold text-foreground">D{dayBlock.day ?? dayIdx + 1}</span>
              </div>
              {(dayIdx < days.length - 1 || flightReturn) ? <div className="mt-1 w-px flex-1 min-h-[8px] bg-border" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Day {dayBlock.day ?? dayIdx + 1}
              </p>
              <ul className="mt-2 space-y-3">
                {(dayBlock.activities || []).map((act, aIdx) => (
                  <li key={aIdx} className="flex gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-3">
                        {act.image_url && (
                          <a
                            href={act.google_maps_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 overflow-hidden rounded-md border border-border"
                          >
                            <img src={act.image_url} alt="" className="h-14 w-20 object-cover" />
                          </a>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{act.start_from || "—"} → next</p>
                          <p className="text-muted-foreground">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {act.start_time ?? "—"} – {act.reach_time ?? "—"}
                            {act.time_to_spend ? ` · ${act.time_to_spend}` : ""}
                          </p>
                          {act.google_maps_url && (
                            <a
                              href={act.google_maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Google Maps
                            </a>
                          )}
                          {onAddPick && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-1 shrink-0 gap-1 text-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onAddPick({
                                  label: act.start_from || "Place",
                                  google_maps_url: act.google_maps_url,
                                })
                              }}
                            >
                              <Plus className="h-3 w-3" />
                              Add to picks
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* Return flight (back to origin) */}
        {flightReturn && (
          <div className="flex gap-4 pb-2">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                <Plane className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Return flight</p>
              <p className="font-medium text-foreground">
                {(flightReturn.from_location || "destination")} → {flightReturn.to_location || "origin"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(flightReturn.start_time)} → {formatTime(flightReturn.reach_by)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
