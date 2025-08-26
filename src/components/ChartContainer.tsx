import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Share, Code, Copy, ExternalLink, Funnel, X, Rewind, Zap } from '@phosphor-icons/react'
import { applyLayout, ChartType } from '@/lib/plotly-config'
import { charts as chartConfig } from '@/lib/config'
import { useUserPreferences } from '@/hooks/use-preferences'
import { toast } from 'sonner'

// Filter types for different chart interactions
export interface FilterConfig {
  column: string
  type: 'categorical' | 'numerical' | 'date' | 'text'
  label: string
  values?: string[]
  range?: [number, number]
  dateRange?: [Date, Date]
}

export interface DrillDownConfig {
  enabled: boolean
  targetColumn: string
  groupByColumn?: string
  aggregationType?: 'sum' | 'mean' | 'count' | 'max' | 'min'
}

export interface FilterState {
  [key: string]: {
    type: 'categorical' | 'numerical' | 'date' | 'text'
    value: any
    active: boolean
  }
}

export interface DrillDownState {
  level: number
  history: Array<{
    filter: { column: string; value: any }
    data: any[]
    title: string
  }>
  currentFilter?: { column: string; value: any }
}

interface ChartContainerProps {
  data: any[]
  rawData?: any[] // Original unfiltered data for filtering
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
  // New interactive features
  enableFiltering?: boolean
  enableDrillDown?: boolean
  filterConfigs?: FilterConfig[]
  drillDownConfig?: DrillDownConfig
  onFilterChange?: (filters: FilterState) => void
  onDrillDown?: (level: number, filter: any) => void
}

