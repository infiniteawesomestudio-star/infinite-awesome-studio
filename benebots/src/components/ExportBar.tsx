import { useState } from 'react'

interface ExportBarProps {
  /** Returns the Markdown content to copy or download. Called on click so it always reflects current state. */
  getContent: () => string
  /** Download filename, e.g. "Demo-Co-stewardship.md" */
  filename: string
  /** Accent color for the Download action (defaults to mint). */
  accent?: string
  /** Optional left-aligned helper note. */
  note?: string
  className?: string
}

/**
 * Reusable Copy / Download .md control for the BeneBots demos.
 * No dependencies — uses the Clipboard API and a Blob download.
 */
export default function ExportBar({ getContent, filename, accent = '#00C47A', note, className = '' }: ExportBarProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getContent())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  const download = () => {
    const blob = new Blob([getContent()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {note && <span className="text-[10px] font-body text-dark-muted mr-auto">{note}</span>}
      <button
        type="button"
        onClick={copy}
        className="text-xs font-body text-dark-muted hover:text-dark-text transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
      <button
        type="button"
        onClick={download}
        className="text-xs font-body font-semibold transition-opacity hover:opacity-80"
        style={{ color: accent }}
        aria-label="Download as Markdown"
      >
        Download .md
      </button>
    </div>
  )
}
