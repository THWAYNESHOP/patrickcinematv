import { useState } from 'react'
import LiveMatches from '../components/Sports/LiveMatches'
import SportsFilters from '../components/Sports/SportsFilters'

export default function Sports() {
  const [selectedSport, setSelectedSport] = useState('all')

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8 bg-deepBlack">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Sports
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            Live matches, upcoming events, and exclusive sports content
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-8 sm:mb-10">
          <SportsFilters 
            selectedSport={selectedSport}
            onSportChange={setSelectedSport}
          />
        </div>

        {/* Live Now Section */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              🔴 Live Now
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Watch matches happening right now
            </p>
          </div>
          <LiveMatches sport={selectedSport} />
        </section>

        {/* Upcoming Matches Section */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ⏰ Upcoming Matches
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Don't miss these upcoming events
            </p>
          </div>
          <LiveMatches sport={selectedSport} variant="upcoming" />
        </section>
      </div>
    </div>
  )
}
