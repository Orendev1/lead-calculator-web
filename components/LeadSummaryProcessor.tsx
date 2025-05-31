'use client'

import { useState } from 'react'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import FileUpload from './FileUpload'

interface LeadData {
  Type: string
  Campaign: string
  Brand: string
  Country: string
  Affiliate: string
  Box?: string
  [key: string]: any
}

export default function LeadSummaryProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const processLeadData = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setProcessing(true)

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const data: LeadData[] = XLSX.utils.sheet_to_json(sheet)

      // Clean data - remove test entries
      const originalCount = data.length
      const cleanData = data.filter(row => 
        !Object.values(row).some(value => 
          String(value).toLowerCase().includes('test')
        )
      )
      const removedCount = originalCount - cleanData.length

      // Add helper columns
      const processedData = cleanData.map(row => ({
        ...row,
        Lead_Count: ['LEAD', 'DEPOSITOR'].includes(row.Type) ? 1 : 0,
        FTD_Count: row.Type === 'DEPOSITOR' ? 1 : 0
      }))

      // Generate summaries
      const brandSummary = generateBrandSummary(processedData)
      const affiliateSummary = generateAffiliateSummary(processedData)
      const crSummary = generateCRSummary(processedData)

      setResults({
        originalCount,
        cleanedCount: cleanData.length,
        removedCount,
        brandSummary,
        affiliateSummary,
        crSummary
      })

    } catch (error) {
      console.error('Processing error:', error)
      alert('Error processing file. Please check the format.')
    } finally {
      setProcessing(false)
    }
  }

  const generateBrandSummary = (data: any[]) => {
    const grouped = data.reduce((acc, row) => {
      const key = `${row.Campaign}_${row.Brand}_${row.Country}`
      if (!acc[key]) {
        acc[key] = {
          Campaign: row.Campaign,
          Brand: row.Brand,
          Country: row.Country,
          'Total leads': 0,
          'Total FTD\'s': 0
        }
      }
      acc[key]['Total leads'] += row.Lead_Count
      acc[key]['Total FTD\'s'] += row.FTD_Count
      return acc
    }, {})

    return Object.values(grouped).map((item: any) => ({
      ...item,
      'CR (%)': item['Total leads'] > 0 
        ? Number((item['Total FTD\'s'] / item['Total leads'] * 100).toFixed(2))
        : 0
    }))
  }

  const generateAffiliateSummary = (data: any[]) => {
    const grouped = data.reduce((acc, row) => {
      const key = `${row.Affiliate}_${row.Country}`
      if (!acc[key]) {
        acc[key] = {
          Affiliate: row.Affiliate,
          Country: row.Country,
          'Total leads': 0,
          'Total FTD\'s': 0
        }
      }
      acc[key]['Total leads'] += row.Lead_Count
      acc[key]['Total FTD\'s'] += row.FTD_Count
      return acc
    }, {})

    return Object.values(grouped).map((item: any) => ({
      ...item,
      'CR (%)': item['Total leads'] > 0 
        ? Number((item['Total FTD\'s'] / item['Total leads'] * 100).toFixed(2))
        : 0
    }))
  }

  const generateCRSummary = (data: any[]) => {
    const grouped = data.reduce((acc, row) => {
      const key = `${row.Campaign}_${row.Box || ''}_${row.Brand}_${row.Country}_${row.Affiliate}`
      if (!acc[key]) {
        acc[key] = {
          Campaign: row.Campaign,
          Box: row.Box || '',
          Brand: row.Brand,
          Country: row.Country,
          Affiliate: row.Affiliate,
          'Total leads': 0,
          'Total FTD\'s': 0
        }
      }
      acc[key]['Total leads'] += row.Lead_Count
      acc[key]['Total FTD\'s'] += row.FTD_Count
      return acc
    }, {})

    return Object.values(grouped).map((item: any) => ({
      ...item,
      'CR (%)': item['Total leads'] > 0 
        ? Number((item['Total FTD\'s'] / item['Total leads'] * 100).toFixed(2))
        : 0
    }))
  }

  const downloadExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Summary')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lead Summary Generator</h2>
      
      <FileUpload
        onFileUpload={processLeadData}
        label="Upload Raw Data File"
        description="CSV or Excel file with lead data"
      />

      {processing && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Processing file...</span>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">
                File processed successfully! Removed {results.removedCount} test entries.
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => downloadExcel(results.brandSummary, 'brand_summary.xlsx')}
              className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={20} />
              <span>Brand Summary</span>
            </button>

            <button
              onClick={() => downloadExcel(results.affiliateSummary, 'affiliate_summary.xlsx')}
              className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={20} />
              <span>Affiliate Summary</span>
            </button>

            <button
              onClick={() => downloadExcel(results.crSummary, 'cr_summary.xlsx')}
              className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Download size={20} />
              <span>CR Summary</span>
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Processing Summary</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{results.originalCount}</div>
                <div className="text-sm text-gray-600">Original Records</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{results.cleanedCount}</div>
                <div className="text-sm text-gray-600">Clean Records</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{results.removedCount}</div>
                <div className="text-sm text-gray-600">Test Records Removed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 