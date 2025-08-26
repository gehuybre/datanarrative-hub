import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { X, Filter, ChevronDown, ChevronUp, RotateCcw } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export interface GlobalFilterConfig {
  key: string
  label: string
  type: 'categorical' | 'numerical' | 'text' | 'date'
  column: string
  values?: string[]
  range?: [number, number]
  description?: string
}

export interface GlobalFilterState {
  [key: string]: {
    type: 'categorical' | 'numerical' | 'text' | 'date'
    value: any
    active: boolean
  }
}

interface GlobalFilterPanelProps {
  filterConfigs: GlobalFilterConfig[]
  onFilterChange: (filters: GlobalFilterState) => void
  allData: Record<string, any[]> // All available data by source
  className?: string
}

export function GlobalFilterPanel({
  filterConfigs,
  onFilterChange,
  allData,
  className = ''
}: GlobalFilterPanelProps) {
  const [filters, setFilters] = useState<GlobalFilterState>({})
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Initialize filters from config
  useEffect(() => {
    const initialFilters: GlobalFilterState = {}
    filterConfigs.forEach(config => {
      // Calculate range for numerical filters from all data
      let range = config.range
      let values = config.values
      
      if (config.type === 'numerical' && !range) {
        const allValues = Object.values(allData).flat()
          .map(row => parseFloat(row[config.column]))
          .filter(val => !isNaN(val))
        
        if (allValues.length > 0) {
          range = [Math.min(...allValues), Math.max(...allValues)]
        }
      }
      
      if (config.type === 'categorical' && !values) {
        const allValues = Object.values(allData).flat()
          .map(row => row[config.column])
          .filter(val => val != null && val !== '')
        
        values = [...new Set(allValues)].sort()
      }

      initialFilters[config.key] = {
        type: config.type,
        value: config.type === 'categorical' ? [] : 
              config.type === 'numerical' ? range || [0, 100] :
              config.type === 'date' ? [new Date(), new Date()] :
              '',
        active: false
      }
    })
    setFilters(initialFilters)
  }, [filterConfigs, allData])

  // Update active filters count and notify parent
  useEffect(() => {
    const activeCount = Object.values(filters).filter(f => f.active).length
    setActiveFiltersCount(activeCount)
    onFilterChange(filters)
  }, [filters, onFilterChange])

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any, active: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
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

  // Get unique values for categorical filters
  const getUniqueValues = useCallback((column: string) => {
    const allValues = Object.values(allData).flat()
      .map(row => row[column])
      .filter(val => val != null && val !== '')
    return [...new Set(allValues)].sort()
  }, [allData])

  // Get numerical range for numerical filters
  const getNumericalRange = useCallback((column: string): [number, number] => {
    const allValues = Object.values(allData).flat()
      .map(row => parseFloat(row[column]))
      .filter(val => !isNaN(val))
    
    if (allValues.length === 0) return [0, 100]
    return [Math.min(...allValues), Math.max(...allValues)]
  }, [allData])

  const renderFilter = (config: GlobalFilterConfig) => {
    const filter = filters[config.key]
    if (!filter) return null

    switch (config.type) {
      case 'categorical':
        const uniqueValues = getUniqueValues(config.column)
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filter.active}
                onCheckedChange={(checked) => 
                  handleFilterChange(config.key, filter.value, !!checked)
                }
              />
              <div className="flex-1">
                <label className="text-label-medium font-medium">
                  {config.label}
                </label>
                {config.description && (
                  <p className="text-body-small text-muted-foreground">
                    {config.description}
                  </p>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {filter.active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pl-6">
                    <Select
                      value={filter.value.join(',')}
                      onValueChange={(value) => {
                        const values = value ? value.split(',') : []
                        handleFilterChange(config.key, values, true)
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
                    
                    {/* Quick select buttons */}
                    <div className="flex flex-wrap gap-1">
                      {uniqueValues.slice(0, 6).map((value) => (
                        <Button
                          key={value}
                          variant={filter.value.includes(value) ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            const newValues = filter.value.includes(value)
                              ? filter.value.filter((v: string) => v !== value)
                              : [...filter.value, value]
                            handleFilterChange(config.key, newValues, true)
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )

      case 'numerical':
        const range = getNumericalRange(config.column)
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filter.active}
                onCheckedChange={(checked) => 
                  handleFilterChange(config.key, filter.value, !!checked)
                }
              />
              <div className="flex-1">
                <label className="text-label-medium font-medium">
                  {config.label}
                </label>
                {config.description && (
                  <p className="text-body-small text-muted-foreground">
                    {config.description}
                  </p>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {filter.active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                      <span>{filter.value[0].toLocaleString()}</span>
                      <span>to</span>
                      <span>{filter.value[1].toLocaleString()}</span>
                    </div>
                    <Slider
                      value={filter.value}
                      onValueChange={(value) => 
                        handleFilterChange(config.key, value, true)
                      }
                      min={range[0]}
                      max={range[1]}
                      step={(range[1] - range[0]) / 100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{range[0].toLocaleString()}</span>
                      <span>{range[1].toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filter.active}
                onCheckedChange={(checked) => 
                  handleFilterChange(config.key, filter.value, !!checked)
                }
              />
              <div className="flex-1">
                <label className="text-label-medium font-medium">
                  {config.label}
                </label>
                {config.description && (
                  <p className="text-body-small text-muted-foreground">
                    {config.description}
                  </p>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {filter.active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6">
                    <Input
                      value={filter.value}
                      onChange={(e) => 
                        handleFilterChange(config.key, e.target.value, true)
                      }
                      placeholder={`Search ${config.label.toLowerCase()}...`}
                      className="text-body-small"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-title-medium flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Global Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="text-label-small">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-body-small"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-6">
              {filterConfigs.map((config, index) => (
                <div key={config.key}>
                  {renderFilter(config)}
                  {index < filterConfigs.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
              
              {filterConfigs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-body-medium">No filters configured</p>
                  <p className="text-body-small">
                    Filters will appear here when enabled for this report
                  </p>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}