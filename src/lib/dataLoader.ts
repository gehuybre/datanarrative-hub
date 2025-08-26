// Centralized data loader to handle CSV imports explicitly

import { parseCSV, ParsedCSVData } from './contentManager'

// Import all CSV files explicitly using static imports
// Market Segmentation Study
import marketSegmentsRaw from '@/content/reports/market-segmentation-study/data/market-segments.csv?raw'
import segmentMetricsRaw from '@/content/reports/market-segmentation-study/data/segment-metrics.csv?raw'

// Sales Performance Q1 2024
import salesMetricsRaw from '@/content/reports/sales-performance-q1-2024/data/sales-metrics.csv?raw'
import monthlySummaryRaw from '@/content/reports/sales-performance-q1-2024/data/monthly-summary.csv?raw'

// User Engagement Metrics
import userEngagementRaw from '@/content/reports/user-engagement-metrics/data/user-engagement.csv?raw'
import featureAdoptionRaw from '@/content/reports/user-engagement-metrics/data/feature-adoption.csv?raw'

// Create a lookup map for the data files
const dataFilesMap: Record<string, string> = {
  'market-segmentation-study/market-segments.csv': marketSegmentsRaw,
  'market-segmentation-study/segment-metrics.csv': segmentMetricsRaw,
  'sales-performance-q1-2024/sales-metrics.csv': salesMetricsRaw,
  'sales-performance-q1-2024/monthly-summary.csv': monthlySummaryRaw,
  'user-engagement-metrics/user-engagement.csv': userEngagementRaw,
  'user-engagement-metrics/feature-adoption.csv': featureAdoptionRaw,
}

export function loadCSVDataFromMap(reportId: string, filename: string): Promise<ParsedCSVData | null> {
  return new Promise((resolve) => {
    try {
      const key = `${reportId}/${filename}`
      const csvText = dataFilesMap[key]
      
      if (!csvText) {
        console.error(`No CSV data found for key: ${key}`)
        resolve(null)
        return
      }
      
      const parsed = parseCSV(csvText)
      resolve(parsed)
    } catch (error) {
      console.error(`Failed to load CSV data for ${reportId}/${filename}:`, error)
      resolve(null)
    }
  })
}

export function loadRawCSVFromMap(reportId: string, filename: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const key = `${reportId}/${filename}`
      const csvText = dataFilesMap[key]
      
      if (!csvText) {
        console.error(`No raw CSV data found for key: ${key}`)
        resolve(null)
        return
      }
      
      resolve(csvText)
    } catch (error) {
      console.error(`Failed to load raw CSV data for ${reportId}/${filename}:`, error)
      resolve(null)
    }
  })
}