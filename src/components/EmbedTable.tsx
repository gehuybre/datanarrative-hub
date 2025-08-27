import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { loadReportConfig } from '@/lib/contentManager'
import { loadCSVDataFromMap } from '@/lib/dataLoader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function EmbedTable() {
  const { reportId, tableId } = useParams<{ reportId: string; tableId: string }>()
  const [tableData, setTableData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTable() {
      if (!reportId || !tableId) {
        setError('Invalid table URL')
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

        // Find the table configuration
        const tableConfig = reportConfig.tables.find(table => table.id === tableId)
        if (!tableConfig) {
          setError('Table not found')
          setIsLoading(false)
          return
        }

        // Load CSV data
        const csvData = await loadCSVDataFromMap(reportId, tableConfig.dataFile)
        if (!csvData) {
          setError('Table data not found')
          setIsLoading(false)
          return
        }

        setTableData({
          config: tableConfig,
          data: csvData
        })
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading table:', err)
        setError('Failed to load table')
        setIsLoading(false)
      }
    }

    loadTable()
  }, [reportId, tableId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading table...</p>
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

  if (!tableData) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <p className="text-muted-foreground">No table data available</p>
      </div>
    )
  }

  const { config, data } = tableData
  const columns = config.columns || data.headers
  const displayData = data.data.slice(0, 100) // Limit to first 100 rows for embedding

  return (
    <div className="min-h-screen bg-card p-4">
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4 text-foreground">{config.title}</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column: string) => (
                  <TableHead key={column} className="text-foreground font-medium">
                    {config.columnTitles?.[column] || column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row: any, index: number) => (
                <TableRow key={index}>
                  {columns.map((column: string) => (
                    <TableCell key={column} className="text-foreground">
                      {row[column]?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.data.length > 100 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Showing first 100 rows of {data.data.length} total rows
          </p>
        )}
      </div>
    </div>
  )
}
