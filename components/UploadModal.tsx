'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Cropper, { Area } from 'react-easy-crop'
import { UploadFormData, FriendName, Memory } from '@/types'
import { getCroppedImageFile } from '@/lib/cropImage'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (memory: Memory) => void
}

const FRIENDS: FriendName[] = ['hammad Masood', 'Raza Khan', 'Hammad Shah', 'Aitzaz Hasan']

const SERIES_OPTIONS = [
  'Chapter One', 'Summer Series', 'Celebrations', 'Adventures',
  'Quiet Moments', 'Road Trips', 'Birthdays', 'Everyday Magic'
]

const ASPECT_OPTIONS: UploadFormData['aspectRatio'][] = ['1:1', '3:4', '16:9', '9:16']
const DISPLAY_TYPES: UploadFormData['displayType'][] = ['Portrait', 'Landscape', 'Story', 'Square']

const aspectRatioToNumber: Record<UploadFormData['aspectRatio'], number> = {
  '1:1': 1,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
}

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

const DEFAULT_FORM: UploadFormData = {
  title: '',
  description: '',
  date: '',
  location: '',
  uploadedBy: 'hammad Masood',
  tags: '',
  isPrivate: false,
  series: '',
  taggedFriends: [],
  latitude: '',
  longitude: '',
  aspectRatio: '3:4',
  displayType: 'Portrait',
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [form, setForm] = useState<UploadFormData>(DEFAULT_FORM)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKey])

  const handleFile = (f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    }
    reader.readAsDataURL(f)
  }

  const toggleTaggedFriend = (friend: FriendName) => {
    setForm((current) => ({
      ...current,
      taggedFriends: current.taggedFriends.includes(friend)
        ? current.taggedFriends.filter((entry) => entry !== friend)
        : [...current.taggedFriends, friend],
    }))
  }

  const handleGenerateCaption = async () => {
    if (!preview) {
      setError('Upload an image first to generate a caption.')
      return
    }

    setError(null)
    setIsGeneratingCaption(true)
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: preview, title: form.title }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Caption generation failed')
      }

      setForm((current) => ({ ...current, description: data.caption }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption')
    } finally {
      setIsGeneratingCaption(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.date || !form.uploadedBy) {
      setError('Please fill in Title, Description, Date, and your name.')
      return
    }
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      let fileToUpload = file
      if (file && preview && croppedAreaPixels) {
        fileToUpload = await getCroppedImageFile(preview, croppedAreaPixels, `memory-${Date.now()}.jpg`)
      }

      if (fileToUpload) formData.append('image', fileToUpload)

      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) {
            formData.append(k, JSON.stringify(v))
            return
          }
          formData.append(k, String(v))
        }
      })

      const res = await fetch('/api/memories', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      onUpload(data.memory)
      setForm(DEFAULT_FORM)
      setPreview(null)
      setFile(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[90] modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest/85 glass w-full max-w-4xl rounded-[2rem] shadow-[0_40px_80px_rgba(25,28,27,0.12)] overflow-hidden flex flex-col md:flex-row relative max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
        </button>

        {/* ─── Left: Photo Upload ─── */}
        <div className="w-full md:w-5/12 p-8 bg-surface-container-low flex flex-col items-center justify-start border-r border-outline-variant/10">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/5] rounded-2xl overflow-hidden relative group cursor-pointer bg-surface-container-high border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all duration-300"
          >
            {preview ? (
              <div className="absolute inset-0">
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatioToNumber[form.aspectRatio]}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/30 to-secondary-container/30 group-hover:opacity-80 transition-opacity" />
            )}

            <div className="relative z-10 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-white/90 glass mx-auto mb-4 flex items-center justify-center shadow-ambient">
                <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
              </div>
              <p className="font-label text-sm font-bold text-on-surface">
                {preview ? 'Change Photograph' : 'Upload Photograph'}
              </p>
              <p className="font-label text-xs text-on-surface-variant mt-1">
                High resolution JPG or PNG
              </p>
              {preview && (
                <p className="font-label text-[10px] text-on-surface-variant/80 mt-1">Drag to crop · scroll to zoom</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </div>

          {/* Quick action buttons */}
          <div className="mt-5 w-full flex gap-3">
            {[
              { icon: 'filter_hdr', label: 'Filter' },
              { icon: 'auto_fix_high', label: 'Enhance' },
              { icon: 'crop', label: 'Crop' },
            ].map(({ icon, label }) => (
              <button
                key={icon}
                title={label}
                className="flex-1 h-14 rounded-xl bg-surface-container-highest/50 border border-outline-variant/20 flex items-center justify-center hover:bg-primary-fixed/30 transition-colors group"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">{icon}</span>
              </button>
            ))}
          </div>

          {preview && (
            <div className="mt-4 w-full">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Friend selector */}
          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-2">Uploading as</p>
            <div className="grid grid-cols-2 gap-2">
              {FRIENDS.map(friend => (
                <button
                  key={friend}
                  onClick={() => setForm(f => ({ ...f, uploadedBy: friend }))}
                  className={`
                    px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200
                    ${form.uploadedBy === friend
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/40 hover:text-primary'
                    }
                  `}
                >
                  {friend.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-2">Aspect Ratio</p>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_OPTIONS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, aspectRatio: ratio }))}
                  className={
                    `px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${form.aspectRatio === ratio
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/40 hover:text-primary'
                    }`
                  }
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-2">Display Style</p>
            <div className="grid grid-cols-2 gap-2">
              {DISPLAY_TYPES.map((display) => (
                <button
                  key={display}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, displayType: display }))}
                  className={
                    `px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${form.displayType === display
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/40 hover:text-primary'
                    }`
                  }
                >
                  {display}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right: Form ─── */}
        <div className="w-full md:w-7/12 p-10 flex flex-col overflow-y-auto">
          <header className="mb-8">
            <h2 className="font-headline italic text-3xl text-primary tracking-tight">
              Preserve a Moment
            </h2>
            <p className="text-on-surface-variant font-body text-sm mt-2">
              Every memory is a thread in the tapestry of your story.
            </p>
          </header>

          <div className="space-y-7 flex-1">
            {/* Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
                Memory Title
              </label>
              <input
                type="text"
                placeholder="A name for this moment..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-minimal font-headline text-2xl text-on-surface placeholder:text-on-surface-variant/30"
              />
            </div>

            {/* Date & Location */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                  Captured On
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="input-minimal font-body text-sm text-on-surface"
                  />
                  <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant pointer-events-none text-xl">
                    calendar_month
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                  Origin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Where did it happen?"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="input-minimal font-body text-sm text-on-surface placeholder:text-on-surface-variant/30"
                  />
                  <span className="material-symbols-outlined absolute right-0 bottom-2 text-on-surface-variant pointer-events-none text-xl">
                    location_on
                  </span>
                </div>
              </div>
            </div>

            {/* Series */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Series / Collection
              </label>
              <div className="flex flex-wrap gap-2">
                {SERIES_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, series: f.series === s ? '' : s }))}
                    className={`
                      text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all
                      ${form.series === s
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/40 hover:text-primary'
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  The Story
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption || !preview}
                  className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-primary-fixed/40 text-primary hover:bg-primary-fixed/60 disabled:opacity-50"
                >
                  {isGeneratingCaption ? 'Generating...' : '✨ Generate Caption'}
                </button>
              </div>
              <textarea
                placeholder="Describe the atmosphere, the feelings, the small details that made this moment unforgettable..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full bg-surface-container-low/50 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary/20 p-4 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 leading-relaxed resize-none transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Tag Friends
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FRIENDS.map((friend) => (
                  <button
                    key={friend}
                    type="button"
                    onClick={() => toggleTaggedFriend(friend)}
                    className={
                      `px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${form.taggedFriends.includes(friend)
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/40 hover:text-primary'
                      }`
                    }
                  >
                    {friend}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="beach, summer, adventure (comma separated)"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="input-minimal font-body text-sm text-on-surface placeholder:text-on-surface-variant/30"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Map Coordinates (optional)
              </label>

              <MapPicker
                latitude={form.latitude ? Number(form.latitude) : null}
                longitude={form.longitude ? Number(form.longitude) : null}
                onPick={(lat, lng) => setForm((current) => ({
                  ...current,
                  latitude: lat.toFixed(6),
                  longitude: lng.toFixed(6),
                }))}
              />

              <div className="grid grid-cols-2 gap-4 mt-3">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => setForm((current) => ({ ...current, latitude: e.target.value }))}
                  className="input-minimal font-body text-sm text-on-surface placeholder:text-on-surface-variant/30"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => setForm((current) => ({ ...current, longitude: e.target.value }))}
                  className="input-minimal font-body text-sm text-on-surface placeholder:text-on-surface-variant/30"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-xs text-error bg-error-container/30 px-4 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="pt-6 mt-2 flex items-center justify-between gap-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
              className="flex items-center gap-2 group"
            >
              <div className={`
                w-8 h-8 rounded-full border flex items-center justify-center transition-all
                ${form.isPrivate
                  ? 'bg-primary border-primary text-on-primary'
                  : 'border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary'
                }
              `}>
                <span className="material-symbols-outlined text-sm">
                  {form.isPrivate ? 'lock' : 'lock_open'}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                {form.isPrivate ? 'Private Entry' : 'Shared with All'}
              </span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="
                bg-gradient-to-br from-primary to-primary-container
                text-on-primary font-label text-xs font-bold uppercase tracking-[0.12em]
                px-10 py-4 rounded-full transition-all active:scale-95
                shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105
                disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                flex items-center gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">bookmark_add</span>
                  Save to Timeline
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
