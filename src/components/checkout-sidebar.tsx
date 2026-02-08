"use client"

import {
  CreditCard,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CheckoutSidebarProps {
  selectedPlanPrice: number | null
  onBook?: () => void
}

export function CheckoutSidebar({ selectedPlanPrice, onBook }: CheckoutSidebarProps) {
  const platformFee = 15
  const subtotal = selectedPlanPrice ?? 0
  const total = subtotal + platformFee
  const pointsSavings = selectedPlanPrice ? Math.round(selectedPlanPrice * 0.07) : 0

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <CreditCard className="h-4 w-4 text-primary" />
        Booking Summary
      </h3>

      {selectedPlanPrice ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Itinerary subtotal</span>
              <span className="font-medium tabular-nums text-foreground">
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="font-medium tabular-nums text-foreground">${platformFee}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              ${total.toLocaleString()}
            </span>
          </div>

          {/* Points Optimization */}
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Points Optimization</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-600">
              Save <span className="font-bold">${pointsSavings}</span> using Seat.aero credit card
              insights. Transfer Chase UR points for best redemption value.
            </p>
          </div>

          <Button
            className="mt-4 h-12 w-full gap-2 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            onClick={onBook}
          >
            <Zap className="h-4 w-4" />
            Single-Shot Book
          </Button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure checkout with end-to-end encryption
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No plan selected</p>
            <p className="text-xs text-muted-foreground">
              Choose an itinerary above to see pricing
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
