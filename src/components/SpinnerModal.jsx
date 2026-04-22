import { useRef, useState, useEffect, useCallback } from 'react'
import { KIMBAP_INGREDIENTS } from '../data'

const SPIN_MIN = 3000, SPIN_MAX = 5500
const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD700', '#C77DFF', '#FF9F43', '#FF6B9D', '#48CAE4']

function Confetti() {
  const ref = useRef(null)
  useEffect(() => {
    const container = ref.current; if (!container) return
    const ps = []
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div'); el.className = 'particle'
      const s = 6 + Math.random() * 10
      el.style.cssText = `left:${Math.random() * 100}%;top:-${s}px;width:${s}px;height:${s}px;
        background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        border-radius:${Math.random() > .5 ? '50%' : '2px'};
        animation:fall ${2 + Math.random() * 3}s ${Math.random() * .8}s linear forwards;`
      container.appendChild(el); ps.push(el)
    }
    return () => ps.forEach(p => p.remove())
  }, [])
  return <div className="particles" ref={ref} />
}

export default function SpinnerModal({ teams, defaultTeamId, teamStars, teamInventories, spinsRemaining, onClaim }) {
  const canvasRef = useRef(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winItem, setWinItem] = useState(null)
  const [claimTeamId, setClaimTeamId] = useState(defaultTeamId ?? teams[0]?.id)
  const [showStarPicker, setShowStarPicker] = useState(false)
  const [starPickUsed, setStarPickUsed] = useState(false)

  // Calculate global stock of each ingredient
  const getAvailableIngredients = () => {
    const stock = {}
    teams.forEach(t => {
      const inv = teamInventories[t.id] || {}
      Object.entries(inv).forEach(([name, count]) => {
        stock[name] = (stock[name] || 0) + count
      })
    })

    // Filter ingredients that have reached the limit of 5
    return KIMBAP_INGREDIENTS.filter(ing => (stock[ing.name] || 0) < 5)
  }

  const segments = getAvailableIngredients()
  const N = segments.length
  // If zero ingredients left (very unlikely but possible), show a fallback or just handle gracefully
  const segAngle = N > 0 ? (2 * Math.PI) / N : 0
  const claimTeam = teams.find(t => t.id === claimTeamId)
  const claimTeamHasStar = !starPickUsed && (teamStars?.[claimTeamId] ?? 0) > 0

  // Reset wheel state when spinsRemaining changes (if more than 0)
  useEffect(() => {
    if (spinsRemaining > 0) {
      setWinItem(null)
      setIsSpinning(false)
      setIsClaimed(false)
    }
  }, [spinsRemaining])

  const audioCtxRef = useRef(null)
  const lastTickAngleRef = useRef(0)
  const animRef = useRef(null)
  const startTimeRef = useRef(null)
  const startRotRef = useRef(0)
  const targetRotRef = useRef(0)
  const durRef = useRef(4000)

  const playTickSound = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.type = 'triangle'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.start(); osc.stop(ctx.currentTime + 0.05)
  }

  const drawWheel = useCallback((rot) => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d')
    const sz = cv.width, cx = sz / 2, cy = sz / 2, r = sz / 2 - 6
    ctx.clearRect(0, 0, sz, sz)

    if (N === 0) {
      ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '20px sans-serif'
      ctx.fillText('Hết nguyên liệu!', cx, cy); return
    }

    // Glow
    const glow = ctx.createRadialGradient(cx, cy, r * .7, cx, cy, r + 10)
    glow.addColorStop(0, 'rgba(79,195,247,0)'); glow.addColorStop(1, 'rgba(79,195,247,0.2)')
    ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, 2 * Math.PI); ctx.fillStyle = glow; ctx.fill()

    segments.forEach((seg, i) => {
      const sa = rot + i * segAngle, ea = sa + segAngle
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, sa, ea); ctx.closePath()
      ctx.fillStyle = seg.color; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke()

      // Emoji
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(sa + segAngle / 2)
      ctx.translate(r * 0.65, 0); ctx.rotate(Math.PI / 2)
      ctx.font = `${sz * 0.07}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(seg.emoji, 0, 0); ctx.restore()

      // Text
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(sa + segAngle / 2)
      ctx.translate(r * 0.33, 0); ctx.rotate(Math.PI / 2)
      ctx.font = `bold ${sz * 0.038}px 'Outfit',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4
      const words = seg.name.split(' ')
      if (words.length === 1) ctx.fillText(seg.name, 0, 0)
      else { ctx.fillText(words[0], 0, -sz * 0.02); ctx.fillText(words.slice(1).join(' '), 0, sz * 0.02) }
      ctx.restore()
    })

    // Center decor
    ctx.beginPath(); ctx.arc(cx, cy, sz * .08, 0, 2 * Math.PI)
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * .08)
    cg.addColorStop(0, '#1a3a5c'); cg.addColorStop(1, '#0a1628')
    ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3; ctx.stroke()
  }, [N, segAngle, segments])

  useEffect(() => {
    drawWheel(rotation)
  }, [rotation, drawWheel])

  const spin = () => {
    if (isSpinning || N === 0) return
    setIsSpinning(true); setWinItem(null); setIsClaimed(false)
    startTimeRef.current = performance.now()
    startRotRef.current = rotation
    const extra = SPIN_MIN + Math.random() * (SPIN_MAX - SPIN_MIN)
    targetRotRef.current = rotation + extra
    durRef.current = 3500 + Math.random() * 1000

    const animate = (now) => {
      let elapsed = now - startTimeRef.current
      if (elapsed > durRef.current) elapsed = durRef.current
      const t = elapsed / durRef.current
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const currentRot = startRotRef.current + (targetRotRef.current - startRotRef.current) * ease
      setRotation(currentRot)

      // Tick sound
      const currentDeg = (currentRot * 180 / Math.PI) % 360
      if (Math.abs(currentDeg - lastTickAngleRef.current) > (360 / N)) {
        playTickSound()
        lastTickAngleRef.current = currentDeg
      }

      if (elapsed < durRef.current) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        const finalRot = currentRot % (2 * Math.PI)
        const totalRot = (2 * Math.PI) - (finalRot < 0 ? finalRot + 2 * Math.PI : finalRot)
        const shiftedRot = (totalRot + Math.PI / 2) % (2 * Math.PI)
        const winIdx = Math.floor(shiftedRot / segAngle) % N
        setWinItem(segments[winIdx])
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  const [isClaimed, setIsClaimed] = useState(false)

  const handleStarPickItem = (ingredient) => {
    if (isClaimed) return
    setIsClaimed(true)
    setStarPickUsed(true)
    setShowStarPicker(false)
    onClaim(ingredient, claimTeamId, true)
  }

  const handleRegularClaim = () => {
    if (isClaimed || !winItem) return
    setIsClaimed(true)
    setTimeout(() => {
      onClaim(winItem, claimTeamId, false)
    }, 0)
  }

  const currentTeamColor = claimTeam?.color || '#4FC3F7'

  return (
    <div className="q-modal-backdrop">
      <div className="q-modal spinner-modal glass">
        <div className="sm-header">
          <div className="sm-title-area">
            <span className="sm-title-emoji">🎡</span>
            <div>
              <h2 className="sm-title">Vòng Quay Kimbap</h2>
              <p className="sm-subtitle">Chúc bạn may mắn với lượt quay của mình!</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
          {/* Badge moved to share row with star bar */}
          <div className="sm-spins-highlight-badge" style={{ margin: 0 }}>
            THƯỞNG: <strong>{spinsRemaining}</strong> LƯỢT QUAY
          </div>

          {!winItem && !isSpinning && claimTeamHasStar && !isClaimed && (
            <div className="sm-star-bar" style={{ margin: 0, flex: '1 1 auto' }}>
              <span className="sm-star-info">⭐ Bạn có Ngôi Sao Hy Vọng!</span>
              <button className="btn sm-star-btn" onClick={() => setShowStarPicker(true)}>🎁 Dùng sao — tự chọn item</button>
            </div>
          )}
        </div>

        <div className="sm-wheel-area">
          <div className="sm-wheel-wrapper large">
            <canvas ref={canvasRef} className={`sm-canvas${isSpinning ? ' spinning' : ''}`} width={550} height={550} />
            <div className="sm-pointer" />
          </div>
        </div>

        <div className="sm-actions">
          {!winItem ? (
            <button
              className={`btn btn-primary sm-spin-btn${isSpinning ? ' spinning' : ''}`}
              onClick={spin}
              disabled={isSpinning || showStarPicker || N === 0 || isClaimed}
            >
              {isSpinning ? 'Đang quay...' : (N === 0 ? 'Hết hàng!' : 'QUAY NGAY!')}
            </button>
          ) : (
            <div className="sm-win-result">
              <Confetti />
              <span className="sm-win-emoji">{winItem.emoji}</span>
              <h3 className="sm-win-name">{winItem.name}</h3>
              <p className="sm-win-team">Chúc mừng <strong>{claimTeam?.name}</strong>!</p>
              <button
                className="btn btn-gold sm-claim-btn"
                onClick={handleRegularClaim}
                disabled={isClaimed}
              >
                {isClaimed ? 'ĐANG NHẬN...' : `XÁC NHẬN NHẬN ${winItem.name}`}
              </button>
              {spinsRemaining > 1 && !isClaimed && (
                <p className="sm-next-spin-hint">Sau đó bạn sẽ còn {spinsRemaining - 1} lượt quay tiếp theo!</p>
              )}
            </div>
          )}
        </div>

        {showStarPicker && (
          <div className="q-star-picker-overlay glass">
            <div className="q-star-picker-content">
              <div className="qsp-header">
                <span className="qsp-emoji">⭐</span>
                <h3>Chọn nguyên liệu bạn muốn:</h3>
                <p>Sử dụng ngôi sao sẽ tiêu tốn 1 lượt quay này.</p>
              </div>
              <div className="qsp-grid">
                {segments.map((ing, idx) => (
                  <button key={idx} className="qsp-item" onClick={() => handleStarPickItem(ing)}>
                    <span className="qsp-emoji">{ing.emoji}</span>
                    <span className="qsp-name">{ing.name}</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary mt-10" onClick={() => setShowStarPicker(false)}>Hủy bỏ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
