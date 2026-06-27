import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

const METADATA_DOC = doc(db, 'settings', 'metadata')

export async function touchLastUpdated() {
  await setDoc(
    METADATA_DOC,
    { lastUpdated: new Date().toISOString() },
    { merge: true },
  )
}

export async function getLastUpdated() {
  const snap = await getDoc(METADATA_DOC)
  return snap.exists() ? snap.data().lastUpdated : null
}

export async function getWorlds() {
  const snap = await getDocs(query(collection(db, 'worlds'), orderBy('order')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getWorldLevelCount(worldId) {
  const snap = await getDocs(collection(db, 'worlds', worldId, 'levels'))
  return snap.size
}

export async function createWorld({ name, emoji }) {
  const worlds = await getWorlds()
  const maxOrder = worlds.reduce((max, w) => Math.max(max, w.order ?? 0), 0)
  const ref = await addDoc(collection(db, 'worlds'), {
    name: name.trim(),
    emoji,
    order: maxOrder + 1,
  })
  await touchLastUpdated()
  return ref.id
}

export async function deleteWorld(worldId) {
  const levelsSnap = await getDocs(collection(db, 'worlds', worldId, 'levels'))
  const batch = writeBatch(db)
  levelsSnap.docs.forEach((levelDoc) => batch.delete(levelDoc.ref))
  batch.delete(doc(db, 'worlds', worldId))
  await batch.commit()
  await touchLastUpdated()
}

export async function getLevels(worldId) {
  const snap = await getDocs(
    query(collection(db, 'worlds', worldId, 'levels'), orderBy('levelNumber')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createLevel(worldId) {
  const levels = await getLevels(worldId)
  const maxNumber = levels.reduce(
    (max, level) => Math.max(max, level.levelNumber ?? 0),
    0,
  )
  const ref = await addDoc(collection(db, 'worlds', worldId, 'levels'), {
    levelNumber: maxNumber + 1,
    words: [],
  })
  await touchLastUpdated()
  return ref.id
}

export async function deleteLevel(worldId, levelId) {
  await deleteDoc(doc(db, 'worlds', worldId, 'levels', levelId))
  await touchLastUpdated()
}

export async function updateLevelWords(worldId, levelId, words) {
  await setDoc(
    doc(db, 'worlds', worldId, 'levels', levelId),
    { words: words.map((w) => w.trim().toUpperCase()).filter(Boolean) },
    { merge: true },
  )
  await touchLastUpdated()
}

export async function getDashboardStats() {
  const worldsSnap = await getDocs(collection(db, 'worlds'))
  const levelsSnap = await getDocs(collectionGroup(db, 'levels'))

  let totalWords = 0
  levelsSnap.docs.forEach((levelDoc) => {
    const words = levelDoc.data().words ?? []
    totalWords += words.length
  })

  const lastUpdated = await getLastUpdated()

  return {
    totalWords,
    totalWorlds: worldsSnap.size,
    totalLevels: levelsSnap.size,
    lastUpdated,
  }
}
