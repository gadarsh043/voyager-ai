import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const { quote, selectedPlanPrice } = location.state || {}
  const total = quote?.total ?? (selectedPlanPrice ?? 0) + 15

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">You&apos;re booked!</h1>
        <p className="mt-2 text-muted-foreground">
          Your itinerary and bill summary are ready. Download the PDF below.
        </p>

        <div className="mt-8 space-y-4">
          <Card className="rounded-2xl border border-border text-left">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Itinerary &amp; Bill PDF
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total charged</span>
                <span className="font-semibold tabular-nums">${total.toLocaleString()}</span>
              </div>
              {quote?.best_card_to_use && (
                <p className="text-xs text-muted-foreground pt-2">{quote.best_card_to_use}</p>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full gap-2"
            onClick={() => window.open('#', '_blank')}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <Button
          variant="outline"
          className="mt-8"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  )
}
