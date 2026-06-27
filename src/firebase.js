import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD4hsq4dM60ejyQu5C9zTI_kgY3wBcowus',
  authDomain: 'nova-words-c706f.firebaseapp.com',
  projectId: 'nova-words-c706f',
  storageBucket: 'nova-words-c706f.firebasestorage.app',
  messagingSenderId: '313117628973',
  appId: '1:313117628973:web:67f9f5f459f266d74ab6a4',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    return enableIndexedDbPersistence(db)
  }
  if (err.code !== 'unimplemented') {
    console.warn('Firestore persistence unavailable:', err)
  }
  return undefined
})
