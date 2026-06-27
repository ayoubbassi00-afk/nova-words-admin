export default function StatsCard({ label, value, icon }) {
  return (
    <div className="rounded-nova bg-nova-card border border-white/10 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-nova-muted text-sm font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <span className="text-3xl" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}
