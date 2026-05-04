import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'zh-CN' | 'en'
export type FontSize = 'small' | 'medium' | 'large'

export interface SettingsState {
  theme: ThemeMode
  language: Language
  fontSize: FontSize
  compactMode: boolean
  showAdvancedAnalysis: boolean
  autoSaveRecords: boolean
  dataRemoteUrl: string

  setTheme: (theme: ThemeMode) => void
  setLanguage: (lang: Language) => void
  setFontSize: (size: FontSize) => void
  setCompactMode: (compact: boolean) => void
  setShowAdvancedAnalysis: (show: boolean) => void
  setAutoSaveRecords: (auto: boolean) => void
  setDataRemoteUrl: (url: string) => void
  resetSettings: () => void
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  let effective: 'light' | 'dark' = 'light'
  if (theme === 'dark') {
    effective = 'dark'
  } else if (theme === 'system') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  if (effective === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const defaults: Omit<SettingsState, 'setTheme' | 'setLanguage' | 'setFontSize' | 'setCompactMode' | 'setShowAdvancedAnalysis' | 'setAutoSaveRecords' | 'setDataRemoteUrl' | 'resetSettings'> = {
  theme: 'system',
  language: 'zh-CN',
  fontSize: 'medium',
  compactMode: false,
  showAdvancedAnalysis: true,
  autoSaveRecords: true,
  dataRemoteUrl: '',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      setLanguage: (language) => set({ language }),

      setFontSize: (fontSize) => set({ fontSize }),

      setCompactMode: (compactMode) => set({ compactMode }),

      setShowAdvancedAnalysis: (showAdvancedAnalysis) => set({ showAdvancedAnalysis }),

      setAutoSaveRecords: (autoSaveRecords) => set({ autoSaveRecords }),

      setDataRemoteUrl: (dataRemoteUrl) => set({ dataRemoteUrl }),

      resetSettings: () => {
        set({ ...defaults })
        applyTheme(defaults.theme)
      },
    }),
    {
      name: 'sts2-settings',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) applyTheme(state.theme)
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        fontSize: state.fontSize,
        compactMode: state.compactMode,
        showAdvancedAnalysis: state.showAdvancedAnalysis,
        autoSaveRecords: state.autoSaveRecords,
        dataRemoteUrl: state.dataRemoteUrl,
      }),
    }
  )
)

// Listen for system theme changes when in 'system' mode
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useSettingsStore.getState()
    if (theme === 'system') applyTheme('system')
  })
}
