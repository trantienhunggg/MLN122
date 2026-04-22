import { useState } from 'react'

const MAX_TEAMS = 8
const TEAM_COLORS = [
  '#4FC3F7', '#81C784', '#FFD54F', '#F48FB1',
  '#CE93D8', '#80DEEA', '#FFAB91', '#A5D6A7',
]

export default function TeamSetup({ onStart }) {
  const [teamNames, setTeamNames] = useState(['Nhóm 1', 'Nhóm 2'])

  const addTeam = () => {
    if (teamNames.length < MAX_TEAMS) {
      setTeamNames(prev => [...prev, `Nhóm ${prev.length + 1}`])
    }
  }

  const removeTeam = (idx) => {
    if (teamNames.length > 1) {
      setTeamNames(prev => prev.filter((_, i) => i !== idx))
    }
  }

  const updateName = (idx, val) => {
    setTeamNames(prev => prev.map((n, i) => (i === idx ? val : n)))
  }

  const handleStart = () => {
    const validNames = teamNames.map(n => n.trim()).filter(Boolean)
    if (validNames.length === 0) return
    onStart(validNames)
  }

  return (
    <div className="setup-page">
      {/* Background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      {/* Hero */}
      <div className="setup-hero">
        <span className="emoji-big">🍱</span>
        <h1>Kimbap Quiz Game</h1>
        <p>Trả lời câu hỏi đúng để quay vòng may mắn nhận nguyên liệu!</p>
      </div>

      {/* Card */}
      <div className="glass setup-card">
        <h2>🏆 Nhập tên các nhóm tham gia</h2>

        <div className="team-inputs">
          {teamNames.map((name, idx) => (
            <div key={idx} className="team-input-row item-bounce-in">
              <div
                className="team-badge"
                style={{ background: TEAM_COLORS[idx % TEAM_COLORS.length], color: 'rgba(0, 0, 0, 0.7)' }}
              >
                {idx + 1}
              </div>
              <input
                className="team-input"
                type="text"
                value={name}
                placeholder={`Nhóm ${idx + 1}`}
                onChange={(e) => updateName(idx, e.target.value)}
                maxLength={24}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              {teamNames.length > 1 && (
                <button
                  className="btn-remove"
                  onClick={() => removeTeam(idx)}
                  title="Xóa nhóm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="setup-actions">
          {teamNames.length < MAX_TEAMS && (
            <button className="btn btn-secondary" onClick={addTeam}>
              ➕ Thêm nhóm
            </button>
          )}
          <button className="btn btn-primary" onClick={handleStart}>
            🎯 Bắt đầu chơi!
          </button>
        </div>
      </div>

      <div className="setup-footer">
        Tối đa {MAX_TEAMS} nhóm • {teamNames.length} nhóm hiện tại • Chọn ô số để bắt đầu câu hỏi 🎮
      </div>
    </div>
  )
}
