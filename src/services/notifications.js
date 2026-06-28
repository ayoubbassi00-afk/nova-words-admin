import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

function hasValidToken(data) {
  const token = data.token
  return typeof token === 'string' && token.trim().length > 0
}

function getPlatform(data) {
  return (data.platform || '').toString().toLowerCase()
}

function matchesTarget(data, target) {
  if (!hasValidToken(data)) return false
  if (target === 'all') return true
  return getPlatform(data) === target
}

export async function getNotificationUserStats() {
  const snap = await getDocs(collection(db, 'users'))

  let total = 0
  let ios = 0
  let android = 0

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data()
    if (!hasValidToken(data)) return

    total += 1
    const platform = getPlatform(data)
    if (platform === 'ios') ios += 1
    else if (platform === 'android') android += 1
  })

  return { total, ios, android }
}

export async function countRecipients(target) {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.filter((docSnap) => matchesTarget(docSnap.data(), target)).length
}

export async function sendNotification({ title, message, target, sentBy }) {
  const recipientCount = await countRecipients(target)

  const ref = await addDoc(collection(db, 'notifications'), {
    title: title.trim(),
    message: message.trim(),
    target,
    sentAt: serverTimestamp(),
    sentBy,
    recipientCount,
  })

  return { id: ref.id, recipientCount }
}

export async function getNotificationHistory() {
  const snap = await getDocs(
    query(collection(db, 'notifications'), orderBy('sentAt', 'desc')),
  )

  return snap.docs.map((docSnap) => {
    const data = docSnap.data()
    let sentAt = data.sentAt

    if (sentAt && typeof sentAt.toDate === 'function') {
      sentAt = sentAt.toDate().toISOString()
    }

    return {
      id: docSnap.id,
      title: data.title ?? '',
      message: data.message ?? '',
      target: data.target ?? 'all',
      sentAt,
      sentBy: data.sentBy ?? '',
      recipientCount: data.recipientCount ?? 0,
    }
  })
}

export function formatTargetLabel(target) {
  switch (target) {
    case 'ios':
      return 'iOS Only'
    case 'android':
      return 'Android Only'
    default:
      return 'All Users'
  }
}
