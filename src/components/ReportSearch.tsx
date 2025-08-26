import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MagnifyingGlass, TrendUp, Users, Calendar } from '@phosphor-icons/react'
import { TemplateShowcase } from '@/components/TemplateShowcase'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { getReportSearchData, loadHomeContent } from '@/lib/contentManager'

interface Report {
  id: string
  title: string
  subtitle: string
  author: string
  publishDate: string
  readTime: string
  tags: string[]
}

interface ReportSearchProps {
  onReportSelect: (reportId: string) => void
}

export function ReportSearch({ onReportSelect }: ReportSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [homeContent, setHomeContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load reports
        const reportData = await getReportSearchData()
        setReports(reportData)
        setFilteredReports(reportData)

        // Load home content
        const content = await loadHomeContent()
        if (content) {
          setHomeContent(content)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredReports(reports)
      return
    }

    const filtered = reports.filter(report =>
      report.title.toLowerCase().includes(query.toLowerCase()) ||
      report.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      report.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    setFilteredReports(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-title-large mb-2">Loading reports...</h2>
          <p className="text-body-medium text-muted-foreground">Please wait while we fetch the data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Home Content */}
      <div className="text-center space-y-6">
        <h1 className="text-display-small font-bold text-foreground">
          DataStory Platform
        </h1>
        <div className="max-w-4xl mx-auto">
          {homeContent ? (
            <MarkdownRenderer content={homeContent} className="text-left" />
          ) : (
            <p className="text-body-large text-muted-foreground">
              Explore interactive data visualizations and insights across sales, marketing, and business analytics.
            </p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 text-body-medium"
        />
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-body-medium text-muted-foreground">
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Report Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer transition-all duration-200 hover:elevation-3 hover:scale-[1.02]"
            onClick={() => onReportSelect(report.id)}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-title-medium line-clamp-2">
                  {report.title}
                </CardTitle>
                <TrendUp className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
              </div>
              <CardDescription className="text-body-small line-clamp-3">
                {report.subtitle}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {report.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-label-small"
                  >
                    {tag}
                  </Badge>
                ))}
                {report.tags.length > 3 && (
                  <Badge variant="outline" className="text-label-small">
                    +{report.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-label-small text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(report.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{report.readTime}</span>
                </div>
              </div>
              
              <div className="text-label-small text-muted-foreground">
                By {report.author}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlass className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-title-medium font-medium mb-2">No reports found</h3>
          <p className="text-body-medium text-muted-foreground">
            Try adjusting your search terms or browse all available reports.
          </p>
          <Button
            variant="outline"
            onClick={() => handleSearch('')}
            className="mt-4"
          >
            View All Reports
          </Button>
        </div>
      )}

      {/* Template Showcase Section */}
      <Separator className="my-12" />
      <TemplateShowcase />
    </div>
  )
}