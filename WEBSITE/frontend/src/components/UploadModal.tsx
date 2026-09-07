import { useState, useRef, useCallback } from 'react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (jobId: string, investigationId: string) => void
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError('')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleUploadAndDetect = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    try {
      // Step 1: Upload the satellite image
      setProgress('Uploading satellite imagery...')
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const uploadResp = await fetch('/api/v1/upload/satellite', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!uploadResp.ok) {
        const err = await uploadResp.json()
        throw new Error(err.error || 'Upload failed')
      }

      const uploadData = await uploadResp.json()

      // Step 2: Trigger detection with the uploaded image
      // The backend auto-creates an investigation and links everything
      setProgress('Starting spill detection analysis via MODEL...')
      const detectResp = await fetch('/api/v1/spills/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          image_id: uploadData.image_id,
          observed_at: new Date().toISOString(),
          bbox: [80.1, 15.2, 81.4, 16.3],
          image_path: uploadData.image_path,
        }),
      })

      if (!detectResp.ok) {
        throw new Error('Failed to start detection job')
      }

      const detectData = await detectResp.json()
      setProgress('Detection job created! Opening investigation...')

      setTimeout(() => {
        onUploadComplete(detectData.job_id, detectData.investigation_id)
      }, 500)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-level-3 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md text-[var(--color-text-white)]">Upload Satellite Imagery</h2>
          <button onClick={onClose} className="btn-ghost px-2 py-1 text-xl leading-none">&times;</button>
        </div>

        <p className="text-body-md text-[var(--color-muted-light)] mb-6">
          Upload a SAR or optical satellite image. The AI model will analyze it for oil spill detection,
          then run drift modelling and vessel attribution automatically.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30">
            <p className="text-body-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)] bg-opacity-5'
              : file
              ? 'border-emerald-500 border-opacity-40 bg-emerald-900 bg-opacity-10'
              : 'border-white border-opacity-10 hover:border-opacity-20'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div>
              <p className="text-body-md text-[var(--color-text-white)] font-medium mb-1">{file.name}</p>
              <p className="text-body-sm text-[var(--color-muted)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB — Click or drop to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-body-md text-[var(--color-muted-light)] mb-1">
                Drag & drop satellite image here
              </p>
              <p className="text-body-sm text-[var(--color-muted)]">
                or click to browse files
              </p>
            </div>
          )}
        </div>

        {/* Pipeline info */}
        <div className="mt-4 glass-level-1 rounded-lg p-4">
          <div className="text-label-sm text-[var(--color-muted)] mb-2">PIPELINE SEQUENCE</div>
          <div className="flex items-center gap-2 text-body-sm text-[var(--color-muted-light)]">
            <span className="text-[var(--color-signal-amber)]">Upload</span>
            <span className="text-[var(--color-muted)]">→</span>
            <span>MODEL /detect</span>
            <span className="text-[var(--color-muted)]">→</span>
            <span>MODEL /drift</span>
            <span className="text-[var(--color-muted)]">→</span>
            <span>MODEL /attribution</span>
          </div>
        </div>

        {/* Status */}
        {uploading && (
          <div className="mt-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[var(--color-signal-amber)] border-t-transparent rounded-full animate-spin" />
            <span className="text-body-sm text-[var(--color-signal-amber)]">{progress}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center" disabled={uploading}>
            Cancel
          </button>
          <button
            onClick={handleUploadAndDetect}
            className="btn-primary flex-1 justify-center"
            disabled={!file || uploading}
          >
            {uploading ? 'Processing...' : 'Upload & Analyze'}
          </button>
        </div>
      </div>
    </div>
  )
}
