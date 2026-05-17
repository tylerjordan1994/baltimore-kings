import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViewModeStore {
  viewAs: 'admin' | 'player'
  setViewAs: (mode: 'admin' | 'player') => void
}

export const useViewMode = create<ViewModeStore>()(
  persist(
    (set) => ({
      viewAs: 'admin',
      setViewAs: (mode) => set({ viewAs: mode }),
    }),
    { name: 'bk-view-mode' }
  )
)
