"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { GripVertical, Pencil, Plus, X, Check } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createClient } from "@/lib/supabase/client"
import { allMemberLinks, iconFor } from "@/lib/member-nav"
import type { QuickLink } from "./dashboard-client"

function SortableTile({ link, editing, onRemove }: { link: QuickLink; editing: boolean; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.href })
  const Icon = iconFor(link.href)
  const style = { transform: CSS.Transform.toString(transform), transition }

  const body = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-dark">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="mt-3 block text-sm font-semibold text-ink">{link.label}</span>
    </>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-2xl border border-border bg-white p-4 shadow-sm transition-colors ${
        isDragging ? "z-10 opacity-80 shadow-lg" : ""
      } ${editing ? "cursor-grab" : "hover:border-accent/50"}`}
      {...(editing ? { ...attributes, ...listeners } : {})}
    >
      {editing ? (
        <>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
            aria-label={`Remove ${link.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <GripVertical className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
          {body}
        </>
      ) : (
        <Link href={link.href} className="block">
          {body}
        </Link>
      )}
    </div>
  )
}

/**
 * Coach quick-link tiles: drag to reorder, add or remove pages in edit mode.
 * Layout is saved to dashboard_prefs for the signed-in account.
 */
export function QuickLinksRow({ initial }: { initial: QuickLink[] }) {
  const [links, setLinks] = useState<QuickLink[]>(initial)
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function persist(next: QuickLink[]) {
    setLinks(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from("dashboard_prefs")
        .upsert({ profile_id: user.id, quick_links: next, updated_at: new Date().toISOString() })
    }, 500)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = links.findIndex((l) => l.href === active.id)
    const newIndex = links.findIndex((l) => l.href === over.id)
    persist(arrayMove(links, oldIndex, newIndex))
  }

  const available = allMemberLinks.filter((l) => !links.some((q) => q.href === l.href))

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Quick Links</h2>
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={() => setAdding(!adding)}
              className="flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
            >
              <Plus className="h-3.5 w-3.5" /> Add page
            </button>
          )}
          <button
            onClick={() => {
              setEditing(!editing)
              setAdding(false)
            }}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
              editing ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-paper"
            }`}
          >
            {editing ? (
              <>
                <Check className="h-3.5 w-3.5" /> Done
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" /> Customize
              </>
            )}
          </button>
        </div>
      </div>

      {adding && (
        <div className="mb-4 rounded-2xl border border-border bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Add a page</p>
          <div className="flex flex-wrap gap-2">
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">All pages are already pinned.</p>
            ) : (
              available.map((l) => (
                <button
                  key={l.href}
                  onClick={() => persist([...links, { href: l.href, label: l.label }])}
                  className="rounded-full border border-border bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:border-accent hover:text-accent-dark"
                >
                  + {l.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={links.map((l) => l.href)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {links.map((link) => (
              <SortableTile
                key={link.href}
                link={link}
                editing={editing}
                onRemove={() => persist(links.filter((l) => l.href !== link.href))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {links.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
          No quick links pinned. Click Customize → Add page to build your row.
        </p>
      )}
    </section>
  )
}
