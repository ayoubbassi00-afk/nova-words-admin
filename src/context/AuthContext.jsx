import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function logout() {
    await signOut(auth)
  }

  async function updateEmail(newEmail, currentPassword) {
    if (!auth.currentUser) throw new Error('Not signed in')
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword,
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    await firebaseUpdateEmail(auth.currentUser, newEmail)
  }

  async function updatePassword(currentPassword, newPassword) {
    if (!auth.currentUser) throw new Error('Not signed in')
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword,
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    await firebaseUpdatePassword(auth.currentUser, newPassword)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateEmail, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
