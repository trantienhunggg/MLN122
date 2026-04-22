import { useRef, useState, useEffect, useCallback } from 'react'
import { KIMBAP_INGREDIENTS } from '../data'
import WinModal from './WinModal'

const SPIN_DURATION_MIN = 3000 // ms
const SPIN_DURATION_MAX = 5000 // ms

export default function SpinnerGame({ teams, teamInventories, onAddIngredient, onEndGame }) {
  const canvasRef = useRef(null)
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id ?? 0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winItem, setWinItem] = useState(null)
  const [spinCount, setSpinCount] = useState(0)
  const animRef = useRef(null)
  const startTimeRef = useRef(null)
  const startRotRef = useRef(0)
  const targetRotRef = useRef(0)
  const durationRef = useRef(4000)

  const segments = KIMBAP_INGREDIENTS
  const numSegments = segments.length
  const segAngle = (2 * Math.PI) / numSegments

  // Draw wheel
  const drawWheel = useCallback((rot) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 4

    ctx.clearRect(0, 0, size, size)

    // Outer glow ring
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius + 4)
    glow.addColorStop(0, 'rgba(199,125,255,0.0)')
    glow.addColorStop(1, 'rgba(199,125,255,0.15)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 4, 0, 2 * Math.PI)
    ctx.fillStyle = glow
    ctx.fill()

    segments.forEach((seg, i) => {
      const startAngle = rot + i * segAngle
      const endAngle = startAngle + segAngle

      // Segment fill
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()

      // Segment stroke
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Gradient overlay
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      grad.addColorStop(0, 'rgba(255,255,255,0.12)')
      grad.addColorStop(1, 'rgba(0,0,0,0.0)')
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Emoji
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segAngle / 2)
      ctx.translate(radius * 0.62, 0)
      ctx.rotate(Math.PI / 2)
      ctx.font = `${size * 0.07}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(seg.emoji, 0, 0)
      ctx.restore()

      // Label
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segAngle / 2)
      ctx.translate(radius * 0.35, 0)
      ctx.rotate(Math.PI / 2)
      ctx.font = `bold ${size * 0.045}px 'Outfit', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 4
      // Word wrap if needed
      const words = seg.name.split(' ')
      if (words.length === 1) {
        ctx.fillText(seg.name, 0, 0)
      } else {
        ctx.fillText(words[0], 0, -size * 0.022)
        ctx.fillText(words.slice(1).join(' '), 0, size * 0.022)
      }
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.075, 0, 2 * Math.PI)
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.075)
    centerGrad.addColorStop(0, '#2a2a5a')
    centerGrad.addColorStop(1, '#0a0a1a')
    ctx.fillStyle = centerGrad
    ctx.fill()
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.stroke()

    // Center emoji
    ctx.font = `${size * 0.05}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🍱', cx, cy)
  }, [segments, segAngle])

  useEffect(() => {
    drawWheel(rotation)
  }, [drawWheel, rotation])

  // Easing function
  const easeOut = (t) => 1 - Math.pow(1 - t, 4)

  const spin = () => {
    if (isSpinning) return

    // Extra rotations + land on random segment
    const extraRotations = (6 + Math.random() * 6) * 2 * Math.PI
    const randomSegment = Math.floor(Math.random() * numSegments)
    // Target: pointer is at top (−π/2), wheel rotates to put randomSegment at top
    const segCenter = randomSegment * segAngle + segAngle / 2
    // We need rotation such that segCenter - targeting = -π/2
    // pointer is at right side (0 rad), we need segment center to align with right (0 rad)
    const targetRot = rotation + extraRotations + (2 * Math.PI - ((rotation + segCenter) % (2 * Math.PI)))
    
    const duration = SPIN_DURATION_MIN + Math.random() * (SPIN_DURATION_MAX - SPIN_DURATION_MIN)

    startTimeRef.current = null
    startRotRef.current = rotation
    targetRotRef.current = targetRot
    durationRef.current = duration
    setIsSpinning(true)

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / durationRef.current, 1)
      const eased = easeOut(progress)
      const currentRot = startRotRef.current + (targetRotRef.current - startRotRef.current) * eased

      setRotation(currentRot)
      drawWheel(currentRot)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        // Determine winner
        const finalRot = targetRotRef.current
        // Pointer at angle 0 (right side). Find which segment is at 0
        const normalizedRot = ((finalRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pointerAngle = 0 // right side
        const relAngle = ((pointerAngle - normalizedRot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
        const winIndex = Math.floor(relAngle / segAngle) % numSegments
        const winner = segments[winIndex]

        setIsSpinning(false)
        setWinItem(winner)
        setSpinCount(c => c + 1)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  const handleClaimAndContinue = () => {
    if (winItem) {
      onAddIngredient(selectedTeamId, winItem)
      setWinItem(null)
    }
  }

  const handleClaimAndSpin = () => {
    if (winItem) {
      onAddIngredient(selectedTeamId, winItem)
      setWinItem(null)
    }
    // spin will be re-triggered by user or we can call spin()
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  return (
    <>
      <div className="game-page">
        {/* Header */}
        <header className="game-header">
          <div className="game-header-title">
            <span>🍱</span>
            <span>Vòng Quay Kimbap May Mắn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="spin-counter">
              🎰 Đã quay: <strong>{spinCount}</strong> lần
            </div>
            <button className="btn btn-danger" onClick={onEndGame}>
              🏁 Kết thúc & Xem kết quả
            </button>
          </div>
        </header>

        {/* Main Spinner Area */}
        <main className="game-main">
          {/* Team Selector */}
          <div className="team-selector">
            <h3>👥 Chọn nhóm đang quay</h3>
            <div className="team-tabs">
              {teams.map(team => (
                <button
                  key={team.id}
                  className={`team-tab${selectedTeamId === team.id ? ' active' : ''}`}
                  style={{ color: team.color }}
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          {/* Spinner */}
          <div className="spinner-area">
            <div className="spinner-wrapper">
              <canvas
                ref={canvasRef}
                className={`spinner-canvas${isSpinning ? ' spinning' : ''}`}
                width={480}
                height={480}
              />
              {/* Pointer arrow from right */}
              <div className="spinner-pointer" />
            </div>

            {selectedTeam && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 20px',
                borderRadius: 50,
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${selectedTeam.color}`,
                fontWeight: 700,
                color: selectedTeam.color,
              }}>
                🎯 Đang quay cho: {selectedTeam.name}
              </div>
            )}

            <button
              className="btn btn-primary spin-btn"
              onClick={spin}
              disabled={isSpinning}
            >
              {isSpinning ? '⏳ Đang quay...' : '🎰 QUAY!'}
            </button>
          </div>
        </main>

        {/* Sidebar Inventory */}
        <aside className="game-sidebar">
          <div className="sidebar-title">
            📦 Kho nguyên liệu
          </div>
          {teams.map(team => {
            const inv = teamInventories[team.id] || {}
            const items = Object.entries(inv)
            return (
              <div key={team.id} className="team-inventory-panel">
                <div className="team-inventory-header">
                  <div className="team-dot" style={{ background: team.color }} />
                  <span style={{ color: team.color }}>{team.name}</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    {items.length} loại
                  </span>
                </div>
                {items.length === 0 ? (
                  <div className="empty-inv">Chưa có nguyên liệu nào</div>
                ) : (
                  <div className="ingredient-list">
                    {items.map(([name, count]) => {
                      const ing = KIMBAP_INGREDIENTS.find(i => i.name === name)
                      return (
                        <div key={name} className="ingredient-row">
                          <span className="ing-label">
                            <span>{ing?.emoji}</span>
                            <span>{name}</span>
                          </span>
                          <span className="ing-count">x{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </aside>
      </div>

      {/* Win Modal */}
      {winItem && (
        <WinModal
          ingredient={winItem}
          team={selectedTeam}
          onClaim={handleClaimAndContinue}
          onSpinAgain={handleClaimAndSpin}
        />
      )}
    </>
  )
}
