import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Clock, Download, Share } from '@phosphor-icons/react'
import { ChartContainer } from '@/components/ChartContainer'
import { DataTable } from '@/components/DataTable'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
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

    // Convert chart config to Plotly data
    const plotlyData = (() => {
      switch (chartConfig.type) {
        case 'line':
          return [{
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[chartConfig.config.y!]),
            type: 'scatter',
            mode: 'lines+markers',
            name: chartConfig.config.y,
            line: { shape: 'spline' }
          }]
        
        case 'bar':
          return [{
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[chartConfig.config.y!]),
            type: 'bar',
            name: chartConfig.config.y
          }]
        
        case 'scatter':
          return [{
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[chartConfig.config.y!]),
            type: 'scatter',
            mode: 'markers',
            name: chartConfig.title,
            text: chartConfig.config.text ? csvData.data.map(row => row[chartConfig.config.text!]) : undefined,
            hovertemplate: chartConfig.config.text ? 
              `<b>${chartConfig.config.text}:</b> %{text}<br><b>${chartConfig.config.x}:</b> %{x}<br><b>${chartConfig.config.y}:</b> %{y}<extra></extra>` : 
              undefined
          }]
        
        case 'pie':
          return [{
            labels: csvData.data.map(row => row[chartConfig.config.labels!]),
            values: csvData.data.map(row => row[chartConfig.config.values!]),
            type: 'pie',
            hole: chartConfig.config.hole || 0,
            textinfo: 'label+percent',
            textposition: 'auto'
          }]
        
        default:
          return []
      }
    })()

    return (
      <ChartContainer
        title={chartConfig.title}
        data={plotlyData}
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

    return (
      <DataTable
        title={tableConfig.title}
        data={csvData}
        csvData={csvRaw}
        csvFilename={tableConfig.dataFile}
        columns={tableConfig.columns}
        columnTitles={tableConfig.columnTitles}
        className="my-8"
        reportId={reportId}
        tableId={tableConfig.id}
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