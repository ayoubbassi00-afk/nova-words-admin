import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function formatDayKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDayLabel(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function getEventName(data) {
  return (data.eventName || data.event || data.name || '').toString()
}

function getUserId(data) {
  const id = data.userId || data.user_id || data.uid
  return id ? id.toString() : null
}

function getParam(data, key) {
  if (data[key] != null) return data[key]
  if (data.parameters && data.parameters[key] != null) {
    return data.parameters[key]
  }
  return null
}

function getTimestamp(data) {
  return toDate(
    data.timestamp || data.createdAt || data.created_at || data.loggedAt,
  )
}

function buildLast30DayKeys() {
  const keys = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    keys.push(formatDayKey(date))
  }

  return keys
}

function formatLevelLabel(worldName, levelNumber) {
  if (worldName && levelNumber != null) {
    return `${worldName} — Level ${levelNumber}`
  }
  if (levelNumber != null) return `Level ${levelNumber}`
  return 'Unknown Level'
}

function formatHintLabel(hintType) {
  if (!hintType) return 'Unknown'
  return hintType
    .toString()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function getAnalyticsStats() {
  const snap = await getDocs(collection(db, 'analytics_events'))
  const events = snap.docs.map((docSnap) => docSnap.data())

  const allUsers = new Set()
  const dailyUsers = new Map()
  const monthlyUsers = new Set()
  const levelCounts = new Map()
  const hintCounts = new Map()
  const completionTimes = []

  const todayKey = formatDayKey(new Date())
  const monthPrefix = todayKey.slice(0, 7)

  events.forEach((data) => {
    const userId = getUserId(data)
    const timestamp = getTimestamp(data)
    const eventName = getEventName(data)

    if (userId) {
      allUsers.add(userId)

      if (timestamp) {
        const dayKey = formatDayKey(timestamp)
        if (dayKey === todayKey) {
          if (!dailyUsers.has(dayKey)) dailyUsers.set(dayKey, new Set())
          dailyUsers.get(dayKey).add(userId)
        }
        if (dayKey.startsWith(monthPrefix)) {
          monthlyUsers.add(userId)
        }
      }
    }

    if (eventName === 'level_start') {
      const worldName = getParam(data, 'world_name')
      const levelNumber = getParam(data, 'level_number')
      const key = `${worldName ?? 'unknown'}::${levelNumber ?? 'unknown'}`
      const label = formatLevelLabel(worldName, levelNumber)
      const current = levelCounts.get(key) ?? { label, count: 0 }
      current.count += 1
      levelCounts.set(key, current)
    }

    if (eventName === 'hint_used') {
      const hintType = getParam(data, 'hint_type') || 'unknown'
      hintCounts.set(hintType, (hintCounts.get(hintType) ?? 0) + 1)
    }

    if (eventName === 'level_complete') {
      const seconds = Number(getParam(data, 'time_taken_seconds'))
      if (!Number.isNaN(seconds) && seconds >= 0) {
        completionTimes.push(seconds)
      }
    }
  })

  const usersByDay = new Map()
  events.forEach((data) => {
    const userId = getUserId(data)
    const timestamp = getTimestamp(data)
    if (!userId || !timestamp) return

    const dayKey = formatDayKey(timestamp)
    if (!usersByDay.has(dayKey)) usersByDay.set(dayKey, new Set())
    usersByDay.get(dayKey).add(userId)
  })

  const dailyUsersChart = buildLast30DayKeys().map((dayKey) => ({
    day: formatDayLabel(dayKey),
    users: usersByDay.get(dayKey)?.size ?? 0,
  }))

  const topLevels = [...levelCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((entry) => ({
      label: entry.label,
      plays: entry.count,
    }))

  const topHints = [...hintCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hintType, count]) => ({
      label: formatHintLabel(hintType),
      uses: count,
    }))

  const averageCompletionSeconds =
    completionTimes.length === 0
      ? 0
      : completionTimes.reduce((sum, value) => sum + value, 0) /
        completionTimes.length

  return {
    totalUsers: allUsers.size,
    dailyActiveUsers: dailyUsers.get(todayKey)?.size ?? 0,
    monthlyActiveUsers: monthlyUsers.size,
    dailyUsersChart,
    topLevels,
    topHints,
    averageCompletionSeconds,
    totalEvents: events.length,
  }
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s'
  const total = Math.round(seconds)
  const minutes = Math.floor(total / 60)
  const remainder = total % 60
  if (minutes === 0) return `${remainder}s`
  return `${minutes}m ${remainder}s`
}
