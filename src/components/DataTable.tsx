import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Share, Copy, ExternalLink } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ParsedCSVData } from '@/lib/contentManager'

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
  tableId
}: DataTableProps) {
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  
  // Use specified columns or all available columns
  const displayColumns = columns || data.headers
  const displayColumnTitles = columnTitles || displayColumns
  
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
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Standalone
                    </Button>
                  </div>
                  <div className="text-body-small text-muted-foreground">
                    This embed code will display the table with Material Design 3 styling. 
                    The table is responsive and includes download functionality.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-label-small">
            {data.data.length} rows
          </Badge>
          <Badge variant="secondary" className="text-label-small">
            {displayColumns.length} columns
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {displayColumns.map((column, index) => (
                  <TableHead key={column} className="text-label-medium font-medium">
                    {displayColumnTitles[index] || column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row, rowIndex) => (
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
      </CardContent>
    </Card>
  )
}