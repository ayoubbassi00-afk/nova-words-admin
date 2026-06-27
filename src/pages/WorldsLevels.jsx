import { useCallback, useEffect, useState } from 'react'
import Modal from '../components/Modal'
import EmojiPicker from '../components/EmojiPicker'
import {
  getWorlds,
  getLevels,
  createWorld,
  deleteWorld,
  createLevel,
  deleteLevel,
  getWorldLevelCount,
} from '../services/firestore'

export default function WorldsLevels() {
  const [worlds, setWorlds] = useState([])
  const [levelCounts, setLevelCounts] = useState({})
  const [expandedWorld, setExpandedWorld] = useState(null)
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddWorld, setShowAddWorld] = useState(false)
  const [newWorldName, setNewWorldName] = useState('')
  const [newWorldEmoji, setNewWorldEmoji] = useState('🌍')
  const [submitting, setSubmitting] = useState(false)

  const loadWorlds = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getWorlds()
      setWorlds(data)
      const counts = {}
      await Promise.all(
        data.map(async (world) => {
          counts[world.id] = await getWorldLevelCount(world.id)
        }),
      )
      setLevelCounts(counts)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorlds()
  }, [loadWorlds])

  async function toggleWorld(worldId) {
    if (expandedWorld === worldId) {
      setExpandedWorld(null)
      setLevels([])
      return
    }
    setExpandedWorld(worldId)
    setLevelsLoading(true)
    try {
      const data = await getLevels(worldId)
      setLevels(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLevelsLoading(false)
    }
  }

  async function handleAddWorld(e) {
    e.preventDefault()
    if (!newWorldName.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await createWorld({ name: newWorldName, emoji: newWorldEmoji })
      setShowAddWorld(false)
      setNewWorldName('')
      setNewWorldEmoji('🌍')
      await loadWorlds()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteWorld(worldId, worldName) {
    if (!confirm(`Delete world "${worldName}" and all its levels?`)) return
    setError('')
    try {
      await deleteWorld(worldId)
      if (expandedWorld === worldId) {
        setExpandedWorld(null)
        setLevels([])
      }
      await loadWorlds()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAddLevel(worldId) {
    setError('')
    try {
      await createLevel(worldId)
      const data = await getLevels(worldId)
      setLevels(data)
      setLevelCounts((prev) => ({
        ...prev,
        [worldId]: data.length,
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteLevel(worldId, levelId, levelNumber) {
    if (!confirm(`Delete level ${levelNumber}?`)) return
    setError('')
    try {
      await deleteLevel(worldId, levelId)
      const data = await getLevels(worldId)
      setLevels(data)
      setLevelCounts((prev) => ({
        ...prev,
        [worldId]: data.length,
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Worlds & Levels</h1>
          <p className="text-nova-muted mt-1">
            Manage game worlds and their level structure.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddWorld(true)}
          className="rounded-nova bg-nova-gold px-4 py-2 text-sm font-semibold text-nova-bg hover:bg-nova-gold-dark"
        >
          + Add World
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-nova border border-red-500/50 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-nova-muted">Loading worlds...</p>
      ) : worlds.length === 0 ? (
        <div className="rounded-nova bg-nova-card border border-white/10 p-8 text-center">
          <p className="text-nova-muted">No worlds yet. Add your first world to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {worlds.map((world) => (
            <div
              key={world.id}
              className="rounded-nova bg-nova-card border border-white/10 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggleWorld(world.id)}
                  className="flex flex-1 items-center gap-3 text-left hover:opacity-90"
                >
                  <span className="text-2xl">{world.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">{world.name}</p>
                    <p className="text-nova-muted text-sm">
                      {levelCounts[world.id] ?? 0} level
                      {(levelCounts[world.id] ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-nova-muted ml-auto text-sm">
                    {expandedWorld === world.id ? '▼' : '▶'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteWorld(world.id, world.name)}
                  className="rounded-nova border border-red-500/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>

              {expandedWorld === world.id && (
                <div className="border-t border-white/10 bg-nova-bg/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium text-white">Levels</h3>
                    <button
                      type="button"
                      onClick={() => handleAddLevel(world.id)}
                      className="rounded-nova bg-nova-gold/20 px-3 py-1.5 text-sm font-medium text-nova-gold hover:bg-nova-gold/30"
                    >
                      + Add Level
                    </button>
                  </div>

                  {levelsLoading ? (
                    <p className="text-nova-muted text-sm">Loading levels...</p>
                  ) : levels.length === 0 ? (
                    <p className="text-nova-muted text-sm">No levels in this world yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {levels.map((level) => (
                        <li
                          key={level.id}
                          className="flex items-center justify-between rounded-nova bg-nova-card px-4 py-3"
                        >
                          <div>
                            <span className="font-medium text-white">
                              Level {level.levelNumber}
                            </span>
                            <span className="text-nova-muted ml-3 text-sm">
                              {(level.words ?? []).length} words
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteLevel(world.id, level.id, level.levelNumber)
                            }
                            className="text-sm text-red-300 hover:text-red-200"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showAddWorld} title="Add New World" onClose={() => setShowAddWorld(false)}>
        <form onSubmit={handleAddWorld} className="space-y-4">
          <div>
            <label htmlFor="worldName" className="text-nova-muted mb-1.5 block text-sm">
              World Name
            </label>
            <input
              id="worldName"
              type="text"
              required
              value={newWorldName}
              onChange={(e) => setNewWorldName(e.target.value)}
              className="w-full rounded-nova border border-white/10 bg-nova-bg px-4 py-2.5 text-white outline-none focus:border-nova-gold"
              placeholder="Magic"
            />
          </div>
          <div>
            <label className="text-nova-muted mb-1.5 block text-sm">Emoji</label>
            <EmojiPicker value={newWorldEmoji} onChange={setNewWorldEmoji} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-nova bg-nova-gold py-2.5 font-semibold text-nova-bg hover:bg-nova-gold-dark disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create World'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
