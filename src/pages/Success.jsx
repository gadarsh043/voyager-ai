import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNav } from '@/components/top-nav'
import { getBooking } from '@/lib/api'
import { openTripDocumentPrintView } from '@/lib/trip-document-pdf'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const bookingId = location.state?.booking_id
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(!!bookingId)

  useEffect(() => {
    if (!bookingId) {
      setLoading(false)
      return
    }
    getBooking(bookingId)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false))
  }, [bookingId])

  const [downloadFailed, setDownloadFailed] = useState(false)
  const handleDownloadPdf = () => {
    if (!booking?.content) return
    const ok = openTripDocumentPrintView(booking.content)
    setDownloadFailed(!ok)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="new-trip" onTabChange={() => navigate('/')} />

      <main className="mx-auto max-w-lg px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="mx-auto mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-center sm:text-3xl">You&apos;re booked!</h1>
        <p className="mt-2 text-muted-foreground text-center">
          Your trip itinerary is saved. Download the full document below (itinerary, suggestions, currency, mobile plan, card benefits, local language cheat sheet).
        </p>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Loading…
          </div>
        ) : booking?.content ? (
          <div className="mt-8 w-full space-y-4">
            <Button
              className="w-full gap-2 h-12 min-h-[48px] text-base font-semibold touch-manipulation"
              onClick={handleDownloadPdf}
            >
              <Download className="h-5 w-5" />
              Download trip itinerary (PDF)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Downloads Voyager-AI-Itinerary.pdf to your device.
            </p>
            {downloadFailed && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                Download failed. Please try again.
              </p>
            )}
          </div>
        ) : !bookingId ? (
          <p className="mt-6 text-sm text-muted-foreground">No booking found. Go back and complete a booking.</p>
        ) : null}

        <Button
          variant="outline"
          className="mt-8 min-h-[44px] w-full sm:w-auto"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </main>
    </div>
  )
}
