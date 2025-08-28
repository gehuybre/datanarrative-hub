import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { Calendar } from '@phosphor-icons/react/dist/csr/Calendar'
import { Clock } from '@phosphor-icons/react/dist/csr/Clock'
import { Download } from '@phosphor-icons/react/dist/csr/Download'
import { Share } from '@phosphor-icons/react/dist/csr/Share'
import { ChartContainer } from '@/components/ChartContainer'
import { DataTable } from '@/components/DataTable'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { toast } from 'sonner'
import { colors } from '@/lib/colors'
import { 
  loadReportContent, 
  ReportConfig,
  ChartConfig,
  TableConfig,
  ParsedCSVData
} from '@/lib/contentManager'
import { loadCSVDataFromMap, loadRawCSVFromMap, loadReportConfigFromMap } from '@/lib/dataLoader'

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
        const config = await loadReportConfigFromMap(reportId)
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
        <div className="text-body-medium text-muted-foreground p-8 text-center border-2 border-dashed border-border rounded-lg">
          <p className="font-medium">Chart data not available</p>
          <p className="text-sm mt-1">Missing data file: {chartConfig.dataFile}</p>
        </div>
      )
    }

    // Convert chart config to Plotly data with Aurora Borealis colors
    const auroraColors = [
      colors.chart.primary,    // Aurora green
      colors.chart.secondary,  // Aurora purple
      colors.chart.tertiary,   // Forest green
      colors.chart.quaternary, // Magenta aurora
      colors.chart.quinary,    // Aurora yellow
      colors.chart.senary      // Icy blue
    ]
    
    const plotlyData = (() => {
      switch (chartConfig.type) {
        case 'line':
          return [{
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[chartConfig.config.y!]),
            type: 'scatter',
            mode: 'lines+markers',
            name: chartConfig.config.y,
            line: { 
              shape: 'spline',
              color: auroraColors[0],
              width: 3
            },
            marker: {
              color: auroraColors[0],
              size: 6,
              line: {
                color: 'white',
                width: 1
              }
            }
          }]

        case 'multiline':
          return chartConfig.config.traces?.map((trace: any, index: number) => ({
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[trace.y]),
            type: 'scatter',
            mode: 'lines+markers',
            name: trace.name,
            line: {
              shape: 'spline',
              color: trace.line?.color || auroraColors[index % auroraColors.length],
              width: trace.line?.width || 3,
              dash: trace.line?.dash || 'solid'
            },
            marker: {
              color: trace.line?.color || auroraColors[index % auroraColors.length],
              size: 6,
              line: {
                color: 'white',
                width: 1
              }
            },
            hovertemplate: `<b>${trace.name}</b><br>` +
                          `<b>Periode:</b> %{x}<br>` +
                          `<b>Aantal:</b> %{y:,.0f}<br>` +
                          `<extra></extra>`,
            hoverlabel: {
              bgcolor: trace.line?.color || auroraColors[index % auroraColors.length],
              bordercolor: 'white',
              font: { color: 'white', size: 12 }
            }
          })) || []

        case 'trendlines':
          return chartConfig.config.traces?.map((trace: any, index: number) => {
            const isDashed = trace.line?.dash === 'dash'
            const traceConfig: any = {
              x: csvData.data.map(row => row[chartConfig.config.x!]),
              y: csvData.data.map(row => row[trace.y]),
              type: 'scatter',
              mode: isDashed ? 'lines+markers' : 'lines',
              name: trace.name,
              line: {
                shape: 'spline',
                color: trace.line?.color || auroraColors[index % auroraColors.length],
                width: trace.line?.width || 3,
                dash: trace.line?.dash || 'solid'
              },
              hovertemplate: `%{y:,.0f}<extra></extra>`,
              hoverlabel: {
                bgcolor: trace.line?.color || auroraColors[index % auroraColors.length],
                bordercolor: 'white',
                borderwidth: 1,
                font: { 
                  color: 'white', 
                  size: 12,
                  family: 'Inter, system-ui, sans-serif'
                }
              }
            }
            
            if (isDashed) {
              traceConfig.marker = {
                color: trace.line?.color || auroraColors[index % auroraColors.length],
                size: 6,
                line: {
                  color: 'white',
                  width: 1
                }
              }
            }
            
            return traceConfig
          }) || []
        
        case 'bar':
          return [{
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[chartConfig.config.y!]),
            type: 'bar',
            name: chartConfig.config.y,
            marker: {
              color: auroraColors[0],
              line: {
                color: 'transparent',
                width: 0
              }
            }
          }]
        
        case 'scatter':
          return [{
            x: csvData.data.map(row => row[chartConfig.config.x!]),
            y: csvData.data.map(row => row[chartConfig.config.y!]),
            type: 'scatter',
            mode: 'markers',
            name: chartConfig.title,
            marker: {
              color: auroraColors[0],
              size: 8,
              opacity: 0.8,
              line: {
                color: 'white',
                width: 1
              }
            },
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
            textposition: 'auto',
            marker: {
              colors: auroraColors,
              line: {
                color: 'white',
                width: 2
              }
            },
            textfont: {
              color: 'white',
              size: 12
            }
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
          ...chartConfig.config,
          // Remove title from layout since it's handled by ChartContainer
          title: undefined,
          // Improve hover behavior for multiline and trendlines charts
          ...((chartConfig.type === 'multiline' || chartConfig.type === 'trendlines') && {
            hovermode: chartConfig.type === 'trendlines' ? 'closest' : 'x unified',
            hoverdistance: 100,
            spikedistance: 100,
            xaxis: {
              ...chartConfig.config.xaxis,
              showspikes: true,
              spikecolor: '#999',
              spikethickness: 1,
              spikedash: 'solid'
            }
          })
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