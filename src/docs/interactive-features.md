# Interactive Chart Filtering and Drill-Down Features

## Overview

The DataStory Platform now includes comprehensive interactive features for data exploration, including chart filtering, drill-down capabilities, table sorting/filtering, and global filter coordination across multiple visualizations.

## Features

### 1. Chart-Level Filtering

Each chart supports individual filtering controls that allow users to refine the data displayed without affecting other visualizations.

#### Supported Filter Types:
- **Categorical Filters**: Multi-select dropdowns for category-based columns
- **Numerical Filters**: Range sliders for numeric data with min/max indicators
- **Text Filters**: Search inputs for text-based filtering

#### Implementation:
```typescript
// Filter configurations are automatically generated based on data structure
const filterConfigs = [
  {
    column: 'category',
    type: 'categorical',
    label: 'Category'
  },
  {
    column: 'revenue',
    type: 'numerical', 
    label: 'Revenue ($)',
    range: [0, 1000000]
  }
]
```

### 2. Drill-Down Navigation

Charts support click-to-drill-down functionality for hierarchical data exploration.

#### How It Works:
1. Click any data point in supported chart types (pie, bar)
2. Chart updates to show filtered view of that specific data point
3. Navigation breadcrumbs show current drill-down level
4. "Back" and "Reset" buttons allow navigation back to higher levels

#### Supported Chart Types:
- **Pie Charts**: Click segments to drill down by category
- **Bar Charts**: Click bars to drill down by category
- **Scatter Plots**: Click points to drill down by associated category

### 3. Advanced Table Interactions

Tables now include comprehensive filtering, sorting, and pagination capabilities.

#### Table Features:
- **Column Filtering**: Individual filters per column with type-appropriate controls
- **Multi-Column Sorting**: Click headers to sort ascending/descending
- **Pagination**: Configurable page sizes with navigation controls
- **Filter Quick-Select**: Common values displayed as clickable buttons
- **Search Integration**: Real-time filtering as you type

#### Usage:
```typescript
<DataTable
  data={csvData}
  enableFiltering={true}
  enableSorting={true}
  pageSize={50}
  // ... other props
/>
```

### 4. Global Filter Coordination

The most powerful feature enables filtering multiple charts and tables simultaneously based on shared data dimensions.

#### Global Filter Panel:
- Automatically detects common columns across all data sources
- Provides unified controls for categorical and numerical filters
- Updates all compatible visualizations in real-time
- Maintains filter state across user interactions

#### Auto-Generated Filters:
The system automatically creates global filters for:
- Columns containing "category", "segment", "type", "status"
- Numerical columns with "percentage", "count", "revenue", "value", "rate"
- Any column that appears in multiple datasets

### 5. Interactive UI Elements

#### Filter Controls:
- **Collapsible Panels**: Filters can be hidden/shown to save space
- **Active Filter Badges**: Visual indicators showing which filters are active
- **Reset Functionality**: Quick reset buttons for individual and all filters
- **Filter Counts**: Real-time display of filtered vs total data points

#### Chart Interactions:
- **Interactive Hints**: Contextual help text explaining available interactions
- **Hover States**: Visual feedback on interactive elements
- **Loading States**: Smooth transitions during data updates
- **State Indicators**: Visual cues for drill-down levels and active filters

## Implementation Details

### Component Architecture

#### ChartContainer
Enhanced with interactive features:
```typescript
interface ChartContainerProps {
  // Standard props
  data: any[]
  rawData?: any[]
  title: string
  chartType: ChartType
  
  // Interactive features
  enableFiltering?: boolean
  enableDrillDown?: boolean
  filterConfigs?: FilterConfig[]
  drillDownConfig?: DrillDownConfig
  onFilterChange?: (filters: FilterState) => void
  onDrillDown?: (level: number, filter: any) => void
}
```

#### DataTable
Enhanced with filtering and sorting:
```typescript
interface DataTableProps {
  // Standard props
  data: ParsedCSVData
  title: string
  
  // Interactive features
  enableFiltering?: boolean
  enableSorting?: boolean
  pageSize?: number
}
```

#### GlobalFilterPanel
New component for cross-visualization filtering:
```typescript
interface GlobalFilterPanelProps {
  filterConfigs: GlobalFilterConfig[]
  onFilterChange: (filters: GlobalFilterState) => void
  allData: Record<string, any[]>
}
```

### Data Flow

1. **Initial Load**: Report loads all CSV data and generates filter configurations
2. **Global Filters**: Automatically detected based on common columns across datasets
3. **Filter Application**: Global filters are applied to all charts and tables
4. **Individual Interactions**: Local filters and drill-downs work within globally filtered data
5. **State Management**: Filter states are maintained and coordinated across components

### Performance Optimizations

- **Lazy Filter Generation**: Filters are generated only when data is available
- **Memoized Calculations**: Expensive filtering operations are cached
- **Incremental Updates**: Only affected visualizations are re-rendered
- **Debounced Inputs**: Text filters use debouncing to prevent excessive updates

## User Experience

### Visual Design
- **Material Design 3**: Consistent theming across all interactive elements
- **Smooth Animations**: Framer Motion animations for state transitions
- **Clear Hierarchy**: Visual distinction between global and local controls
- **Responsive Design**: All interactions work across device sizes

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: WCAG AA compliant color combinations

### Performance
- **Optimized Rendering**: Efficient updates minimize re-renders
- **Memory Management**: Proper cleanup of event listeners and state
- **Large Dataset Support**: Pagination and virtualization for large tables
- **Fast Filtering**: Client-side filtering with optimized algorithms

## Usage Examples

### Basic Chart with Filtering
```typescript
<ChartContainer
  title="Sales by Region"
  data={plotlyData}
  rawData={csvData.data}
  chartType="bar"
  enableFiltering={true}
  filterConfigs={[
    {
      column: 'region',
      type: 'categorical',
      label: 'Region'
    }
  ]}
/>
```

### Chart with Drill-Down
```typescript
<ChartContainer
  title="Revenue Breakdown"
  data={plotlyData}
  rawData={csvData.data}
  chartType="pie"
  enableDrillDown={true}
  drillDownConfig={{
    enabled: true,
    targetColumn: 'category',
    aggregationType: 'sum'
  }}
/>
```

### Global Filter Setup
```typescript
<GlobalFilterPanel
  filterConfigs={[
    {
      key: 'global-category',
      label: 'Category',
      type: 'categorical',
      column: 'category',
      description: 'Filter all charts by category'
    }
  ]}
  onFilterChange={handleGlobalFilters}
  allData={csvDataCache}
/>
```

## Best Practices

### Filter Configuration
- Use descriptive labels that match your data context
- Limit categorical filters to reasonable option counts (≤20)
- Set appropriate ranges for numerical filters
- Provide helpful descriptions for complex filters

### Performance
- Enable pagination for tables with >100 rows
- Use debouncing for text filters
- Consider data size when enabling drill-down
- Monitor filter performance with large datasets

### User Experience
- Provide clear visual feedback for all interactions
- Include helpful hints about available interactions
- Use consistent interaction patterns across charts
- Test thoroughly across different screen sizes

## Future Enhancements

Planned improvements include:
- Date range filtering support
- Custom filter operators (contains, starts with, etc.)
- Filter presets and saved views
- Export filtered data functionality
- Cross-chart brushing and linking
- Advanced aggregation options in drill-down