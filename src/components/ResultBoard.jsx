import { KIMBAP_INGREDIENTS } from '../data'

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '0.8rem',
  color: 'rgba(0,0,0,0.4)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
}

const tdStyle = {
  padding: '12px 16px',
  fontSize: '0.9rem',
  color: '#2d3748',
  background: 'rgba(0,0,0,0.015)',
  borderRadius: 10,
}

export default function ResultBoard({ teams, teamInventories, teamStars = {}, onRestart }) {
  const teamTotals = teams.map(team => {
    const inv = teamInventories[team.id] || {}
    const total = Object.values(inv).reduce((s, v) => s + v, 0)
    const starCount = teamStars[team.id] ?? 0
    return { ...team, total, starCount }
  }).sort((a, b) => b.total - a.total)

  const rankEmoji = (rank) => {
    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'
    return `#${rank + 1}`
  }

  return (
    <div className="result-page">
      {/* Background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      {/* Hero */}
      <div className="result-hero">
        <span className="result-hero-trophy">🏆</span>
        <h1>Bảng Kết Quả Tổng</h1>
        <p>Nguyên liệu làm Kimbap mỗi nhóm nhận được!</p>
      </div>

      {/* Rankings Summary */}
      <div className="result-podium">
        {teamTotals.map((team, rank) => (
          <div
            key={team.id}
            className={`result-podium-item ${rank === 0 ? 'winner-bright' : ''}`}
            style={{
              borderColor: team.color,
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{rankEmoji(rank)}</span>
            <span style={{ fontWeight: 800, color: team.color, fontSize: rank === 0 ? '1.1rem' : '0.9rem' }}>
              {team.name}
              {rank === 0 && <span className="winner-label">QUÁN QUÂN 👑</span>}
            </span>
            <span className="podium-total">
              {team.total} <small>món</small>
            </span>
          </div>
        ))}
      </div>

      <div className="result-grid">
        {teamTotals.map((team, rank) => {
          const inv = teamInventories[team.id] || {}
          const items = Object.entries(inv)
          return (
            <div
              key={team.id}
              className={`glass result-card ${rank === 0 ? 'winner-card' : ''}`}
              style={{ '--team-color': team.color, color: team.color }}
            >
              <div className="result-rank-badge">{rankEmoji(rank)}</div>
              <div className="result-card-header">
                <div className="result-team-avatar" style={{ background: team.color }}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: rank === 0 ? '1.4rem' : '1.1rem' }}>{team.name}</h2>
                  {rank === 0 && <div className="winner-tag">CHAMPION</div>}
                </div>
                {team.starCount > 0 ? (
                  <span title="Chưa dùng ngôi sao" style={{ fontSize: '1.2rem', marginLeft: 'auto' }}>⭐</span>
                ) : (
                  <span title="Đã dùng ngôi sao" style={{ fontSize: '1rem', opacity: 0.4, marginLeft: 'auto' }}>🌑</span>
                )}
              </div>
              <div className="total-badge-large">{team.total} nguyên liệu</div>

              {items.length === 0 ? (
                <div className="empty-result">Chưa có nguyên liệu nào 😢</div>
              ) : (
                <div className="result-ingredient-grid">
                  {items.map(([name, count]) => {
                    const ing = KIMBAP_INGREDIENTS.find(i => i.name === name)
                    return (
                      <div key={name} className="result-ing-item">
                        <span className="ing-emoji">{ing?.emoji ?? '🍱'}</span>
                        <div className="ing-info">
                          <div className="ing-name">{name}</div>
                          <div className="ing-qty">×{count}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Full summary table */}
      <div className="result-table-wrap">
        <div className="glass" style={{ padding: 24, overflowX: 'auto' }}>
          <h2 style={{ marginBottom: 18, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
            📊 Bảng Chi Tiết Tất Cả Nguyên Liệu
          </h2>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nguyên liệu</th>
                {teams.map(t => (
                  <th key={t.id} style={{ ...thStyle, color: t.color }}>{t.name}</th>
                ))}
                <th style={{ ...thStyle, color: '#FFD700' }}>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {KIMBAP_INGREDIENTS.map(ing => {
                const rowVals = teams.map(t => (teamInventories[t.id]?.[ing.name] ?? 0))
                const rowTotal = rowVals.reduce((s, v) => s + v, 0)
                if (rowTotal === 0) return null
                return (
                  <tr key={ing.name}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>{ing.emoji}</span>
                        <span>{ing.name}</span>
                      </div>
                    </td>
                    {rowVals.map((v, idx) => (
                      <td key={idx} style={{
                        ...tdStyle,
                        textAlign: 'center',
                        fontWeight: v > 0 ? 800 : 400,
                        color: v > 0 ? teams[idx]?.color : 'rgba(0,0,0,0.25)',
                      }}>
                        {v > 0 ? `×${v}` : '—'}
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#FFD700', fontWeight: 800 }}>
                      {rowTotal}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button
          className="btn btn-primary"
          style={{ fontSize: '1.05rem', padding: '14px 40px' }}
          onClick={onRestart}
        >
          🔄 Chơi lại
        </button>
      </div>
    </div>
  )
}
