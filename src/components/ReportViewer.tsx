import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Clock, Download, Share } from '@phosphor-icons/react'
import { ChartContainer } from '@/components/ChartContainer'
import { DataTable } from '@/components/DataTable'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { GlobalFilterPanel, GlobalFilterConfig, GlobalFilterState } from '@/components/GlobalFilterPanel'
import { toast } from 'sonner'
import { 
  loadReportConfig, 
  loadReportContent, 
  ReportConfig,
  ChartConfig,
  TableConfig,
  ParsedCSVData
} from '@/lib/contentManager'
import { loadCSVDataFromMap, loadRawCSVFromMap } from '@/lib/dataLoader'

interface ReportViewerProps {
  reportId: string
  onBack: () => void
}

export function ReportViewer({ reportId, onBack }: ReportViewerProps) {
  const [report, setReport] = useState<ReportConfig | null>(null)
  const [content, setContent] = useState<string>('')
  const [csvDataCache, setCsvDataCache] = useState<Record<string, ParsedCSVData>>({})
  const [csvRawCache, setCsvRawCache] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [globalFilters, setGlobalFilters] = useState<GlobalFilterState>({})

  // Generate global filter configurations from all data
  const globalFilterConfigs = useMemo((): GlobalFilterConfig[] => {
    if (!report || Object.keys(csvDataCache).length === 0) return []

    const allHeaders = new Set<string>()
    const columnData: Record<string, any[]> = {}

    // Collect all unique headers and their data
    Object.values(csvDataCache).forEach(csvData => {
      csvData.headers.forEach(header => {
        allHeaders.add(header)
        if (!columnData[header]) {
          columnData[header] = []
        }
        csvData.data.forEach(row => {
          if (row[header] != null) {
            columnData[header].push(row[header])
          }
        })
      })
    })

    const configs: GlobalFilterConfig[] = []

    // Generate filter configs for common column patterns
    allHeaders.forEach(header => {
      const values = columnData[header]
      if (values.length === 0) return

      // Categorical filters for common category columns
      if (header.toLowerCase().includes('category') || 
          header.toLowerCase().includes('segment') ||
          header.toLowerCase().includes('type') ||
          header.toLowerCase().includes('status')) {
        const uniqueValues = [...new Set(values)].sort()
        if (uniqueValues.length > 1 && uniqueValues.length <= 20) {
          configs.push({
            key: `global-${header}`,
            label: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' '),
            type: 'categorical',
            column: header,
            values: uniqueValues,
            description: `Filter all charts and tables by ${header}`
          })
        }
      }
      // Numerical filters for metrics
      else if (header.toLowerCase().includes('percentage') ||
               header.toLowerCase().includes('count') ||
               header.toLowerCase().includes('revenue') ||
               header.toLowerCase().includes('value') ||
               header.toLowerCase().includes('rate') ||
               header.toLowerCase().includes('cost') ||
               header.toLowerCase().includes('size')) {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v))
        if (numericValues.length > 0) {
          const min = Math.min(...numericValues)
          const max = Math.max(...numericValues)
          if (min !== max) {
            configs.push({
              key: `global-${header}`,
              label: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' '),
              type: 'numerical',
              column: header,
              range: [min, max],
              description: `Filter all charts and tables by ${header} range`
            })
          }
        }
      }
    })

    return configs
  }, [report, csvDataCache])

  // Apply global filters to data
  const applyGlobalFilters = useCallback((data: any[]) => {
    let filtered = [...data]

    Object.entries(globalFilters).forEach(([key, filter]) => {
      if (!filter.active) return

      const config = globalFilterConfigs.find(c => c.key === key)
      if (!config) return

      switch (filter.type) {
        case 'categorical':
          if (filter.value.length > 0) {
            filtered = filtered.filter(item => 
              filter.value.includes(item[config.column])
            )
          }
          break
        case 'numerical':
          const [min, max] = filter.value
          filtered = filtered.filter(item => {
            const val = parseFloat(item[config.column])
            return !isNaN(val) && val >= min && val <= max
          })
          break
        case 'text':
          if (filter.value.trim()) {
            filtered = filtered.filter(item => 
              String(item[config.column] || '').toLowerCase().includes(filter.value.toLowerCase())
            )
          }
          break
      }
    })

    return filtered
  }, [globalFilters, globalFilterConfigs])

  // Handle global filter changes
  const handleGlobalFilterChange = useCallback((filters: GlobalFilterState) => {
    setGlobalFilters(filters)
  }, [])

  useEffect(() => {
    async function loadReportData() {
      setLoading(true)
      try {
        // Load report configuration
        const config = await loadReportConfig(reportId)
        if (!config) {
          toast.error('Report not found')
          onBack()
          return
        }
        setReport(config)

        // Load markdown content
        const markdownContent = await loadReportContent(reportId)
        if (markdownContent) {
          setContent(markdownContent)
        }

        // Load all CSV files
        const csvData: Record<string, ParsedCSVData> = {}
        const csvRaw: Record<string, string> = {}
        
        for (const dataFile of config.dataFiles) {
          // Use the new map-based loader
          const data = await loadCSVDataFromMap(reportId, dataFile.filename)
          if (data) {
            csvData[dataFile.filename] = data
          }
          
          // Load raw CSV for downloads
          const rawText = await loadRawCSVFromMap(reportId, dataFile.filename)
          if (rawText) {
            csvRaw[dataFile.filename] = rawText
          }
        }
        
        setCsvDataCache(csvData)
        setCsvRawCache(csvRaw)
      } catch (error) {
        console.error('Error loading report:', error)
        toast.error('Failed to load report')
        onBack()
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [reportId, onBack])

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-title-large mb-2">Loading report...</h2>
          <p className="text-body-medium text-muted-foreground">Please wait while we fetch the data.</p>
        </div>
      </div>
    )
  }

  const renderChart = (chartConfig: ChartConfig) => {
    const csvData = csvDataCache[chartConfig.dataFile]
    const csvRaw = csvRawCache[chartConfig.dataFile]
    
    if (!csvData || !csvRaw) {
      return (
        <div className="text-body-medium text-muted-foreground">
          Chart data not available for {chartConfig.dataFile}
        </div>
      )
    }

    // Apply global filters to the data
    const filteredChartData = applyGlobalFilters(csvData.data)

    // Convert chart config to Plotly data using filtered data
    const plotlyData = (() => {
      switch (chartConfig.type) {
        case 'line':
          return [{
            x: filteredChartData.map(row => row[chartConfig.config.x!]),
            y: filteredChartData.map(row => row[chartConfig.config.y!]),
            type: 'scatter',
            mode: 'lines+markers',
            name: chartConfig.config.y,
            line: { shape: 'spline' }
          }]
        
        case 'bar':
          return [{
            x: filteredChartData.map(row => row[chartConfig.config.x!]),
            y: filteredChartData.map(row => row[chartConfig.config.y!]),
            type: 'bar',
            name: chartConfig.config.y
          }]
        
        case 'scatter':
          return [{
            x: filteredChartData.map(row => row[chartConfig.config.x!]),
            y: filteredChartData.map(row => row[chartConfig.config.y!]),
            type: 'scatter',
            mode: 'markers',
            name: chartConfig.title,
            text: chartConfig.config.text ? filteredChartData.map(row => row[chartConfig.config.text!]) : undefined,
            hovertemplate: chartConfig.config.text ? 
              `<b>${chartConfig.config.text}:</b> %{text}<br><b>${chartConfig.config.x}:</b> %{x}<br><b>${chartConfig.config.y}:</b> %{y}<extra></extra>` : 
              undefined
          }]
        
        case 'pie':
          return [{
            labels: filteredChartData.map(row => row[chartConfig.config.labels!]),
            values: filteredChartData.map(row => row[chartConfig.config.values!]),
            type: 'pie',
            hole: chartConfig.config.hole || 0,
            textinfo: 'label+percent',
            textposition: 'auto'
          }]
        
        default:
          return []
      }
    })()

    // Configure individual chart filters (excluding global filter columns)
    const filterConfigs = (() => {
      const configs = []
      const globalColumns = globalFilterConfigs.map(c => c.column)
      
      // Add filters for columns not covered by global filters
      csvData.headers.forEach(header => {
        if (globalColumns.includes(header)) return // Skip global filter columns

        if (header.toLowerCase().includes('category') || 
            header.toLowerCase().includes('type')) {
          const uniqueValues = [...new Set(csvData.data.map(row => row[header]))].sort()
          if (uniqueValues.length > 1 && uniqueValues.length <= 10) {
            configs.push({
              column: header,
              type: 'categorical' as const,
              label: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' ')
            })
          }
        }
      })
      
      return configs
    })()

    // Configure drill-down for hierarchical charts
    const drillDownConfig = (() => {
      if (chartConfig.type === 'pie' || chartConfig.type === 'bar') {
        return {
          enabled: true,
          targetColumn: chartConfig.config.x || chartConfig.config.labels || 'category',
          groupByColumn: 'category',
          aggregationType: 'sum' as const
        }
      }
      return undefined
    })()

    return (
      <ChartContainer
        title={chartConfig.title}
        data={plotlyData}
        rawData={csvData.data}
        layout={{
          title: chartConfig.title,
          ...chartConfig.config
        }}
        chartType={chartConfig.type}
        csvData={csvRaw}
        csvFilename={chartConfig.dataFile}
        className="my-8"
        reportId={reportId}
        chartId={chartConfig.id}
        enableFiltering={filterConfigs.length > 0}
        enableDrillDown={!!drillDownConfig}
        filterConfigs={filterConfigs}
        drillDownConfig={drillDownConfig}
        onFilterChange={(filters) => {
          console.log('Chart filter changed:', filters)
        }}
        onDrillDown={(level, filter) => {
          console.log('Chart drill down:', level, filter)
        }}
      />
    )
  }

  const renderTable = (tableConfig: TableConfig) => {
    const csvData = csvDataCache[tableConfig.dataFile]
    const csvRaw = csvRawCache[tableConfig.dataFile]
    
    if (!csvData || !csvRaw) {
      return (
        <div className="text-body-medium text-muted-foreground">
          Table data not available for {tableConfig.dataFile}
        </div>
      )
    }

    // Apply global filters to table data
    const filteredTableData = applyGlobalFilters(csvData.data)

    // Create filtered data structure for the table
    const filteredCsvData = {
      ...csvData,
      data: filteredTableData
    }

    return (
      <DataTable
        title={tableConfig.title}
        data={filteredCsvData}
        csvData={csvRaw}
        csvFilename={tableConfig.dataFile}
        columns={tableConfig.columns}
        columnTitles={tableConfig.columnTitles}
        className="my-8"
        reportId={reportId}
        tableId={tableConfig.id}
        enableFiltering={true}
        enableSorting={true}
        pageSize={50}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-label-large"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-display-small font-bold">{report.title}</h1>
          <p className="text-title-medium text-muted-foreground">{report.subtitle}</p>
          
          <div className="flex items-center gap-6 text-body-small text-muted-foreground">
            <span>By {report.author}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(report.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{report.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Global Filters */}
      {globalFilterConfigs.length > 0 && (
        <div className="space-y-6">
          <GlobalFilterPanel
            filterConfigs={globalFilterConfigs}
            onFilterChange={handleGlobalFilterChange}
            allData={csvDataCache}
            className="mb-8"
          />
          <Separator />
        </div>
      )}

      {/* Content */}
      <div className="space-y-12">
        {/* Markdown content */}
        {content && (
          <MarkdownRenderer content={content} />
        )}
        
        {/* Charts */}
        {report.charts.map((chartConfig) => (
          <div key={chartConfig.id}>
            {renderChart(chartConfig)}
          </div>
        ))}
        
        {/* Tables */}
        {report.tables.map((tableConfig) => (
          <div key={tableConfig.id}>
            {renderTable(tableConfig)}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t pt-8 text-center">
        <p className="text-body-medium text-muted-foreground">
          End of report • Published {new Date(report.publishDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}