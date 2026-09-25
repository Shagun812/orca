import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type TelemetryData = {
  db_latency_ms: number;
  ml_api_latency_ms: number;
  ml_api_status: string;
  active_cases: number;
  ram_usage_mb: number;
  total_ram_mb: number;
}

async function fetchTelemetry(): Promise<TelemetryData> {
  const response = await fetch('/api/v1/telemetry')
  if (!response.ok) throw new Error('Network response was not ok')
  return response.json()
}

export default function Telemetry() {
  const { data, isError, error } = useQuery({
    queryKey: ['telemetry'],
    queryFn: fetchTelemetry,
    refetchInterval: 5000,
  })

  const [latencyHistory, setLatencyHistory] = useState<any[]>([])
  const [queueData, setQueueData] = useState<any[]>([])

  useEffect(() => {
    if (data) {
      const now = new Date()
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      
      setLatencyHistory(prev => {
        const newHist = [...prev, { time: timeStr, ml_latency: data.ml_api_latency_ms, db_latency: data.db_latency_ms }]
        if (newHist.length > 20) newHist.shift()
        return newHist
      })

      // The backend gives us a total active cases number. 
      // In a more complex setup, we'd fetch per-node queues, but for now we'll visualize the active cases as one bar.
      setQueueData([
        { node: 'Global Queue', tasks: data.active_cases },
      ])
    }
  }, [data])

  const loading = !data && !isError

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 relative z-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-3 relative">
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
            System Telemetry
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10 max-w-2xl">
            Real-time inference metrics, microservice health, and compute resource allocation.
          </p>
        </div>
        <div className="flex items-center gap-3 border border-white/20 px-4 py-2 bg-white/[0.02]">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isError ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-xs uppercase tracking-widest text-white font-mono">
            {isError ? 'API Error' : 'System Polling Active'}
          </span>
        </div>
      </div>

      {isError && (
        <div className="border border-red-500/20 p-6 bg-red-500/[0.02] text-red-400 font-mono text-sm tracking-wider uppercase animate-slide-up">
          Error fetching telemetry: {error instanceof Error ? error.message : 'Unknown Error'}
        </div>
      )}

      {loading && (
        <div className="animate-pulse flex items-center justify-center py-20 text-white/30 uppercase tracking-widest font-mono text-sm">
          Establishing Uplink...
        </div>
      )}

      {!loading && !isError && data && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {[
              { label: 'ML API Latency', value: data.ml_api_latency_ms.toString(), unit: 'ms', trend: data.ml_api_status },
              { label: 'Active Cases', value: data.active_cases.toString(), unit: 'cases', trend: 'Processing' },
              { label: 'RAM Utilization', value: Math.round((data.ram_usage_mb / Math.max(1, data.total_ram_mb)) * 100).toString(), unit: '%', trend: `${data.ram_usage_mb} MB` },
              { label: 'Database Ping', value: data.db_latency_ms.toString(), unit: 'ms', trend: 'Stable' },
            ].map((kpi, i) => (
              <div key={i} className="border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 pt-6 flex flex-col gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--color-muted)]">{kpi.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-light text-white font-mono">{kpi.value}</span>
                  <span className="text-sm font-mono text-white/50">{kpi.unit}</span>
                </div>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{kpi.trend}</span>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Latency Time-Series */}
            <div className="border border-white/[0.05] bg-white/[0.03] backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">API Latency (ms)</h3>
                <span className="text-[9px] font-mono text-white/50 border border-white/10 px-2 py-1">LIVE POLLING</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0' }}
                      itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line type="step" dataKey="ml_latency" name="ML Service" stroke="#ffffff" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="step" dataKey="db_latency" name="PostgreSQL" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Queue Distribution */}
            <div className="border border-white/[0.05] bg-white/[0.03] backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Active Queue</h3>
                <span className="text-[9px] font-mono text-white/50 border border-white/10 px-2 py-1">LIVE</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="node" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0' }}
                      itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Bar dataKey="tasks" name="Active Investigations" fill="#ffffff" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Services List */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6 border-b border-white/[0.05] pb-4">Service Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Core API Gateway', status: 'Online', uptime: '100%', ping: 'N/A' },
                { name: 'PostgreSQL Db', status: data.db_latency_ms < 100 ? 'Online' : 'High Latency', uptime: '99.9%', ping: `${data.db_latency_ms}ms`, alert: data.db_latency_ms > 100 },
                { name: 'ML Inference Engine', status: data.ml_api_status, uptime: '99.5%', ping: `${data.ml_api_latency_ms}ms`, alert: data.ml_api_status !== 'Online' },
              ].map((service, i) => (
                <div key={i} className={`p-5 border backdrop-blur-xl transition-colors ${service.alert ? 'border-red-500/40 bg-red-500/[0.05]' : 'border-white/[0.05] bg-white/[0.03]'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-white">{service.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${service.alert ? 'bg-red-500' : 'bg-green-500'}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-white/50">
                      <span>Status</span>
                      <span className="text-white">{service.status}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-white/50">
                      <span>Uptime</span>
                      <span className="text-white">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-white/50">
                      <span>Ping</span>
                      <span className="text-white">{service.ping}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
