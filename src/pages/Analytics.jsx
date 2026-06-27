import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import StatsCard from '../components/StatsCard'
import { formatDuration, getAnalyticsStats } from '../services/analytics'

const chartTooltipStyle = {
  backgroundColor: '#2D1B69',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
}

const axisStyle = { fill: '#a89fd4', fontSize: 12 }
const gridStyle = { stroke: 'rgba(255,255,255,0.08)' }

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-nova bg-nova-card border border-white/10 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-nova-muted mt-1 text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function EmptyChartMessage({ message }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-nova bg-nova-bg/40 text-nova-muted text-sm">
      {message}
    </div>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalyticsStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-nova-muted">Loading analytics...</p>
  }

  if (error) {
    return (
      <div className="rounded-nova border border-red-500/50 bg-red-500/10 p-4 text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Analytics</h1>
      <p className="text-nova-muted mb-8">
        Player activity and engagement from Firestore analytics events.
      </p>

      <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
        />
        <StatsCard
          label="Daily Active Users"
          value={stats.dailyActiveUsers.toLocaleString()}
          icon="📅"
        />
        <StatsCard
          label="Monthly Active Users"
          value={stats.monthlyActiveUsers.toLocaleString()}
          icon="🗓"
        />
        <StatsCard
          label="Avg. Level Completion"
          value={formatDuration(stats.averageCompletionSeconds)}
          icon="⏱"
        />
      </div>

      <ChartCard
        title="Daily Active Users"
        subtitle="Unique users per day over the last 30 days"
      >
        {stats.dailyUsersChart.every((entry) => entry.users === 0) ? (
          <EmptyChartMessage message="No user activity recorded in the last 30 days." />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyUsersChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                <XAxis
                  dataKey="day"
                  tick={axisStyle}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={axisStyle}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: '#FFD700' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#FFD700"
                  strokeWidth={3}
                  dot={{ fill: '#FFD700', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#FFD700' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Top 5 Most Played Levels" subtitle="Based on level_start events">
          {stats.topLevels.length === 0 ? (
            <EmptyChartMessage message="No level play data yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topLevels} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={axisStyle}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={140}
                    tick={axisStyle}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: '#FFD700' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="plays" name="Plays" fill="#FFD700" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Most Used Hints" subtitle="Based on hint_used events">
          {stats.topHints.length === 0 ? (
            <EmptyChartMessage message="No hint usage data yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topHints} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={axisStyle}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={120}
                    tick={axisStyle}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: '#FFD700' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="uses" name="Uses" fill="#FFD700" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
