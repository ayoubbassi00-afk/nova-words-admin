import { useCallback, useEffect, useState } from 'react'
import StatsCard from '../components/StatsCard'
import { getDashboardStats } from '../services/firestore'

const EMPTY_STATS = {
  totalWords: 0,
  totalWorlds: 0,
  totalLevels: 0,
  lastUpdated: null,
}

function formatDate(isoString) {
  if (!isoString) return 'Never'
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function Dashboard() {
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data)
      setIsConnected(true)
    } catch {
      setStats(EMPTY_STATS)
      setIsConnected(typeof navigator !== 'undefined' ? navigator.onLine : false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    const handleOnline = () => setIsConnected(true)
    const handleOffline = () => setIsConnected(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-nova-muted">
            Overview of your Nova Words content database.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-nova-muted">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-500'
              }`}
              aria-hidden="true"
            />
            <span>{isConnected ? 'Connected' : 'Offline'}</span>
          </div>
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="rounded-nova bg-nova-gold px-4 py-2 text-sm font-semibold text-nova-bg transition-colors hover:bg-nova-gold-dark disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-nova-muted mb-6">Loading dashboard...</p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Words"
          value={stats.totalWords.toLocaleString()}
          icon="📝"
        />
        <StatsCard
          label="Total Worlds"
          value={stats.totalWorlds.toLocaleString()}
          icon="🌍"
        />
        <StatsCard
          label="Total Levels"
          value={stats.totalLevels.toLocaleString()}
          icon="🎯"
        />
        <StatsCard
          label="Last Updated"
          value={formatDate(stats.lastUpdated)}
          icon="🕐"
        />
      </div>
    </div>
  )
}
