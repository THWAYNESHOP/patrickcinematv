import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, MapPin, ExternalLink, Film, Award, User as UserIcon } from 'lucide-react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi, type PersonDetails as PersonDetailsType, type PersonCredit } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

export default function PersonDetails() {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<PersonDetailsType | null>(null)
  const [credits, setCredits] = useState<PersonCredit[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchPersonData = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const [personData, creditsData] = await Promise.all([
        tmdbApi.getPersonDetails(Number(id)),
        tmdbApi.getPersonCredits(Number(id))
      ])
      setPerson(personData)
      setCredits(creditsData)
    } catch (error) {
      console.error('Failed to fetch person data:', error)
      toast.error('Failed to load person details. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchPersonData()
  }, [fetchPersonData])

  const movieCredits = credits.filter(c => c.media_type === 'movie')
  const tvCredits = credits.filter(c => c.media_type === 'tv')

  const convertToMovieSummary = (credit: PersonCredit): MovieSummary => ({
    id: credit.id,
    title: credit.title || credit.name || 'Untitled',
    poster: credit.poster,
    rating: credit.vote_average ? credit.vote_average.toFixed(1) : 'N/A',
    year: credit.release_date ? Number(credit.release_date.slice(0, 4)) : credit.first_air_date ? Number(credit.first_air_date.slice(0, 4)) : undefined,
    type: credit.media_type === 'tv' ? 'tv' : 'movie',
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-400 py-20">
            <p>Person not found</p>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const calculateAge = (birthday?: string, deathday?: string) => {
    if (!birthday) return null
    const birth = new Date(birthday)
    const death = deathday ? new Date(deathday) : new Date()
    const age = death.getFullYear() - birth.getFullYear()
    const monthDiff = death.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  const age = calculateAge(person.birthday, person.deathday)

  const DepartmentIcon = person.known_for_department === 'Acting' ? UserIcon : 
                        person.known_for_department === 'Directing' ? Film : 
                        person.known_for_department === 'Writing' ? Award : UserIcon

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-48 h-64 md:w-56 md:h-72 rounded-xl overflow-hidden bg-darkSurface">
                <img
                  src={person.profile}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Person Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{person.name}</h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <DepartmentIcon className="w-5 h-5" />
                  <span className="capitalize">{person.known_for_department}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {person.birthday && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {formatDate(person.birthday)}
                      {age && <span className="ml-2 text-gray-400">(Age: {age})</span>}
                    </span>
                  </div>
                )}
                {person.deathday && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Died: {formatDate(person.deathday)}</span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}
                {person.imdb_id && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <a
                      href={`https://www.imdb.com/name/${person.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      IMDb Profile
                    </a>
                  </div>
                )}
              </div>

              {person.biography && (
                <div className="pt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Biography</h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {person.biography}
                  </p>
                </div>
              )}

              {person.also_known_as && person.also_known_as.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Also Known As</h3>
                  <div className="flex flex-wrap gap-2">
                    {person.also_known_as.map((name, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        <div className="space-y-8">
          {movieCredits.length > 0 && (
            <ContentCarousel
              title={`Movies (${movieCredits.length})`}
              items={movieCredits.map(convertToMovieSummary)}
              type="movie"
              showProgress={false}
              loading={false}
            />
          )}

          {tvCredits.length > 0 && (
            <ContentCarousel
              title={`TV Shows (${tvCredits.length})`}
              items={tvCredits.map(convertToMovieSummary)}
              type="tv"
              showProgress={false}
              loading={false}
            />
          )}

          {movieCredits.length === 0 && tvCredits.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-gray-400">No filmography available for this person.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
