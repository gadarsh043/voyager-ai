"use client"

import { Users, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { joinTripByCode } from "@/lib/api"

export function JoinTrip() {
  const navigate = useNavigate()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleJoin = async () => {
    if (!code.trim()) return
    setError("")
    setLoading(true)
    try {
      await joinTripByCode(code.trim())
      setSuccess(true)
      setCode("")
      // Redirect to Existing Plans so the joined trip appears there
      navigate("/", { state: { openTab: "existing-plans" } })
    } catch (e) {
      setError(e?.message || "Failed to join trip")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display text-balance">
          Join an existing trip
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the invite code shared by your travel buddy. The trip will be added to your Existing Plans.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {success && (
          <p className="mb-4 text-sm text-emerald-600 font-medium">You joined the trip successfully.</p>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Invite Code</Label>
            <Input
              placeholder="e.g. ABC12X"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-11 text-center text-lg tracking-widest font-mono"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="h-11 min-h-[44px] w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation"
            disabled={!code.trim() || loading}
            onClick={handleJoin}
          >
            {loading ? "Joining..." : "Join Trip"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
