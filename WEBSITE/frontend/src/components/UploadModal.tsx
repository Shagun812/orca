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
  const [observedAt, setObservedAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [bbox, setBbox] = useState(['80.1', '15.2', '81.4', '16.3'])
  const [weather, setWeather] = useState({ windSpeed: '', windDirection: '', currentSpeed: '', currentDirection: '' })
  const [aisFile, setAisFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const aisInputRef = useRef<HTMLInputElement>(null)

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

  const toVector = (speed: number, direction: number) => {
    const radians = direction * Math.PI / 180
    return { u: speed * Math.sin(radians), v: speed * Math.cos(radians) }
  }

  const parseAisCsv = async (source: File) => {
    const [header, ...rows] = (await source.text()).trim().split(/\r?\n/)
    const fields = header.split(',').map((field) => field.trim())
    const required = ['mmsi', 'timestamp', 'latitude', 'longitude', 'speed_knots', 'course_deg']
    if (required.some((field) => !fields.includes(field))) throw new Error(`AIS CSV needs: ${required.join(', ')}`)
    return rows.filter(Boolean).map((row) => {
      const values = row.split(',').map((value) => value.trim())
      const record = Object.fromEntries(fields.map((field, index) => [field, values[index] || undefined])) as Record<string, string | undefined>
      return { ...record, latitude: Number(record.latitude), longitude: Number(record.longitude), speed_knots: Number(record.speed_knots), course_deg: Number(record.course_deg), heading_deg: record.heading_deg ? Number(record.heading_deg) : null }
    })
  }

  const handleUploadAndDetect = async () => {
    if (!file) return
    const coordinates = bbox.map(Number)
    const measurements = Object.fromEntries(Object.entries(weather).map(([key, value]) => [key, Number(value)])) as Record<string, number>
    if (!observedAt || coordinates.some((value) => !Number.isFinite(value)) || coordinates[0] >= coordinates[2] || coordinates[1] >= coordinates[3]) {
      setError('Enter a valid observation time and bounding box: west, south, east, north.')
      return
    }
    if (Object.values(measurements).some((value) => !Number.isFinite(value)) || measurements.windSpeed < 0 || measurements.currentSpeed < 0 || measurements.windDirection < 0 || measurements.windDirection > 360 || measurements.currentDirection < 0 || measurements.currentDirection > 360) { setError('Enter wind/current speeds and directions (directions are 0–360°).'); return }
    setUploading(true)
    setError('')

    try {
      const aisPositions = aisFile ? await parseAisCsv(aisFile) : []
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
          observed_at: new Date(observedAt).toISOString(),
          bbox: coordinates,
          image_path: uploadData.image_path,
        }),
      })

      if (!detectResp.ok) {
        throw new Error('Failed to start detection job')
      }

      const detectData = await detectResp.json()
      const wind = toVector(measurements.windSpeed, measurements.windDirection)
      const current = toVector(measurements.currentSpeed, measurements.currentDirection)
      sessionStorage.setItem(`case-inputs-${detectData.investigation_id}`, JSON.stringify({ current_u_mps: current.u, current_v_mps: current.v, wind_u_mps: wind.u, wind_v_mps: wind.v, ais_positions: aisPositions }))
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="intake-modal relative my-auto w-full max-w-3xl glass-level-3 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md text-[var(--color-text-white)]">Upload Satellite Imagery</h2>
          <button onClick={onClose} className="btn-ghost px-2 py-1 text-xl leading-none">&times;</button>
        </div>

        <div className="intake-location grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <label className="text-label-sm text-[var(--color-muted)]">Observed at
            <input type="datetime-local" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-body-sm text-white outline-none focus:border-[var(--color-signal-amber)]" required />
          </label>
          <div className="text-label-sm text-[var(--color-muted)]">Bounding box <span className="normal-case text-[9px]">west, south, east, north</span>
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {bbox.map((value, index) => <label key={index} className="bbox-field"><span>{['W', 'S', 'E', 'N'][index]}</span><input aria-label={['West longitude', 'South latitude', 'East longitude', 'North latitude'][index]} type="number" step="any" value={value} onChange={(event) => setBbox((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}
            </div>
          </div>
        </div>

        <p className="intake-description text-body-md text-[var(--color-muted-light)] mb-5">
          Upload a SAR or optical satellite image. The AI model will analyze it for oil spill detection,
          then run drift modelling and vessel attribution automatically.
        </p>

        <div className="intake-environment grid grid-cols-2 gap-3 mb-5">
          {([['windSpeed', 'Wind speed (m/s)', '0'], ['windDirection', 'Wind direction (°)', '0–360'], ['currentSpeed', 'Current speed (m/s)', '0'], ['currentDirection', 'Current direction (°)', '0–360']] as const).map(([key, label, placeholder]) => <label key={key} className="text-label-sm text-[var(--color-muted)]">{label}<input required type="number" min="0" max={key.includes('Direction') ? 360 : undefined} step="any" placeholder={placeholder} value={weather[key]} onChange={(event) => setWeather((value) => ({ ...value, [key]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-body-sm text-white outline-none focus:border-[var(--color-signal-amber)]" /></label>)}
        </div>

        <div className="intake-ais block mb-5 rounded-xl border border-dashed border-white/15 p-4 text-body-sm text-[var(--color-muted-light)]"><span className="text-label-sm text-[var(--color-electric-cyan)]">03 · Vessel traffic</span><span className="mt-1 block text-body-md text-white">Add the AIS records for this incident <span className="text-[var(--color-muted)]">(optional)</span></span><input ref={aisInputRef} type="file" accept=".csv,text/csv" onChange={(event) => setAisFile(event.target.files?.[0] || null)} className="hidden" /><div className="mt-3 flex items-center gap-3"><button type="button" onClick={() => aisInputRef.current?.click()} className="ais-choose">Choose AIS CSV</button><span className="truncate text-body-sm text-[var(--color-muted)]">{aisFile?.name || 'No file selected'}</span></div><a href="/ais-test-data.csv" download className="mt-3 inline-block text-label-sm text-[var(--color-electric-cyan)] hover:underline">Download test AIS data</a><span className="mt-2 block text-label-sm text-[var(--color-muted)]">Required: MMSI, timestamp, latitude, longitude, speed_knots, course_deg. Optional: heading_deg, vessel_type, IMO, vessel_name.</span></div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30">
            <p className="text-body-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          className={`intake-dropzone border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
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

          <div className="intake-drop-icon">↥</div>
          {file ? (
            <div>
              <p className="text-body-md text-[var(--color-text-white)] font-medium mb-1">{file.name}</p>
              <p className="text-body-sm text-[var(--color-muted)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB — Click or drop to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-headline-sm text-[var(--color-text-white)] mb-2">
                Drag & drop a satellite image
              </p>
              <p className="text-body-sm text-[var(--color-muted)]">
                GeoTIFF, TIFF, PNG, or JPG · or click to browse
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
