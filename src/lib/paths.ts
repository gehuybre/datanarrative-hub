// Configuration paths for the data storytelling platform
export const paths = {
  // Data paths
  data: {
    reports: '/src/data/reports',
    csv: '/src/data/csv',
    assets: '/src/assets'
  },
  
  // API endpoints (if needed for future expansion)
  api: {
    base: '/api',
    reports: '/api/reports',
    export: '/api/export'
  },
  
  // Route paths
  routes: {
    home: '/',
    reports: '/reports',
    report: '/reports/:id',
    search: '/search'
  },
  
  // Asset paths
  assets: {
    images: '/src/assets/images',
    icons: '/src/assets/icons',
    exports: '/exports'
  }
} as const

export type PathConfig = typeof paths