import { useKV } from '@github/spark/hooks'

export interface UserPreferences {
  theme: 'light' | 'dark'
  animationsEnabled: boolean
  defaultChartColors: 'material' | 'classic' | 'colorblind'
  exportFormat: 'png' | 'svg' | 'pdf'
  showGridlines: boolean
  autoSaveReports: boolean
  recentReportsLimit: number
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  animationsEnabled: true,
  defaultChartColors: 'material',
  exportFormat: 'png',
  showGridlines: true,
  autoSaveReports: true,
  recentReportsLimit: 10
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useKV('user-preferences', defaultPreferences)

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(current => ({
      ...current,
      [key]: value
    }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences
  }
}