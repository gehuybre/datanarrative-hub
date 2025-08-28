import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Plot from 'react-plotly.js'
import { loadReportConfigFromMap, loadCSVDataFromMap } from '@/lib/dataLoader'
import '@/lib/plotly-config'

export function EmbedChart() {
  const { reportId, chartId } = useParams<{ reportId: string; chartId: string }>()
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChart() {
      if (!reportId || !chartId) {
        console.error('Missing reportId or chartId:', { reportId, chartId })
        setError('Invalid chart URL')
        setIsLoading(false)
        return
      }

      console.log('Loading chart:', { reportId, chartId })

      try {
        // Load report configuration
        const reportConfig = await loadReportConfigFromMap(reportId)
        console.log('Report config loaded:', reportConfig)
        if (!reportConfig) {
          setError('Report not found')
          setIsLoading(false)
          return
        }

        // Find the chart configuration
        const chartConfig = reportConfig.charts.find((chart: any) => chart.id === chartId)
        console.log('Chart config found:', chartConfig)
        if (!chartConfig) {
          setError('Chart not found')
          setIsLoading(false)
          return
        }

        // Load CSV data
        const csvData = await loadCSVDataFromMap(reportId, chartConfig.dataFile)
        console.log('CSV data loaded:', csvData)
        if (!csvData) {
          setError('Chart data not found')
          setIsLoading(false)
          return
        }

        // Generate chart data based on chart configuration
        const plotlyData = generatePlotlyData(chartConfig, csvData)
        const layout = generateLayout(chartConfig, csvData)
        
        console.log('Generated plotly data:', plotlyData)
        console.log('Generated layout:', layout)

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

      case 'trendlines':
        return chartConfig.config.traces?.map((trace: any, index: number) => {
          const isDashed = trace.line?.dash === 'dash'
          const traceConfig: any = {
            x: csvData.data.map((row: any) => row[chartConfig.config.x!]),
            y: csvData.data.map((row: any) => row[trace.y]),
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

      case 'multiline':
        return chartConfig.config.traces?.map((trace: any, index: number) => {
          const isDashed = trace.line?.dash === 'dash'
          const traceConfig: any = {
            x: csvData.data.map((row: any) => row[chartConfig.config.x!]),
            y: csvData.data.map((row: any) => row[trace.y]),
            type: 'scatter',
            mode: 'lines+markers',
            name: trace.name,
            line: {
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
    const baseLayout: any = {
      title: {
        text: chartConfig.title,
        font: {
          size: 18,
          color: '#ffffff',
          family: 'Inter, system-ui, sans-serif'
        },
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        title: {
          text: chartConfig.config.xaxis?.title || chartConfig.config.xLabel || chartConfig.config.x,
          font: {
            color: '#ffffff',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        gridcolor: 'rgba(255, 255, 255, 0.2)',
        zerolinecolor: 'rgba(255, 255, 255, 0.3)',
        tickfont: {
          color: '#ffffff',
          family: 'Inter, system-ui, sans-serif'
        },
        linecolor: 'rgba(255, 255, 255, 0.3)',
        // Add support for additional xaxis configuration
        ...(chartConfig.config.xaxis?.type && { type: chartConfig.config.xaxis.type }),
        ...(chartConfig.config.xaxis?.tickangle && { tickangle: chartConfig.config.xaxis.tickangle }),
        ...(chartConfig.config.xaxis?.dtick && { dtick: chartConfig.config.xaxis.dtick })
      },
      yaxis: {
        title: {
          text: chartConfig.config.yaxis?.title || chartConfig.config.yLabel || chartConfig.config.y,
          font: {
            color: '#ffffff',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        gridcolor: 'rgba(255, 255, 255, 0.2)',
        zerolinecolor: 'rgba(255, 255, 255, 0.3)',
        tickfont: {
          color: '#ffffff',
          family: 'Inter, system-ui, sans-serif'
        },
        linecolor: 'rgba(255, 255, 255, 0.3)'
      },
      plot_bgcolor: '#0a0a0a',
      paper_bgcolor: '#0a0a0a',
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

    // Add hover behavior for multiline and trendlines charts
    if (chartConfig.type === 'multiline' || chartConfig.type === 'trendlines') {
      baseLayout.hovermode = chartConfig.type === 'trendlines' ? 'closest' : 'x unified'
    }

    return baseLayout
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading Chart</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="text-xs text-gray-400">
            <p>Report ID: {reportId}</p>
            <p>Chart ID: {chartId}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-300 mb-4">No chart data generated</p>
          <div className="text-xs text-gray-400 bg-gray-800 p-4 rounded">
            <p><strong>Report ID:</strong> {reportId}</p>
            <p><strong>Chart ID:</strong> {chartId}</p>
            <p><strong>Loading:</strong> {isLoading.toString()}</p>
            <p><strong>Error:</strong> {error || 'none'}</p>
            <p><strong>Debug:</strong> Check if config and data loaded properly</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
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
