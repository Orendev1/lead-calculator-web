# 🧮 Lead Calculator System

A modern web application for processing lead data and generating comprehensive reports. This system converts your lead and FTD data into organized Excel reports with calculations.

## 🌟 Features

- **Lead Summary Generator**: Processes raw lead data and generates summaries by brand, affiliate, and conversion rates
- **Money Balance Calculator**: Calculates payment balances between affiliates and brands
- **Full Report Generator**: Creates comprehensive reports with cost, income, and P&L analysis
- **Modern Web Interface**: Responsive design that works on any device
- **File Processing**: Supports CSV and Excel file uploads
- **Instant Downloads**: Generate and download Excel reports directly in your browser

## 🚀 Getting Started

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

To create a production build:

```bash
npm run build
```

## 📊 How to Use

### 1. Lead Summary Generator
- Upload a CSV or Excel file with your raw lead data
- The system will automatically remove test entries
- Download three summary reports:
  - **Brand Summary**: Grouped by Campaign + Brand + Country
  - **Affiliate Summary**: Grouped by Affiliate + Country  
  - **CR Summary**: Detailed breakdown with conversion rates

### 2. Money Balance Calculator
- Upload three files:
  - Cost data file
  - Income data file
  - Manual payments file (with "Money In" and "Money Out" sheets)
- Get calculated balance reports for both money in and money out

### 3. Full Report Generator
- Upload three files:
  - Raw data file
  - Rates file (with "Affiliate Rates" and "Brand Rates" sheets)
  - Manual payments file
- Generate a comprehensive Excel file with 5 sheets: COST, INCOME, MONEY IN, MONEY OUT, PROFIT & LOSS

## 🔧 File Requirements

### Input File Formats

**Raw Data Files:**
- Must contain columns: `Type`, `Campaign`, `Brand`, `Country`, `Affiliate`
- Optional: `Box` column for detailed analysis
- Supported formats: CSV, XLSX

**Rates File:**
- Must have two sheets: "Affiliate Rates" and "Brand Rates"
- Include columns: `CPA to Pay`, `CPA to Collect`, etc.

**Manual Payments File:**
- Must have two sheets: "Money In" and "Money Out"
- Include payment tracking data

## 🌐 Deployment

This application is configured for easy deployment on:

- **Netlify**: Simply connect your repository and deploy
- **Vercel**: Deploy with zero configuration
- **Any Static Host**: Build and upload the `out` folder

### Deploying to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `out`
5. Deploy!

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **File Processing**: SheetJS (xlsx)
- **UI Components**: Lucide React icons
- **File Handling**: React Dropzone

## 📁 Project Structure

```
lead-calculator-web/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── FileUpload.tsx
│   ├── LeadSummaryProcessor.tsx
│   ├── MoneyBalanceProcessor.tsx
│   └── FullReportProcessor.tsx
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔄 Migration from Original System

This web application replaces the original Streamlit-based system with the following improvements:

- ✅ **Cross-platform access**: Works on any device with a browser
- ✅ **No local installation**: No need for Python/Streamlit setup
- ✅ **Modern UI**: Better user experience and responsive design
- ✅ **Cloud deployment**: Access from anywhere
- ✅ **File security**: No files saved on server, everything processed in browser

## 📞 Support

 