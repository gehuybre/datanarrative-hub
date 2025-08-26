import { colors } from './colors'

// Function to get CSS variable values at runtime
function getCSSColorValues() {
  if (typeof window === 'undefined') {
    // Fallback colors for SSR
    return {
      background: 'oklch(0.98 0.01 180)',
      foreground: 'oklch(0.15 0.02 240)',
      chartColors: [
        'oklch(0.65 0.20 160)', // Aurora green
        'oklch(0.75 0.15 280)', // Aurora purple
        'oklch(0.55 0.18 120)', // Forest green
        'oklch(0.70 0.12 320)', // Magenta aurora
        'oklch(0.60 0.15 40)',  // Aurora yellow
        'oklch(0.68 0.18 200)'  // Icy blue
      ]
    }
  }
  
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  
  return {
    background: computedStyle.getPropertyValue('--background').trim(),
    foreground: computedStyle.getPropertyValue('--foreground').trim(),
    chartColors: [
      computedStyle.getPropertyValue('--chart-1').trim() || 'oklch(0.65 0.20 160)',
      computedStyle.getPropertyValue('--chart-2').trim() || 'oklch(0.75 0.15 280)',
      computedStyle.getPropertyValue('--chart-3').trim() || 'oklch(0.55 0.18 120)',
      computedStyle.getPropertyValue('--chart-4').trim() || 'oklch(0.70 0.12 320)',
      computedStyle.getPropertyValue('--chart-5').trim() || 'oklch(0.60 0.15 40)',
      computedStyle.getPropertyValue('--chart-6').trim() || 'oklch(0.68 0.18 200)'
    ]
  }
}

// Function to create the base layout with current theme colors
function createBaseLayout() {
  const themeColors = getCSSColorValues()
  
  return {
    font: {
      family: 'Inter, system-ui, sans-serif',
      size: 14,
      color: themeColors.foreground
    },
    paper_bgcolor: themeColors.background,
    plot_bgcolor: 'transparent',
    colorway: themeColors.chartColors,
    margin: { l: 60, r: 40, t: 60, b: 60 },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.02,
      y: 1,
      bgcolor: 'transparent',
      bordercolor: 'transparent',
      font: {
        size: 12,
        color: themeColors.foreground
      }
    },
    xaxis: {
      gridcolor: 'oklch(0.92 0.02 180)',
      linecolor: 'oklch(0.88 0.02 180)',
      tickcolor: 'oklch(0.74 0.02 180)',
      titlefont: {
        size: 14,
        color: themeColors.foreground
      },
      tickfont: {
        size: 12,
        color: themeColors.foreground
      }
    },
    yaxis: {
      gridcolor: 'oklch(0.92 0.02 180)',
      linecolor: 'oklch(0.88 0.02 180)',
      tickcolor: 'oklch(0.74 0.02 180)',
      titlefont: {
        size: 14,
        color: themeColors.foreground
      },
      tickfont: {
        size: 12,
        color: themeColors.foreground
      }
    },
    hoverlabel: {
      bgcolor: 'oklch(0.28 0.02 180)',
      bordercolor: 'oklch(0.49 0.02 180)',
      font: {
        color: 'white',
        size: 12
      }
    }
  } as const
}

// Base Plotly template applied to every figure
export const BASE_LAYOUT = createBaseLayout()

// Chart type specific layouts and trace defaults
export const CHART_TYPE_LAYOUTS = {
  bar: {
    layout: {
      bargap: 0.3,
      bargroupgap: 0.1
    },
    trace: {
      marker: {
        line: {
          width: 0
        }
      },
      textposition: 'auto',
      textfont: {
        size: 11,
        color: 'oklch(0.42 0.02 180)'
      }
    }
  },
  
  line: {
    layout: {
      hovermode: 'x unified'
    },
    trace: {
      mode: 'lines+markers',
      line: {
        width: 2
      },
      marker: {
        size: 6,
        line: {
          width: 1,
          color: 'white'
        }
      }
    }
  },
  
  scatter: {
    layout: {
      hovermode: 'closest'
    },
    trace: {
      mode: 'markers',
      marker: {
        size: 8,
        opacity: 0.8,
        line: {
          width: 1,
          color: 'white'
        }
      }
    }
  },
  
  pie: {
    layout: {
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0,
        y: -0.1
      }
    },
    trace: {
      textinfo: 'label+percent',
      textposition: 'auto',
      textfont: {
        size: 12,
        color: 'white'
      },
      marker: {
        line: {
          color: 'white',
          width: 2
        }
      }
    }
  },
  
  heatmap: {
    layout: {
      xaxis: {
        side: 'bottom'
      },
      yaxis: {
        side: 'left'
      }
    },
    trace: {
      colorscale: [
        [0, 'oklch(0.96 0.01 180)'],  // Light background
        [0.3, 'oklch(0.55 0.18 120)'], // Forest green
        [0.6, 'oklch(0.65 0.20 160)'], // Aurora green
        [1, 'oklch(0.75 0.15 280)']    // Aurora purple
      ],
      showscale: true,
      colorbar: {
        thickness: 15,
        len: 0.7,
        x: 1.02,
        tickfont: {
          size: 10,
          color: 'oklch(0.49 0.02 180)'
        }
      }
    }
  },
  
  histogram: {
    layout: {
      bargap: 0.05
    },
    trace: {
      marker: {
        line: {
          width: 1,
          color: 'white'
        }
      },
      opacity: 0.8
    }
  }
} as const