export function ChartContainer({
  data,
  rawData,
  layout = {},
  config = {},
  title,
  chartType,
  overrides = {},
  csvData,
  csvFilename,
  className = '',
  reportId,
  chartId,
  enableFiltering = false,
  enableDrillDown = false,
  filterConfigs = [],
  drillDownConfig,
  onFilterChange,
  onDrillDown
}: ChartContainerProps) {
  const plotRef = useRef<any>(null)
  const { preferences } = useUserPreferences()
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Filter and drill-down state
  const [filters, setFilters] = useState<FilterState>({})
  const [drillDownState, setDrillDownState] = useState<DrillDownState>({
    level: 0,
    history: []
  })
  const [filteredData, setFilteredData] = useState(data)
  const [filteredRawData, setFilteredRawData] = useState(rawData || [])
  const [currentTitle, setCurrentTitle] = useState(title)
  // Initialize filters from config
  useEffect(() => {
    if (filterConfigs.length > 0) {
      const initialFilters: FilterState = {}
      filterConfigs.forEach(config => {
        initialFilters[config.column] = {
          type: config.type,
          value: config.type === 'categorical' ? [] : 
                config.type === 'numerical' ? config.range || [0, 100] :
                config.type === 'date' ? config.dateRange || [new Date(), new Date()] :
                '',
          active: false
        }
      })
      setFilters(initialFilters)
    }
  }, [filterConfigs])

  // Apply filters to data
  const applyFilters = useCallback((sourceData: any[], filterState: FilterState) => {
    let filtered = [...sourceData]
    
    Object.entries(filterState).forEach(([column, filter]) => {
      if (!filter.active) return
      
      switch (filter.type) {
        case 'categorical':
          if (filter.value.length > 0) {
            filtered = filtered.filter(item => 
              filter.value.includes(item[column])
            )
          }
          break
        case 'numerical':
          const [min, max] = filter.value
          filtered = filtered.filter(item => {
            const val = parseFloat(item[column])
            return val >= min && val <= max
          })
          break
        case 'text':
          if (filter.value.trim()) {
            filtered = filtered.filter(item => 
              String(item[column]).toLowerCase().includes(filter.value.toLowerCase())
            )
          }
          break
        case 'date':
          const [startDate, endDate] = filter.value
          filtered = filtered.filter(item => {
            const date = new Date(item[column])
            return date >= startDate && date <= endDate
          })
          break
      }
    })
    
    return filtered
  }, [])

  // Update filtered data when filters or rawData change
  useEffect(() => {
    const sourceData = rawData || []
    const filtered = applyFilters(sourceData, filters)
    setFilteredRawData(filtered)
    
    // Keep original plotly data structure unchanged for now
    // Individual chart filtering will be handled by the parent component
    setFilteredData(data)
    
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }, [filters, rawData, data, applyFilters, onFilterChange])

  // Handle filter changes
  const handleFilterChange = useCallback((column: string, value: any, active: boolean) => {
    setFilters(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        value,
        active
      }
    }))
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(prev => {
      const reset = { ...prev }
      Object.keys(reset).forEach(key => {
        reset[key].active = false
      })
      return reset
    })
  }, [])

  // Handle drill-down click events
  const handlePlotClick = useCallback((eventData: any) => {
    if (!enableDrillDown || !drillDownConfig) return
    
    const point = eventData.points[0]
    if (!point) return

    const drillDownValue = point.x || point.label
    const newFilter = {
      column: drillDownConfig.targetColumn,
      value: drillDownValue
    }

    // Create filtered data for drill-down
    const sourceData = rawData || []
    const drillDownData = sourceData.filter(item => 
      item[drillDownConfig.targetColumn] === drillDownValue
    )

    // Update drill-down state
    setDrillDownState(prev => ({
      level: prev.level + 1,
      history: [
        ...prev.history,
        {
          filter: newFilter,
          data: filteredData,
          title: currentTitle
        }
      ],
      currentFilter: newFilter
    }))

    // Update chart data and title
    setFilteredRawData(drillDownData)
    setCurrentTitle(`${title} - ${drillDownValue}`)

    if (onDrillDown) {
      onDrillDown(drillDownState.level + 1, newFilter)
    }

    toast.success(`Drilled down to: ${drillDownValue}`)
  }, [enableDrillDown, drillDownConfig, rawData, data, filteredData, currentTitle, title, drillDownState.level, onDrillDown])

  // Handle drill-up (go back)
  const handleDrillUp = useCallback(() => {
    if (drillDownState.history.length === 0) return

    const lastState = drillDownState.history[drillDownState.history.length - 1]
    
    setDrillDownState(prev => ({
      level: Math.max(0, prev.level - 1),
      history: prev.history.slice(0, -1),
      currentFilter: prev.history.length > 1 ? prev.history[prev.history.length - 2].filter : undefined
    }))

    setFilteredData(lastState.data)
    setFilteredRawData(rawData || [])
    setCurrentTitle(lastState.title)
  }, [drillDownState])

  // Reset drill-down to top level
  const resetDrillDown = useCallback(() => {
    setDrillDownState({
      level: 0,
      history: [],
      currentFilter: undefined
    })
    setFilteredData(rawData || data)
    setFilteredRawData(rawData || [])
    setCurrentTitle(title)
  }, [rawData, data, title])

  // Get unique values for categorical filters
  const getUniqueValues = useCallback((column: string) => {
    const sourceData = rawData || []
    const values = sourceData.map(item => item[column]).filter(val => val != null)
    return [...new Set(values)].sort()
  }, [rawData])

  // Get numerical range for numerical filters
  const getNumericalRange = useCallback((column: string): [number, number] => {
    const sourceData = rawData || []
    const values = sourceData.map(item => parseFloat(item[column])).filter(val => !isNaN(val))
    return [Math.min(...values), Math.max(...values)]
  }, [rawData])
  // Apply the configured layout
  const figure = { data: filteredData, layout }
  const configuredFigure = applyLayout(figure, chartType, overrides)
  
  // Default Plotly config using app configuration
  const plotlyConfig = {
    ...chartConfig.plotly,
    toImageButtonOptions: {
      format: preferences.exportFormat,
      filename: `${currentTitle.toLowerCase().replace(/\s+/g, '-')}-chart`,
      height: chartConfig.dimensions.height,
      width: chartConfig.dimensions.width,
      scale: chartConfig.export.imageScale
    },
    ...config
  }

  // Add click handler for drill-down
  if (enableDrillDown) {
    plotlyConfig.onClick = handlePlotClick
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
      const filename = `${currentTitle.toLowerCase().replace(/\s+/g, '-')}-chart.png`
      
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
  }, [currentTitle, preferences.exportFormat])

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
      link.download = csvFilename || `${currentTitle.toLowerCase().replace(/\s+/g, '-')}-data.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('CSV data downloaded successfully')
    } catch (error) {
      toast.error('Failed to download CSV data')
      console.error('CSV download error:', error)
    }
  }, [csvData, csvFilename, currentTitle])

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
      : `/embed/chart/${encodeURIComponent(currentTitle)}`
    window.open(url, '_blank')
  }, [reportId, chartId, currentTitle])

  // Render filter controls
  const renderFilterControls = () => {
    if (!enableFiltering || filterConfigs.length === 0) return null

    return (
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-title-small font-medium">Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-body-small"
          >
            Reset All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filterConfigs.map((config) => {
            const filter = filters[config.column]
            if (!filter) return null

            switch (config.type) {
              case 'categorical':
                const uniqueValues = getUniqueValues(config.column)
                return (
                  <div key={config.column} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filter.active}
                        onCheckedChange={(checked) => 
                          handleFilterChange(config.column, filter.value, !!checked)
                        }
                      />
                      <label className="text-label-medium font-medium">
                        {config.label}
                      </label>
                    </div>
                    {filter.active && (
                      <Select
                        value={filter.value.join(',')}
                        onValueChange={(value) => {
                          const values = value ? value.split(',') : []
                          handleFilterChange(config.column, values, true)
                        }}
                      >
                        <SelectTrigger className="text-body-small">
                          <SelectValue placeholder="Select values..." />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueValues.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )

              case 'numerical':
                const range = getNumericalRange(config.column)
                return (
                  <div key={config.column} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filter.active}
                        onCheckedChange={(checked) => 
                          handleFilterChange(config.column, filter.value, !!checked)
                        }
                      />
                      <label className="text-label-medium font-medium">
                        {config.label}
                      </label>
                    </div>
                    {filter.active && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                          <span>{filter.value[0]}</span>
                          <span>to</span>
                          <span>{filter.value[1]}</span>
                        </div>
                        <Slider
                          value={filter.value}
                          onValueChange={(value) => 
                            handleFilterChange(config.column, value, true)
                          }
                          min={range[0]}
                          max={range[1]}
                          step={(range[1] - range[0]) / 100}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )

              case 'text':
                return (
                  <div key={config.column} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filter.active}
                        onCheckedChange={(checked) => 
                          handleFilterChange(config.column, filter.value, !!checked)
                        }
                      />
                      <label className="text-label-medium font-medium">
                        {config.label}
                      </label>
                    </div>
                    {filter.active && (
                      <Input
                        value={filter.value}
                        onChange={(e) => 
                          handleFilterChange(config.column, e.target.value, true)
                        }
                        placeholder={`Search ${config.label.toLowerCase()}...`}
                        className="text-body-small"
                      />
                    )}
                  </div>
                )

              default:
                return null
            }
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className={`chart-container ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-title-large">{currentTitle}</CardTitle>
          
          {/* Drill-down indicators */}
          {drillDownState.level > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-label-small">
                Level {drillDownState.level}
              </Badge>
              {drillDownState.currentFilter && (
                <Badge variant="outline" className="text-label-small">
                  {drillDownState.currentFilter.column}: {drillDownState.currentFilter.value}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Drill-down controls */}
          {enableDrillDown && (
            <>
              {drillDownState.level > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDrillUp}
                  className="text-label-medium"
                >
                  <Rewind className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {drillDownState.history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDrillDown}
                  className="text-label-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </>
          )}
          
          {/* Filter toggle */}
          {enableFiltering && filterConfigs.length > 0 && (
            <Button
              variant={showFilterPanel ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="text-label-medium"
            >
              <Funnel className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}

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
      
      {/* Filter panel */}
      {showFilterPanel && renderFilterControls()}
      
      <CardContent>
        {/* Interactive hints */}
        {(enableDrillDown || enableFiltering) && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 text-body-small text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>
                {enableDrillDown && enableFiltering 
                  ? 'Click chart elements to drill down • Use filters to refine data'
                  : enableDrillDown
                  ? 'Click chart elements to drill down for detailed view'
                  : 'Use filters above to refine the data view'
                }
              </span>
            </div>
          </div>
        )}
        
        <Plot
          ref={plotRef}
          data={configuredFigure.data}
          layout={configuredFigure.layout}
          config={plotlyConfig}
          style={{ width: '100%', height: '400px' }}
          useResizeHandler={true}
          onClick={enableDrillDown ? handlePlotClick : undefined}
        />
        
        {/* Data summary */}
        {(enableFiltering || enableDrillDown) && (
          <div className="mt-4 pt-3 border-t text-body-small text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Showing {filteredRawData.length} of {(rawData || []).length} data points
              </span>
              {drillDownState.level > 0 && (
                <span>
                  Drill-down level: {drillDownState.level}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}