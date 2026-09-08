export default function Reports() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-headline-lg text-[var(--color-text-white)] mb-2">Reports & Exports</h1>
        <p className="text-body-lg text-[var(--color-muted-light)]">Generate evidentiary reports for closed investigations.</p>
      </div>

      <div className="glass-level-1 p-12 text-center rounded-xl border border-white/[0.06]">
        <div className="text-4xl mb-4 opacity-50"></div>
        <h3 className="text-headline-sm text-[var(--color-text-white)] mb-2">Reporting Module</h3>
        <p className="text-body-md text-[var(--color-muted)] mb-6">PDF report generation is currently unavailable in this environment.</p>
        <button className="btn-ghost" disabled>Configure Templates</button>
      </div>
    </div>
  )
}