export type ChartType = keyof typeof CHART_TYPE_LAYOUTS
export type PlotlyLayout = ReturnType<typeof createBaseLayout>
export type ChartTypeConfig = typeof CHART_TYPE_LAYOUTS

// Function to apply trace defaults to data
export function applyTraceDefaults(data: any[], chartType: ChartType) {
  if (!data || !Array.isArray(data)) {
    return data
  }
  
  const themeColors = getCSSColorValues()
  
  return data.map((trace: any, index: number) => {
    // Start with chart type defaults
    let traceDefaults = CHART_TYPE_LAYOUTS[chartType]?.trace ? 
      { ...CHART_TYPE_LAYOUTS[chartType].trace } : {}
    
    // Apply Aurora Borealis colors based on chart type
    switch (chartType) {
      case 'bar':
      case 'histogram':
        // For bar charts, apply color to marker
        traceDefaults.marker = {
          ...traceDefaults.marker,
          color: trace.marker?.color || themeColors.chartColors[index % themeColors.chartColors.length],
          line: {
            ...traceDefaults.marker?.line,
            color: 'transparent',
            width: 0
          }
        }
        break
        
      case 'line':
        // For line charts, apply color to both line and marker
        traceDefaults.line = {
          ...traceDefaults.line,
          color: trace.line?.color || themeColors.chartColors[index % themeColors.chartColors.length]
        }
        traceDefaults.marker = {
          ...traceDefaults.marker,
          color: trace.marker?.color || themeColors.chartColors[index % themeColors.chartColors.length],
          line: {
            ...traceDefaults.marker?.line,
            color: 'white',
            width: 1
          }
        }
        break
        
      case 'scatter':
        // For scatter plots, apply color to marker
        traceDefaults.marker = {
          ...traceDefaults.marker,
          color: trace.marker?.color || themeColors.chartColors[index % themeColors.chartColors.length],
          line: {
            ...traceDefaults.marker?.line,
            color: 'white',
            width: 1
          }
        }
        break
        
      case 'pie':
        // For pie charts, apply colors array to marker
        traceDefaults.marker = {
          ...traceDefaults.marker,
          colors: trace.marker?.colors || themeColors.chartColors,
          line: {
            ...traceDefaults.marker?.line,
            color: 'white',
            width: 2
          }
        }
        break
        
      default:
        // Default case - apply first color as fallback
        if (!trace.marker?.color && !trace.line?.color) {
          traceDefaults.marker = {
            ...traceDefaults.marker,
            color: themeColors.chartColors[index % themeColors.chartColors.length]
          }
        }
        break
    }
    
    // Deep merge trace defaults with existing trace data
    // Existing trace data takes precedence over defaults
    return deepMerge(traceDefaults, trace)
  })
}

