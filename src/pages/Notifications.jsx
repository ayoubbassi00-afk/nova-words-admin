import { useCallback, useEffect, useState } from 'react'
import StatsCard from '../components/StatsCard'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import {
  countRecipients,
  formatTargetLabel,
  getNotificationHistory,
  getNotificationUserStats,
  sendNotification,
} from '../services/notifications'

function formatDate(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const EMPTY_USER_STATS = { total: 0, ios: 0, android: 0 }

export default function Notifications() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState(EMPTY_USER_STATS)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadPageData = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const [stats, notifications] = await Promise.all([
        getNotificationUserStats(),
        getNotificationHistory(),
      ])
      setUserStats(stats)
      setHistory(notifications)
    } catch {
      setUserStats(EMPTY_USER_STATS)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  async function handleSendClick(e) {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    if (!title.trim() || !message.trim()) {
      setErrorMessage('Please enter both a title and message.')
      return
    }

    try {
      const count = await countRecipients(target)
      setPendingCount(count)
      setConfirmOpen(true)
    } catch {
      setErrorMessage('Unable to load recipient count. Please try again.')
    }
  }

  async function handleConfirmSend() {
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const result = await sendNotification({
        title,
        message,
        target,
        sentBy: user?.email ?? 'admin',
      })

      setConfirmOpen(false)
      setSuccessMessage(`Notification sent to ${result.recipientCount} users!`)
      setTitle('')
      setMessage('')
      setTarget('all')
      await loadPageData()
    } catch {
      setErrorMessage('Failed to send notification. Please try again.')
      setConfirmOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Notifications</h1>
      <p className="text-nova-muted mb-8">
        Send push notifications to Nova Words players.
      </p>

      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <StatsCard
          label="Users Enabled"
          value={loading ? '…' : userStats.total.toLocaleString()}
          icon="🔔"
        />
        <StatsCard
          label="iOS Users"
          value={loading ? '…' : userStats.ios.toLocaleString()}
          icon="📱"
        />
        <StatsCard
          label="Android Users"
          value={loading ? '…' : userStats.android.toLocaleString()}
          icon="🤖"
        />
      </div>

      <div className="mb-8 rounded-nova bg-nova-card border border-white/10 p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold text-white">Send Notification</h2>
        <p className="text-nova-muted mb-6 text-sm">
          Compose a message and choose who should receive it.
        </p>

        {successMessage && (
          <div className="mb-4 rounded-nova border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-nova border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSendClick} className="space-y-5">
          <div>
            <label htmlFor="notifTitle" className="text-nova-muted mb-1.5 block text-sm">
              Title
            </label>
            <input
              id="notifTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Daily Reminder"
              className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-3 text-white outline-none focus:border-nova-gold focus:ring-1 focus:ring-nova-gold"
            />
          </div>

          <div>
            <label htmlFor="notifMessage" className="text-nova-muted mb-1.5 block text-sm">
              Message
            </label>
            <textarea
              id="notifMessage"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your chest is ready!"
              className="w-full resize-y rounded-nova border border-white/10 bg-nova-bg px-4 py-3 text-white outline-none focus:border-nova-gold focus:ring-1 focus:ring-nova-gold"
            />
          </div>

          <div>
            <label htmlFor="notifTarget" className="text-nova-muted mb-1.5 block text-sm">
              Target
            </label>
            <select
              id="notifTarget"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-3 text-white outline-none focus:border-nova-gold"
            >
              <option value="all">All Users</option>
              <option value="ios">iOS Only</option>
              <option value="android">Android Only</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-nova bg-nova-gold py-3.5 text-base font-semibold text-nova-bg transition-colors hover:bg-nova-gold-dark disabled:opacity-60"
          >
            Send Notification 📢
          </button>
        </form>
      </div>

      <div className="rounded-nova bg-nova-card border border-white/10 overflow-hidden shadow-lg">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Notification History</h2>
        </div>

        {loading ? (
          <p className="text-nova-muted px-6 py-8">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-nova-muted px-6 py-8 text-center">
            No notifications sent yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-nova-muted text-sm">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Message</th>
                  <th className="px-6 py-3 font-medium">Target</th>
                  <th className="px-6 py-3 font-medium">Recipients</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5">
                    <td className="text-nova-muted whitespace-nowrap px-6 py-4 text-sm">
                      {formatDate(entry.sentAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{entry.title}</td>
                    <td className="text-nova-muted max-w-xs px-6 py-4 text-sm">
                      {entry.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatTargetLabel(entry.target)}
                    </td>
                    <td className="px-6 py-4 text-sm text-nova-gold">
                      {entry.recipientCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        title="Confirm Send"
        onClose={() => !submitting && setConfirmOpen(false)}
      >
        <p className="text-nova-muted mb-6 text-sm">
          You are about to send to {pendingCount.toLocaleString()} users. Continue?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={submitting}
            className="flex-1 rounded-nova border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSend}
            disabled={submitting}
            className="flex-1 rounded-nova bg-nova-gold px-4 py-2.5 text-sm font-semibold text-nova-bg hover:bg-nova-gold-dark disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Continue'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
