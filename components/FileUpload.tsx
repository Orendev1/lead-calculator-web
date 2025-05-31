'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  acceptedTypes?: string[]
  label: string
  description?: string
}

export default function FileUpload({ 
  onFileUpload, 
  acceptedTypes = ['.csv', '.xlsx'], 
  label,
  description 
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  })

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the file here...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              {description || `Accepts: ${acceptedTypes.join(', ')}`}
            </p>
          </>
        )}
      </div>
    </div>
  )
} 