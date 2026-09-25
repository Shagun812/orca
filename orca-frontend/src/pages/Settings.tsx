import { useState } from 'react'

export default function Settings() {
  const [preferences, setPreferences] = useState({
    showRawAis: true,
    showConfidenceOverlays: true,
    alertHighConfidence: true,
    dailyDigest: false,
    autoDriftModeling: true,
    displayShipNames: false,
  })

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const ToggleRow = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between py-5 border-b border-white/[0.05] last:border-0 group hover:bg-white/[0.01] transition-colors -mx-6 px-6">
      <div className="space-y-1">
        <label className="text-sm font-bold text-white uppercase tracking-widest cursor-pointer group-hover:text-gray-300 transition-colors" onClick={onChange}>
          {label}
        </label>
        <p className="text-[10px] text-[var(--color-muted)] font-mono uppercase tracking-wider">
          {description}
        </p>
      </div>
      <div className="relative flex items-center cursor-pointer" onClick={onChange}>
        <div className={`w-10 h-5 border transition-colors flex items-center px-0.5 ${checked ? 'border-white bg-white/10' : 'border-white/20 bg-transparent'}`}>
          <div className={`w-3.5 h-3.5 bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0 opacity-50'}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 relative z-10 pb-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 animate-slide-up">
        <div className="space-y-3 relative">
          <h1 className="relative text-5xl font-bold tracking-tight text-white z-10">
            Settings
          </h1>
          <p className="relative text-lg text-[var(--color-muted)] font-light z-10 max-w-2xl">
            System configuration, automation logic, and visibility preferences.
          </p>
        </div>
        <button className="btn-ghost rounded-none border border-white/20 text-xs px-6 py-3 uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all">
          SIGN OUT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Left Column */}
        <div className="space-y-12">
          
          {/* Account Profile */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.1] pb-4">
              <h2 className="text-sm uppercase tracking-widest text-white">Analyst Profile</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-mono text-[var(--color-muted)] mb-2 block uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value="analyst@orca.ai" 
                  disabled 
                  className="w-full bg-transparent border-b border-white/[0.05] py-3 text-white font-mono text-sm opacity-50 cursor-not-allowed focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-mono text-[var(--color-muted)] mb-2 block uppercase tracking-widest">Clearance Level</label>
                  <div className="text-sm font-bold text-white uppercase tracking-widest">Level 4 (Admin)</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--color-muted)] mb-2 block uppercase tracking-widest">Region</label>
                  <div className="text-sm font-bold text-white uppercase tracking-widest">Global</div>
                </div>
              </div>
            </div>
          </section>

          {/* Interface & Map Settings */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.1] pb-4">
              <h2 className="text-sm uppercase tracking-widest text-white">Map & Visibility Preferences</h2>
            </div>
            <div className="border border-white/[0.05] p-6 bg-white/[0.03] backdrop-blur-xl">
              <ToggleRow 
                label="Show Raw AIS Data" 
                description="Display all vessel pings on map by default"
                checked={preferences.showRawAis}
                onChange={() => togglePreference('showRawAis')}
              />
              <ToggleRow 
                label="Confidence Overlays" 
                description="Render ML probability heatmaps over SAR imagery"
                checked={preferences.showConfidenceOverlays}
                onChange={() => togglePreference('showConfidenceOverlays')}
              />
              <ToggleRow 
                label="Display Ship Names" 
                description="Show vessel names instead of MMSI codes on markers"
                checked={preferences.displayShipNames}
                onChange={() => togglePreference('displayShipNames')}
              />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-12">
          
          {/* Notification Preferences */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.1] pb-4">
              <h2 className="text-sm uppercase tracking-widest text-white">Alerts & Notifications</h2>
            </div>
            <div className="border border-white/[0.05] p-6 bg-white/[0.03] backdrop-blur-xl">
              <ToggleRow 
                label="High Confidence Alerts" 
                description="Notify when a spill is detected with >90% probability"
                checked={preferences.alertHighConfidence}
                onChange={() => togglePreference('alertHighConfidence')}
              />
              <ToggleRow 
                label="Daily Intelligence Digest" 
                description="Receive a summary of all regional activity at 00:00 UTC"
                checked={preferences.dailyDigest}
                onChange={() => togglePreference('dailyDigest')}
              />
            </div>
          </section>

          {/* System Automation */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.1] pb-4">
              <h2 className="text-sm uppercase tracking-widest text-white">System Automation</h2>
            </div>
            <div className="border border-white/[0.05] p-6 bg-white/[0.03] backdrop-blur-xl">
              <ToggleRow 
                label="Auto Drift Modeling" 
                description="Automatically run ocean current models on new detections"
                checked={preferences.autoDriftModeling}
                onChange={() => togglePreference('autoDriftModeling')}
              />
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-8">
            <div className="border border-red-500/20 p-6 bg-red-500/[0.02]">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Clear Local Data</h3>
              <p className="text-[10px] text-[var(--color-muted)] font-mono uppercase tracking-wider mb-6">
                Remove all cached investigations and map tiles from this device.
              </p>
              <button className="btn-ghost rounded-none border border-red-500/30 text-xs px-6 py-2.5 uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-colors w-full sm:w-auto">
                WIPE CACHE
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
