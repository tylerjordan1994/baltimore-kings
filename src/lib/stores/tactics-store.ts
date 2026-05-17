import { create } from "zustand"
import type {
  TacticsPlayer,
  TacticsArrow,
  TacticsLabel,
  TacticsBoardState,
  TacticsKind,
  FieldType,
} from "@/types/database"

export type TacticsTool = "select" | "arrow" | "label"

interface TacticsState {
  // Board metadata
  name: string
  kind: TacticsKind
  fieldType: FieldType
  teamId: string | null
  isPublished: boolean
  boardId: string | null

  // Board elements
  players: TacticsPlayer[]
  arrows: TacticsArrow[]
  labels: TacticsLabel[]

  // UI state
  selectedId: string | null
  tool: TacticsTool
  arrowStart: { x: number; y: number } | null
  curvedArrows: boolean
  isDirty: boolean
}

interface TacticsActions {
  // Players
  addPlayer: (player: TacticsPlayer) => void
  movePlayer: (id: string, x: number, y: number) => void
  removePlayer: (id: string) => void

  // Arrows
  addArrow: (arrow: TacticsArrow) => void
  removeArrow: (id: string) => void
  moveArrowControl: (id: string, controlX: number, controlY: number) => void

  // Labels
  addLabel: (label: TacticsLabel) => void
  moveLabel: (id: string, x: number, y: number) => void
  removeLabel: (id: string) => void

  // Tool
  setTool: (tool: TacticsTool) => void
  setArrowStart: (point: { x: number; y: number } | null) => void
  setCurvedArrows: (curved: boolean) => void
  setSelectedId: (id: string | null) => void

  // Board meta
  setName: (name: string) => void
  setKind: (kind: TacticsKind) => void
  setFieldType: (fieldType: FieldType) => void
  setTeamId: (teamId: string | null) => void
  setIsPublished: (isPublished: boolean) => void
  setBoardId: (id: string | null) => void

  // State management
  loadState: (state: TacticsBoardState & { id?: string; name?: string; kind?: TacticsKind; field_type?: FieldType; team_id?: string | null; is_published?: boolean }) => void
  reset: () => void
  getStateJson: () => TacticsBoardState
  markClean: () => void
}

const initialState: TacticsState = {
  name: "Untitled Board",
  kind: "formation",
  fieldType: "futsal_rounded",
  teamId: null,
  isPublished: false,
  boardId: null,
  players: [],
  arrows: [],
  labels: [],
  selectedId: null,
  tool: "select",
  arrowStart: null,
  curvedArrows: false,
  isDirty: false,
}

export const useTacticsStore = create<TacticsState & TacticsActions>()(
  (set, get) => ({
    ...initialState,

    // Players
    addPlayer: (player) =>
      set((s) => ({ players: [...s.players, player], isDirty: true })),
    movePlayer: (id, x, y) =>
      set((s) => ({
        players: s.players.map((p) => (p.id === id ? { ...p, x, y } : p)),
        isDirty: true,
      })),
    removePlayer: (id) =>
      set((s) => ({
        players: s.players.filter((p) => p.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
        isDirty: true,
      })),

    // Arrows
    addArrow: (arrow) =>
      set((s) => ({ arrows: [...s.arrows, arrow], isDirty: true })),
    removeArrow: (id) =>
      set((s) => ({
        arrows: s.arrows.filter((a) => a.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
        isDirty: true,
      })),
    moveArrowControl: (id, controlX, controlY) =>
      set((s) => ({
        arrows: s.arrows.map((a) =>
          a.id === id ? { ...a, controlX, controlY } : a
        ),
        isDirty: true,
      })),

    // Labels
    addLabel: (label) =>
      set((s) => ({ labels: [...s.labels, label], isDirty: true })),
    moveLabel: (id, x, y) =>
      set((s) => ({
        labels: s.labels.map((l) => (l.id === id ? { ...l, x, y } : l)),
        isDirty: true,
      })),
    removeLabel: (id) =>
      set((s) => ({
        labels: s.labels.filter((l) => l.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
        isDirty: true,
      })),

    // Tool
    setTool: (tool) => set({ tool, arrowStart: null }),
    setArrowStart: (point) => set({ arrowStart: point }),
    setCurvedArrows: (curved) => set({ curvedArrows: curved }),
    setSelectedId: (id) => set({ selectedId: id }),

    // Board meta
    setName: (name) => set({ name, isDirty: true }),
    setKind: (kind) => set({ kind, isDirty: true }),
    setFieldType: (fieldType) => set({ fieldType, isDirty: true }),
    setTeamId: (teamId) => set({ teamId, isDirty: true }),
    setIsPublished: (isPublished) => set({ isPublished, isDirty: true }),
    setBoardId: (id) => set({ boardId: id }),

    // State management
    loadState: (data) => {
      set({
        players: data.players ?? [],
        arrows: data.arrows ?? [],
        labels: data.labels ?? [],
        boardId: data.id ?? null,
        name: data.name ?? "Untitled Board",
        kind: data.kind ?? "formation",
        fieldType: data.field_type ?? "futsal_rounded",
        teamId: data.team_id ?? null,
        isPublished: data.is_published ?? false,
        selectedId: null,
        tool: "select",
        arrowStart: null,
        isDirty: false,
      })
    },
    reset: () => set(initialState),
    getStateJson: () => {
      const { players, arrows, labels } = get()
      return { players, arrows, labels }
    },
    markClean: () => set({ isDirty: false }),
  })
)
