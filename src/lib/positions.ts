// Predetermined positions for the two sports. Players/prospects can hold several.
export const FUTSAL_POSITIONS = ["Goalkeeper", "Defender (Fixo)", "Winger (Ala)", "Pivot"] as const
export const ARENA_POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"] as const

export type FutsalPosition = (typeof FUTSAL_POSITIONS)[number]
export type ArenaPosition = (typeof ARENA_POSITIONS)[number]
