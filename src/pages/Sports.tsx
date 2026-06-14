import { useState } from 'react'
import LiveMatches from '../components/Sports/LiveMatches'
import SportsFilters from '../components/Sports/SportsFilters'

export default function Sports() {
  const [selectedSport, setSelectedSport] = useState('all')

  return (
    <div className="min-h-screen py-16 px-6 md:px-12 lg:px-16 bg-deepBlack">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Sports
          </h1>
          <p className="text-base text-gray-400 mt-3">
            Live matches, upcoming events, and exclusive sports content
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-12">
          <SportsFilters 
            selectedSport={selectedSport}
            onSportChange={setSelectedSport}
          />
        </div>

        {/* Live Now Section */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              🔴 Live Now
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Watch matches happening right now
            </p>
          </div>
          <LiveMatches sport={selectedSport} />
        </section>

        {/* Upcoming Matches Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              ⏰ Upcoming Matches
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Don't miss these upcoming events
            </p>
          </div>
          <LiveMatches sport={selectedSport} variant="upcoming" />
        </section>
      </div>
    </div>
  )
}
