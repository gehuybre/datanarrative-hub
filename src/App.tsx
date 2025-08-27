import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { ReportSearch } from '@/components/ReportSearch'
import { ReportViewer } from '@/components/ReportViewer'
import { EmbedChart } from '@/components/EmbedChart'
import { EmbedTable } from '@/components/EmbedTable'
import { Toaster } from '@/components/ui/sonner'
// Import plotly config to ensure Aurora Borealis theme is registered
import '@/lib/plotly-config'

function MainApp() {
  const [currentView, setCurrentView] = useState<'search' | 'report'>('search')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const handleReportSelect = (reportId: string) => {
    setSelectedReportId(reportId)
    setCurrentView('report')
  }

  const handleBackToSearch = () => {
    setCurrentView('search')
    setSelectedReportId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {currentView === 'search' ? (
          <ReportSearch onReportSelect={handleReportSelect} />
        ) : (
          selectedReportId && (
            <ReportViewer 
              reportId={selectedReportId} 
              onBack={handleBackToSearch} 
            />
          )
        )}
      </main>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main application routes */}
        <Route path="/" element={<MainApp />} />
        
        {/* Embed routes */}
        <Route path="/embed/chart/:reportId/:chartId" element={<EmbedChart />} />
        <Route path="/embed/table/:reportId/:tableId" element={<EmbedTable />} />
      </Routes>
    </Router>
  )
}

export default App