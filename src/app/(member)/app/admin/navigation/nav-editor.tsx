"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
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
  feature_card_json: Record<string, unknown> | null
}
type Page = { id: string; title: string; slug: string }

export function NavEditor({ items, pages }: { items: NavItem[]; pages: Page[] }) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Navigation</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Build the public menus. Create <b>groups</b> for dropdowns, nest links under them, drag to reorder. The header and footer render from here.
      </p>
      <Menu title="Primary menu (header)" menuKey="primary" items={items.filter((i) => i.menu_key === "primary")} pages={pages} />
      <Menu title="Footer menu" menuKey="footer" items={items.filter((i) => i.menu_key === "footer")} pages={pages} />
    </div>
  )
}

function Menu({ title, menuKey, items, pages }: { title: string; menuKey: string; items: NavItem[]; pages: Page[] }) {
  const router = useRouter()
  const [list, setList] = useState(() => [...items].sort((a, b) => a.order_index - b.order_index))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const groups = list.filter((i) => i.link_type === "group")

  // Order: top-level by order_index, each followed by its children.
  const ordered: NavItem[] = []
  for (const top of list.filter((i) => !i.parent_id)) {
    ordered.push(top)
    ordered.push(...list.filter((i) => i.parent_id === top.id))
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const tops = list.filter((i) => !i.parent_id)
    const oldIdx = tops.findIndex((i) => i.id === active.id)
    const newIdx = tops.findIndex((i) => i.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const next = arrayMove(tops, oldIdx, newIdx)
    setList([...next, ...list.filter((i) => i.parent_id)])
    await fetch(`${BASE}/api/cms/nav`, {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next.map((it, idx) => ({ id: it.id, order_index: idx, parent_id: null })) }),
    })
  }

  async function add(linkType: "url" | "group") {
    const res = await fetch(`${BASE}/api/cms/nav`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ menu_key: menuKey, label: linkType === "group" ? "New group" : "New item", link_type: linkType, external_url: linkType === "group" ? null : "#", order_index: list.length }),
    })
    if (res.ok) router.refresh()
  }

  return (
    <section className="mb-10">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-xl text-ink">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => add("url")} className="rounded-full border border-border px-3 py-1 text-sm font-medium">+ Link</button>
          <button onClick={() => add("group")} className="rounded-full border border-border px-3 py-1 text-sm font-medium">+ Group</button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={list.filter((i) => !i.parent_id).map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {ordered.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No items. Add a link or group.</p> : null}
            {ordered.map((item) => <Row key={item.id} item={item} pages={pages} groups={groups} onChanged={() => router.refresh()} />)}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

function Row({ item, pages, groups, onChanged }: { item: NavItem; pages: Page[]; groups: NavItem[]; onChanged: () => void }) {
  const top = !item.parent_id
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: !top })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const [draft, setDraft] = useState(item)
  const [showCard, setShowCard] = useState(false)
  const fc = (draft.feature_card_json ?? {}) as Record<string, string>

  async function patch(p: Partial<NavItem>) {
    const next = { ...draft, ...p }
    setDraft(next)
    await fetch(`${BASE}/api/cms/nav/${item.id}`, {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: next.label, link_type: next.link_type, page_id: next.page_id, external_url: next.external_url,
        parent_id: next.parent_id, is_cta: next.is_cta, visibility: next.visibility, feature_card_json: next.feature_card_json,
      }),
    })
  }
  async function del() {
    if (!confirm("Delete this menu item?")) return
    await fetch(`${BASE}/api/cms/nav/${item.id}`, { method: "DELETE" })
    onChanged()
  }

  const input = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm"

  return (
    <div ref={setNodeRef} style={style} className={`bg-card p-3 ${item.parent_id ? "pl-10" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        {top ? <button {...attributes} {...listeners} className="cursor-grab px-1 text-muted-foreground" title="Drag">⠿</button> : <span className="px-1 text-muted-foreground">↳</span>}
        <input className={`${input} w-36`} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} onBlur={() => patch({})} />
        <select className={input} value={draft.link_type} onChange={(e) => patch({ link_type: e.target.value })}>
          <option value="url">URL</option><option value="page">Page</option><option value="group">Group</option>
        </select>
        {draft.link_type === "page" ? (
          <select className={`${input} w-40`} value={draft.page_id ?? ""} onChange={(e) => patch({ page_id: e.target.value || null })}>
            <option value="">— page —</option>{pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        ) : draft.link_type === "url" ? (
          <input className={`${input} w-40`} value={draft.external_url ?? ""} onChange={(e) => setDraft({ ...draft, external_url: e.target.value })} onBlur={() => patch({})} placeholder="/path or https://…" />
        ) : <span className="text-xs text-muted-foreground">dropdown</span>}
        <select className={input} value={draft.parent_id ?? ""} onChange={(e) => patch({ parent_id: e.target.value || null })} title="Nest under group">
          <option value="">Top level</option>
          {groups.filter((g) => g.id !== item.id).map((g) => <option key={g.id} value={g.id}>↳ {g.label}</option>)}
        </select>
        <select className={input} value={draft.visibility} onChange={(e) => patch({ visibility: e.target.value })}>
          <option value="public">Public</option><option value="members_only">Members</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={draft.is_cta} onChange={(e) => patch({ is_cta: e.target.checked })} /> CTA</label>
        {draft.link_type === "group" ? <button onClick={() => setShowCard(!showCard)} className="text-xs text-accent-dark hover:underline">Feature card</button> : null}
        <button onClick={del} className="ml-auto text-xs font-medium text-red-600 hover:underline">Delete</button>
      </div>
      {draft.link_type === "group" && showCard ? (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-border bg-paper/40 p-3 sm:grid-cols-4">
          {(["title", "blurb", "href", "imageUrl"] as const).map((k) => (
            <input key={k} className={input} placeholder={k} value={fc[k] ?? ""}
              onChange={(e) => setDraft({ ...draft, feature_card_json: { ...fc, [k]: e.target.value } })}
              onBlur={() => patch({})} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
