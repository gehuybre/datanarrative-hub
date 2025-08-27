import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Plot from 'react-plotly.js'
import { loadReportConfig } from '@/lib/contentManager'
import { loadCSVDataFromMap } from '@/lib/dataLoader'
import '@/lib/plotly-config'

export function EmbedChart() {
  const { reportId, chartId } = useParams<{ reportId: string; chartId: string }>()
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChart() {
      if (!reportId || !chartId) {
        setError('Invalid chart URL')
        setIsLoading(false)
        return
      }

      try {
        // Load report configuration
        const reportConfig = await loadReportConfig(reportId)
        if (!reportConfig) {
          setError('Report not found')
          setIsLoading(false)
          return
        }

        // Find the chart configuration
        const chartConfig = reportConfig.charts.find(chart => chart.id === chartId)
        if (!chartConfig) {
          setError('Chart not found')
          setIsLoading(false)
          return
        }

        // Load CSV data
        const csvData = await loadCSVDataFromMap(reportId, chartConfig.dataFile)
        if (!csvData) {
          setError('Chart data not found')
          setIsLoading(false)
          return
        }

        // Generate chart data based on chart configuration
        const plotlyData = generatePlotlyData(chartConfig, csvData)
        const layout = generateLayout(chartConfig, csvData)

        setChartData({
          data: plotlyData,
          layout: layout,
          config: {
            displayModeBar: false,
            responsive: true,
            displaylogo: false
          }
        })
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading chart:', err)
        setError('Failed to load chart')
        setIsLoading(false)
      }
    }

    loadChart()
  }, [reportId, chartId])

  // Helper function to generate Plotly data
  function generatePlotlyData(chartConfig: any, csvData: any) {
    const auroraColors = [
      '#4ade80', '#a855f7', '#22c55e', '#c084fc', '#16a34a', '#9333ea'
    ]

    switch (chartConfig.type) {
      case 'line':
        return chartConfig.traces?.map((trace: any, index: number) => ({
          x: csvData.data.map((row: any) => row[chartConfig.config.x!]),
          y: csvData.data.map((row: any) => row[trace.column]),
          type: 'scatter',
          mode: 'lines+markers',
          name: trace.name,
          line: {
            color: trace.color || auroraColors[index % auroraColors.length],
            width: 3,
            dash: trace.dash || 'solid'
          },
          marker: {
            color: trace.color || auroraColors[index % auroraColors.length],
            size: 6
          }
        })) || []

      case 'bar':
        return [{
          x: csvData.data.map((row: any) => row[chartConfig.config.x!]),
          y: csvData.data.map((row: any) => row[chartConfig.config.y!]),
          type: 'bar',
          marker: {
            color: auroraColors[0],
            line: {
              color: 'white',
              width: 1
            }
          }
        }]

      case 'scatter':
        return [{
          x: csvData.data.map((row: any) => row[chartConfig.config.x!]),
          y: csvData.data.map((row: any) => row[chartConfig.config.y!]),
          text: chartConfig.config.text ? csvData.data.map((row: any) => row[chartConfig.config.text!]) : undefined,
          type: 'scatter',
          mode: 'markers',
          marker: {
            color: auroraColors[0],
            size: 8,
            line: {
              color: 'white',
              width: 1
            }
          }
        }]

      case 'pie':
        return [{
          labels: csvData.data.map((row: any) => row[chartConfig.config.labels!]),
          values: csvData.data.map((row: any) => row[chartConfig.config.values!]),
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
  }

  // Helper function to generate layout
  function generateLayout(chartConfig: any, csvData: any) {
    return {
      title: {
        text: chartConfig.title,
        font: {
          size: 18,
          color: 'white',
          family: 'Inter, system-ui, sans-serif'
        },
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        title: {
          text: chartConfig.config.xLabel || chartConfig.config.x,
          font: {
            color: 'white',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        tickfont: {
          color: 'white',
          family: 'Inter, system-ui, sans-serif'
        }
      },
      yaxis: {
        title: {
          text: chartConfig.config.yLabel || chartConfig.config.y,
          font: {
            color: 'white',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        tickfont: {
          color: 'white',
          family: 'Inter, system-ui, sans-serif'
        }
      },
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      font: {
        color: 'white',
        family: 'Inter, system-ui, sans-serif'
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      },
      template: 'aurora_borealis',
      colorway: [
        '#4ade80', '#a855f7', '#22c55e', '#c084fc', '#16a34a', '#9333ea'
      ]
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium mb-2">Error</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-card p-4">
      <div className="w-full h-full">
        <Plot
          data={chartData.data}
          layout={{
            ...chartData.layout,
            autosize: true,
            width: undefined,
            height: undefined
          }}
          config={chartData.config}
          style={{ width: '100%', height: '100vh' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  )
}
