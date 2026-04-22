import { useEffect, useRef } from 'react'

const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#FFD700','#C77DFF','#FF9F43','#FF6B9D','#48CAE4']

function Confetti() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const particles = []

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div')
      el.className = 'particle'
      const size = 6 + Math.random() * 8
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        top: -${size}px;
        width: ${size}px;
        height: ${size}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: fall ${2 + Math.random() * 3}s ${Math.random() * 1}s linear forwards;
        opacity: ${0.7 + Math.random() * 0.3};
      `
      container.appendChild(el)
      particles.push(el)
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [])

  return <div className="particles" ref={containerRef} />
}

export default function WinModal({ ingredient, team, onClaim, onSpinAgain }) {
  return (
    <>
      <Confetti />
      <div className="modal-backdrop" onClick={onClaim}>
        <div className="glass win-modal" onClick={e => e.stopPropagation()}>
          <span className="win-ingredient-emoji">{ingredient.emoji}</span>

          <div style={{ marginBottom: 8, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
            🎉 Chúc mừng!
          </div>

          <div className="win-name">{ingredient.name}</div>

          <div className="win-team" style={{ color: team?.color ?? 'rgba(255,255,255,0.6)' }}>
            {team?.name} nhận được nguyên liệu này!
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.85rem',
            marginBottom: 28,
            fontStyle: 'italic',
          }}>
            {ingredient.desc}
          </p>

          <div className="win-actions">
            <button className="btn btn-secondary" onClick={onClaim}>
              ✅ Nhận & Tiếp tục
            </button>
            <button className="btn btn-gold" onClick={() => { onSpinAgain(); }}>
              🎰 Nhận & Quay tiếp
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
