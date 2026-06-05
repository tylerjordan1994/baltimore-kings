"use client"

import { useRef, useState } from "react"
import { Puck, type Data } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck/config"

const BASE = "/project/football-team"

export function PageEditor({
  pageId,
  slug,
  initialData,
}: {
  pageId: string
  slug: string
  initialData: Data
}) {
  const latest = useRef<Data>(initialData)
  const [status, setStatus] = useState<string>("")

  async function save(data: Data, publish: boolean) {
    setStatus(publish ? "Publishing…" : "Saving…")
    const url = publish
      ? `${BASE}/api/cms/pages/${pageId}/publish`
      : `${BASE}/api/cms/pages/${pageId}`
    const res = await fetch(url, {
      method: publish ? "POST" : "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ puck_data: data }),
    })
    setStatus(res.ok ? (publish ? "Published ✓" : "Saved ✓") : "Error saving")
  }

  return (
    <Puck
      config={puckConfig}
      data={initialData}
      onChange={(d) => {
        latest.current = d
      }}
      onPublish={(d) => save(d, true)}
      overrides={{
        headerActions: ({ children }) => (
          <>
            <span style={{ alignSelf: "center", fontSize: 12, color: "#6B6B6B" }}>
              /{slug} {status}
            </span>
            <button
              type="button"
              onClick={() => save(latest.current, false)}
              style={{ borderRadius: 8, border: "1px solid #ddd", padding: "8px 14px", fontWeight: 600 }}
            >
              Save draft
            </button>
            {children}
          </>
        ),
      }}
    />
  )
}
