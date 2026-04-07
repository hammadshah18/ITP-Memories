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

      void fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Memory Added! 📸',
          body: data?.memory?.title || form.title,
          url: '/dashboard',
        }),
      })

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
    <div className="fixed inset-0 z-[90] bg-black/35" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 mx-auto h-[calc(100vh-40px)] w-full max-w-md rounded-t-3xl bg-surface border border-outline-variant/20 p-3 animate-sheet-up lg:max-w-lg"
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-outline-variant/70" />

        <div className="mb-3 flex items-center justify-between">
          <p className="text-[18px] font-semibold text-on-surface">Add Memory</p>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-surface-container text-on-surface-variant"
          >
            X
          </button>
        </div>

        <div className="h-[calc(100%-64px)] overflow-y-auto pr-1 pb-4 space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[16/9] rounded-xl overflow-hidden relative cursor-pointer bg-surface-container-high border border-outline-variant/30"
          >
            {preview ? (
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatioToNumber[form.aspectRatio]}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
                <p className="text-sm">Upload photo</p>
                <p className="text-[12px]">Tap to choose image</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </div>

          {preview && (
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-on-surface-variant">Zoom</label>
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

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm"
            />
            <textarea
              placeholder="Describe this memory"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm"
              />
              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Uploading As</p>
            <div className="grid grid-cols-2 gap-2">
              {FRIENDS.map((friend) => (
                <button
                  key={friend}
                  onClick={() => setForm((f) => ({ ...f, uploadedBy: friend }))}
                  className={`h-9 rounded-full text-xs ${form.uploadedBy === friend ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {friend.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Aspect Ratio</p>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_OPTIONS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, aspectRatio: ratio }))}
                  className={`h-8 rounded-full text-[11px] ${form.aspectRatio === ratio ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Display Type</p>
            <div className="grid grid-cols-2 gap-2">
              {DISPLAY_TYPES.map((display) => (
                <button
                  key={display}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, displayType: display }))}
                  className={`h-9 rounded-full text-[11px] ${form.displayType === display ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Series</p>
            <div className="flex flex-wrap gap-2">
              {SERIES_OPTIONS.map((series) => (
                <button
                  key={series}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, series: f.series === series ? '' : series }))}
                  className={`h-8 rounded-full px-3 text-[11px] ${form.series === series ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {series}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Tags</p>
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption || !preview}
                className="h-7 rounded-full px-3 text-[10px] bg-primary-fixed/40 text-primary disabled:opacity-60"
              >
                {isGeneratingCaption ? 'Generating' : 'Generate Caption'}
              </button>
            </div>
            <input
              type="text"
              placeholder="beach, summer"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm"
            />
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Tag Friends</p>
            <div className="grid grid-cols-2 gap-2">
              {FRIENDS.map((friend) => (
                <button
                  key={friend}
                  type="button"
                  onClick={() => toggleTaggedFriend(friend)}
                  className={`h-9 rounded-full text-[11px] ${form.taggedFriends.includes(friend) ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {friend}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Map Coordinates</p>
            <MapPicker
              latitude={form.latitude ? Number(form.latitude) : null}
              longitude={form.longitude ? Number(form.longitude) : null}
              onPick={(lat, lng) => setForm((current) => ({
                ...current,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
              }))}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isPrivate: !f.isPrivate }))}
            className="h-9 rounded-full px-4 bg-surface-container text-[12px] text-on-surface-variant"
          >
            {form.isPrivate ? 'Private Entry' : 'Shared with All'}
          </button>

          {error && <p className="rounded-xl bg-error-container/40 px-3 py-2 text-xs text-error">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 w-full rounded-full bg-primary text-on-primary text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save Memory'}
          </button>
        </div>
      </div>
    </div>
  )
}
