import { create } from "zustand"
import type {
  TacticsPlayer,
  TacticsArrow,
  TacticsLabel,
  TacticsBoardState,
  TacticsKind,
  FieldType,
  TacticsPosition,
} from "@/types/database"

export type TacticsTool = "select"

export const FUTSAL_POSITIONS: TacticsPosition[] = [
  "Goalkeeper",
  "Fixo",
  "Ala",
  "Pivô",
]
export const MASL_POSITIONS: TacticsPosition[] = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Target Forward",
  "2nd Forward",
]

/**
 * Standard starting positions for the OPPONENT team, normalized 0-1.
 * x≈0.78-0.95 keeps them on the right (defending) side of the court.
 */
const FUTSAL_OPPONENT_LAYOUT: { position: string; x: number; y: number }[] = [
  { position: "Goalkeeper", x: 0.95, y: 0.5 },
  { position: "Fixo", x: 0.78, y: 0.5 },
  { position: "Ala", x: 0.68, y: 0.26 },
  { position: "Ala", x: 0.68, y: 0.74 },
  { position: "Pivô", x: 0.56, y: 0.5 },
]

const MASL_OPPONENT_LAYOUT: { position: string; x: number; y: number }[] = [
  { position: "Goalkeeper", x: 0.95, y: 0.5 },
  { position: "Defender", x: 0.8, y: 0.32 },
  { position: "Defender", x: 0.8, y: 0.68 },
  { position: "Midfielder", x: 0.66, y: 0.5 },
  { position: "Target Forward", x: 0.55, y: 0.34 },
  { position: "2nd Forward", x: 0.55, y: 0.66 },
]

/**
 * Standard starting positions for the HOME team, normalized 0-1.
 * x≈0.05-0.45 keeps them on the left (attacking) side of the court.
 */
const FUTSAL_HOME_LAYOUT: { position: string; x: number; y: number }[] = [
  { position: "Goalkeeper", x: 0.05, y: 0.5 },
  { position: "Fixo", x: 0.22, y: 0.5 },
  { position: "Ala", x: 0.32, y: 0.26 },
  { position: "Ala", x: 0.32, y: 0.74 },
  { position: "Pivô", x: 0.44, y: 0.5 },
]

const MASL_HOME_LAYOUT: { position: string; x: number; y: number }[] = [
  { position: "Goalkeeper", x: 0.05, y: 0.5 },
  { position: "Defender", x: 0.2, y: 0.5 },
  { position: "Midfielder", x: 0.34, y: 0.32 },
  { position: "Midfielder", x: 0.34, y: 0.68 },
  { position: "2nd Forward", x: 0.45, y: 0.34 },
  { position: "Target Forward", x: 0.45, y: 0.66 },
]

/** Build the pre-populated opponent token list for a fresh board. */
export function buildOpponents(fieldType: FieldType): TacticsPlayer[] {
  const layout =
    fieldType === "futsal_rounded"
      ? FUTSAL_OPPONENT_LAYOUT
      : MASL_OPPONENT_LAYOUT
  return layout.map((p) => ({
    id: crypto.randomUUID(),
    x: p.x,
    y: p.y,
    name: p.position,
    team: "away" as const,
    tokenType: "player" as const,
    position: p.position,
    profileId: null,
  }))
}

/** Build the pre-populated HOME team token list for a fresh board. */
export function buildHomePlayers(fieldType: FieldType): TacticsPlayer[] {
  const layout =
    fieldType === "futsal_rounded" ? FUTSAL_HOME_LAYOUT : MASL_HOME_LAYOUT
  return layout.map((p) => ({
    id: crypto.randomUUID(),
    x: p.x,
    y: p.y,
    name: p.position,
    team: "home" as const,
    tokenType: "player" as const,
    position: p.position,
    profileId: null,
  }))
}

interface TacticsState {
  // Board metadata
  name: string
  kind: TacticsKind
  fieldType: FieldType
  /** Teams the board is assigned to (multi-select). */
  teamIds: string[]
  isPublished: boolean
  boardId: string | null
  previewImageUrl: string | null

  // Board elements
  players: TacticsPlayer[]
  arrows: TacticsArrow[]
  labels: TacticsLabel[]

  // UI state
  selectedId: string | null
  tool: TacticsTool
  isDirty: boolean

  // Undo history (snapshots of board elements)
  history: TacticsBoardState[]
}

interface TacticsActions {
  // Players / tokens
  addPlayer: (player: TacticsPlayer) => void
  movePlayer: (id: string, x: number, y: number) => void
  removePlayer: (id: string) => void

  // Arrows
  addArrow: (arrow: TacticsArrow) => void
  removeArrow: (id: string) => void
  updateArrow: (id: string, patch: Partial<TacticsArrow>) => void

  // Labels
  addLabel: (label: TacticsLabel) => void
  moveLabel: (id: string, x: number, y: number) => void
  updateLabel: (id: string, patch: Partial<TacticsLabel>) => void
  removeLabel: (id: string) => void

  // Selection
  setSelectedId: (id: string | null) => void
  deleteSelected: () => void

  // Undo
  pushHistory: () => void
  undo: () => void

  // Board meta
  setName: (name: string) => void
  setKind: (kind: TacticsKind) => void
  setFieldType: (fieldType: FieldType) => void
  setTeamIds: (teamIds: string[]) => void
  toggleTeamId: (teamId: string) => void
  setIsPublished: (isPublished: boolean) => void
  setBoardId: (id: string | null) => void
  setPreviewImageUrl: (url: string | null) => void

