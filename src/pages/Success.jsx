import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { CheckCircle, Download, Map, Utensils, DollarSign, Languages, Copy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNav } from '@/components/top-nav'
import { getBooking } from '@/lib/api'
import { openTripDocumentPrintView } from '@/lib/trip-document-pdf'

const DOC_SECTIONS = [
  { id: 'itinerary', icon: Map, label: 'Itinerary', sub: 'Detailed daily plans' },
  { id: 'local', icon: Utensils, label: 'Local Tips', sub: 'Curated hidden spots' },
  { id: 'currency', icon: DollarSign, label: 'Currency', sub: 'JPY advice & tips' },
  { id: 'language', icon: Languages, label: 'Language', sub: 'Essential phrases' },
]

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: paramBookingId } = useParams()
  const bookingId = paramBookingId || location.state?.booking_id
  const destination = location.state?.destination
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(!!bookingId)
  const [copied, setCopied] = useState(false)
  const [downloadFailed, setDownloadFailed] = useState(false)

  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    getBooking(bookingId)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false))
  }, [bookingId])

  const handleDownloadPdf = () => {
    if (!booking?.content) return
    const ok = openTripDocumentPrintView(booking.content)
    setDownloadFailed(!ok)
  }

  const shortId = bookingId ? `#VOY-${String(bookingId).slice(-4).toUpperCase()}` : '#VOY-XXXX'

  const handleCopyId = () => {
    navigator.clipboard.writeText(shortId).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20">
            <CheckCircle className="h-9 w-9 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Booking Confirmed!
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            You're going to{' '}
            <span className="font-semibold text-primary">{destination || 'your destination'}</span>!
            {' '}Get ready for an adventure.
          </p>

          {/* Booking ID pill */}
          <div className="mt-5 flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Booking ID</span>
            <span className="font-bold text-foreground">{shortId}</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy booking ID"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            {copied && <span className="text-xs text-emerald-400">Copied!</span>}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Trip document card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                {/* Mock document thumbnail */}
                <div className="hidden sm:block relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/60">
                  <img
                    src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=60"
                    alt="Trip guide"
                    className="h-full w-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[10px] font-bold text-white leading-tight text-center">
                      {destination || 'Trip'} Guide
                    </span>
                    <span className="text-[9px] text-white/70 mt-0.5">Voyager AI</span>
                  </div>
                  <div className="absolute top-1.5 left-1.5 rounded px-1 py-0.5 bg-primary text-[8px] font-bold text-primary-foreground uppercase">
                    Generated
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground mb-1">Your AI-Generated Trip Document</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    We've compiled a personalized comprehensive guide for your trip. It includes your day-by-day itinerary, hidden gems, local currency advice, and a survival language cheat sheet.
                  </p>

                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      Preparing your document…
                    </div>
                  ) : booking?.content ? (
                    <div className="flex flex-wrap gap-3">
                      <Button className="gap-2 h-10" onClick={handleDownloadPdf}>
                        <Download className="h-4 w-4" />
                        Download PDF Guide
                      </Button>
                      <Button variant="outline" className="gap-2 h-10" onClick={handleDownloadPdf}>
                        <Map className="h-4 w-4" />
                        View Web Itinerary
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="h-10" onClick={() => navigate('/')}>
                      Back to Home
                    </Button>
                  )}

                  {downloadFailed && (
                    <p className="mt-2 text-sm text-amber-400">Download failed. Please try again.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Doc section tiles */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DOC_SECTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.id} className="group rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="relative mb-2 aspect-video overflow-hidden rounded-lg bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Travel Together */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Travel Together</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Share this trip with friends to let them view the plan and collaborate.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invite Code</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm font-bold text-foreground tracking-widest">
                    {booking?.invite_code ? `TRIP-${booking.invite_code}` : `TRIP-${shortId.slice(-2)}X`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(booking?.invite_code ? `TRIP-${booking.invite_code}` : `TRIP-${shortId.slice(-2)}X`).catch(() => { })
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Don't forget */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-3">🚀 Don't forget</h3>
              <div className="space-y-3">
                {[
                  { label: 'Airport Transfer', sub: 'Book a ride in advance' },
                  { label: 'Travel Insurance', sub: 'Protect your trip' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <span className="text-muted-foreground text-sm">›</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full h-10" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
