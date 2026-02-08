"use client"

import React from "react"

import { useState } from "react"
import {
  GripVertical,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CustomStop {
  id: string
  label: string
  url?: string
}

const defaultStops: CustomStop[] = [
  { id: "1", label: "Senso-ji Temple, Asakusa" },
  { id: "2", label: "Tsukiji Outer Market" },
  { id: "3", label: "TeamLab Borderless" },
  { id: "4", label: "Meiji Shrine" },
]

export function TripCustomizer() {
  const [stops, setStops] = useState<CustomStop[]>(defaultStops)
  const [newUrl, setNewUrl] = useState("")
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const addStop = () => {
    if (!newUrl.trim()) return
    const newStop: CustomStop = {
      id: Date.now().toString(),
      label: newUrl.includes("google.com/maps") ? "Google Maps Pin" : newUrl,
      url: newUrl,
    }
    setStops([...stops, newStop])
    setNewUrl("")
  }

  const removeStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const newStops = [...stops]
    const [removed] = newStops.splice(draggedIndex, 1)
    newStops.splice(index, 0, removed)
    setStops(newStops)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleRecalculate = () => {
    setIsRecalculating(true)
    setTimeout(() => setIsRecalculating(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-foreground">Customize Stops</h3>
      <p className="mb-4 text-xs text-muted-foreground">Drag to reorder or add your own Google Maps links</p>

      <div className="space-y-2">
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 transition-all",
              draggedIndex === index && "opacity-50 border-primary"
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <span className="flex-1 truncate text-sm text-foreground">{stop.label}</span>
            {stop.url && (
              <a href={stop.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="sr-only">Open link</span>
              </a>
            )}
            <button
              onClick={() => removeStop(stop.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Remove stop</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          placeholder="Paste Google Maps link or place name..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStop()}
          className="h-9 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={addStop}
          className="shrink-0 gap-1 bg-transparent"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <Button
        onClick={handleRecalculate}
        disabled={isRecalculating}
        variant="outline"
        className="mt-4 w-full gap-2 border-primary/20 text-primary hover:bg-accent hover:text-primary bg-transparent"
      >
        {isRecalculating ? (
          <>
            <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Recalculating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Recalculate with AI
          </>
        )}
      </Button>
    </div>
  )
}
