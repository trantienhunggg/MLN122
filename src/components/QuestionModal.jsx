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

const TIER_THEMES = {
  1: { bg: 'linear-gradient(135deg, #0a1628, #132d50, #0d2035)', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.25)' },
  2: { bg: 'linear-gradient(135deg, #1f1a08, #352a0c, #1a1505)', accent: '#FFD54F', glow: 'rgba(255,213,79,0.25)' },
  3: { bg: 'linear-gradient(135deg, #200808, #3a0e0e, #1a0505)', accent: '#FF5252', glow: 'rgba(255,82,82,0.25)' },
}

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

  const calculateInitialTime = (tier, turn) => {
    if (tier === 3) return 45
    if (tier === 2) { return turn === 1 ? 17 : turn === 2 ? 10 : 5 }
    return turn === 1 ? 17 : turn === 2 ? 8 : 5
  }

  useEffect(() => {
    audioCtxRef.current = createAudioContext()
    const time = calculateInitialTime(question.tier, 1)
    setInitialTime(time)
    setTimeLeft(time)
    setTimerActive(false)
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

  useEffect(() => {
    if (isCorrect && question.type === 'guess') {
      const timer = setTimeout(() => onCorrect(question.tier, activeTeam?.id), 3000)
      return () => clearTimeout(timer)
    }
  }, [isCorrect, question.type, question.tier, activeTeam, onCorrect])

  const hasStar = !starUsedOnThisQuestion && activeTeam && (teamStars[activeTeam.id] ?? 0) > 0
  const isTier3 = question.tier === 3
  const theme = TIER_THEMES[question.tier] || TIER_THEMES[1]
  const timerPct = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0
  const timerColor = timeLeft > 10 ? '#4FC3F7' : timeLeft > 5 ? '#FFD700' : '#FF5252'
  const optLabels = ['A', 'B', 'C', 'D']
  const CIRC = 2 * Math.PI * 52

  const handleInitialTeamSelect = (team) => { setActiveTeam(team); setTimerActive(true) }

  const handleOptionClick = (idx) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setTimerActive(false)
    clearInterval(timerRef.current)
    if (idx === question.answer) {
      setIsCorrect(true); setIsAnswered(true); setShowCorrectAnim(true)
      playCorrectSound(audioCtxRef.current)
    } else {
      setIsCorrect(false); setIsAnswered(true)
      setReaction(WRONG_REACTIONS[Math.floor(Math.random() * WRONG_REACTIONS.length)])
      playWrongSound(audioCtxRef.current)
      setShowWrongChoices(true)
    }
  }

  const handleUseStarExtraLife = () => {
    setStarUsedOnThisQuestion(true); setShowWrongChoices(false)
    setIsAnswered(false); setSelectedOption(null); setReaction(null)
    setTimeLeft(initialTime); setTimerActive(true)
    playStarSound(audioCtxRef.current); onUseStarExtraLife(activeTeam.id)
  }

  const handleOpenStealUI = () => { setShowWrongChoices(false); setShowStealUI(true) }

  const handleSteal = (newTeam) => {
    setActiveTeam(newTeam); setTurnCount(prev => prev + 1)
    const nextTime = calculateInitialTime(question.tier, turnCount + 1)
    setInitialTime(nextTime); setTimeLeft(nextTime)
    setIsAnswered(false); setSelectedOption(null); setReaction(null)
    setShowStealUI(false); setTimerActive(true); setStarUsedOnThisQuestion(false)
  }

  return (
    <div className="qp-page" style={{ background: theme.bg }}>
      {/* Background orbs */}
      <div className="qp-orb qp-orb-1" style={{ background: `radial-gradient(circle, ${theme.glow}, transparent)` }} />
      <div className="qp-orb qp-orb-2" style={{ background: `radial-gradient(circle, ${theme.glow}, transparent)` }} />

      <div className="qp-container">
        {/* ── HEADER ── */}
        <header className="qp-header">
          <div className={`qp-tier tier-${question.tier}`}>
            <span className="qp-tier-stars">{'★'.repeat(question.tier)}</span>
            <span>Bậc {question.tier}</span>
          </div>

          <div className="qp-header-center">
            <span className="qp-qnum">Câu #{questionNumber}</span>
            {activeTeam && (
              <div className="qp-team-pill" style={{ borderColor: activeTeam.color, color: activeTeam.color }}>
                <span className="qp-team-dot" style={{ background: activeTeam.color }} />
                {activeTeam.name}
                {hasStar && <span className="qp-star-badge">★</span>}
              </div>
            )}
          </div>

          <div className="qp-timer" style={{ '--t-color': timerColor }}>
            <svg viewBox="0 0 120 120" className="qp-timer-svg">
              <circle cx="60" cy="60" r="52" className="qp-timer-track" />
              <circle cx="60" cy="60" r="52" className="qp-timer-fill"
                style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - timerPct / 100) }} />
            </svg>
            <span className={`qp-timer-num${timeLeft <= 5 ? ' danger' : ''}`}>{timeLeft}</span>
          </div>
        </header>

        {/* ── BODY ── */}
        <main className="qp-body">
          {/* Team Selection */}
          {!activeTeam && (
            <div className="qp-team-select">
              <h3 className="qp-team-select-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Đội nào giành quyền trả lời?
              </h3>
              <div className="qp-team-cards">
                {teams.map(t => (
                  <button key={t.id} className="qp-team-card" style={{ '--tc': t.color }} onClick={() => handleInitialTeamSelect(t)}>
                    <span className="qp-tc-dot" style={{ background: t.color }} />
                    <span className="qp-tc-name">{t.name}</span>
                    {(teamStars[t.id] ?? 0) > 0 && <span className="qp-tc-star">★</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="qp-qcard" style={{ '--accent': theme.accent }}>
            <p className="qp-qtext">{question.question}</p>
            {question.image && (
              <div className="qp-qimg-wrap">
                <img src={question.image} alt="Hình câu hỏi" className="qp-qimg" />
              </div>
            )}
          </div>

          {/* Options */}
          {question.type === 'guess' ? (
            <div className="qp-guess" style={{ opacity: activeTeam ? 1 : 0.4, pointerEvents: activeTeam ? 'auto' : 'none' }}>
              <div className={`qp-guess-display${isCorrect && isAnswered ? ' revealed' : ''}`}>
                {(isCorrect && isAnswered) ? question.answerText : question.options[0]}
              </div>
              <div className="qp-guess-btns">
                <button className="qp-gbtn qp-gbtn-yes" onClick={() => handleOptionClick(1)}
                  disabled={!activeTeam || isAnswered || showCorrectAnim || showStealUI}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ĐÚNG
                </button>
                <button className="qp-gbtn qp-gbtn-no" onClick={() => handleOptionClick(0)}
                  disabled={!activeTeam || isAnswered || showCorrectAnim || showStealUI}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  SAI
                </button>
              </div>
            </div>
          ) : (
            <div className="qp-options" style={{ opacity: activeTeam ? 1 : 0.4, pointerEvents: activeTeam ? 'auto' : 'none' }}>
              {question.options.map((opt, idx) => {
                let cls = 'qp-opt'
                if (isAnswered && selectedOption === idx) cls += isCorrect ? ' correct' : ' wrong'
                if (showCorrectAnim && idx === question.answer) cls += ' correct glow'
                return (
                  <button key={idx} className={cls} onClick={() => handleOptionClick(idx)}
                    disabled={!activeTeam || isAnswered || showCorrectAnim || showStealUI}>
                    <span className="qp-opt-ltr">{optLabels[idx]}</span>
                    <span className="qp-opt-txt">{opt}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Reward */}
          {!isAnswered && (
            <div className="qp-reward" style={{ color: theme.accent }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2">
                <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
              </svg>
              Phần thưởng: <strong>{question.tier} lượt quay!</strong>
            </div>
          )}
        </main>
      </div>

      {/* ── WRONG OVERLAY ── */}
      {reaction && showWrongChoices && (
        <div className="qp-overlay">
          <div className="qp-overlay-card qp-wrong-card">
            <div className="qp-wrong-icon">✕</div>
            <p className="qp-wrong-text">{reaction.text}</p>
            <div className="qp-wrong-actions">
              {hasStar && !isTier3 && (
                <button className="qp-action-btn qp-star-btn" onClick={handleUseStarExtraLife}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  Dùng Ngôi Sao Hy Vọng
                </button>
              )}
              {!isTier3 && (
                <button className="qp-action-btn qp-steal-btn" onClick={handleOpenStealUI}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  Nhường quyền trả lời
                </button>
              )}
              <button className="qp-action-btn qp-skip-btn" onClick={onNextQuestion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
                Câu tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEAL OVERLAY ── */}
      {showStealUI && (
        <div className="qp-overlay">
          <div className="qp-overlay-card qp-steal-card">
            <h3 className="qp-steal-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
              Chọn đội nhường quyền
            </h3>
            <p className="qp-steal-sub">Thời gian: <strong>{calculateInitialTime(question.tier, turnCount + 1)}s</strong></p>
            <div className="qp-steal-teams">
              {teams.filter(t => t.id !== activeTeam.id).map(team => (
                <button key={team.id} className="qp-steal-team" style={{ '--tc': team.color }} onClick={() => handleSteal(team)}>
                  <span className="qp-tc-dot" style={{ background: team.color }} />
                  {team.name}
                </button>
              ))}
            </div>
            <button className="qp-action-btn qp-back-btn" onClick={() => { setShowWrongChoices(true); setShowStealUI(false) }}>
              ← Quay lại
            </button>
          </div>
        </div>
      )}

      {/* ── CORRECT OVERLAY ── */}
      {showCorrectAnim && question.type !== 'guess' && (
        <div className="qp-overlay qp-correct-overlay">
          <div className="qp-overlay-card qp-correct-card">
            <div className="qp-correct-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="qp-correct-title">Chính xác!</h2>
            <p className="qp-correct-sub"><strong>{activeTeam?.name}</strong> nhận <strong>{question.tier} lượt quay!</strong></p>
            <button className="qp-action-btn qp-spin-btn" onClick={() => onCorrect(question.tier, activeTeam.id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 12l-4-4v8l4-4z" /></svg>
              Bắt đầu quay ngay!
            </button>
          </div>
        </div>
      )}

      {/* ── TIMEOUT OVERLAY ── */}
      {timeLeft === 0 && !showCorrectAnim && !isAnswered && (
        <div className="qp-overlay">
          <div className="qp-overlay-card qp-timeout-card">
            <div className="qp-timeout-icon">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h2 className="qp-timeout-title">Hết giờ!</h2>
            <div className="qp-wrong-actions">
              {!isTier3 && (
                <button className="qp-action-btn qp-steal-btn" onClick={handleOpenStealUI}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  Nhường quyền trả lời
                </button>
              )}
              <button className="qp-action-btn qp-skip-btn" onClick={onNextQuestion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
                Câu tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
