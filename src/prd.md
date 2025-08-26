# DataStory Platform - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: Create a flexible, folder-based data storytelling platform where users can organize reports with markdown content, multiple CSV datasets, interactive Plotly visualizations, and embeddable tables with Material Design 3 theming.

**Success Indicators**: 
- Users can easily navigate between home page and individual reports
- Content creators can organize reports in intuitive folder structures
- Data visualizations are interactive, downloadable, and embeddable
- Tables provide filtering, sorting, and embedding capabilities
- Consistent Material Design 3 theming across all components

**Experience Qualities**: Organized, Professional, Interactive

## Project Classification & Approach

**Complexity Level**: Light Application (multiple features with basic state)
**Primary User Activity**: Consuming and Interacting with data stories

## Core Problem Analysis

Traditional data reporting tools lack the flexibility to organize content in intuitive folder structures while maintaining consistent theming and embedding capabilities. Users need a system where:
- Content is organized hierarchically (home → report folders → data files)
- Multiple CSV files can be associated with a single report
- Visualizations and tables can be embedded into external sites
- Consistent design system ensures professional appearance

## Essential Features

### Folder-Based Content Organization
- **What it does**: Organizes content in `/content/home/` and `/content/reports/{report-id}/` structure
- **Why it matters**: Enables content creators to manage text, data, and configuration separately
- **Success criteria**: Content loads correctly from folder structure, multiple CSV files per report supported

### Interactive Data Visualizations  
- **What it does**: Renders Plotly charts with consistent theming, download capabilities, and embed codes
- **Why it matters**: Makes data accessible and shareable across platforms
- **Success criteria**: Charts render with Material Design 3 colors, generate working embed codes, support image/CSV downloads

### Embeddable Tables
- **What it does**: Displays CSV data in Material Design 3 tables with embed functionality
- **Why it matters**: Enables data sharing in external websites and applications
- **Success criteria**: Tables are responsive, generate iframe embed codes, support CSV downloads

### Markdown Content Rendering
- **What it does**: Renders markdown files as formatted content within reports
- **Why it matters**: Allows rich text content alongside data visualizations
- **Success criteria**: Markdown renders with proper typography, supports headers, lists, and emphasis

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Professional confidence, data credibility, accessibility
**Design Personality**: Clean, modern, trustworthy - following Google's Material Design 3 principles
**Visual Metaphors**: Data sheets, organized folders, interactive dashboards
**Simplicity Spectrum**: Minimal interface that lets data and content take center stage

### Color Strategy
**Color Scheme Type**: Material Design 3 system colors
**Primary Color**: Deep blue (`oklch(0.45 0.12 240)`) - conveys trust and professionalism for data
**Secondary Colors**: Light blue-grey tones for supporting elements
**Accent Color**: Warm amber (`oklch(0.7 0.15 45)`) for highlights and call-to-action elements
**Color Psychology**: Blues establish trust and reliability essential for data platforms; amber provides warmth and engagement
**Color Accessibility**: All text combinations meet WCAG AA standards (4.5:1 normal, 3:1 large text)

### Typography System
**Font Pairing Strategy**: Inter as primary font for excellent readability and professional appearance
**Typographic Hierarchy**: Material Design 3 type scale (Display, Headline, Title, Body, Label)
**Font Personality**: Clean, neutral, highly legible - perfect for data-heavy interfaces
**Readability Focus**: Generous line spacing (1.5x), optimal line lengths, clear size differentiation
**Typography Consistency**: Consistent use of Material Design 3 type scale throughout

### Visual Hierarchy & Layout
**Attention Direction**: Content flows from top-level navigation → report title → content sections → data visualizations
**White Space Philosophy**: Generous padding around content blocks, breathing room between sections
**Grid System**: Container-based layout with responsive breakpoints
**Responsive Approach**: Mobile-first design with adaptive chart and table layouts
**Content Density**: Balanced information display without overwhelming users

### UI Elements & Component Selection
**Component Usage**: 
- Cards for report previews and chart containers
- Tables for data display with sorting and filtering
- Dialogs for embed code sharing
- Badges for tags and metadata
- Buttons with clear hierarchy (primary, secondary, outline)

**Component Customization**: Material Design 3 elevation system, consistent border radius
**Component States**: Hover effects with subtle elevation changes, focus states with color rings
**Icon Selection**: Phosphor Icons for consistent weight and style
**Mobile Adaptation**: Responsive tables with horizontal scroll, collapsible navigation

## Implementation Considerations

### Folder Structure Requirements
- Content organization: `/content/home/content.md` and `/content/reports/{id}/content.md`
- Data management: Multiple CSV files per report in `/content/reports/{id}/data/`
- Configuration: JSON config files defining charts, tables, and metadata

### Embedding System Architecture
- Generate iframe codes for charts and tables
- Standalone embeddable views accessible via `/embed/chart/{reportId}/{chartId}`
- Responsive embed containers with proper aspect ratios

### Plotly Template System  
- BASE_LAYOUT applied to all charts for consistent theming
- CHART_TYPE_LAYOUTS for type-specific defaults (line, bar, pie, scatter)
- Local overrides system for report-specific customizations
- Material Design 3 color integration

### Technical Constraints
- Client-side rendering with React and Vite
- CSV parsing and management without backend database
- Browser clipboard API for embed code copying
- Responsive design across device sizes

## Edge Cases & Problem Scenarios

**CSV File Loading Failures**: Graceful error handling with user-friendly messages
**Large Dataset Performance**: Consider virtual scrolling for tables with 1000+ rows
**Embed Code Compatibility**: Test iframe embedding across different CMS platforms
**Mobile Chart Interactions**: Ensure touch gestures work properly on mobile devices

## Accessibility & Readability

**Contrast Goal**: WCAG AA compliance (4.5:1) for all text elements
**Keyboard Navigation**: Full keyboard accessibility for all interactive elements
**Screen Reader Support**: Proper ARIA labels and semantic HTML structure
**Color Independence**: Information conveyed through color also available through text/icons

## Reflection

This folder-based approach uniquely addresses the need for organized, scalable data storytelling. Unlike monolithic reporting tools, this system enables content creators to manage reports as discrete projects while maintaining design consistency. The combination of Material Design 3 theming with Plotly's powerful visualization capabilities creates a professional platform suitable for business intelligence and data journalism use cases.

The embeddable nature of both charts and tables makes this platform valuable for organizations that need to share data insights across multiple digital properties while maintaining brand consistency.