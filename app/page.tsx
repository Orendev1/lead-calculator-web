'use client'

import { useState } from 'react'
import { Upload, Download, Calculator, DollarSign, TrendingUp } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import LeadSummaryProcessor from '@/components/LeadSummaryProcessor'
import MoneyBalanceProcessor from '@/components/MoneyBalanceProcessor'
import FullReportProcessor from '@/components/FullReportProcessor'

export default function Home() {
  const [activeTab, setActiveTab] = useState('leads')

  const tabs = [
    { id: 'leads', label: 'Lead Summary', icon: TrendingUp },
    { id: 'money', label: 'Money Balance', icon: DollarSign },
    { id: 'full', label: 'Full Report', icon: Calculator }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧮 Lead Calculator System
          </h1>
          <p className="text-lg text-gray-600">
            Advanced Lead & FTD Analysis Platform
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-1 flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {activeTab === 'leads' && <LeadSummaryProcessor />}
          {activeTab === 'money' && <MoneyBalanceProcessor />}
          {activeTab === 'full' && <FullReportProcessor />}
        </div>
      </div>
    </div>
  )
} 