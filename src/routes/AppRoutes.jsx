import { Routes, Route, Navigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Main from '../pages/Main'
import Plan from '../pages/Plan'
import Quote from '../pages/Quote'
import Success from '../pages/Success'
import Booking from '../pages/Booking'
import Profile from '../pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const generating = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('itinerary_generating')
  if (generating) return children
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 animate-pulse">
        <Compass className="h-7 w-7 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 animate-pulse">
        <Compass className="h-7 w-7 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
  if (user) return <Navigate to="/" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
      <Route path="/quote" element={<ProtectedRoute><Quote /></ProtectedRoute>} />
      <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
      <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
