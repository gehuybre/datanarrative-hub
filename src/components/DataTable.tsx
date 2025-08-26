import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Share, Copy, ExternalLink, Funnel, X, ArrowUpDown, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ParsedCSVData } from '@/lib/contentManager'

type SortDirection = 'asc' | 'desc' | null

interface ColumnFilter {
  column: string
  value: string
  active: boolean
}

interface DataTableProps {
  title: string
  data: ParsedCSVData
  csvData: string
  csvFilename: string
  columns?: string[]
  columnTitles?: string[]
  className?: string
  reportId?: string
  tableId?: string
  enableFiltering?: boolean
  enableSorting?: boolean
  pageSize?: number
}

export function DataTable({ 
  title, 
  data, 
  csvData, 
  csvFilename, 
  columns,
  columnTitles,
  className,
  reportId,
  tableId,
  enableFiltering = true,
  enableSorting = true,
  pageSize = 50
}: DataTableProps) {
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState<ColumnFilter[]>([])
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Use specified columns or all available columns
  const displayColumns = columns || data.headers
  const displayColumnTitles = columnTitles || displayColumns

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data.data]
    
    // Apply filters
    filters.forEach(filter => {
      if (filter.active && filter.value.trim()) {
        filtered = filtered.filter(row => 
          String(row[filter.column] || '').toLowerCase().includes(filter.value.toLowerCase())
        )
      }
    })
    
    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        // Try to parse as numbers first
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
        }
        
        // Fall back to string comparison
        const aStr = String(aVal || '').toLowerCase()
        const bStr = String(bVal || '').toLowerCase()
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    }
    
    return filtered
  }, [data.data, filters, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = processedData.slice(startIndex, endIndex)

  // Handle column header click for sorting
  const handleHeaderClick = useCallback((column: string) => {
    if (!enableSorting) return
    
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn, sortDirection, enableSorting])

  // Handle filter changes
  const handleFilterChange = useCallback((column: string, value: string, active: boolean) => {
    setFilters(prev => {
      const existing = prev.find(f => f.column === column)
      if (existing) {
        return prev.map(f => 
          f.column === column ? { ...f, value, active } : f
        )
      } else {
        return [...prev, { column, value, active }]
      }
    })
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters([])
    setCurrentPage(1)
  }, [])

  // Get unique values for a column (for filter suggestions)
  const getUniqueValues = useCallback((column: string) => {
    const values = data.data.map(row => row[column]).filter(val => val != null && val !== '')
    return [...new Set(values)].sort().slice(0, 10) // Limit to 10 suggestions
  }, [data.data])
  
  // Generate embed code
  const embedCode = `<iframe 
  src="${window.location.origin}/embed/table/${reportId}/${tableId}" 
  width="100%" 
  height="400" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</iframe>`

  const handleDownload = () => {
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = csvFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${csvFilename}`)
  }

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      toast.success('Embed code copied to clipboard')
      setShowEmbedDialog(false)
    } catch (error) {
      toast.error('Failed to copy embed code')
    }
  }

  const handleViewStandalone = () => {
    const url = `/embed/table/${reportId}/${tableId}`
    window.open(url, '_blank')
  }

  // Render filter controls
  const renderFilterControls = () => {
    if (!enableFiltering) return null

    return (
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-title-small font-medium">Column Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-body-small"
          >
            Reset All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayColumns.map((column) => {
            const filter = filters.find(f => f.column === column)
            const uniqueValues = getUniqueValues(column)
            
            return (
              <div key={column} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filter?.active || false}
                    onCheckedChange={(checked) => 
                      handleFilterChange(column, filter?.value || '', !!checked)
                    }
                  />
                  <label className="text-label-medium font-medium">
                    {displayColumnTitles[displayColumns.indexOf(column)] || column}
                  </label>
                </div>
                {filter?.active && (
                  <div className="space-y-2">
                    <Input
                      value={filter.value}
                      onChange={(e) => 
                        handleFilterChange(column, e.target.value, true)
                      }
                      placeholder={`Filter ${column}...`}
                      className="text-body-small"
                    />
                    {uniqueValues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {uniqueValues.slice(0, 5).map((value) => (
                          <Button
                            key={value}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFilterChange(column, String(value), true)}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {String(value)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className={`chart-container ${className || ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-title-large">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            {enableFiltering && (
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-label-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
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
                  <DialogTitle>Embed Table</DialogTitle>
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
                    This embed code will display the table with full interactivity and filtering. 
                    The table is responsive and includes download functionality.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-label-small">
            {processedData.length} of {data.data.length} rows
          </Badge>
          <Badge variant="secondary" className="text-label-small">
            {displayColumns.length} columns
          </Badge>
          {filters.some(f => f.active) && (
            <Badge variant="outline" className="text-label-small">
              {filters.filter(f => f.active).length} filters active
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {/* Filter panel */}
      {showFilterPanel && renderFilterControls()}
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {displayColumns.map((column, index) => (
                  <TableHead 
                    key={column} 
                    className={`text-label-medium font-medium ${enableSorting ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    onClick={() => handleHeaderClick(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{displayColumnTitles[index] || column}</span>
                      {enableSorting && (
                        <div className="flex flex-col">
                          {sortColumn === column ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {displayColumns.map((column) => (
                    <TableCell key={column} className="text-body-medium">
                      {typeof row[column] === 'number' 
                        ? row[column].toLocaleString() 
                        : row[column]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-body-small text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of {processedData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-body-small">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}