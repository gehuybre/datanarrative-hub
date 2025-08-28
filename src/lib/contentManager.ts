export interface ReportConfig {
  id: string
  title: string
  subtitle: string
  author: string
  publishDate: string
  readTime: string
  tags: string[]
  contentFile: string
  dataFiles: DataFile[]
  charts: ChartConfig[]
  tables: TableConfig[]
}

export interface DataFile {
  filename: string
  title: string
  description: string
}

export interface ChartConfig {
  id: string
  title: string
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'multiline' | 'trendlines'
  dataFile: string
  config: {
    x?: string
    y?: string
    labels?: string
    values?: string
    text?: string
    hole?: number
    xaxis?: { title: string }
    yaxis?: { title: string }
    traces?: Array<{
      y: string
      name: string
      line?: {
        color?: string
        width?: number
        dash?: string
      }
    }>
  }
}

export interface TableConfig {
  id: string
  title: string
  dataFile: string
  columns: string[]
  columnTitles: string[]
}

export interface ParsedCSVData {
  headers: string[]
  data: Record<string, any>[]
}

// Parse CSV helper
export function parseCSV(csvText: string): ParsedCSVData {
  const lines = csvText.trim().split('\n')
  
  if (lines.length < 2) {
    console.error('CSV must have at least a header and one data row')
    return { headers: [], data: [] }
  }
  
  const headers = lines[0].split(',').map(h => h.trim())
  
  const data = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim())
    const row: any = {}
    headers.forEach((header, headerIndex) => {
      const value = values[headerIndex] || ''
      // Try to parse as number
      const numValue = parseFloat(value)
      row[header] = isNaN(numValue) ? value : numValue
    })
    return row
  })
  
  return { headers, data }
}

// Load report configuration
export async function loadReportConfig(reportId: string): Promise<ReportConfig | null> {
  try {
    const configModule = await import(`@/content/reports/${reportId}/config.json`)
    return configModule.default || configModule
  } catch (error) {
    console.error(`Failed to load config for report ${reportId}:`, error)
    return null
  }
}

// Load report content (markdown)
export async function loadReportContent(reportId: string): Promise<string | null> {
  try {
    const contentModule = await import(`@/content/reports/${reportId}/content.md?raw`)
    return contentModule.default || contentModule
  } catch (error) {
    console.error(`Failed to load content for report ${reportId}:`, error)
    return null
  }
}

// Load CSV data
export async function loadCSVData(reportId: string, filename: string): Promise<ParsedCSVData | null> {
  try {
    console.log(`Attempting to load CSV: ${filename} for report: ${reportId}`)
    const csvModule = await import(`@/content/reports/${reportId}/data/${filename}?raw`)
    console.log('CSV module loaded:', csvModule)
    const csvText = csvModule.default || csvModule
    
    if (!csvText || typeof csvText !== 'string') {
      console.error(`CSV text is invalid for ${filename}:`, csvText)
      return null
    }
    
    const parsed = parseCSV(csvText)
    console.log(`Successfully parsed CSV ${filename}:`, parsed)
    return parsed
  } catch (error) {
    console.error(`Failed to load CSV data ${filename} for report ${reportId}:`, error)
    return null
  }
}

// Load home page content
export async function loadHomeContent(): Promise<string | null> {
  try {
    const contentModule = await import('@/content/home/content.md?raw')
    return contentModule.default || contentModule
  } catch (error) {
    console.error('Failed to load home content:', error)
    return null
  }
}

// Get list of available reports
export function getAvailableReports(): string[] {
  // This would ideally be dynamic, but for now we'll return the known reports
  return [
    'sales-performance-q1-2024',
    'market-segmentation-study', 
    'user-engagement-metrics',
    'vergunningen-2025',
    'aantal-starters-vlaanderen-2025'
  ]
}

// Generate report search data
export async function getReportSearchData() {
  const reportIds = getAvailableReports()
  const reports = []
  
  for (const reportId of reportIds) {
    const config = await loadReportConfig(reportId)
    if (config) {
      reports.push({
        id: config.id,
        title: config.title,
        subtitle: config.subtitle,
        author: config.author,
        publishDate: config.publishDate,
        readTime: config.readTime,
        tags: config.tags
      })
    }
  }
  
  return reports
}