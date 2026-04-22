import { KIMBAP_INGREDIENTS } from '../data'

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.45)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

const tdStyle = {
  padding: '10px 16px',
  fontSize: '0.88rem',
  color: 'rgba(255,255,255,0.8)',
  background: 'rgba(255,255,255,0.025)',
  borderRadius: 8,
}

export default function ResultBoard({ teams, teamInventories, teamStars = {}, onRestart }) {
  const teamTotals = teams.map(team => {
    const inv = teamInventories[team.id] || {}
    const total = Object.values(inv).reduce((s, v) => s + v, 0)
    return { ...team, total }
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

      {/* Podium summary */}
      <div className="result-podium">
        {teamTotals.map((team, rank) => (
          <div
            key={team.id}
            className="result-podium-item"
            style={{
              borderColor: team.color,
              boxShadow: rank === 0 ? `0 0 20px ${team.color}44` : 'none',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{rankEmoji(rank)}</span>
            <span style={{ fontWeight: 800, color: team.color }}>{team.name}</span>
            {(teamStars[team.id] ?? 0) > 0 && (
              <span title="Chưa dùng ngôi sao!">⭐</span>
            )}
            <span style={{
              background: 'rgba(255,215,0,0.12)',
              border: '1px solid rgba(255,215,0,0.28)',
              borderRadius: 20,
              padding: '2px 10px',
              color: '#FFD700',
              fontWeight: 700,
              fontSize: '0.82rem',
            }}>
              {team.total} nguyên liệu
            </span>
          </div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="result-grid">
        {teams.map(team => {
          const inv = teamInventories[team.id] || {}
          const items = Object.entries(inv)
          const total = items.reduce((s, [, v]) => s + v, 0)
          return (
            <div
              key={team.id}
              className="glass result-card"
              style={{ '--team-color': team.color, color: team.color }}
            >
              <div className="result-card-header">
                <div className="result-team-avatar" style={{ background: team.color }}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <h2>{team.name}</h2>
                {(teamStars[team.id] ?? 0) > 0 ? (
                  <span title="Chưa dùng ngôi sao" style={{ fontSize: '1.1rem', marginLeft: 2 }}>⭐</span>
                ) : (
                  <span title="Đã dùng ngôi sao" style={{ fontSize: '1rem', opacity: 0.4, marginLeft: 2 }}>🌑</span>
                )}
                <div className="total-badge">{total} nguyên liệu</div>
              </div>

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
          <h2 style={{ marginBottom: 18, fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)' }}>
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
                        fontWeight: v > 0 ? 700 : 400,
                        color: v > 0 ? teams[idx]?.color : 'rgba(255,255,255,0.18)',
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
