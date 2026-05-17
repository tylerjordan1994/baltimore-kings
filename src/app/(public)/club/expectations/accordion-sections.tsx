"use client"

import { useState } from "react"

interface Section {
  heading: string
  body: string
}

function parseMarkdownSections(markdown: string): Section[] {
  const parts = markdown.split(/^## /m)
  const sections: Section[] = []

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const newlineIndex = trimmed.indexOf("\n")
    if (newlineIndex === -1) {
      sections.push({ heading: trimmed, body: "" })
    } else {
      sections.push({
        heading: trimmed.slice(0, newlineIndex).trim(),
        body: trimmed.slice(newlineIndex + 1).trim(),
      })
    }
  }

  return sections
}

function markdownToHtml(text: string): string {
  return text
    .replace(/### (.+)/g, '<h4 class="mt-4 mb-2 text-base font-semibold text-ink">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2 space-y-1">$&</ul>')
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />")
}

export function AccordionSections({ markdown }: { markdown: string }) {
  const sections = parseMarkdownSections(markdown)
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.map((_, i) => i))
  )

  function toggle(index: number) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (sections.length === 0) {
    return (
      <div
        className="prose max-w-none text-ink/80"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
      />
    )
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-white">
      {sections.map((section, i) => (
        <div key={i}>
          <button
            onClick={() => toggle(i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-paper"
          >
            <h3 className="text-lg font-semibold text-ink">{section.heading}</h3>
            <svg
              className={`h-5 w-5 shrink-0 text-accent transition-transform ${
                openSections.has(i) ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.has(i) && (
            <div className="px-6 pb-6">
              <div
                className="prose prose-sm max-w-none text-ink/70"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(section.body) }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
