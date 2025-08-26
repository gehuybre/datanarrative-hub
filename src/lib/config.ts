import { colors } from './colors'
import { paths } from './paths'

// Application-wide configuration
export const appConfig = {
  // Application metadata
  app: {
    name: 'DataStory Platform',
    version: '1.0.0',
    description: 'Interactive data storytelling and visualization platform',
    author: 'Analytics Team'
  },

  // UI Configuration
  ui: {
    // Animation settings
    animations: {
      enabled: true,
      duration: {
        fast: 150,
        normal: 300,
        slow: 500
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },

    // Layout settings
    layout: {
      containerMaxWidth: '1200px',
      sidebarWidth: '280px',
      headerHeight: '64px',
      spacing: {
        xs: '4px',
        sm: '8px', 
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
      }
    },

    // Typography scale
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px'
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    }
  },

  // Chart Configuration
  charts: {
    // Default chart dimensions
    dimensions: {
      width: 800,
      height: 400,
      aspectRatio: '16:10'
    },

    // Export settings
    export: {
      imageFormat: 'png',
      imageScale: 2,
      csvDelimiter: ',',
      includeHeaders: true
    },

    // Plotly specific config
    plotly: {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: [
        'pan2d',
        'lasso2d', 
        'select2d',
        'autoScale2d',
        'hoverClosestCartesian',
        'hoverCompareCartesian'
      ],
      scrollZoom: false,
      doubleClick: 'reset+autosize',
      showTips: false,
      responsive: true
    }
  },

  // Data configuration
  data: {
    // CSV parsing settings
    csv: {
      delimiter: ',',
      skipEmptyLines: true,
      trimHeaders: true,
      autoDetectTypes: true
    },

    // File size limits
    limits: {
      maxFileSize: '10MB',
      maxRows: 50000,
      maxColumns: 100
    },

    // Caching settings
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxEntries: 50
    }
  },

  // Feature flags
  features: {
    enableExports: true,
    enableEmbeds: true,
    enableSharing: true,
    enableBookmarks: true,
    enableComments: false,
    enableCollaboration: false,
    enableRealTimeUpdates: false
  },

  // API Configuration
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Security settings
  security: {
    allowedFileTypes: ['.csv', '.json', '.xlsx'],
    maxUploadSize: '10MB',
    enableCSP: true,
    enableCORS: false
  }
} as const

// Export individual configs for convenience
export const { ui, charts, data, features, api, security } = appConfig

// Type definitions
export type AppConfig = typeof appConfig
export type UIConfig = typeof ui
export type ChartConfig = typeof charts
export type DataConfig = typeof data

// Merge with colors and paths
export const config = {
  ...appConfig,
  colors,
  paths
} as const

export default config