import React, { useState } from 'react'
import { ReportSearch } from '@/components/ReportSearch'
import { ReportViewer } from '@/components/ReportViewer'
import { Toaster } from '@/components/ui/sonner'

function App() {
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

export default App