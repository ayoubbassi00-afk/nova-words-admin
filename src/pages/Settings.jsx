import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FIREBASE_PROJECT_ID } from '../firebase'

export default function Settings() {
  const { user, updateEmail, updatePassword } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  const [pwdCurrentPassword, setPwdCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [submittingEmail, setSubmittingEmail] = useState(false)
  const [submittingPassword, setSubmittingPassword] = useState(false)

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setEmailMessage({ type: '', text: '' })
    if (!newEmail.trim()) return
    setSubmittingEmail(true)
    try {
      await updateEmail(newEmail.trim(), emailCurrentPassword)
      setEmailMessage({ type: 'success', text: 'Email updated successfully.' })
      setNewEmail('')
      setEmailCurrentPassword('')
    } catch (err) {
      setEmailMessage({
        type: 'error',
        text: err.message || 'Failed to update email.',
      })
    } finally {
      setSubmittingEmail(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'Password must be at least 6 characters.',
      })
      return
    }
    setSubmittingPassword(true)
    try {
      await updatePassword(pwdCurrentPassword, newPassword)
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' })
      setPwdCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.message || 'Failed to update password.',
      })
    } finally {
      setSubmittingPassword(false)
    }
  }

  function Message({ message }) {
    if (!message.text) return null
    const colors =
      message.type === 'success'
        ? 'border-green-500/50 bg-green-500/10 text-green-300'
        : 'border-red-500/50 bg-red-500/10 text-red-300'
    return (
      <div className={`rounded-nova border px-4 py-3 text-sm ${colors}`}>
        {message.text}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Settings</h1>
      <p className="text-nova-muted mb-8">Manage your admin account and project info.</p>

      <div className="mb-6 rounded-nova bg-nova-card border border-white/10 p-6">
        <h2 className="mb-2 font-semibold text-white">Firebase Project</h2>
        <p className="text-nova-muted text-sm">Project ID</p>
        <p className="mt-1 font-mono text-nova-gold">{FIREBASE_PROJECT_ID}</p>
        <p className="text-nova-muted mt-4 text-sm">
          Signed in as <span className="text-white">{user?.email}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-nova bg-nova-card border border-white/10 p-6">
          <h2 className="mb-4 font-semibold text-white">Change Email</h2>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Message message={emailMessage} />
            <div>
              <label htmlFor="newEmail" className="text-nova-muted mb-1.5 block text-sm">
                New Email
              </label>
              <input
                id="newEmail"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 text-white outline-none focus:border-nova-gold"
              />
            </div>
            <div>
              <label htmlFor="emailPassword" className="text-nova-muted mb-1.5 block text-sm">
                Current Password
              </label>
              <input
                id="emailPassword"
                type="password"
                required
                value={emailCurrentPassword}
                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 text-white outline-none focus:border-nova-gold"
              />
            </div>
            <button
              type="submit"
              disabled={submittingEmail}
              className="rounded-nova bg-nova-gold px-4 py-2.5 text-sm font-semibold text-nova-bg hover:bg-nova-gold-dark disabled:opacity-60"
            >
              {submittingEmail ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>

        <div className="rounded-nova bg-nova-card border border-white/10 p-6">
          <h2 className="mb-4 font-semibold text-white">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Message message={passwordMessage} />
            <div>
              <label htmlFor="pwdCurrent" className="text-nova-muted mb-1.5 block text-sm">
                Current Password
              </label>
              <input
                id="pwdCurrent"
                type="password"
                required
                value={pwdCurrentPassword}
                onChange={(e) => setPwdCurrentPassword(e.target.value)}
                className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 text-white outline-none focus:border-nova-gold"
              />
            </div>
            <div>
              <label htmlFor="pwdNew" className="text-nova-muted mb-1.5 block text-sm">
                New Password
              </label>
              <input
                id="pwdNew"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 text-white outline-none focus:border-nova-gold"
              />
            </div>
            <div>
              <label htmlFor="pwdConfirm" className="text-nova-muted mb-1.5 block text-sm">
                Confirm New Password
              </label>
              <input
                id="pwdConfirm"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 text-white outline-none focus:border-nova-gold"
              />
            </div>
            <button
              type="submit"
              disabled={submittingPassword}
              className="rounded-nova bg-nova-gold px-4 py-2.5 text-sm font-semibold text-nova-bg hover:bg-nova-gold-dark disabled:opacity-60"
            >
              {submittingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
