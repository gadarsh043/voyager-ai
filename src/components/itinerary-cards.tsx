"use client"

import React from "react"

import { useState } from "react"
import {
  Plane,
  Hotel,
  Star,
  Clock,
  CreditCard,
  Check,
  ChevronRight,
  Zap,
  Shield,
  Gem,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ItineraryOption {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
  badgeLabel: string
  badgeColor: string
  totalPrice: number
  dailySummary: string[]
  flight: {
    airline: string
    route: string
    price: number
    duration: string
  }
  hotel: {
    name: string
    rating: number
    pricePerNight: number
  }
  highlights: string[]
}

const options: ItineraryOption[] = [
  {
    id: "budget",
    title: "Budget Explorer",
    subtitle: "Maximum experiences, smart spending",
    icon: Zap,
    iconColor: "text-amber-500",
    badgeLabel: "Best Value",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    totalPrice: 1420,
    dailySummary: [
      "Day 1: Arrive, Asakusa temple walk, street food tour",
      "Day 2: Tsukiji outer market, Meiji Shrine, Harajuku",
      "Day 3: Day trip to Kamakura, Great Buddha",
      "Day 4: Akihabara, Ueno Park, departure",
    ],
    flight: {
      airline: "ANA Economy",
      route: "SFO → NRT",
      price: 580,
      duration: "11h 15m",
    },
    hotel: {
      name: "Hotel Mystays Asakusa",
      rating: 3.8,
      pricePerNight: 85,
    },
    highlights: ["Free walking tours", "Rail pass included", "Hostel option available"],
  },
  {
    id: "balanced",
    title: "Balanced Comfort",
    subtitle: "The sweet spot between value and luxury",
    icon: Shield,
    iconColor: "text-primary",
    badgeLabel: "Best for Chase Sapphire Users",
    badgeColor: "bg-accent text-primary border-primary/20",
    totalPrice: 2840,
    dailySummary: [
      "Day 1: Arrive, private transfer, Shibuya evening walk",
      "Day 2: Guided temple tour, tea ceremony, Ginza dining",
      "Day 3: Mt. Fuji day trip with lunch included",
      "Day 4: Teamlab Borderless, Roppongi, farewell dinner",
    ],
    flight: {
      airline: "JAL Premium Economy",
      route: "SFO → HND",
      price: 1200,
      duration: "10h 45m",
    },
    hotel: {
      name: "The Gate Hotel Asakusa",
      rating: 4.5,
      pricePerNight: 180,
    },
    highlights: ["2x Sapphire points", "Lounge access", "Flexible cancellation"],
  },
  {
    id: "luxury",
    title: "Luxury Speed",
    subtitle: "Premium everything, zero compromises",
    icon: Gem,
    iconColor: "text-emerald-500",
    badgeLabel: "Premium Pick",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    totalPrice: 5650,
    dailySummary: [
      "Day 1: Arrive first class, private car, Aman spa welcome",
      "Day 2: Private guide, Imperial Palace, Michelin dinner",
      "Day 3: Helicopter to Mt. Fuji, ryokan experience",
      "Day 4: Personal shopper Ginza, private departure lounge",
    ],
    flight: {
      airline: "ANA First Class",
      route: "SFO → HND",
      price: 2800,
      duration: "10h 30m",
    },
    hotel: {
      name: "Aman Tokyo",
      rating: 4.9,
      pricePerNight: 650,
    },
    highlights: ["Private transfers", "Michelin dining", "Concierge 24/7"],
  },
]

interface ItineraryCardsProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ItineraryCards({ selectedId, onSelect }: ItineraryCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {options.map((option) => {
        const Icon = option.icon
        const isSelected = selectedId === option.id
        return (
          <div
            key={option.id}
            className={cn(
              "group relative flex flex-col rounded-2xl border-2 bg-card p-5 transition-all hover:shadow-lg cursor-pointer",
              isSelected
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/30"
            )}
            onClick={() => onSelect(option.id)}
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted")}>
                  <Icon className={cn("h-5 w-5", option.iconColor)} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{option.title}</h3>
                  <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                </div>
              </div>
              {isSelected && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Badge */}
            <Badge variant="outline" className={cn("mb-4 w-fit text-xs", option.badgeColor)}>
              <CreditCard className="mr-1 h-3 w-3" />
              {option.badgeLabel}
            </Badge>

            {/* Price */}
            <div className="mb-4">
              <span className="text-2xl font-bold tabular-nums text-foreground">
                ${option.totalPrice.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground"> / person</span>
            </div>

            {/* Flight */}
            <div className="mb-3 rounded-xl border border-border bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Plane className="h-3.5 w-3.5" />
                FLIGHT
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{option.flight.airline}</p>
                  <p className="text-xs text-muted-foreground">{option.flight.route}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">${option.flight.price}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {option.flight.duration}
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel */}
            <div className="mb-4 rounded-xl border border-border bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Hotel className="h-3.5 w-3.5" />
                HOTEL
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{option.hotel.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">{option.hotel.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    ${option.hotel.pricePerNight}
                  </p>
                  <p className="text-xs text-muted-foreground">/ night</p>
                </div>
              </div>
            </div>

            {/* Daily Summary */}
            <div className="mb-4 flex-1 space-y-1.5">
              {option.dailySummary.map((day) => (
                <p key={day} className="text-xs leading-relaxed text-muted-foreground">
                  {day}
                </p>
              ))}
            </div>

            {/* Highlights */}
            <div className="mt-auto flex flex-wrap gap-1.5">
              {option.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Select Button */}
            <Button
              variant={isSelected ? "default" : "outline"}
              className="mt-4 w-full gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(option.id)
              }}
            >
              {isSelected ? "Selected" : "Choose Plan"}
              {!isSelected && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export { options as itineraryOptions }
