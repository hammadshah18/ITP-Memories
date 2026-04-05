'use client'

import { useEffect, useRef, useState } from 'react'

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    const audio = new Audio('/memories/ambient.mp3')
    audio.loop = true
    audio.volume = 0.35

    const onError = () => {
      setIsAvailable(false)
      setEnabled(false)
    }

    audio.addEventListener('error', onError)
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.currentTime = 0
      audio.removeEventListener('error', onError)
    }
  }, [])

  const toggle = async () => {
    if (!audioRef.current || !isAvailable) return

    if (enabled) {
      audioRef.current.pause()
      setEnabled(false)
      return
    }

    try {
      await audioRef.current.play()
      setEnabled(true)
    } catch {
      setIsAvailable(false)
      setEnabled(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={!isAvailable}
      className="text-on-surface/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      title={isAvailable ? (enabled ? 'Pause background music' : 'Play background music') : 'Add public/memories/ambient.mp3 to enable music'}
      type="button"
    >
      <span className="material-symbols-outlined text-xl">
        {enabled ? 'music_off' : 'music_note'}
      </span>
    </button>
  )
}
