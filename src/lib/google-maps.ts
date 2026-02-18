/**
 * Loads Google Maps JavaScript API dynamically using VITE_GOOGLE_MAPS_API_KEY.
 * Call loadGoogleMaps() before using Maps/Places. Script is loaded only once.
 */
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

let loadPromise: Promise<boolean> | null = null

export function getGoogleMapsApiKey(): string | undefined {
  return GOOGLE_MAPS_API_KEY
}

export function isGoogleMapsEnabled(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY)
}

/**
 * Load Google Maps script via callback (recommended by Google).
 * Resolves to true when API is ready, false if no key or load failed.
 */
export function loadGoogleMaps(): Promise<boolean> {
  if (!GOOGLE_MAPS_API_KEY) return Promise.resolve(false)
  if (typeof window !== "undefined" && (window as unknown as { google?: unknown }).google) {
    return Promise.resolve(true)
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise<boolean>((resolve) => {
    const done = (ok: boolean) => {
      if (!ok) loadPromise = null
      resolve(ok)
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existing && (window as unknown as { google?: unknown }).google) {
      return done(true)
    }
    if (existing) {
      const poll = (attempts = 0) => {
        if ((window as unknown as { google?: unknown }).google) return done(true)
        if (attempts < 30) setTimeout(() => poll(attempts + 1), 200)
        else done(false)
      }
      return poll()
    }

    const cbName = "___googleMapsInit"
    ;(window as unknown as { [key: string]: () => void })[cbName] = () => done(true)

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${cbName}`
    script.async = true
    script.defer = true
    script.onerror = () => {
      delete (window as unknown as { [key: string]: unknown })[cbName]
      console.warn("[Google Maps] Script failed. Enable Maps JavaScript API + Geocoding API, ensure billing is on.")
      done(false)
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
