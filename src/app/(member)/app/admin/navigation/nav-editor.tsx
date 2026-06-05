"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const BASE = "/project/football-team"

export type NavItem = {
  id: string
  menu_key: string
  parent_id: string | null
  label: string
  link_type: string
  page_id: string | null
  external_url: string | null
  is_cta: boolean
  visibility: string
  order_index: number
  is_active: boolean
}

export function NavEditor({ items, pages }: { items: NavItem[]; pages: { id: string; title: string; slug: string }[] }) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Navigation</h1>
      <p className="mb-6 text-sm text-muted-foreground">Drag to reorder. Items render in the public site menus.</p>
      <Menu title="Primary menu" menuKey="primary" items={items.filter((i) => i.menu_key === "primary")} pages={pages} />
      <Menu title="Footer menu" menuKey="footer" items={items.filter((i) => i.menu_key === "footer")} pages={pages} />
    </div>
  )
}

function Menu({ title, menuKey, items, pages }: { title: string; menuKey: string; items: NavItem[]; pages: { id: string; title: string; slug: string }[] }) {
  const router = useRouter()
  const [list, setList] = useState(() => [...items].sort((a, b) => a.order_index - b.order_index))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = list.findIndex((i) => i.id === active.id)
    const newIdx = list.findIndex((i) => i.id === over.id)
    const next = arrayMove(list, oldIdx, newIdx)
    setList(next)
    await fetch(`${BASE}/api/cms/nav`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next.map((it, idx) => ({ id: it.id, order_index: idx, parent_id: it.parent_id })) }),
    })
  }

  async function add() {
    const res = await fetch(`${BASE}/api/cms/nav`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ menu_key: menuKey, label: "New item", link_type: "url", external_url: "#", order_index: list.length }),
    })
    if (res.ok) router.refresh()
  }

  return (
    <section className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-xl text-ink">{title}</h2>
        <button onClick={add} className="rounded-full border border-border px-3 py-1 text-sm font-medium">+ Add item</button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {list.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No items. Add one above.</p> : null}
            {list.map((item) => <Row key={item.id} item={item} pages={pages} onChanged={() => router.refresh()} />)}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

function Row({ item, pages, onChanged }: { item: NavItem; pages: { id: string; title: string; slug: string }[]; onChanged: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const [draft, setDraft] = useState(item)

  async function patch(p: Partial<NavItem>) {
    const next = { ...draft, ...p }
    setDraft(next)
    await fetch(`${BASE}/api/cms/nav/${item.id}`, {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: next.label, link_type: next.link_type, page_id: next.page_id, external_url: next.external_url, is_cta: next.is_cta, visibility: next.visibility }),
    })
  }
  async function del() {
    if (!confirm("Delete this menu item?")) return
    await fetch(`${BASE}/api/cms/nav/${item.id}`, { method: "DELETE" })
    onChanged()
  }

  const input = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm"

  return (
    <div ref={setNodeRef} style={style} className="flex flex-wrap items-center gap-2 bg-card p-3">
      <button {...attributes} {...listeners} className="cursor-grab px-1 text-muted-foreground" title="Drag">⠿</button>
      <input className={`${input} w-40`} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} onBlur={() => patch({})} />
      <select className={input} value={draft.link_type} onChange={(e) => patch({ link_type: e.target.value })}>
        <option value="page">Page</option><option value="url">URL</option><option value="group">Group</option>
      </select>
      {draft.link_type === "page" ? (
        <select className={`${input} w-44`} value={draft.page_id ?? ""} onChange={(e) => patch({ page_id: e.target.value || null })}>
          <option value="">— page —</option>
          {pages.map((p) => <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>)}
        </select>
      ) : draft.link_type === "url" ? (
        <input className={`${input} w-44`} value={draft.external_url ?? ""} onChange={(e) => setDraft({ ...draft, external_url: e.target.value })} onBlur={() => patch({})} placeholder="https://…" />
      ) : <span className="text-xs text-muted-foreground">(dropdown parent)</span>}
      <select className={input} value={draft.visibility} onChange={(e) => patch({ visibility: e.target.value })}>
        <option value="public">Public</option><option value="members_only">Members</option>
      </select>
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        <input type="checkbox" checked={draft.is_cta} onChange={(e) => patch({ is_cta: e.target.checked })} /> CTA
      </label>
      <button onClick={del} className="ml-auto text-xs font-medium text-red-600 hover:underline">Delete</button>
    </div>
  )
}
