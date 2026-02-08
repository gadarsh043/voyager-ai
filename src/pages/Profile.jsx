import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { updateProfile as updateProfileApi } from '@/lib/auth'
import { uploadAvatar } from '@/lib/storage'

export default function Profile() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(/** @type {File | null} */ (null))
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(/** @type {string | null} */ (null))
  const [preferencesJson, setPreferencesJson] = useState('[]')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) return
    setFirstName(user.first_name || '')
    setLastName(user.last_name || '')
    setAvatarUrl(user.avatar_url || '')
    setAvatarFile(null)
    setAvatarPreviewUrl(null)
    setPreferencesJson(Array.isArray(user.preferences) ? JSON.stringify(user.preferences, null, 2) : '[]')
  }, [user])

  // Revoke object URL when preview is no longer needed
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (!firstName.trim()) {
      setError('First name is required')
      return
    }
    if (!lastName.trim()) {
      setError('Last name is required')
      return
    }
    let prefs = []
    try {
      const parsed = JSON.parse(preferencesJson || '[]')
      prefs = Array.isArray(parsed) ? parsed : []
    } catch {
      setError('Preferences must be a valid JSON array')
      return
    }
    setLoading(true)
    try {
      let finalAvatarUrl = avatarUrl?.trim() || null
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(user.id, avatarFile)
        setAvatarFile(null)
        setAvatarPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return null
        })
      }
      await updateProfileApi({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_url: finalAvatarUrl,
        preferences: prefs,
      })
      if (typeof refreshUser === 'function') refreshUser()
      setAvatarUrl(finalAvatarUrl || '')
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const initials = [user.first_name, user.last_name].filter(Boolean).map((n) => n?.[0]).join('').slice(0, 2).toUpperCase() || '?'

  function onAvatarFileChange(e) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setError('')
    setAvatarFile(file)
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {avatarPreviewUrl ? (
                <AvatarImage src={avatarPreviewUrl} alt="" className="object-cover" />
              ) : avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar_file">Profile image</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="avatar_file"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={onAvatarFileChange}
                  disabled={loading}
                  className="h-10 cursor-pointer file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                />
                {avatarFile && <span className="text-sm text-muted-foreground">New image selected. Click Save to upload.</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF or WebP. Stored only when you click Save.</p>
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input value={user.email ?? ''} disabled className="mt-1 h-10 bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferences">Preferences (JSON array)</Label>
            <textarea
              id="preferences"
              value={preferencesJson}
              onChange={(e) => setPreferencesJson(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              placeholder='e.g. [] or [{"dietary":"Vegan"}]'
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-emerald-600">Profile saved.</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
