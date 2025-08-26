import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MagnifyingGlass, TrendUp, Users, Calendar } from '@phosphor-icons/react'
import { TemplateShowcase } from '@/components/TemplateShowcase'

interface Report {
  id: string
  title: string
  description: string
  tags: string[]
  lastUpdated: string
  readTime: string
  thumbnail?: string
}

const sampleReports: Report[] = [
  {
    id: 'sales-performance-q1-2024',
    title: 'Q1 2024 Sales Performance Analysis',
    description: 'Comprehensive analysis of sales metrics, conversion rates, and revenue trends for the first quarter of 2024.',
    tags: ['Sales', 'Performance', 'Q1', 'Revenue'],
    lastUpdated: '2024-01-15',
    readTime: '8 min read'
  },
  {
    id: 'market-segmentation-study',
    title: 'Market Segmentation Deep Dive',
    description: 'Detailed breakdown of customer segments across technology, healthcare, finance, and other key industries.',
    tags: ['Market Research', 'Segmentation', 'Industries'],
    lastUpdated: '2024-01-12',
    readTime: '12 min read'
  },
  {
    id: 'user-engagement-metrics',
    title: 'User Engagement Metrics Dashboard',
    description: 'Interactive analysis of user behavior patterns, session duration, and feature adoption rates.',
    tags: ['User Analytics', 'Engagement', 'Behavior'],
    lastUpdated: '2024-01-10',
    readTime: '6 min read'
  }
]

interface ReportSearchProps {
  onReportSelect: (reportId: string) => void
}

export function ReportSearch({ onReportSelect }: ReportSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredReports, setFilteredReports] = useState(sampleReports)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredReports(sampleReports)
      return
    }

    const filtered = sampleReports.filter(report =>
      report.title.toLowerCase().includes(query.toLowerCase()) ||
      report.description.toLowerCase().includes(query.toLowerCase()) ||
      report.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    setFilteredReports(filtered)
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-display-small font-bold text-foreground">
          Data Stories & Reports
        </h1>
        <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
          Explore interactive data visualizations and insights across sales, marketing, and business analytics.
        </p>
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
                {report.description}
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
                  <span>{new Date(report.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{report.readTime}</span>
                </div>
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