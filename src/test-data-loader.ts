import { loadReportConfigFromMap, loadCSVDataFromMap } from './lib/dataLoader'

// Test de data loader
async function testDataLoader() {
  console.log('Testing data loader...')
  
  // Test config loading
  const config = await loadReportConfigFromMap('market-segmentation-study')
  console.log('Config loaded:', config)
  
  // Test CSV loading
  const csvData = await loadCSVDataFromMap('market-segmentation-study', 'market-segments.csv')
  console.log('CSV data loaded:', csvData)
  
  if (config && csvData) {
    // Test chart finding
    const chartConfig = config.charts.find((chart: any) => chart.id === 'segment-distribution-pie')
    console.log('Chart config found:', chartConfig)
  }
}

testDataLoader().catch(console.error)
