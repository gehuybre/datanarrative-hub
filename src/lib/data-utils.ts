import { data as dataConfig } from '@/lib/config'

export interface ParsedCSVData {
  headers: string[]
  data: Record<string, any>[]
  rowCount: number
  columnCount: number
}

export interface DataValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Parse CSV text into structured data
 */
export function parseCSV(csvText: string): ParsedCSVData {
  const lines = csvText.trim().split('\n')
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  // Parse headers
  const headers = lines[0]
    .split(dataConfig.csv.delimiter)
    .map(header => dataConfig.csv.trimHeaders ? header.trim() : header)

  // Parse data rows
  const data: Record<string, any>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines if configured
    if (dataConfig.csv.skipEmptyLines && !line) {
      continue
    }
    
    const values = line.split(dataConfig.csv.delimiter)
    const row: Record<string, any> = {}
    
    headers.forEach((header, index) => {
      let value = values[index] || ''
      
      // Auto-detect and convert types if enabled
      if (dataConfig.csv.autoDetectTypes) {
        value = autoDetectType(value)
      }
      
      row[header] = value
    })
    
    data.push(row)
  }

  return {
    headers,
    data,
    rowCount: data.length,
    columnCount: headers.length
  }
}

/**
 * Auto-detect and convert data types
 */
function autoDetectType(value: string): any {
  if (!value || value.trim() === '') {
    return null
  }

  const trimmed = value.trim()

  // Boolean detection
  if (trimmed.toLowerCase() === 'true') return true
  if (trimmed.toLowerCase() === 'false') return false

  // Number detection
  const numberValue = parseFloat(trimmed)
  if (!isNaN(numberValue) && isFinite(numberValue)) {
    // Check if it's an integer
    if (trimmed.indexOf('.') === -1 && trimmed.indexOf('e') === -1 && trimmed.indexOf('E') === -1) {
      const intValue = parseInt(trimmed, 10)
      if (intValue.toString() === trimmed) {
        return intValue
      }
    }
    return numberValue
  }

  // Date detection (basic patterns)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  const datetimePattern = /^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/
  
  if (datePattern.test(trimmed) || datetimePattern.test(trimmed)) {
    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0] // Return as ISO date string
    }
  }

  // Return as string
  return trimmed
}

/**
 * Validate parsed CSV data
 */
export function validateCSVData(parsedData: ParsedCSVData): DataValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check row count limits
  if (parsedData.rowCount > dataConfig.limits.maxRows) {
    errors.push(`Too many rows: ${parsedData.rowCount}. Maximum allowed: ${dataConfig.limits.maxRows}`)
  }

  // Check column count limits
  if (parsedData.columnCount > dataConfig.limits.maxColumns) {
    errors.push(`Too many columns: ${parsedData.columnCount}. Maximum allowed: ${dataConfig.limits.maxColumns}`)
  }

  // Check for empty headers
  const emptyHeaders = parsedData.headers.filter(header => !header.trim())
  if (emptyHeaders.length > 0) {
    warnings.push(`Found ${emptyHeaders.length} empty column header(s)`)
  }

  // Check for duplicate headers
  const headerCounts = new Map()
  parsedData.headers.forEach(header => {
    headerCounts.set(header, (headerCounts.get(header) || 0) + 1)
  })
  
  const duplicateHeaders = Array.from(headerCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([header]) => header)
  
  if (duplicateHeaders.length > 0) {
    warnings.push(`Duplicate column headers found: ${duplicateHeaders.join(', ')}`)
  }

  // Check data consistency
  const inconsistentRows = parsedData.data
    .map((row, index) => {
      const rowKeys = Object.keys(row)
      if (rowKeys.length !== parsedData.columnCount) {
        return index + 1 // +1 for 1-based row numbering
      }
      return null
    })
    .filter(Boolean)

  if (inconsistentRows.length > 0) {
    warnings.push(`Rows with inconsistent column count: ${inconsistentRows.slice(0, 5).join(', ')}${inconsistentRows.length > 5 ? '...' : ''}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Convert data back to CSV format
 */
export function dataToCSV(data: ParsedCSVData): string {
  const { headers, data: rows } = data
  
  // Create CSV content
  const csvRows = [headers.join(dataConfig.csv.delimiter)]
  
  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) {
        return ''
      }
      return String(value)
    })
    csvRows.push(values.join(dataConfig.csv.delimiter))
  })
  
  return csvRows.join('\n')
}

/**
 * Generate sample data for charts
 */
export function generateSampleData(type: 'timeseries' | 'categorical' | 'scatter' | 'distribution', count = 50) {
  switch (type) {
    case 'timeseries':
      return generateTimeSeriesData(count)
    case 'categorical':
      return generateCategoricalData(count)
    case 'scatter':
      return generateScatterData(count)
    case 'distribution':
      return generateDistributionData(count)
    default:
      throw new Error(`Unknown sample data type: ${type}`)
  }
}

function generateTimeSeriesData(count: number) {
  const data = []
  const startDate = new Date('2024-01-01')
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(100 + Math.random() * 50 + Math.sin(i / 10) * 20),
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'
    })
  }
  
  return data
}

function generateCategoricalData(count: number) {
  const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing']
  return categories.slice(0, Math.min(count, categories.length)).map(category => ({
    category,
    value: Math.round(Math.random() * 100),
    percentage: Math.round(Math.random() * 30 + 5)
  }))
}

function generateScatterData(count: number) {
  const data = []
  for (let i = 0; i < count; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 5,
      category: ['Group A', 'Group B', 'Group C'][i % 3]
    })
  }
  return data
}

function generateDistributionData(count: number) {
  const data = []
  for (let i = 0; i < count; i++) {
    // Generate normally distributed data
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    
    data.push({
      value: Math.round(z0 * 15 + 50), // mean=50, std=15
      bin: Math.floor(i / 5)
    })
  }
  return data
}