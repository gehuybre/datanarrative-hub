import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Clock, Download, Share } from '@phosphor-icons/react'
import { ChartContainer } from '@/components/ChartContainer'
import { toast } from 'sonner'

// Import sample data
import salesMetricsCSV from '@/assets/data/sales-metrics.csv?raw'
import marketSegmentsCSV from '@/assets/data/market-segments.csv?raw'
import userEngagementCSV from '@/assets/data/user-engagement.csv?raw'

interface ReportViewerProps {
  reportId: string
  onBack: () => void
}

interface ReportSection {
  type: 'text' | 'chart' | 'table'
  content: any
}

interface ReportData {
  id: string
  title: string
  subtitle: string
  author: string
  publishDate: string
  readTime: string
  tags: string[]
  sections: ReportSection[]
}

// Parse CSV helper
function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')
  const data = lines.slice(1).map(line => {
    const values = line.split(',')
    const row: any = {}
    headers.forEach((header, index) => {
      const value = values[index]
      // Try to parse as number
      const numValue = parseFloat(value)
      row[header] = isNaN(numValue) ? value : numValue
    })
    return row
  })
  return { headers, data }
}

const reportTemplates: Record<string, ReportData> = {
  'sales-performance-q1-2024': {
    id: 'sales-performance-q1-2024',
    title: 'Q1 2024 Sales Performance Analysis',
    subtitle: 'Comprehensive analysis of sales metrics, conversion rates, and revenue trends',
    author: 'Analytics Team',
    publishDate: '2024-01-15',
    readTime: '8 min read',
    tags: ['Sales', 'Performance', 'Q1', 'Revenue'],
    sections: [
      {
        type: 'text',
        content: {
          title: 'Executive Summary',
          body: `Q1 2024 demonstrated strong performance across key sales metrics, with revenue growth of 38% compared to Q1 2023. Our conversion rates improved consistently throughout the quarter, reaching a peak of 6.5% in early January.

Key highlights include:
• Total revenue reached $1.85M for the quarter
• User acquisition grew by 42% to average 1,580 users daily
• Conversion rates stabilized above 5.5% after mid-January
• Peak performance day achieved $174K in revenue

The data reveals a clear upward trend in both user engagement and monetization efficiency, suggesting our Q4 2023 optimization initiatives are bearing fruit.`
        }
      },
      {
        type: 'chart',
        content: {
          title: 'Daily Revenue Trend',
          chartType: 'line',
          data: () => {
            const { data } = parseCSV(salesMetricsCSV)
            return [{
              x: data.map(row => row.date),
              y: data.map(row => row.revenue),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Revenue ($)',
              line: { shape: 'spline' }
            }]
          },
          layout: {
            title: 'Daily Revenue Performance',
            xaxis: { title: 'Date' },
            yaxis: { title: 'Revenue ($)' }
          },
          csvData: salesMetricsCSV,
          csvFilename: 'sales-metrics.csv'
        }
      },
      {
        type: 'chart',
        content: {
          title: 'User Acquisition vs Conversion Rate',
          chartType: 'scatter',
          data: () => {
            const { data } = parseCSV(salesMetricsCSV)
            return [{
              x: data.map(row => row.users),
              y: data.map(row => row.conversion_rate),
              type: 'scatter',
              mode: 'markers',
              name: 'Daily Performance',
              text: data.map(row => row.date),
              hovertemplate: '<b>Date:</b> %{text}<br><b>Users:</b> %{x}<br><b>Conversion:</b> %{y}%<extra></extra>'
            }]
          },
          layout: {
            title: 'User Volume vs Conversion Efficiency',
            xaxis: { title: 'Daily Users' },
            yaxis: { title: 'Conversion Rate (%)' }
          },
          csvData: salesMetricsCSV,
          csvFilename: 'sales-metrics.csv'
        }
      },
      {
        type: 'text',
        content: {
          title: 'Key Insights & Recommendations',
          body: `The correlation between user volume and conversion rates indicates our platform scales effectively with increased traffic. Days with higher user counts (1,650+) consistently achieved conversion rates above 6%.

**Strategic Recommendations:**

1. **Traffic Optimization**: Focus marketing spend on channels that drive high-intent users, as evidenced by the positive correlation between volume and conversion rates.

2. **Retention Programs**: Implement targeted retention campaigns during high-conversion periods to maximize LTV from quality user cohorts.

3. **Capacity Planning**: Ensure infrastructure can handle projected Q2 traffic increases of 25-35% based on current growth trajectory.

The data suggests we're entering a scaling phase where operational excellence will be critical to maintaining our conversion rate improvements while growing revenue.`
        }
      }
    ]
  },
  
  'market-segmentation-study': {
    id: 'market-segmentation-study',
    title: 'Market Segmentation Deep Dive',
    subtitle: 'Detailed breakdown of customer segments across key industries',
    author: 'Market Research Team',
    publishDate: '2024-01-12',
    readTime: '12 min read',
    tags: ['Market Research', 'Segmentation', 'Industries'],
    sections: [
      {
        type: 'text',
        content: {
          title: 'Market Overview',
          body: `Our comprehensive market analysis reveals distinct customer segments with unique characteristics and growth potentials. Technology leads our customer base at 32.1%, followed by Healthcare (20.0%) and Finance (15.7%).

This segmentation analysis provides critical insights for resource allocation, product development, and go-to-market strategies across our diverse customer portfolio.`
        }
      },
      {
        type: 'chart',
        content: {
          title: 'Market Segment Distribution',
          chartType: 'pie',
          data: () => {
            const { data } = parseCSV(marketSegmentsCSV)
            return [{
              labels: data.map(row => row.category),
              values: data.map(row => row.percentage),
              type: 'pie',
              hole: 0.3,
              textinfo: 'label+percent',
              textposition: 'auto'
            }]
          },
          layout: {
            title: 'Customer Distribution by Industry Segment'
          },
          csvData: marketSegmentsCSV,
          csvFilename: 'market-segments.csv'
        }
      },
      {
        type: 'chart',
        content: {
          title: 'Segment Volume Analysis',
          chartType: 'bar',
          data: () => {
            const { data } = parseCSV(marketSegmentsCSV)
            return [{
              x: data.map(row => row.category),
              y: data.map(row => row.count),
              type: 'bar',
              name: 'Customer Count'
            }]
          },
          layout: {
            title: 'Customer Count by Market Segment',
            xaxis: { title: 'Industry Segment' },
            yaxis: { title: 'Number of Customers' }
          },
          csvData: marketSegmentsCSV,
          csvFilename: 'market-segments.csv'
        }
      }
    ]
  },

  'user-engagement-metrics': {
    id: 'user-engagement-metrics',
    title: 'User Engagement Metrics Dashboard',
    subtitle: 'Interactive analysis of user behavior patterns and feature adoption',
    author: 'Product Analytics Team',
    publishDate: '2024-01-10',
    readTime: '6 min read',
    tags: ['User Analytics', 'Engagement', 'Behavior'],
    sections: [
      {
        type: 'text',
        content: {
          title: 'Engagement Overview',
          body: `User engagement metrics for H1 2024 show consistent growth across all key indicators. Active users increased 45% from 15.4K to 22.3K, while retention rates improved from 78.5% to 88.3%.

The engagement score, which combines session duration, feature usage, and return frequency, reached an all-time high of 8.5 in June 2024.`
        }
      },
      {
        type: 'chart',
        content: {
          title: 'Monthly Active Users Growth',
          chartType: 'line',
          data: () => {
            const { data } = parseCSV(userEngagementCSV)
            return [{
              x: data.map(row => row.month),
              y: data.map(row => row.active_users),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Active Users',
              line: { shape: 'spline' }
            }]
          },
          layout: {
            title: 'Active Users Trend',
            xaxis: { title: 'Month' },
            yaxis: { title: 'Active Users' }
          },
          csvData: userEngagementCSV,
          csvFilename: 'user-engagement.csv'
        }
      },
      {
        type: 'chart',
        content: {
          title: 'Engagement Score vs Retention Rate',
          chartType: 'scatter',
          data: () => {
            const { data } = parseCSV(userEngagementCSV)
            return [{
              x: data.map(row => row.retention_rate),
              y: data.map(row => row.engagement_score),
              type: 'scatter',
              mode: 'markers',
              name: 'Monthly Performance',
              text: data.map(row => row.month),
              hovertemplate: '<b>Month:</b> %{text}<br><b>Retention:</b> %{x}%<br><b>Engagement:</b> %{y}<extra></extra>'
            }]
          },
          layout: {
            title: 'Retention vs Engagement Correlation',
            xaxis: { title: 'Retention Rate (%)' },
            yaxis: { title: 'Engagement Score' }
          },
          csvData: userEngagementCSV,
          csvFilename: 'user-engagement.csv'
        }
      }
    ]
  }
}

