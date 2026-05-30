import { useState } from 'react'
import LiveMatches from '../components/Sports/LiveMatches'
import SportsFilters from '../components/Sports/SportsFilters'

export default function Sports() {
  const [selectedSport, setSelectedSport] = useState('all')

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 neon-text">Sports</h1>
        
        <SportsFilters 
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
        />
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 neon-text">Live Now</h2>
          <LiveMatches sport={selectedSport} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 neon-text">Upcoming Matches</h2>
          <LiveMatches sport={selectedSport} variant="upcoming" />
        </section>
      </div>
    </div>
  )
}
