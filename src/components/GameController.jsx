import { useState, useMemo, useRef, useEffect } from 'react'
import { QUESTIONS, KIMBAP_INGREDIENTS } from '../data'
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

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  // Map each number 1-50 to a question
  const numberToQuestion = useMemo(() => {
    const map = {}
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
    for (let i = 1; i <= 50; i++) {
      map[i] = shuffled[(i - 1) % shuffled.length]
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isRandomizing, setIsRandomizing] = useState(false)
  const [randomHighlight, setRandomHighlight] = useState(null)
  const [spinsRemaining, setSpinsRemaining] = useState(0)
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
    const duration = 3000
    const startTime = Date.now()

    const shuffle = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress < 1) {
        // "Popping" jump to any random number
        const rand = Math.floor(Math.random() * 30) + 1
        setRandomHighlight(rand)
        playShuffleSound()

        const delay = 40 + (Math.pow(progress, 3) * 160)
        setTimeout(shuffle, delay)
      } else {
        const final = available[Math.floor(Math.random() * available.length)]
        setRandomHighlight(final)

        setTimeout(() => {
          setIsRandomizing(false)
          setRandomHighlight(null)
          handleSelectNumber(final)
        }, 700)
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

  const handleCorrectAnswer = (tier, teamId) => {
    setUsedNumbers(prev => [...prev, activeNumber])
    setSpinnerTeamId(teamId || selectedTeamId)
    setSpinsRemaining(tier || 1)
    setPhase('spinner')
  }

  const handleSkipQuestion = () => {
    setUsedNumbers(prev => [...prev, activeNumber])
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
    setSpinsRemaining(nextSpins)

    // 3. Decide if we finish or continue
    if (nextSpins <= 0) {
      setPhase('board')
      setSpinnerTeamId(teams[0]?.id ?? 0)
      setActiveQuestion(null)
      setActiveNumber(null)
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

    if (totalStock >= 5) {
      alert(`Nguyên liệu "${ingredient.name}" đã hết hàng!`)
      return
    }

    onUseStarForItem(teamId, ingredient)
    setActiveQuestion(null)
    setActiveNumber(null)
    setUsedNumbers(prev => [...prev, activeNumber])
    setPhase('board')
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
                🎲 Chọn câu hỏi ngẫu nhiên
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
                        <div key={name} className="ingredient-row">
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
    </>
  )
}
