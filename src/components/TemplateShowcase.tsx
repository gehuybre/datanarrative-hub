import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, BarChart, PieChart, LineChart, Scatter } from '@phosphor-icons/react'

interface TemplateShowcaseProps {
  className?: string
}

export function TemplateShowcase({ className = '' }: TemplateShowcaseProps) {
  const chartTypes = [
    {
      name: 'Line Charts',
      icon: LineChart,
      description: 'Time series and trend analysis',
      features: ['Smooth curves', 'Multi-series support', 'Interactive hover']
    },
    {
      name: 'Bar Charts',
      icon: BarChart,
      description: 'Categorical data comparison',
      features: ['Grouped bars', 'Custom colors', 'Data labels']
    },
    {
      name: 'Pie Charts',
      icon: PieChart,
      description: 'Proportional data visualization',
      features: ['Donut mode', 'Custom segments', 'Legend positioning']
    },
    {
      name: 'Scatter Plots',
      icon: Scatter,
      description: 'Correlation and distribution analysis',
      features: ['Bubble sizing', 'Color coding', 'Trend lines']
    }
  ]

  const templateFeatures = [
    'Global layout defaults (fonts, colors, spacing)',
    'Chart-specific presets (bar gaps, line styles, marker sizes)', 
    'Local override system for custom requirements',
    'Material Design 3 color palette integration',
    'Responsive design with mobile optimization',
    'Export functionality (PNG, SVG, CSV downloads)',
    'Embed code generation for external use',
    'Configuration-driven styling system'
  ]

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center space-y-4">
        <h2 className="text-headline-medium font-semibold">Template System Architecture</h2>
        <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
          Our unified template system follows Plotly's official template mechanism with BASE_LAYOUT → CHART_TYPE_LAYOUTS → LOCAL_OVERRIDES for consistent, customizable visualizations.
        </p>
      </div>

      {/* Chart Types Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {chartTypes.map((chart) => {
          const Icon = chart.icon
          return (
            <Card key={chart.name} className="elevation-2 hover:elevation-3 transition-all duration-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-title-medium">{chart.name}</CardTitle>
                <CardDescription className="text-body-small">
                  {chart.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chart.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-label-small">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Template Features */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle className="text-title-large flex items-center gap-2">
            <TrendUp className="w-5 h-5" />
            Template System Features
          </CardTitle>
          <CardDescription>
            Centralized configuration enables consistent design and easy customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {templateFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-body-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Example */}
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle className="text-title-large">Configuration Example</CardTitle>
          <CardDescription>
            How the template system works with global defaults and local overrides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <div className="text-accent font-semibold mb-2">// Template Application</div>
            <div className="text-muted-foreground">
              <span className="text-foreground">applyLayout</span>(<span className="text-primary">'line'</span>, baseLayout, &#123;
            </div>
            <div className="ml-4 text-muted-foreground">
              title: <span className="text-primary">'Custom Chart Title'</span>,
            </div>
            <div className="ml-4 text-muted-foreground">
              xaxis: &#123; title: <span className="text-primary">'Custom X Label'</span> &#125;
            </div>
            <div className="text-muted-foreground">&#125;)</div>
            
            <div className="mt-4 text-accent font-semibold">// Result: BASE + LINE_TYPE + OVERRIDES</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}