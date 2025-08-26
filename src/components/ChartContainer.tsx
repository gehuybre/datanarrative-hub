import React, { useCallback, useRef } from 'react'
import Plot from 'react-plotly.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Share, Code } from '@phosphor-icons/react'
import { applyLayout, ChartType } from '@/lib/plotly-config'
import { charts as chartConfig } from '@/lib/config'
import { useUserPreferences } from '@/hooks/use-preferences'
import { toast } from 'sonner'

interface ChartContainerProps {
  data: any[]
  layout?: any
  config?: any
  title: string
  chartType: ChartType
  overrides?: any
  csvData?: string
  csvFilename?: string
  className?: string
}

export function ChartContainer({
  data,
  layout = {},
  config = {},
  title,
  chartType,
  overrides = {},
  csvData,
  csvFilename,
  className = ''
}: ChartContainerProps) {
  const plotRef = useRef<any>(null)
  const { preferences } = useUserPreferences()
  
  // Apply the configured layout
  const figure = { data, layout }
  const configuredFigure = applyLayout(figure, chartType, overrides)
  
  // Default Plotly config using app configuration
  const plotlyConfig = {
    ...chartConfig.plotly,
    toImageButtonOptions: {
      format: preferences.exportFormat,
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}-chart`,
      height: chartConfig.dimensions.height,
      width: chartConfig.dimensions.width,
      scale: chartConfig.export.imageScale
    },
    ...config
  }

  const downloadImage = useCallback(async () => {
    if (!plotRef.current) return
    
    try {
      // Use Plotly's built-in download functionality
      const gd = plotRef.current.el
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`
      
      // Create download using Plotly's toImage
      const img = await (window as any).Plotly.toImage(gd, {
        format: preferences.exportFormat,
        width: chartConfig.dimensions.width,
        height: chartConfig.dimensions.height,
        scale: chartConfig.export.imageScale
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = filename
      link.href = img
      link.click()
      
      toast.success('Chart image downloaded successfully')
    } catch (error) {
      toast.error('Failed to download chart image')
      console.error('Download error:', error)
    }
  }, [title])

  const downloadCSV = useCallback(() => {
    if (!csvData) {
      toast.error('No CSV data available')
      return
    }
    
    try {
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = csvFilename || `${title.toLowerCase().replace(/\s+/g, '-')}-data.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('CSV data downloaded successfully')
    } catch (error) {
      toast.error('Failed to download CSV data')
      console.error('CSV download error:', error)
    }
  }, [csvData, csvFilename, title])

  const copyEmbedCode = useCallback(() => {
    const embedCode = `<iframe 
  src="${window.location.origin}/embed/chart/${encodeURIComponent(title)}" 
  width="800" 
  height="600" 
  frameborder="0" 
  style="border: none;">
</iframe>`
    
    navigator.clipboard.writeText(embedCode).then(() => {
      toast.success('Embed code copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy embed code')
    })
  }, [title])

  return (
    <Card className={`chart-container ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-title-large">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {csvData && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              className="text-label-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            className="text-label-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyEmbedCode}
            className="text-label-medium"
          >
            <Code className="w-4 h-4 mr-2" />
            Embed
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Plot
          ref={plotRef}
          data={configuredFigure.data}
          layout={configuredFigure.layout}
          config={plotlyConfig}
          style={{ width: '100%', height: '400px' }}
          useResizeHandler={true}
        />
      </CardContent>
    </Card>
  )
}