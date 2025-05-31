'use client'

import { useState } from 'react'
import { Download, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import FileUpload from './FileUpload'

export default function MoneyBalanceProcessor() {
  const [files, setFiles] = useState<{
    cost?: File
    income?: File
    manual?: File
  }>({})
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileUpload = (type: 'cost' | 'income' | 'manual') => (file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  const processFiles = async () => {
    if (!files.cost || !files.income || !files.manual) {
      alert('Please upload all three files')
      return
    }

    setProcessing(true)
    try {
      // Read cost file
      const costBuffer = await files.cost.arrayBuffer()
      const costWorkbook = XLSX.read(costBuffer, { type: 'array' })
      const costData = XLSX.utils.sheet_to_json(costWorkbook.Sheets[costWorkbook.SheetNames[0]])

      // Read income file  
      const incomeBuffer = await files.income.arrayBuffer()
      const incomeWorkbook = XLSX.read(incomeBuffer, { type: 'array' })
      const incomeData = XLSX.utils.sheet_to_json(incomeWorkbook.Sheets[incomeWorkbook.SheetNames[0]])

      // Read manual payments file
      const manualBuffer = await files.manual.arrayBuffer()
      const manualWorkbook = XLSX.read(manualBuffer, { type: 'array' })
      const manualOutData = XLSX.utils.sheet_to_json(manualWorkbook.Sheets['Money Out'])
      const manualInData = XLSX.utils.sheet_to_json(manualWorkbook.Sheets['Money In'])

      // Process Money Out
      const moneyOut = costData.map((costRow: any) => {
        const matchingPayment = manualOutData.find((paymentRow: any) => 
          paymentRow['Week Number'] === costRow['Week num'] &&
          paymentRow['Affiliate'] === costRow['Affiliate'] &&
          paymentRow['Box ID'] === costRow['Box ID'] &&
          paymentRow['Country'] === costRow['Country']
        )
        
        const paidAmount = matchingPayment ? (matchingPayment as any)['How Much We Paid'] || 0 : 0
        return {
          ...costRow,
          'How Much We Paid': paidAmount,
          'Balance': (costRow as any)['Total to Pay'] - paidAmount
        }
      })

      // Process Money In
      const moneyIn = incomeData.map((incomeRow: any) => {
        const matchingPayment = manualInData.find((paymentRow: any) => 
          paymentRow['Week Number'] === incomeRow['Week num'] &&
          paymentRow['Brand'] === incomeRow['Brand'] &&
          paymentRow['Campaign'] === incomeRow['Campaign'] &&
          paymentRow['Country'] === incomeRow['Country']
        )
        
        const receivedAmount = matchingPayment ? (matchingPayment as any)['Payment Received'] || 0 : 0
        return {
          ...incomeRow,
          'Payment Received': receivedAmount,
          'Balance': receivedAmount - (incomeRow as any)['Total to Collect']
        }
      })

      setResults({ moneyOut, moneyIn })
    } catch (error) {
      console.error('Processing error:', error)
      alert('Error processing files. Please check the format.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Balance')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  const allFilesUploaded = files.cost && files.income && files.manual

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Money Balance Calculator</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <FileUpload
          onFileUpload={handleFileUpload('cost')}
          label="Cost Data File"
          description="Raw data with cost calculations"
        />
        
        <FileUpload
          onFileUpload={handleFileUpload('income')}
          label="Income Data File"
          description="Raw data with income calculations"
        />
        
        <FileUpload
          onFileUpload={handleFileUpload('manual')}
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
            {processing ? 'Processing...' : 'Calculate Balances'}
          </button>
        </div>
      )}

      {processing && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Processing files...</span>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">
                Balance calculations completed successfully!
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => downloadExcel(results.moneyOut, 'Money_Out_Calculated.xlsx')}
              className="flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Download size={20} />
              <span>Money Out (with Balance)</span>
            </button>

            <button
              onClick={() => downloadExcel(results.moneyIn, 'Money_In_Calculated.xlsx')}
              className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={20} />
              <span>Money In (with Balance)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 