import { colors } from './colors'

// Base Plotly template applied to every figure
export const BASE_LAYOUT = {
  font: {
    family: 'Inter, system-ui, sans-serif',
    size: 14,
    color: colors.neutral[800]
  },
  paper_bgcolor: colors.neutral[50],
  plot_bgcolor: 'transparent',
  colorway: [
    colors.chart.primary,
    colors.chart.secondary,
    colors.chart.tertiary,
    colors.chart.quaternary,
    colors.chart.quinary,
    colors.chart.senary
  ],
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
      color: colors.neutral[700]
    }
  },
  xaxis: {
    gridcolor: colors.neutral[200],
    linecolor: colors.neutral[300],
    tickcolor: colors.neutral[400],
    titlefont: {
      size: 14,
      color: colors.neutral[700]
    },
    tickfont: {
      size: 12,
      color: colors.neutral[600]
    }
  },
  yaxis: {
    gridcolor: colors.neutral[200],
    linecolor: colors.neutral[300],
    tickcolor: colors.neutral[400],
    titlefont: {
      size: 14,
      color: colors.neutral[700]
    },
    tickfont: {
      size: 12,
      color: colors.neutral[600]
    }
  },
  hoverlabel: {
    bgcolor: colors.neutral[800],
    bordercolor: colors.neutral[600],
    font: {
      color: 'white',
      size: 12
    }
  }
} as const

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
        color: colors.neutral[700]
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
        [0, colors.neutral[100]],
        [0.5, colors.primary[300]],
        [1, colors.primary[600]]
      ],
      showscale: true,
      colorbar: {
        thickness: 15,
        len: 0.7,
        x: 1.02,
        tickfont: {
          size: 10,
          color: colors.neutral[600]
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
export type PlotlyLayout = typeof BASE_LAYOUT
export type ChartTypeConfig = typeof CHART_TYPE_LAYOUTS

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

// Main layout application function
export function applyLayout(
  fig: any,
  chartType: ChartType,
  overrides: Partial<PlotlyLayout> = {}
) {
  // Start with base layout
  let finalLayout = { ...BASE_LAYOUT }
  
  // Apply chart type specific layout
  if (CHART_TYPE_LAYOUTS[chartType]?.layout) {
    finalLayout = deepMerge(finalLayout, CHART_TYPE_LAYOUTS[chartType].layout)
  }
  
  // Apply local overrides
  finalLayout = deepMerge(finalLayout, overrides)
  
  // Apply to figure
  fig.layout = finalLayout
  
  // Apply chart type specific trace defaults
  if (CHART_TYPE_LAYOUTS[chartType]?.trace && fig.data) {
    fig.data = fig.data.map((trace: any) => 
      deepMerge(CHART_TYPE_LAYOUTS[chartType].trace, trace)
    )
  }
  
  return fig
}