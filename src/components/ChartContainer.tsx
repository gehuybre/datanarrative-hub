import React, { useCallback, useRef, useState } from 'react'
import Plot from 'react-plotly.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Download, Share, Code, Copy, ExternalLink } from '@phosphor-icons/react'
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
  reportId?: string
  chartId?: string
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
  className = '',
  reportId,
  chartId
}: ChartContainerProps) {
  const plotRef = useRef<any>(null)
  const { preferences } = useUserPreferences()
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  
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

  // Generate embed code
  const embedCode = reportId && chartId 
    ? `<iframe 
  src="${window.location.origin}/embed/chart/${reportId}/${chartId}" 
  width="100%" 
  height="500" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</iframe>`
    : `<iframe 
  src="${window.location.origin}/embed/chart/${encodeURIComponent(title)}" 
  width="100%" 
  height="500" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</iframe>`

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
  }, [title, preferences.exportFormat])

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

  const handleCopyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      toast.success('Embed code copied to clipboard')
      setShowEmbedDialog(false)
    } catch (error) {
      toast.error('Failed to copy embed code')
    }
  }, [embedCode])

  const handleViewStandalone = useCallback(() => {
    const url = reportId && chartId 
      ? `/embed/chart/${reportId}/${chartId}`
      : `/embed/chart/${encodeURIComponent(title)}`
    window.open(url, '_blank')
  }, [reportId, chartId, title])

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
          
          <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-label-medium"
              >
                <Share className="w-4 h-4 mr-2" />
                Embed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Embed Chart</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-label-medium font-medium">Embed Code:</label>
                  <Textarea
                    value={embedCode}
                    readOnly
                    rows={8}
                    className="text-body-small font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleCopyEmbed} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Embed Code
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleViewStandalone}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Standalone
                  </Button>
                </div>
                <div className="text-body-small text-muted-foreground">
                  This embed code will display the chart with full interactivity and matching theme. 
                  The chart is responsive and includes download functionality.
                </div>
              </div>
            </DialogContent>
          </Dialog>
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