export function ReportViewer({ reportId, onBack }: ReportViewerProps) {
  const [report, setReport] = useState<ReportData | null>(null)

  useEffect(() => {
    const reportData = reportTemplates[reportId]
    if (reportData) {
      setReport(reportData)
    } else {
      toast.error('Report not found')
      onBack()
    }
  }, [reportId, onBack])

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-title-large mb-2">Loading report...</h2>
          <p className="text-body-medium text-muted-foreground">Please wait while we fetch the data.</p>
        </div>
      </div>
    )
  }

  const renderSection = (section: ReportSection, index: number) => {
    switch (section.type) {
      case 'text':
        return (
          <div key={index} className="space-y-4">
            <h2 className="text-headline-small font-semibold">{section.content.title}</h2>
            <div className="text-body-large leading-relaxed whitespace-pre-line">
              {section.content.body}
            </div>
          </div>
        )
      
      case 'chart':
        return (
          <ChartContainer
            key={index}
            title={section.content.title}
            data={section.content.data()}
            layout={section.content.layout}
            chartType={section.content.chartType}
            csvData={section.content.csvData}
            csvFilename={section.content.csvFilename}
            className="my-8"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-label-large"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-display-small font-bold">{report.title}</h1>
          <p className="text-title-medium text-muted-foreground">{report.subtitle}</p>
          
          <div className="flex items-center gap-6 text-body-small text-muted-foreground">
            <span>By {report.author}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(report.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{report.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-12">
        {report.sections.map((section, index) => renderSection(section, index))}
      </div>

      {/* Footer */}
      <div className="border-t pt-8 text-center">
        <p className="text-body-medium text-muted-foreground">
          End of report • Published {new Date(report.publishDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}