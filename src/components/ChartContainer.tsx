import React, { useCallback, useRef, useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Download, Share, Code, Copy, ExternalLink } from '@phosphor-icons/react'
import { applyLayout, applyTraceDefaults, ChartType, registerAuroraBorealisTemplate } from '@/lib/plotly-config'
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
  
  // Register Aurora Borealis template on mount
  useEffect(() => {
    // Wait a bit for Plotly to be fully loaded, then register template
    const timer = setTimeout(() => {
      registerAuroraBorealisTemplate()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Calculate final layout with applied config
  const finalLayout = applyLayout(chartType, layout, overrides)
  
  // Apply trace defaults to data
  const finalData = applyTraceDefaults(data, chartType)
  
  // Generate embed code
  const embedCode = `<iframe src="${window.location.origin}/embed/chart/${reportId}/${chartId}" width="800" height="600" frameborder="0"></iframe>`

  const handleDownloadImage = useCallback(() => {
    if (plotRef.current && window.Plotly) {
      const element = plotRef.current.el
      const gd = element
      
      const format = preferences.chartExportFormat || 'png'
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chart.${format}`
      
      // Use Plotly's built-in download functionality
      const config_download = {
        format: format,
        filename: filename,
        width: preferences.chartExportWidth || 1200,
        height: preferences.chartExportHeight || 800,
        scale: 2
      }
      
      window.Plotly.downloadImage(gd, config_download)
        .then(() => {
          toast.success(`Chart exported as ${format.toUpperCase()}`)
        })
        .catch((error: any) => {
          console.error('Export failed:', error)
          toast.error('Failed to export chart')
        })
    } else {
      toast.error('Chart export not available')
    }
  }, [title, preferences])

  const handleDownloadCSV = useCallback(() => {
    if (!csvData || !csvFilename) {
      toast.error('No data available for download')
      return
    }
    
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = csvFilename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success(`Data exported: ${csvFilename}`)
  }, [csvData, csvFilename])

  const handleCopyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast.success('Embed code copied to clipboard')
      })
      .catch(() => {
        toast.error('Failed to copy embed code')
      })
  }, [embedCode])

  return (
    <Card className={`chart-container ${className}`}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-title-large">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadImage}
            className="quick-action-btn"
            title="Export chart as image"
          >
            <Download className="w-4 h-4" />
            <span className="ml-1">PNG</span>
          </Button>
          
          {csvData && csvFilename && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadCSV}
              className="quick-action-btn"
              title="Download data as CSV"
            >
              <Download className="w-4 h-4" />
              <span className="ml-1">CSV</span>
            </Button>
          )}
          
          <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="quick-action-btn"
                title="Get embed code"
              >
                <Share className="w-4 h-4" />
                <span className="ml-1">Embed</span>
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
                    className="font-mono text-body-small"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCopyEmbed}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/embed/chart/${reportId}/${chartId}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <Plot
          ref={plotRef}
          data={finalData}
          layout={finalLayout}
          config={{
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
            modeBarButtonsToAdd: [
              {
                name: 'Download PNG',
                icon: {
                  width: 857.1,
                  height: 1000,
                  path: 'm214 629c0 36 11 65 32 86 22 22 51 32 87 32h142c36 0 65-11 86-32 22-22 32-51 32-87v-171h-379v172z m-71-143h521v-107c0-36-11-65-32-86-22-22-51-32-87-32h-283c-36 0-65 11-86 32-22 22-32 51-32 87v106z',
                  transform: 'matrix(1 0 0 -1 0 850)'
                },
                click: function(gd: any) {
                  if (window.Plotly) {
                    window.Plotly.downloadImage(gd, {
                      format: 'png',
                      width: 1200,
                      height: 800,
                      filename: 'chart'
                    })
                  }
                }
              }
            ],
            responsive: true,
            toImageButtonOptions: {
              format: 'png',
              filename: title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_chart',
              height: 800,
              width: 1200,
              scale: 2
            },
            ...config
          }}
          className="w-full h-full"
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      </CardContent>
    </Card>
  )
}