  // State management
  loadState: (
    state: TacticsBoardState & {
      id?: string
      name?: string
      kind?: TacticsKind
      field_type?: FieldType
      team_ids?: string[]
      is_published?: boolean
      preview_image_url?: string | null
    }
  ) => void
  initNewBoard: (fieldType?: FieldType, kind?: TacticsKind) => void
  reset: () => void
  getStateJson: () => TacticsBoardState
  markClean: () => void
}

const initialState: TacticsState = {
  name: "Untitled Play",
  kind: "play",
  fieldType: "futsal_rounded",
  teamIds: [],
  isPublished: false,
  boardId: null,
  previewImageUrl: null,
  players: [],
  arrows: [],
  labels: [],
  selectedId: null,
  tool: "select",
  isDirty: false,
  history: [],
}

const MAX_HISTORY = 50

export const useTacticsStore = create<TacticsState & TacticsActions>()(
  (set, get) => {
    /** Capture current board elements onto the undo stack before mutating. */
    function snapshot(s: TacticsState): TacticsBoardState[] {
      const snap: TacticsBoardState = {
        players: s.players,
        arrows: s.arrows,
        labels: s.labels,
      }
      const next = [...s.history, snap]
      if (next.length > MAX_HISTORY) next.shift()
      return next
    }

    return {
      ...initialState,

      // Players / tokens
      addPlayer: (player) =>
        set((s) => ({
          history: snapshot(s),
          players: [...s.players, player],
          isDirty: true,
        })),
      movePlayer: (id, x, y) =>
        set((s) => ({
          history: snapshot(s),
          players: s.players.map((p) => (p.id === id ? { ...p, x, y } : p)),
          isDirty: true,
        })),
      removePlayer: (id) =>
        set((s) => ({
          history: snapshot(s),
          players: s.players.filter((p) => p.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
          isDirty: true,
        })),

      // Arrows
      addArrow: (arrow) =>
        set((s) => ({
          history: snapshot(s),
          arrows: [...s.arrows, arrow],
          isDirty: true,
        })),
      removeArrow: (id) =>
        set((s) => ({
          history: snapshot(s),
          arrows: s.arrows.filter((a) => a.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
          isDirty: true,
        })),
      updateArrow: (id, patch) =>
        set((s) => ({
          history: snapshot(s),
          arrows: s.arrows.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          isDirty: true,
        })),

      // Labels
      addLabel: (label) =>
        set((s) => ({
          history: snapshot(s),
          labels: [...s.labels, label],
          isDirty: true,
        })),
      moveLabel: (id, x, y) =>
        set((s) => ({
          history: snapshot(s),
          labels: s.labels.map((l) => (l.id === id ? { ...l, x, y } : l)),
          isDirty: true,
        })),
      updateLabel: (id, patch) =>
        set((s) => ({
          history: snapshot(s),
          labels: s.labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          isDirty: true,
        })),
      removeLabel: (id) =>
        set((s) => ({
          history: snapshot(s),
          labels: s.labels.filter((l) => l.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
          isDirty: true,
        })),

      // Selection
      setSelectedId: (id) => set({ selectedId: id }),
      deleteSelected: () => {
        const s = get()
        if (!s.selectedId) return
        const id = s.selectedId
        if (s.players.find((p) => p.id === id)) get().removePlayer(id)
        else if (s.arrows.find((a) => a.id === id)) get().removeArrow(id)
        else if (s.labels.find((l) => l.id === id)) get().removeLabel(id)
      },

      // Undo
      pushHistory: () => set((s) => ({ history: snapshot(s) })),
      undo: () =>
        set((s) => {
          if (s.history.length === 0) return s
          const prev = s.history[s.history.length - 1]
          return {
            history: s.history.slice(0, -1),
            players: prev.players,
            arrows: prev.arrows,
            labels: prev.labels,
            selectedId: null,
            isDirty: true,
          }
        }),

      // Board meta
      setName: (name) => set({ name, isDirty: true }),
      setKind: (kind) => set({ kind, isDirty: true }),
      setFieldType: (fieldType) => set({ fieldType, isDirty: true }),
      setTeamIds: (teamIds) => set({ teamIds, isDirty: true }),
      toggleTeamId: (teamId) =>
        set((s) => ({
          teamIds: s.teamIds.includes(teamId)
            ? s.teamIds.filter((t) => t !== teamId)
            : [...s.teamIds, teamId],
          isDirty: true,
        })),
      setIsPublished: (isPublished) => set({ isPublished, isDirty: true }),
      setBoardId: (id) => set({ boardId: id }),
      setPreviewImageUrl: (url) => set({ previewImageUrl: url }),

      // State management
      loadState: (data) => {
        set({
          players: data.players ?? [],
          arrows: data.arrows ?? [],
          labels: data.labels ?? [],
          boardId: data.id ?? null,
          name: data.name ?? "Untitled Play",
          kind: data.kind ?? "play",
          fieldType: data.field_type ?? "futsal_rounded",
          teamIds: data.team_ids ?? [],
          isPublished: data.is_published ?? false,
          previewImageUrl: data.preview_image_url ?? null,
          selectedId: null,
          tool: "select",
          isDirty: false,
          history: [],
        })
      },
      initNewBoard: (fieldType = "futsal_rounded", kind = "play") => {
        set({
          ...initialState,
          fieldType,
          kind,
          players: [
            ...buildHomePlayers(fieldType),
            ...buildOpponents(fieldType),
          ],
        })
      },
      reset: () => set({ ...initialState }),
      getStateJson: () => {
        const { players, arrows, labels } = get()
        return { players, arrows, labels }
      },
      markClean: () => set({ isDirty: false }),
    }
  }
)