// Deep merge utility for combining layouts
function deepMerge(target: any, source: any): any {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

// Main layout application function - returns final layout for use in components
export function applyLayout(
  chartType: ChartType,
  baseLayout: any = {},
  overrides: Partial<ReturnType<typeof createBaseLayout>> = {}
) {
  // Start with current theme base layout
  let finalLayout = { ...createBaseLayout() }
  
  // Apply chart type specific layout
  if (CHART_TYPE_LAYOUTS[chartType]?.layout) {
    finalLayout = deepMerge(finalLayout, CHART_TYPE_LAYOUTS[chartType].layout)
  }
  
  // Apply provided base layout
  finalLayout = deepMerge(finalLayout, baseLayout)
  
  // Apply local overrides
  finalLayout = deepMerge(finalLayout, overrides)
  
  return finalLayout
}

// Alternative function for applying layout directly to a figure object
export function applyLayoutToFigure(
  fig: any,
  chartType: ChartType,
  overrides: Partial<ReturnType<typeof createBaseLayout>> = {}
) {
  // Apply layout with template
  fig.layout = applyLayout(chartType, fig.layout || {}, {
    template: 'aurora_borealis',
    ...overrides
  })
  
  // Apply chart type specific trace defaults with Aurora colors
  if (fig.data) {
    fig.data = applyTraceDefaults(fig.data, chartType)
  }
  
  return fig
}

// Function to register Aurora Borealis theme as a Plotly template
export function registerAuroraBorealisTemplate() {
  if (typeof window === 'undefined') return
  
  try {
    // Check if Plotly is available
    if (!window.Plotly) {
      console.warn('Plotly is not available on window object')
      return
    }
    
    // Ensure templates object exists
    if (!window.Plotly.templates) {
      window.Plotly.templates = {}
    }
    
    // Create template with current theme colors
    const currentLayout = createBaseLayout()
    const themeColors = getCSSColorValues()
    
    const template = {
      layout: {
        ...currentLayout,
        // Ensure colorway is always applied for consistent colors across series
        colorway: themeColors.chartColors,
        // Set global color defaults
        plot_bgcolor: 'transparent',
        paper_bgcolor: themeColors.background
      },
      data: {
        scatter: [{ 
          ...CHART_TYPE_LAYOUTS.scatter.trace,
          marker: { 
            ...CHART_TYPE_LAYOUTS.scatter.trace.marker,
            color: themeColors.chartColors[0],
            colorscale: [
              [0, themeColors.chartColors[0]],
              [0.2, themeColors.chartColors[1]], 
              [0.4, themeColors.chartColors[2]],
              [0.6, themeColors.chartColors[3]],
              [0.8, themeColors.chartColors[4]],
              [1, themeColors.chartColors[5]]
            ]
          }
        }],
        bar: [{ 
          ...CHART_TYPE_LAYOUTS.bar.trace,
          marker: {
            ...CHART_TYPE_LAYOUTS.bar.trace.marker,
            color: themeColors.chartColors[0],
            line: { color: 'transparent', width: 0 }
          }
        }], 
        line: [{ 
          ...CHART_TYPE_LAYOUTS.line.trace,
          line: {
            ...CHART_TYPE_LAYOUTS.line.trace.line,
            color: themeColors.chartColors[0]
          },
          marker: {
            ...CHART_TYPE_LAYOUTS.line.trace.marker,
            color: themeColors.chartColors[0]
          }
        }],
        pie: [{ 
          ...CHART_TYPE_LAYOUTS.pie.trace,
          marker: {
            ...CHART_TYPE_LAYOUTS.pie.trace.marker,
            colors: themeColors.chartColors,
            line: { color: 'white', width: 2 }
          }
        }],
        heatmap: [CHART_TYPE_LAYOUTS.heatmap.trace],
        histogram: [{ 
          ...CHART_TYPE_LAYOUTS.histogram.trace,
          marker: {
            ...CHART_TYPE_LAYOUTS.histogram.trace.marker,
            color: themeColors.chartColors[0],
            line: { color: 'white', width: 1 }
          }
        }]
      }
    }
    
    // Register the template
    window.Plotly.templates.aurora_borealis = template
    
    // Set as default template
    window.Plotly.templates.default = 'aurora_borealis'
    
    console.log('Aurora Borealis template registered successfully')
  } catch (error) {
    console.warn('Failed to register Aurora Borealis template:', error)
  }
}

// Function to wait for Plotly to be fully loaded
function waitForPlotly(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }
    
    if (window.Plotly) {
      resolve()
      return
    }
    
    let attempts = 0
    const maxAttempts = 50
    const checkInterval = setInterval(() => {
      attempts++
      if (window.Plotly) {
        clearInterval(checkInterval)
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        console.warn('Plotly not loaded after maximum attempts')
        resolve()
      }
    }, 100)
  })
}

// Call this function when the module loads
if (typeof window !== 'undefined') {
  waitForPlotly().then(() => {
    registerAuroraBorealisTemplate()
  })
}