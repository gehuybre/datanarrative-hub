// Centralized data loader to handle CSV imports explicitly

import { parseCSV, ParsedCSVData, ReportConfig } from './contentManager'

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

// Vergunningen 2025
import graphDataExportRaw from '@/content/reports/vergunningen-2025/data/graph_data_export.csv?raw'

// Aantal Starters Vlaanderen 2025
import didSummaryRaw from '@/content/reports/aantal-starters-vlaanderen-2025/data/did_summary.csv?raw'
import econometricResultsRaw from '@/content/reports/aantal-starters-vlaanderen-2025/data/econometric_results.csv?raw'
import economicFactorsRaw from '@/content/reports/aantal-starters-vlaanderen-2025/data/economic_factors.csv?raw'
import gereglementeerdeSectorenRaw from '@/content/reports/aantal-starters-vlaanderen-2025/data/gereglementeerde_sectoren.csv?raw'

// Import all config files
import marketSegmentationConfig from '@/content/reports/market-segmentation-study/config.json'
import salesPerformanceConfig from '@/content/reports/sales-performance-q1-2024/config.json'
import userEngagementConfig from '@/content/reports/user-engagement-metrics/config.json'
import vergunningenConfig from '@/content/reports/vergunningen-2025/config.json'
import aantalStartersVlaanderenConfig from '@/content/reports/aantal-starters-vlaanderen-2025/config.json'

// Create a lookup map for the data files
const dataFilesMap: Record<string, string> = {
  'market-segmentation-study/market-segments.csv': marketSegmentsRaw,
  'market-segmentation-study/segment-metrics.csv': segmentMetricsRaw,
  'sales-performance-q1-2024/sales-metrics.csv': salesMetricsRaw,
  'sales-performance-q1-2024/monthly-summary.csv': monthlySummaryRaw,
  'user-engagement-metrics/user-engagement.csv': userEngagementRaw,
  'user-engagement-metrics/feature-adoption.csv': featureAdoptionRaw,
  'vergunningen-2025/graph_data_export.csv': graphDataExportRaw,
  'aantal-starters-vlaanderen-2025/did_summary.csv': didSummaryRaw,
  'aantal-starters-vlaanderen-2025/econometric_results.csv': econometricResultsRaw,
  'aantal-starters-vlaanderen-2025/economic_factors.csv': economicFactorsRaw,
  'aantal-starters-vlaanderen-2025/gereglementeerde_sectoren.csv': gereglementeerdeSectorenRaw,
}

// Create a lookup map for config files
const configFilesMap: Record<string, any> = {
  'market-segmentation-study': marketSegmentationConfig,
  'sales-performance-q1-2024': salesPerformanceConfig,
  'user-engagement-metrics': userEngagementConfig,
  'vergunningen-2025': vergunningenConfig,
  'aantal-starters-vlaanderen-2025': aantalStartersVlaanderenConfig,
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

export function loadReportConfigFromMap(reportId: string): Promise<any | null> {
  return new Promise((resolve) => {
    try {
      const config = configFilesMap[reportId]
      
      if (!config) {
        console.error(`No config found for reportId: ${reportId}`)
        resolve(null)
        return
      }
      
      resolve(config)
    } catch (error) {
      console.error(`Failed to load config for ${reportId}:`, error)
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