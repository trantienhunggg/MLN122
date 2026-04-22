import { useState, useEffect, useRef } from 'react'
import { WRONG_REACTIONS, KIMBAP_INGREDIENTS } from '../data'

function createAudioContext() {
  try { return new (window.AudioContext || window.webkitAudioContext)() } catch { return null }
}
function playWrongSound(ctx) {
  if (!ctx) return
  const osc = ctx.createOscillator(), gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(220, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
}
function playCorrectSound(ctx) {
  if (!ctx) return
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
      osc.start(t); osc.stop(t + 0.25)
    })
}
function playTickSound(ctx) {
  if (!ctx) return
  const osc = ctx.createOscillator(), gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.05)
}
function playStarSound(ctx) {
  if (!ctx) return
    ;[800, 1000, 1200, 1600].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'triangle'
      const t = ctx.currentTime + i * 0.08
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2)
      osc.start(t); osc.stop(t + 0.2)
    })
}

const TIMER_SECONDS = 20

export default function QuestionModal({
  question, questionNumber, currentTeam, teams, teamStars,
  onCorrect, onNextQuestion, onUseStarExtraLife, onUseStarPickItem,
}) {
  const [activeTeam, setActiveTeam] = useState(null)
  const [turnCount, setTurnCount] = useState(1)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [reaction, setReaction] = useState(null)
  const [showWrongChoices, setShowWrongChoices] = useState(false)
  const [showStealUI, setShowStealUI] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [initialTime, setInitialTime] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showCorrectAnim, setShowCorrectAnim] = useState(false)
  const [starUsedOnThisQuestion, setStarUsedOnThisQuestion] = useState(false)
  const audioCtxRef = useRef(null)
  const timerRef = useRef(null)
  const qBgmRef = useRef(null)

  useEffect(() => {
    if (qBgmRef.current) qBgmRef.current.volume = 0.5
  }, [])

  // Adaptive Timer Logic
  const calculateInitialTime = (tier, turn) => {
    if (tier === 3) return 45 // Tier 3: Always 45s, 1 try
    if (tier === 2) {
      if (turn === 1) return 17
      if (turn === 2) return 10
      return 5
    }
    // Tier 1
    if (turn === 1) return 17
    if (turn === 2) return 8
    return 5
  }

  useEffect(() => {
    audioCtxRef.current = createAudioContext()
    const time = calculateInitialTime(question.tier, 1)
    setInitialTime(time)
    setTimeLeft(time)
    setTimerActive(false) // Wait for MC to select the team
  }, [question])

  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0 }
        if (t <= 6) playTickSound(audioCtxRef.current)
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerActive])

  // Auto-transition for Guess questions
  useEffect(() => {
    if (isCorrect && question.type === 'guess') {
      const timer = setTimeout(() => {
        onCorrect(question.tier, activeTeam?.id)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isCorrect, question.type, question.tier, activeTeam, onCorrect])

  const hasStar = !starUsedOnThisQuestion && activeTeam && (teamStars[activeTeam.id] ?? 0) > 0
  const isTier3 = question.tier === 3

  const handleInitialTeamSelect = (team) => {
    setActiveTeam(team)
    setTimerActive(true) // Start the clock once team is confirmed!
  }

  const handleOptionClick = (idx) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setTimerActive(false)
    clearInterval(timerRef.current)

    if (idx === question.answer) {
      setIsCorrect(true)
      setIsAnswered(true)
      setShowCorrectAnim(true)
      playCorrectSound(audioCtxRef.current)
    } else {
      setIsCorrect(false)
      setIsAnswered(true)
      const r = WRONG_REACTIONS[Math.floor(Math.random() * WRONG_REACTIONS.length)]
      setReaction(r)
      playWrongSound(audioCtxRef.current)
      setShowWrongChoices(true)
    }
  }

  const handleUseStarExtraLife = () => {
    setStarUsedOnThisQuestion(true)
    setShowWrongChoices(false)
    setIsAnswered(false)
    setSelectedOption(null)
    setReaction(null)
    // Don't change turnCount or ActiveTeam, just reset time for current team
    setTimeLeft(initialTime)
    setTimerActive(true)
    playStarSound(audioCtxRef.current)
    onUseStarExtraLife(activeTeam.id)
  }

  const handleOpenStealUI = () => {
    setShowWrongChoices(false)
    setShowStealUI(true)
  }

  const handleSteal = (newTeam) => {
    setActiveTeam(newTeam)
    setTurnCount(prev => prev + 1)
    const nextTime = calculateInitialTime(question.tier, turnCount + 1)
    setInitialTime(nextTime)
    setTimeLeft(nextTime)
    setIsAnswered(false)
    setSelectedOption(null)
    setReaction(null)
    setShowStealUI(false)
    setTimerActive(true)
    setStarUsedOnThisQuestion(false)
  }

  const timerPct = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0
  const timerColor = timeLeft > 10 ? '#4FC3F7' : timeLeft > 5 ? '#FFD700' : '#FF5252'
  const optLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="q-modal-backdrop">
      {/* Background Music Logic */}
      <audio ref={qBgmRef} src="/bgm-question.mp3" autoPlay loop />

      <div className="q-modal glass tiered-modal">
        {/* Tier Indicator */}
        <div className={`q-tier-badge tier-${question.tier}`}>
          {Array(question.tier).fill('⭐').join('')} Bậc {question.tier}
        </div>

        {/* Header */}
        <div className="q-modal-header">
          <div className="q-num-badge">Câu #{questionNumber}</div>
          <div className="q-team-label" style={{ color: activeTeam?.color || 'white' }}>
            <span className="q-team-dot" style={{ background: activeTeam?.color || 'white' }} />
            {activeTeam?.name || '---'}
            {hasStar && <span title="Còn Ngôi Sao Hy Vọng" style={{ marginLeft: 6 }}>⭐</span>}
          </div>
          <div className="q-timer" style={{ color: timerColor }}>
            <svg className="q-timer-ring" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle cx="20" cy="20" r="16" fill="none" stroke={timerColor} strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - timerPct / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <span className="q-timer-num">{timeLeft}</span>
          </div>
        </div>

        {/* Question body */}
        <div className="q-question-text">{question.question}</div>
        {question.image && (
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img src={question.image} alt="Question Graphic" style={{ maxWidth: '100%', maxHeight: '30vh', borderRadius: '12px', objectFit: 'contain', filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.2))' }} />
          </div>
        )}

        {/* Interactive Options or Team Selection */}
        {/* Interactive Options or Team Selection */}
        {!activeTeam && (
          <div className="q-team-selector" style={{ marginTop: '20px', textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#FFD700', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Đội nào giành quyền trả lời?</h3>
            <div className="sm-team-list" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {teams.map(t => (
                <button
                  key={t.id}
                  className="btn"
                  style={{ background: t.color, color: 'white', padding: '8px 16px', fontSize: '1rem', borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer' }}
                  onClick={() => handleInitialTeamSelect(t)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {question.type === 'guess' ? (
          <div className="q-guess-area" style={{ opacity: activeTeam ? 1 : 0.6, transition: 'opacity 0.3s' }}>
            <div className="q-guess-word" style={{
              fontSize: '2.5rem',
              letterSpacing: '8px',
              textAlign: 'center',
              margin: '20px 0',
              fontWeight: '800',
              color: isCorrect && isAnswered ? '#166534' : '#FFD700',
              textShadow: isCorrect && isAnswered ? 'none' : '0 4px 15px rgba(255,215,0,0.4)',
              padding: '20px',
              background: isCorrect && isAnswered ? 'rgba(117, 213, 240, 0.6)' : 'rgba(0,0,0,0.3)',
              borderRadius: '15px',
              border: isCorrect && isAnswered ? '2px solid rgba(117, 213, 240, 1)' : '2px dashed rgba(255,215,0,0.5)',
              transition: 'all 0.5s ease',
              backdropFilter: isCorrect && isAnswered ? 'blur(8px)' : 'none'
            }}>
              {(isCorrect && isAnswered) ? question.answerText : question.options[0]}
            </div>
            <div className="q-guess-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
              <button
                className="btn"
                onClick={() => handleOptionClick(1)}
                disabled={!activeTeam || isAnswered || showCorrectAnim || showStealUI}
                style={{ padding: '15px 35px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: 'white', border: 'none', borderRadius: '50px', boxShadow: '0 4px 15px rgba(76,175,80,0.3)', cursor: !activeTeam ? 'not-allowed' : 'pointer' }}
              >
                ✅ ĐÚNG
              </button>
              <button
                className="btn"
                onClick={() => handleOptionClick(0)}
                disabled={!activeTeam || isAnswered || showCorrectAnim || showStealUI}
                style={{ padding: '15px 35px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #F44336, #C62828)', color: 'white', border: 'none', borderRadius: '50px', boxShadow: '0 4px 15px rgba(244,67,54,0.3)', cursor: !activeTeam ? 'not-allowed' : 'pointer' }}
              >
                ❌ SAI
              </button>
            </div>
          </div>
        ) : (
          <div className="q-options" style={{ opacity: activeTeam ? 1 : 0.4, transition: 'opacity 0.3s', pointerEvents: !activeTeam ? 'none' : 'auto' }}>
            {question.options.map((opt, idx) => {
              let optClass = 'q-option'
              if (isAnswered && selectedOption === idx) {
                optClass += isCorrect ? ' correct' : ' wrong'
              }
              if (showCorrectAnim && idx === question.answer) optClass += ' correct highlight'
              return (
                <button
                  key={idx}
                  className={optClass}
                  onClick={() => handleOptionClick(idx)}
                  disabled={!activeTeam || isAnswered || showCorrectAnim || showStealUI}
                >
                  <span className="q-opt-label">{optLabels[idx]}</span>
                  <span className="q-opt-text">{opt}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Reward Preview */}
        {!isAnswered && (
          <div className="q-reward-preview">
            Phần thưởng: <strong>{question.tier} lượt quay thưởng!</strong> 🎰
          </div>
        )}

        {/* WRONG OVERLAY / CHOICE */}
        {reaction && showWrongChoices && (
          <div className="q-wrong-overlay">
            <div className="q-wrong-content glass">
              <span className="q-reaction-emoji">{reaction.emoji}</span>
              <p className="q-reaction-text">{reaction.text}</p>

              <div className="q-wrong-actions">
                {hasStar && !isTier3 && (
                  <button className="btn star-extralife" onClick={handleUseStarExtraLife}>
                    ⭐ Dùng Ngôi Sao Hy Vọng
                  </button>
                )}

                {!isTier3 && (
                  <button className="btn btn-primary" onClick={handleOpenStealUI}>
                    🤝 Nhường quyền (Steal)
                  </button>
                )}

                <button className="btn btn-secondary" onClick={onNextQuestion}>
                  ⏭️ Câu tiếp theo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEAL MODAL / SELECTOR */}
        {showStealUI && (
          <div className="q-steal-overlay">
            <div className="q-steal-content glass">
              <h3>🤝 Chọn đội nhường quyền:</h3>
              <p>Thời gian cho đội mới: <strong>{calculateInitialTime(question.tier, turnCount + 1)}s</strong></p>
              <div className="q-steal-teams">
                {teams.filter(t => t.id !== activeTeam.id).map(team => (
                  <button
                    key={team.id}
                    className="btn q-steal-team-btn"
                    style={{ '--team-color': team.color }}
                    onClick={() => handleSteal(team)}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary mt-10" onClick={() => setShowWrongChoices(true) & setShowStealUI(false)}>
                Quay lại
              </button>
            </div>
          </div>
        )}

        {/* CORRECT OVERLAY */}
        {/* CORRECT OVERLAY - Only for multiple choice, guess questions show success in-place */}
        {showCorrectAnim && question.type !== 'guess' && (
          <div className="q-correct-overlay">
            <div className="q-correct-content">
              <span className="q-correct-emoji">🎉</span>
              <p className="q-correct-text">Chính xác!</p>
              {question.type === 'guess' && (
                <p style={{ color: '#4CAF50', fontWeight: '800', fontSize: '1.2rem', marginBottom: '10px' }}>
                  ĐÁP ÁN: {question.answerText}
                </p>
              )}
              <p className="q-correct-sub"><strong>{activeTeam?.name}</strong> nhận được <strong>{question.tier} lượt quay!</strong></p>
              {question.type === 'guess' ? (
                <div style={{ marginTop: '20px', color: 'var(--gold)', fontWeight: '600', fontStyle: 'italic' }}>
                  ⌛ Vòng quay sẽ mở sau 5 giây...
                </div>
              ) : (
                <button className="btn btn-gold q-correct-btn" onClick={() => onCorrect(question.tier, activeTeam.id)}>
                  🎰 Bắt đầu quay ngay!
                </button>
              )}
            </div>
          </div>
        )}

        {/* TIMEOUT */}
        {timeLeft === 0 && !showCorrectAnim && !isAnswered && (
          <div className="q-timeout-overlay">
            <div className="q-timeout-content glass">
              <span className="q-timeout-emoji">⏰</span>
              <p className="q-timeout-text">Hết giờ rồi!</p>
              <div className="q-wrong-actions">
                {!isTier3 && (
                  <button className="btn btn-primary" onClick={handleOpenStealUI}>
                    🤝 Nhường quyền (Steal)
                  </button>
                )}
                <button className="btn btn-secondary" onClick={onNextQuestion}>⏭️ Câu tiếp theo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
