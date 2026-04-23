import { useState, useMemo, useRef, useEffect } from 'react'
import { QUESTIONS, KIMBAP_INGREDIENTS, PUZZLE_IMAGE_URL } from '../data'
import NumberBoard from './NumberBoard'
import QuestionModal from './QuestionModal'
import SpinnerModal from './SpinnerModal'

export default function GameController({ teams, teamInventories, teamStars, onAddIngredient, onUseStarForItem, onUseStarForExtraLife, onEndGame }) {
  const [phase, setPhase] = useState('board') // 'board' | 'question' | 'spinner'
  const [usedNumbers, setUsedNumbers] = useState([])
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [activeNumber, setActiveNumber] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id ?? 0)
  const [spinnerTeamId, setSpinnerTeamId] = useState(teams[0]?.id ?? 0)

  // Picture Guess feature
  const [showPictureGuess, setShowPictureGuess] = useState(false)
  const [pgPhase, setPgPhase] = useState('team-select') // 'team-select' | 'confirm' | 'reveal' | 'pick-items'
  const [pgTeam, setPgTeam] = useState(null)
  const [pgPickedItems, setPgPickedItems] = useState([])
  const [pgResult, setPgResult] = useState(null) // 'correct' | 'wrong'

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  // Map each number 1-30 to a question based on its ID
  const numberToQuestion = useMemo(() => {
    const map = {}
    QUESTIONS.forEach(q => {
      map[q.id] = q
    })
    return map
  }, [])

  const [isRandomizing, setIsRandomizing] = useState(false)
  const [randomHighlight, setRandomHighlight] = useState(null)
  const [spinsRemaining, setSpinsRemaining] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const audioCtxRef = useRef(null)
  const bgmRef = useRef(null)

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = 0.4
      if (phase === 'board') {
        const playPromise = bgmRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => { /* browser requires interaction first */ })
        }
      } else {
        bgmRef.current.pause()
      }
    }
  }, [phase])

  // Game Countdown Timer (30 mins)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const playShuffleSound = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = audioCtxRef.current
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.type = 'square'
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.start(); osc.stop(ctx.currentTime + 0.05)
  }

  const playSpinClickSound = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = audioCtxRef.current
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.type = 'triangle'
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)
    osc.start(); osc.stop(ctx.currentTime + 0.02)
  }

  const handleRandomSelect = () => {
    if (isRandomizing || phase !== 'board') return
    const available = Array.from({ length: 30 }, (_, i) => i + 1).filter(n => !usedNumbers.includes(n))
    if (available.length === 0) return

    setIsRandomizing(true)
    const duration = 3000 // Total 4 seconds
    const startTime = Date.now()

    const shuffle = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress < 1) {
        const rand = Math.floor(Math.random() * 30) + 1
        setRandomHighlight(rand)
        playShuffleSound()

        // Higher floor delay (180ms) makes every jump distinct
        const delay = 180 + (Math.pow(progress, 2) * 500)
        setTimeout(shuffle, delay)
      } else {
        const final = available[Math.floor(Math.random() * available.length)]
        setRandomHighlight(final)

        setTimeout(() => {
          setIsRandomizing(false)
          setRandomHighlight(null)
          handleSelectNumber(final)
        }, 1200) // Clear pause on the result
      }
    }
    shuffle()
  }

  const handleSelectNumber = (num) => {
    if (usedNumbers.includes(num)) return
    const q = numberToQuestion[num]
    setActiveQuestion(q)
    setActiveNumber(num)
    setPhase('question')
  }

  const getAvailableIngredientsForTeam = (teamId) => {
    const teamInv = teamInventories[teamId] || {}
    return KIMBAP_INGREDIENTS.filter(ing => {
      const teamHas = teamInv[ing.name] || 0
      if (teamHas >= 2) return false
      const globalCount = teams.reduce((acc, t) => acc + (teamInventories[t.id]?.[ing.name] || 0), 0)
      return globalCount < 5
    })
  }

  const handleCorrectAnswer = (tier, teamId) => {
    setUsedNumbers(prev => [...prev, activeNumber])
    const tid = teamId || selectedTeamId
    const available = getAvailableIngredientsForTeam(tid)

    if (available.length === 0) {
      alert(`Đội ${teams.find(t => t.id === tid)?.name} đã thu thập đủ toàn bộ nguyên liệu (tối đa 2 cái mỗi loại)! Vòng quay sẽ được bỏ qua.`)
      setPhase('board')
      setSpinnerTeamId(teams[0]?.id ?? 0)
      setActiveQuestion(null)
      setActiveNumber(null)
      return
    }

    setSpinnerTeamId(tid)
    setSpinsRemaining(tier || 1)
    setPhase('spinner')
  }

  const handleSkipQuestion = () => {
    // Don't reveal tile — only correct answers should open tiles
    setActiveQuestion(null)
    setActiveNumber(null)
    setPhase('board')
  }

  const handleSpinClaim = (ingredient, claimTeamId, usedStar) => {
    // 1. Process the ingredient addition
    if (usedStar) {
      onUseStarForItem(claimTeamId, ingredient)
    } else {
      onAddIngredient(claimTeamId, ingredient)
    }

    // 2. Decrement spins sequentially
    const nextSpins = spinsRemaining - 1

    // Check if team has run out of ingredients after this claim
    const currentAvailable = getAvailableIngredientsForTeam(claimTeamId)
    const teamInv = teamInventories[claimTeamId] || {}
    const teamCountAfter = (teamInv[ingredient.name] || 0) + 1
    const globalCountAfter = teams.reduce((acc, t) => acc + (teamInventories[t.id]?.[ingredient.name] || 0), 0) + 1

    let stillHasAvailable = false
    for (const ing of KIMBAP_INGREDIENTS) {
      if (ing.name === ingredient.name) {
        if (teamCountAfter < 2 && globalCountAfter < 5) stillHasAvailable = true
      } else {
        if (currentAvailable.some(a => a.name === ing.name)) stillHasAvailable = true
      }
    }

    // 3. Decide if we finish or continue
    if (nextSpins <= 0 || !stillHasAvailable) {
      if (!stillHasAvailable && nextSpins > 0) {
        alert(`Đội ${teams.find(t => t.id === claimTeamId)?.name} đã gom đủ toàn bộ nguyên liệu! Vòng quay sẽ kết thúc sớm.`)
      }
      setPhase('board')
      setSpinnerTeamId(teams[0]?.id ?? 0)
      setActiveQuestion(null)
      setActiveNumber(null)
    } else {
      setSpinsRemaining(nextSpins)
    }
  }

  const handleStarExtraLife = (teamId) => {
    onUseStarForExtraLife(teamId)
  }

  const handleStarPickItem = (teamId, ingredient) => {
    // Check global stock before allowing star pick
    const totalStock = teams.reduce((acc, t) => {
      return acc + (teamInventories[t.id]?.[ingredient.name] || 0)
    }, 0)

    if (totalStock >= 5) return

    const teamCount = teamInventories[teamId]?.[ingredient.name] || 0
    if (teamCount >= 2) return

    onUseStarForItem(teamId, ingredient)
    setActiveQuestion(null)
    setActiveNumber(null)
    setUsedNumbers(prev => [...prev, activeNumber])
    setPhase('board')
  }

  // ── Picture Guess handlers ──
  const handleOpenPictureGuess = () => {
    setShowPictureGuess(true)
    setPgPhase('team-select')
    setPgTeam(null)
    setPgPickedItems([])
    setPgResult(null)
  }

  const handlePgSelectTeam = (team) => {
    setPgTeam(team)
    setPgPhase('confirm')
  }

  const handlePgCorrect = () => {
    setPgResult('correct')
    setPgPhase('reveal')
  }

  const handlePgWrong = () => {
    setPgResult('wrong')
    setPgPhase('reveal')
  }

  const handlePgRevealNext = () => {
    if (pgResult === 'correct') {
      setPgPhase('pick-items')
    } else {
      setShowPictureGuess(false)
    }
  }

  const handlePgPickItem = (ingredient) => {
    // Check global stock
    const globalCount = teams.reduce((acc, t) => acc + (teamInventories[t.id]?.[ingredient.name] || 0), 0)
    if (globalCount >= 5) return
    const teamCount = teamInventories[pgTeam.id]?.[ingredient.name] || 0
    if (teamCount >= 2) return // Already has max 2 of this ingredient
    onAddIngredient(pgTeam.id, ingredient)
    setPgPickedItems(prev => [...prev, ingredient.name])
  }

  const handlePgDone = () => {
    setShowPictureGuess(false)
  }

  const getPickableIngredients = () => {
    if (!pgTeam) return []
    const teamInv = teamInventories[pgTeam.id] || {}
    return KIMBAP_INGREDIENTS.filter(ing => {
      const teamHas = teamInv[ing.name] || 0
      if (teamHas >= 2) return false // Already has max 2 of this ingredient
      const globalCount = teams.reduce((acc, t) => acc + (teamInventories[t.id]?.[ing.name] || 0), 0)
      return globalCount < 5 // Still available in stock
    })
  }

  return (
    <>
      <audio ref={bgmRef} src="/bgm-home.mp3" loop />
      <div className="game-layout">
        <div className="game-main-area">
          {/* Top bar */}
          <header className="game-top-bar">
            <div className="gtb-left">
              <span className="gtb-emoji">🍱</span>
              <span className="gtb-title">Kimbap Quiz</span>
            </div>
            <div className="gtb-right">
              <div className={`gtb-timer ${timeLeft < 300 ? 'urgent' : ''}`}>
                <span className="gtb-timer-icon">🕒</span>
                <span className="gtb-timer-val">{formatTime(timeLeft)}</span>
              </div>
              <span className="gtb-stat">
                📋 {usedNumbers.length}<span className="gtb-stat-label">/30</span>
              </span>
              <button className="btn btn-danger gtb-end-btn" onClick={onEndGame}>
                🏁 Kết thúc
              </button>
              <button
                className={`btn btn-primary btn-random-pick${isRandomizing ? ' spinning' : ''}`}
                onClick={handleRandomSelect}
                disabled={isRandomizing}
              >
                🎲
              </button>
              <button
                className="btn btn-guess-picture"
                onClick={handleOpenPictureGuess}
                disabled={isRandomizing || phase !== 'board'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                Đoán hình
              </button>
            </div>
          </header>

          {/* Number Board */}
          <NumberBoard
            usedNumbers={usedNumbers}
            onSelectNumber={phase === 'board' ? handleSelectNumber : () => { }}
            currentTeam={null}
            randomHighlight={randomHighlight}
          />
        </div>

        {/* Sidebar */}
        <aside className="game-sidebar">
          <div className="sidebar-title">📦 Kho nguyên liệu</div>
          {teams.map(team => {
            const inv = teamInventories[team.id] || {}
            const items = Object.entries(inv)
            const total = items.reduce((s, [, v]) => s + v, 0)
            const hasStar = (teamStars[team.id] ?? 0) > 0
            return (
              <div key={team.id} className="team-inventory-panel">
                <div className="team-inventory-header">
                  <div className="team-dot" style={{ background: team.color }} />
                  <span style={{ color: team.color }}>{team.name}</span>
                  {hasStar && (
                    <span className="star-badge" title="Ngôi Sao Hy Vọng còn">⭐</span>
                  )}
                  {total > 0 && (
                    <span className="inv-total-badge">{total}</span>
                  )}
                </div>
                {items.length === 0 ? (
                  <div className="empty-inv">Chưa có nguyên liệu</div>
                ) : (
                  <div className="ingredient-list">
                    {items.map(([name, count]) => {
                      const ing = KIMBAP_INGREDIENTS.find(i => i.name === name)
                      return (
                        <div key={`${name}-${count}`} className="ingredient-row item-bounce-in">
                          <span className="ing-label">
                            <span>{ing?.emoji}</span>
                            <span>{name}</span>
                          </span>
                          <span className="ing-count">×{count}</span>
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

      {/* Question Modal */}
      {phase === 'question' && activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          questionNumber={activeNumber}
          currentTeam={selectedTeam}
          teams={teams}
          teamStars={teamStars}
          onCorrect={handleCorrectAnswer}
          onNextQuestion={handleSkipQuestion}
          onUseStarExtraLife={handleStarExtraLife}
          onUseStarPickItem={handleStarPickItem}
        />
      )}

      {/* Spinner Modal */}
      {phase === 'spinner' && (
        <SpinnerModal
          key={`spinner-${activeNumber}-${spinsRemaining}`}
          teams={teams}
          defaultTeamId={spinnerTeamId}
          teamStars={teamStars}
          teamInventories={teamInventories}
          spinsRemaining={spinsRemaining}
          onClaim={handleSpinClaim}
        />
      )}

      {/* Picture Guess Modal */}
      {showPictureGuess && (
        <div className="qp-overlay" style={{ zIndex: 600 }}>
          {pgPhase === 'team-select' && (
            <div className="qp-overlay-card pg-card">
              <div className="pg-header-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </div>
              <h2 className="pg-title">Đoán Hình Bí Ẩn</h2>
              <p className="pg-sub">Đội nào muốn đoán bức tranh phía sau?</p>
              <div className="pg-team-grid">
                {teams.map(t => (
                  <button key={t.id} className="qp-steal-team" style={{ '--tc': t.color }}
                    onClick={() => handlePgSelectTeam(t)}>
                    <span className="qp-tc-dot" style={{ background: t.color }} />
                    {t.name}
                  </button>
                ))}
              </div>
              <button className="qp-action-btn qp-back-btn" onClick={() => setShowPictureGuess(false)}>
                ← Hủy bỏ
              </button>
            </div>
          )}

          {pgPhase === 'confirm' && (
            <div className="qp-overlay-card pg-card">
              <div className="pg-header-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.5"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="12" r="10" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
              <h2 className="pg-title" style={{ color: pgTeam.color }}>
                Đội {pgTeam.name} đoán hình
              </h2>
              <p className="pg-sub">MC xác nhận: Đội đoán có đúng không?</p>
              <div className="pg-confirm-btns">
                <button className="qp-action-btn pg-btn-correct" onClick={handlePgCorrect}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  Đúng rồi!
                </button>
                <button className="qp-action-btn pg-btn-wrong" onClick={handlePgWrong}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  Sai rồi!
                </button>
              </div>
            </div>
          )}

          {pgPhase === 'reveal' && (
            <div className="qp-overlay-card pg-card">
              <div className={`pg-header-icon ${pgResult === 'correct' ? 'pg-success-icon' : 'pg-wrong-icon'}`}>
                {pgResult === 'correct'
                  ? <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  : <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
              </div>
              <h2 className="pg-title" style={{ color: pgResult === 'correct' ? '#166534' : '#991b1b' }}>
                {pgResult === 'correct' ? 'Chính xác! 🎉' : 'Lêu lêu sai rồi! 😢'}
              </h2>
              {pgResult === 'correct' && (
                <>
                  <p className="pg-sub">Đây là bức tranh bí ẩn:</p>
                  <div className="pg-reveal-img-wrap">
                    <img src={PUZZLE_IMAGE_URL} alt="Hình bí ẩn" className="pg-reveal-img" />
                  </div>
                </>
              )}
              <button className="qp-action-btn qp-spin-btn" style={{ marginTop: 16 }} onClick={handlePgRevealNext}>
                {pgResult === 'correct' ? '→ Chọn nguyên liệu' : '← Quay lại'}
              </button>
            </div>
          )}

          {pgPhase === 'pick-items' && (
            <div className="qp-overlay-card pg-card pg-pick-card">
              <div className="pg-header-icon pg-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="pg-title" style={{ color: '#4ade80' }}>Chính xác!</h2>
              <p className="pg-sub">Chọn nguyên liệu đội <strong style={{ color: pgTeam.color }}>{pgTeam.name}</strong> còn thiếu:</p>
              {getPickableIngredients().length === 0 ? (
                <p className="pg-sub" style={{ color: '#FFD700' }}>Đội đã có đủ tất cả nguyên liệu! 🎉</p>
              ) : (
                <div className="pg-items-grid">
                  {getPickableIngredients().map(ing => (
                    <button key={ing.name} className="pg-item-btn"
                      onClick={() => handlePgPickItem(ing)}
                      disabled={pgPickedItems.includes(ing.name)}>
                      <span className="pg-item-emoji">{ing.emoji}</span>
                      <span className="pg-item-name">{ing.name}</span>
                      {pgPickedItems.includes(ing.name) && (
                        <span className="pg-item-check">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <button className="qp-action-btn qp-spin-btn" style={{ marginTop: 20 }} onClick={handlePgDone}>
                ✓ Hoàn tất
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
