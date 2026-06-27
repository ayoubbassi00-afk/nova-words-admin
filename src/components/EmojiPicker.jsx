const EMOJIS = [
  '🍎', '🍔', '🐾', '🌍', '⚽', '🎵', '🚀', '🦕', '🐉', '💎',
  '🧙', '🏰', '🌊', '⛈', '🎬', '💻', '🌲', '🏛', '✨', '🔥',
  '🌟', '🎯', '🎮', '📚', '🎨', '🌸', '🍕', '🎁', '🏆', '⭐',
]

export default function EmojiPicker({ value, onChange }) {
  return (
    <div>
      <p className="text-nova-muted mb-2 text-sm">Selected: {value || 'None'}</p>
      <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto rounded-lg bg-nova-bg/50 p-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`rounded-lg p-1.5 text-xl transition-colors hover:bg-white/10 ${
              value === emoji ? 'bg-nova-gold/30 ring-2 ring-nova-gold' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
