/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// Plotly type declarations
declare global {
  interface Window {
    Plotly: {
      templates: {
        [key: string]: any
        default?: string
        aurora_borealis?: any
      }
      downloadImage: (gd: any, options: any) => Promise<void>
    }
  }
}