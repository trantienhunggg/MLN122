import { PUZZLE_IMAGE_URL } from '../data'

export default function NumberBoard({ usedNumbers, onSelectNumber, currentTeam, randomHighlight }) {
  return (
    <div className="number-board-page">
      {/* Floating blobs background */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      {/* Header */}
      <div className="nb-header">
        <div className="nb-title">
          <span className="nb-emoji">🍱</span>
          <div>
            <h1>Kimbap Quiz</h1>
            <p className="nb-subtitle">Mở mảnh ghép để giải mã bức tranh bí ẩn!</p>
          </div>
        </div>
        {currentTeam && (
          <div className="nb-current-team" style={{ borderColor: currentTeam.color, color: currentTeam.color }}>
            <span className="nb-team-dot" style={{ background: currentTeam.color }} />
            Lượt: <strong>{currentTeam.name}</strong>
          </div>
        )}
      </div>

      {/* Puzzle Board Container */}
      <div className="puzzle-container">
        {/* The Hidden Image */}
        <div 
          className="puzzle-background" 
          style={{ backgroundImage: `url(${PUZZLE_IMAGE_URL})` }}
        />
        
        {/* Grid of tiles */}
        <div className="number-grid puzzle-grid">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
            const isUsed = usedNumbers.includes(num)
            const isHighlighted = randomHighlight === num
            
            return (
              <button
                key={num}
                className={`num-cell puzzle-tile${isUsed ? ' revealed' : ''}${isHighlighted ? ' highlighted' : ''}`}
                onClick={() => !isUsed && onSelectNumber(num)}
                disabled={isUsed}
              >
                {!isUsed && <span className="num-label">{num}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer progress */}
      <div className="nb-footer">
        <div className="nb-progress-bar">
          <div
            className="nb-progress-fill"
            style={{ width: `${(usedNumbers.length / 30) * 100}%` }}
          />
        </div>
        <p className="nb-progress-text">
          Đã mở: {usedNumbers.length} / 30 mảnh ghép
        </p>
      </div>
    </div>
  )
}
