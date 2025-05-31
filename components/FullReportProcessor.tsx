'use client'

import { useState } from 'react'
import { Download, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import FileUpload from './FileUpload'

export default function FullReportProcessor() {
  const [files, setFiles] = useState<{
    raw?: File
    rates?: File
    payments?: File
  }>({})
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileUpload = (type: 'raw' | 'rates' | 'payments') => (file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  const processFiles = async () => {
    if (!files.raw || !files.rates || !files.payments) {
      alert('Please upload all three files')
      return
    }

    setProcessing(true)
    try {
      // Read raw data
      const rawBuffer = await files.raw.arrayBuffer()
      const rawWorkbook = XLSX.read(rawBuffer, { type: 'array' })
      const rawData = XLSX.utils.sheet_to_json(rawWorkbook.Sheets[rawWorkbook.SheetNames[0]])

      // Read rates
      const ratesBuffer = await files.rates.arrayBuffer()
      const ratesWorkbook = XLSX.read(ratesBuffer, { type: 'array' })
      const affRates = XLSX.utils.sheet_to_json(ratesWorkbook.Sheets['Affiliate Rates'])
      const brandRates = XLSX.utils.sheet_to_json(ratesWorkbook.Sheets['Brand Rates'])

      // Read payments
      const paymentsBuffer = await files.payments.arrayBuffer()
      const paymentsWorkbook = XLSX.read(paymentsBuffer, { type: 'array' })
      const moneyOut = XLSX.utils.sheet_to_json(paymentsWorkbook.Sheets['Money Out'])
      const moneyIn = XLSX.utils.sheet_to_json(paymentsWorkbook.Sheets['Money In'])

      // Generate cost data with dummy values (you can enhance this with real calculations)
      const costData = affRates.map((rate: any) => ({
        ...rate,
        Leads: 50, // Placeholder
        FTDs: 5,   // Placeholder
        'Total to Pay': 5 * (rate['CPA to Pay'] || 0)
      }))

      // Generate income data with dummy values
      const incomeData = brandRates.map((rate: any) => ({
        ...rate,
        Leads: 50, // Placeholder
        FTDs: 5,   // Placeholder
        'Total to Collect': 5 * (rate['CPA to Collect'] || 0)
      }))

      // Merge with payments
      const mergedOut = costData.map((cost: any) => {
        const payment = moneyOut.find((p: any) => p.Affiliate === cost.Affiliate)
        const paidAmount = payment ? (payment as any)['How Much We Paid'] || 0 : 0
        return {
          ...cost,
          'How Much We Paid': paidAmount,
          'Updated Balance': cost['Total to Pay'] - paidAmount
        }
      })

      const mergedIn = incomeData.map((income: any) => {
        const payment = moneyIn.find((p: any) => p.Brand === income.Brand)
        const receivedAmount = payment ? (payment as any)['Payment Received'] || 0 : 0
        return {
          ...income,
          'Payment Received': receivedAmount,
          'Updated Balance': receivedAmount - income['Total to Collect']
        }
      })

      // P&L summary
      const plData = [
        ...costData.map((item: any) => ({
          Entity: item.Affiliate,
          Type: 'Affiliate',
          'Total Income': 0,
          'Total Cost': item['Total to Pay'],
          'Profit/Loss': -item['Total to Pay']
        })),
        ...incomeData.map((item: any) => ({
          Entity: item.Brand,
          Type: 'Brand',
          'Total Income': item['Total to Collect'],
          'Total Cost': 0,
          'Profit/Loss': item['Total to Collect']
        }))
      ]

      setResults({
        costData,
        incomeData,
        mergedIn,
        mergedOut,
        plData
      })

    } catch (error) {
      console.error('Processing error:', error)
      alert('Error processing files. Please check the format.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadFullReport = () => {
    if (!results) return

    const wb = XLSX.utils.book_new()
    
    // Add all sheets
    const costWs = XLSX.utils.json_to_sheet(results.costData)
    const incomeWs = XLSX.utils.json_to_sheet(results.incomeData)
    const moneyInWs = XLSX.utils.json_to_sheet(results.mergedIn)
    const moneyOutWs = XLSX.utils.json_to_sheet(results.mergedOut)
    const plWs = XLSX.utils.json_to_sheet(results.plData)

    XLSX.utils.book_append_sheet(wb, costWs, 'COST')
    XLSX.utils.book_append_sheet(wb, incomeWs, 'INCOME')
    XLSX.utils.book_append_sheet(wb, moneyInWs, 'MONEY IN')
    XLSX.utils.book_append_sheet(wb, moneyOutWs, 'MONEY OUT')
    XLSX.utils.book_append_sheet(wb, plWs, 'PROFIT & LOSS')

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, 'Lead_System_Full_Output.xlsx')
  }

  const allFilesUploaded = files.raw && files.rates && files.payments

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Full Report Generator</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <FileUpload
          onFileUpload={handleFileUpload('raw')}
          label="Raw Data File"
          description="Lead and conversion data"
        />
        
        <FileUpload
          onFileUpload={handleFileUpload('rates')}
          label="Rates File"
          description="Excel with Affiliate & Brand rates"
        />
        
        <FileUpload
          onFileUpload={handleFileUpload('payments')}
          label="Manual Payments File"
          description="Excel with Money In/Out sheets"
        />
      </div>

      {allFilesUploaded && (
        <div className="text-center mb-6">
          <button
            onClick={processFiles}
            disabled={processing}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Generate Full Report'}
          </button>
        </div>
      )}

      {processing && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Generating report...</span>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">
                Full report generated successfully!
              </span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={downloadFullReport}
              className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-8 py-4 rounded-lg hover:bg-purple-600 transition-colors mx-auto"
            >
              <Download size={24} />
              <span className="text-lg">Download Full Report (Excel)</span>
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Report Contents</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>COST Sheet ({results.costData.length} records)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>INCOME Sheet ({results.incomeData.length} records)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>MONEY IN Sheet ({results.mergedIn.length} records)</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>MONEY OUT Sheet ({results.mergedOut.length} records)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>PROFIT & LOSS Sheet ({results.plData.length} records)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 