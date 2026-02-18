import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import AppRoutes from './routes/AppRoutes'
import { loadGoogleMaps } from './lib/google-maps'

function App() {
  useEffect(() => {
    loadGoogleMaps()
  }, [])

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
