import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNav } from '@/components/top-nav'
import { getBooking } from '@/lib/api'
import { openTripDocumentPrintView } from '@/lib/trip-document-pdf'

export default function Booking() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    getBooking(id)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false))
  }, [id])

  const [downloadFailed, setDownloadFailed] = useState(false)
  const handleDownloadPdf = () => {
    if (!booking?.content) return
    const ok = openTripDocumentPrintView(booking.content)
    setDownloadFailed(!ok)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />
        <main className="mx-auto max-w-lg px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="mt-4 text-muted-foreground">Loading booking…</p>
        </main>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />
        <main className="mx-auto max-w-lg px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Booking not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Back to Home</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="existing-plans" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your booked trip</h1>
        <p className="mt-2 text-muted-foreground">
          Download your full trip itinerary (itinerary detail, suggestions, currency, mobile plan, card benefits, local language cheat sheet).
        </p>

        <div className="mt-8">
          <Button
            className="w-full gap-2 h-12 text-base font-semibold"
            onClick={handleDownloadPdf}
          >
            <Download className="h-5 w-5" />
            Download trip itinerary (PDF)
          </Button>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Downloads Voyager-AI-Itinerary.pdf to your device.
          </p>
          {downloadFailed && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 text-center">
              Download failed. Please try again.
            </p>
          )}
        </div>

        <Button variant="outline" className="mt-8 w-full" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </main>
    </div>
  )
}
