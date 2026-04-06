'use client'

import { FormEvent, useMemo, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Memory } from '@/types'

interface PhotobookExportProps {
  memories: Memory[]
  buttonLabel?: string
}

async function imageToDataUrl(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Failed to read image data'))
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function formatMemoryDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PhotobookExport({ memories, buttonLabel = 'Download as Photobook 📖' }: PhotobookExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [title, setTitle] = useState('ITP Memories')
  const [includeDateRange, setIncludeDateRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(memories.map((m) => m.id)))
  const [error, setError] = useState<string | null>(null)

  const allSelected = selectedIds.size > 0 && selectedIds.size === memories.length

  const selectedMemories = useMemo(() => {
    return memories.filter((memory) => selectedIds.has(memory.id))
  }, [memories, selectedIds])

  const filteredForDateRange = useMemo(() => {
    if (!includeDateRange) return selectedMemories

    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    return selectedMemories.filter((memory) => {
      const date = new Date(memory.date)
      if (Number.isNaN(date.getTime())) return true
      if (start && date < start) return false
      if (end && date > end) return false
      return true
    })
  }, [endDate, includeDateRange, selectedMemories, startDate])

  const sortedMemories = useMemo(() => {
    return [...filteredForDateRange].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [filteredForDateRange])

  const inferredDateRange = useMemo(() => {
    if (sortedMemories.length === 0) return 'No memories selected'
    const first = formatMemoryDate(sortedMemories[0].date)
    const last = formatMemoryDate(sortedMemories[sortedMemories.length - 1].date)
    return `${first} - ${last}`
  }, [sortedMemories])

  const toggleMemory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(memories.map((memory) => memory.id)))
  }

  const handleGeneratePdf = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (sortedMemories.length === 0) {
      setError('Please select at least one memory to export.')
      return
    }

    setIsGenerating(true)

    try {
      const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'pt' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      pdf.setFillColor('#1a1a2e')
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      pdf.setTextColor('#ffffff')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(36)
      pdf.text(title || 'ITP Memories', pageWidth / 2, 260, { align: 'center' })
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(22)
      pdf.text('Our Story', pageWidth / 2, 305, { align: 'center' })
      pdf.setFontSize(12)
      pdf.text(inferredDateRange, pageWidth / 2, 340, { align: 'center' })
      pdf.text('Hammad Shah, Aitzaz Hassan, Hammad Masood, Raza Khan', pageWidth / 2, 365, { align: 'center' })

      for (const memory of sortedMemories) {
        pdf.addPage()

        const pageRoot = document.createElement('div')
        pageRoot.style.position = 'fixed'
        pageRoot.style.left = '-99999px'
        pageRoot.style.top = '0'
        pageRoot.style.width = '794px'
        pageRoot.style.height = '1123px'
        pageRoot.style.padding = '40px'
        pageRoot.style.background = '#f8faf8'
        pageRoot.style.fontFamily = 'Manrope, system-ui, sans-serif'
        pageRoot.style.boxSizing = 'border-box'

        const imageData = await imageToDataUrl(memory.imagePath)

        pageRoot.innerHTML = `
          <div style="height:100%; border:1px solid rgba(27, 94, 32, 0.12); border-radius:24px; overflow:hidden; background:white; display:flex; flex-direction:column;">
            <div style="height:420px; background:#e5e7eb; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              ${imageData ? `<img src="${imageData}" style="width:100%; height:100%; object-fit:cover;"/>` : '<span style="color:#6b7280; font-size:18px;">Image unavailable</span>'}
            </div>
            <div style="padding:24px; display:flex; flex-direction:column; gap:14px; flex:1;">
              <h1 style="font-size:30px; margin:0; color:#191c1b; font-family:Noto Serif, Georgia, serif;">${memory.title}</h1>
              <p style="font-size:14px; margin:0; color:#475569;"><strong>Date:</strong> ${formatMemoryDate(memory.date)}  •  <strong>Location:</strong> ${memory.location}</p>
              <p style="font-size:15px; margin:0; color:#334155; line-height:1.7; white-space:pre-wrap;">${memory.description || 'No description provided.'}</p>
              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
                ${(memory.tags.length > 0 ? memory.tags : ['memory'])
                  .map((tag) => `<span style="font-size:12px; padding:6px 10px; border-radius:999px; background:#e3f2e1; color:#1f2937;">#${tag}</span>`)
                  .join('')}
              </div>
              <p style="margin-top:auto; text-align:right; font-size:13px; color:#64748b;">
                Uploaded by <strong>${memory.uploadedBy}</strong>
              </p>
            </div>
          </div>
        `

        document.body.appendChild(pageRoot)
        const canvas = await html2canvas(pageRoot, {
          useCORS: true,
          backgroundColor: '#f8faf8',
        } as any)
        document.body.removeChild(pageRoot)

        const image = canvas.toDataURL('image/jpeg', 0.92)
        pdf.addImage(image, 'JPEG', 0, 0, pageWidth, pageHeight)
      }

      pdf.addPage()
      pdf.setFillColor('#f4f6f8')
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      pdf.setTextColor('#191c1b')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(30)
      pdf.text('Made with ❤️ - ITP Memories', pageWidth / 2, pageHeight / 2, { align: 'center' })

      const totalPages = pdf.getNumberOfPages()
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pdf.setPage(pageNumber)
        pdf.setTextColor('#6b7280')
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 18, { align: 'center' })
      }

      pdf.save('ITP-Memories-Photobook.pdf')
      setIsOpen(false)
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-br from-primary-fixed to-secondary-container text-on-surface px-5 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest border border-outline-variant/20 hover:shadow-lg hover:shadow-primary/20 transition"
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface border border-outline-variant/20 p-6 md:p-8 shadow-ambient">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold mb-2">Export</p>
                <h2 className="font-headline italic text-4xl text-on-surface">Photobook Builder</h2>
                <p className="text-sm text-on-surface-variant/70 mt-1">Choose memories and generate your printable story.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-outline-variant/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleGeneratePdf} className="space-y-5">
              <div>
                <label htmlFor="photobook-title" className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                  Title
                </label>
                <input
                  id="photobook-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/30 px-4 py-3 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Memories ({selectedIds.size}/{memories.length})</p>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    {allSelected ? 'Clear all' : 'Select all'}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {memories.map((memory) => (
                    <label key={memory.id} className="flex items-start gap-3 rounded-xl border border-outline-variant/15 bg-surface px-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(memory.id)}
                        onChange={() => toggleMemory(memory.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{memory.title}</p>
                        <p className="text-xs text-on-surface-variant/70">{formatMemoryDate(memory.date)} · {memory.location}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDateRange}
                    onChange={(event) => setIncludeDateRange(event.target.checked)}
                  />
                  Include optional date range filter
                </label>

                {includeDateRange && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label htmlFor="range-start" className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Start date</label>
                      <input
                        id="range-start"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="w-full rounded-xl border border-outline-variant/30 px-3 py-2 bg-surface"
                      />
                    </div>
                    <div>
                      <label htmlFor="range-end" className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">End date</label>
                      <input
                        id="range-end"
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="w-full rounded-xl border border-outline-variant/30 px-3 py-2 bg-surface"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-primary-fixed/25 border border-primary/10 p-4 text-sm text-on-surface">
                <p>
                  <span className="font-bold">Included:</span> {sortedMemories.length} memory{sortedMemories.length === 1 ? '' : 'ies'}
                </p>
                <p className="text-on-surface-variant/80">Date span: {inferredDateRange}</p>
              </div>

              {error && (
                <p className="text-xs text-error bg-error-container/20 border border-error/30 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-full border border-outline-variant/30 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-widest disabled:opacity-70"
                >
                  {isGenerating ? 'Generating your photobook... please wait' : 'Generate PDF'}
                </button>
              </div>

              {isGenerating && (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container px-4 py-3">
                  <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-sm text-on-surface-variant">Generating your photobook... please wait</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}
