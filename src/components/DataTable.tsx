import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from '@phosphor-icons/react/dist/csr/Download'
import { Share } from '@phosphor-icons/react/dist/csr/Share'
import { Copy } from '@phosphor-icons/react/dist/csr/Copy'
import { ArrowSquareOut } from '@phosphor-icons/react/dist/csr/ArrowSquareOut'
import { ArrowsDownUp } from '@phosphor-icons/react/dist/csr/ArrowsDownUp'
import { ArrowUp } from '@phosphor-icons/react/dist/csr/ArrowUp'
import { ArrowDown } from '@phosphor-icons/react/dist/csr/ArrowDown'
import { toast } from 'sonner'
import { ParsedCSVData } from '@/lib/contentManager'

type SortDirection = 'asc' | 'desc' | null

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
  pageSize?: number
  enableSorting?: boolean
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
  pageSize = 50,
  enableSorting = true
}: DataTableProps) {
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Use specified columns or all available columns
  const displayColumns = columns || data.headers
  const displayColumnTitles = columnTitles || displayColumns

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data.data]
    
    // Apply basic search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
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
  }, [data.data, searchTerm, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = processedData.slice(startIndex, endIndex)

  // Handle column header click for sorting
  const handleHeaderClick = useCallback((column: string) => {
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
  }, [sortColumn, sortDirection])
  
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

  return (
    <Card className={`chart-container ${className || ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-title-large">{title}</CardTitle>
          <div className="flex items-center gap-2">
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
                      <ArrowSquareOut className="w-4 h-4 mr-2" />
                      View Standalone
                    </Button>
                  </div>
                  <div className="text-body-small text-muted-foreground">
                    This embed code will display the table with basic search and sort functionality.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search and status */}
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search all columns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <div className="text-body-small text-muted-foreground">
              {processedData.length} of {data.data.length} rows
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-6 pt-0">
          <div className="overflow-x-auto relative rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {displayColumns.map((column, index) => (
                    <TableHead 
                      key={column} 
                      className={`text-label-medium font-medium ${enableSorting ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                      onClick={enableSorting ? () => handleHeaderClick(column) : undefined}
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
                                <ArrowsDownUp className="w-3 h-3 opacity-50" />
                              )
                            ) : (
                              <ArrowsDownUp className="w-3 h-3 opacity-30" />
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
        </div>
      </CardContent>
    </Card>
  )
}