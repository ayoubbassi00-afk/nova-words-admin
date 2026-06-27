import { useEffect, useState } from 'react'
import {
  getWorlds,
  getLevels,
  updateLevelWords,
} from '../services/firestore'

export default function WordsManager() {
  const [worlds, setWorlds] = useState([])
  const [levels, setLevels] = useState([])
  const [selectedWorldId, setSelectedWorldId] = useState('')
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [editedWords, setEditedWords] = useState([])
  const [newWord, setNewWord] = useState('')
  const [loading, setLoading] = useState(true)
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    getWorlds()
      .then(setWorlds)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedWorldId) {
      setLevels([])
      setSelectedLevelId('')
      return
    }
    setLevelsLoading(true)
    getLevels(selectedWorldId)
      .then((data) => {
        setLevels(data)
        setSelectedLevelId(data[0]?.id ?? '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLevelsLoading(false))
  }, [selectedWorldId])

  useEffect(() => {
    const level = levels.find((l) => l.id === selectedLevelId)
    if (level) {
      const levelWords = level.words ?? []
      setEditedWords([...levelWords])
      setDirty(false)
    } else {
      setEditedWords([])
    }
  }, [selectedLevelId, levels])

  function handleWordChange(index, value) {
    setEditedWords((prev) => {
      const next = [...prev]
      next[index] = value.toUpperCase()
      return next
    })
    setDirty(true)
    setSuccess('')
  }

  function handleDeleteWord(index) {
    setEditedWords((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
    setSuccess('')
  }

  function handleAddWord(e) {
    e.preventDefault()
    const word = newWord.trim().toUpperCase()
    if (!word) return
    setEditedWords((prev) => [...prev, word])
    setNewWord('')
    setDirty(true)
    setSuccess('')
  }

  async function handleSave() {
    if (!selectedWorldId || !selectedLevelId) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateLevelWords(selectedWorldId, selectedLevelId, editedWords)
      setDirty(false)
      setSuccess('Changes saved to Firestore.')
      const updatedLevels = await getLevels(selectedWorldId)
      setLevels(updatedLevels)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId)
  const selectedLevel = levels.find((l) => l.id === selectedLevelId)

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Words Manager</h1>
          <p className="text-nova-muted mt-1">
            Edit puzzle words for each level.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving || !selectedLevelId}
          className="rounded-nova bg-nova-gold px-5 py-2.5 text-sm font-semibold text-nova-bg hover:bg-nova-gold-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-nova border border-red-500/50 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-nova border border-green-500/50 bg-green-500/10 p-4 text-green-300">
          {success}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="worldSelect" className="text-nova-muted mb-1.5 block text-sm">
            World
          </label>
          <select
            id="worldSelect"
            value={selectedWorldId}
            onChange={(e) => setSelectedWorldId(e.target.value)}
            disabled={loading}
            className="w-full rounded-nova border border-white/10 bg-nova-card px-4 py-2.5 text-white outline-none focus:border-nova-gold"
          >
            <option value="">Select a world...</option>
            {worlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.emoji} {world.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="levelSelect" className="text-nova-muted mb-1.5 block text-sm">
            Level
          </label>
          <select
            id="levelSelect"
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            disabled={!selectedWorldId || levelsLoading}
            className="w-full rounded-nova border border-white/10 bg-nova-card px-4 py-2.5 text-white outline-none focus:border-nova-gold"
          >
            <option value="">Select a level...</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                Level {level.levelNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedLevelId ? (
        <div className="rounded-nova bg-nova-card border border-white/10 p-8 text-center">
          <p className="text-nova-muted">
            Select a world and level to manage words.
          </p>
        </div>
      ) : (
        <div className="rounded-nova bg-nova-card border border-white/10 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <p className="font-medium text-white">
              {selectedWorld?.emoji} {selectedWorld?.name} — Level{' '}
              {selectedLevel?.levelNumber}
            </p>
            <p className="text-nova-muted text-sm">
              {editedWords.length} word{editedWords.length !== 1 ? 's' : ''}
              {dirty && ' · Unsaved changes'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-nova-muted text-sm">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Word</th>
                  <th className="px-6 py-3 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editedWords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-nova-muted px-6 py-8 text-center">
                      No words in this level yet.
                    </td>
                  </tr>
                ) : (
                  editedWords.map((word, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="text-nova-muted px-6 py-3">{index + 1}</td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={word}
                          onChange={(e) => handleWordChange(index, e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-nova-bg px-3 py-2 font-mono uppercase text-white outline-none focus:border-nova-gold"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteWord(index)}
                          className="text-sm text-red-300 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={handleAddWord}
            className="flex flex-wrap items-end gap-3 border-t border-white/10 p-6"
          >
            <div className="min-w-[200px] flex-1">
              <label htmlFor="newWord" className="text-nova-muted mb-1.5 block text-sm">
                Add Word
              </label>
              <input
                id="newWord"
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 font-mono uppercase text-white outline-none focus:border-nova-gold"
                placeholder="MAGIC"
              />
            </div>
            <button
              type="submit"
              className="rounded-nova bg-nova-gold/20 px-4 py-2.5 text-sm font-medium text-nova-gold hover:bg-nova-gold/30"
            >
              + Add Word
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
