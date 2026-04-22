import { useState } from 'react'
import TeamSetup from './components/TeamSetup'
import GameController from './components/GameController'
import ResultBoard from './components/ResultBoard'
import './App.css'

const TEAM_COLORS = [
  '#4FC3F7', '#81C784', '#FFD54F', '#F48FB1',
  '#CE93D8', '#80DEEA', '#FFAB91', '#A5D6A7',
]

function App() {
  const [phase, setPhase] = useState('setup')
  const [teams, setTeams] = useState([])
  const [teamInventories, setTeamInventories] = useState({})
  const [teamStars, setTeamStars] = useState({}) // { teamId: 1 } — each team starts with 1 star

  const handleStartGame = (teamNames) => {
    const newTeams = teamNames.map((name, idx) => ({
      id: idx,
      name,
      color: TEAM_COLORS[idx % TEAM_COLORS.length],
    }))
    const inventories = {}, stars = {}
    newTeams.forEach(t => { inventories[t.id] = {}; stars[t.id] = 1 })
    setTeams(newTeams)
    setTeamInventories(inventories)
    setTeamStars(stars)
    setPhase('game')
  }

  const handleAddIngredient = (teamId, ingredient) => {
    setTeamInventories(prev => {
      // Global stock check
      let totalStock = 0
      Object.values(prev).forEach(inv => {
        totalStock += (inv[ingredient.name] || 0)
      })

      if (totalStock >= 5) {
        console.warn(`Ingredient ${ingredient.name} is already at its limit of 5.`)
        return prev
      }

      const updated = { ...prev }
      const inv = { ...updated[teamId] }
      inv[ingredient.name] = (inv[ingredient.name] || 0) + 1
      updated[teamId] = inv
      return updated
    })
  }

  // Star used for extra life — just consume the star, no item added
  const handleUseStarForExtraLife = (teamId) => {
    setTeamStars(prev => ({ ...prev, [teamId]: Math.max(0, (prev[teamId] || 0) - 1) }))
  }

  // Star used to pick any item directly
  const handleUseStarForItem = (teamId, ingredient) => {
    setTeamStars(prev => ({ ...prev, [teamId]: Math.max(0, (prev[teamId] || 0) - 1) }))
    handleAddIngredient(teamId, ingredient)
  }

  const handleEndGame = () => setPhase('result')

  const handleRestart = () => {
    setPhase('setup')
    setTeams([])
    setTeamInventories({})
    setTeamStars({})
  }

  return (
    <div className="app-root">
      {phase === 'setup' && (
        <TeamSetup onStart={handleStartGame} />
      )}
      {phase === 'game' && (
        <GameController
          teams={teams}
          teamInventories={teamInventories}
          teamStars={teamStars}
          onAddIngredient={handleAddIngredient}
          onUseStarForExtraLife={handleUseStarForExtraLife}
          onUseStarForItem={handleUseStarForItem}
          onEndGame={handleEndGame}
        />
      )}
      {phase === 'result' && (
        <ResultBoard
          teams={teams}
          teamInventories={teamInventories}
          teamStars={teamStars}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

export default App
