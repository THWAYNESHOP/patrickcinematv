import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, Clock3, Play, Plus, Share2, Volume2, VolumeX, X } from 'lucide-react'
import DetailHero, { MetaStar } from '../components/Details/DetailHero'
import MediaRail from '../components/Details/MediaRail'
import { IconAction, PlayButton } from '../components/Details/DetailActions'
import ReviewsSection from '../components/Reviews/ReviewsSection'
import { useMyList } from '../hooks/useMyList'
import { useToast } from '../hooks/useToast'
import { useStore } from '../store/useStore'
import { getKenyanSeriesItem, getOrderedKenyanSeriesItems } from '../data/kenyanSeries'
import type { MovieSummary } from '../api/tmdb'

interface AyanaEpisode {
  id: string
  title: string
  thumbnail: string
  youtubeUrl: string
  date: string
  runtime?: string
  part?: number
}

const ayanaEpisodes: AyanaEpisode[] = [
  {
    id: 'part-1',
    title: 'AYANA | Citizen TV | Wednesday 8th July | Part 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/LhPIIBulRGc?si=iX6XmaWvjzKMeb4S',
    date: '2026-07-08',
    runtime: '45 min',
    part: 1,
  },
  {
    id: 'part-2',
    title: 'AYANA | Citizen TV | Wednesday 8th July | Part 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/1oBjuJnN8As?si=zgE1IvLoRLGOSfko',
    date: '2026-07-08',
    runtime: '45 min',
    part: 2,
  },
  {
    id: 'part-3',
    title: 'AYANA | Citizen TV | Wednesday 8th July | Part 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/DrBuNQ6i_Js?si=rAcqADFUmn-vSthK',
    date: '2026-07-08',
    runtime: '45 min',
    part: 3,
  },
  {
    id: 'part-4',
    title: 'AYANA | Citizen TV | Wednesday 8th July | Part 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/_f-5yeYh8Wc?si=ha5g3Tr7Neylt7Az',
    date: '2026-07-08',
    runtime: '45 min',
    part: 4,
  },
  {
    id: 'part-5',
    title: '10TH FRIDAY PART 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/5Rl21geGprw?si=onGv5wCUVhGaPkwu',
    date: '2026-07-10',
    runtime: '45 min',
    part: 5,
  },
  {
    id: 'part-6',
    title: '10TH FRIDAY PART 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/ekVv8BqxSJk?si=HIsDLLlOWdWo6KDZ',
    date: '2026-07-10',
    runtime: '45 min',
    part: 6,
  },
  {
    id: 'part-7',
    title: '13TH MONDAY PART 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/hRG9YRoGJHc?si=AVBon47H0YhoI5W0',
    date: '2026-07-13',
    runtime: '45 min',
    part: 7,
  },
  {
    id: 'part-8',
    title: '13TH MONDAY PART 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/VfHFp-G958M?si=C9ajOEhzp0Dt8XxY',
    date: '2026-07-13',
    runtime: '45 min',
    part: 8,
  },
  {
    id: 'part-9',
    title: '14TH TUESDAY PART 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/V3TV-5fiCDk?si=38TAlsECjzdvcW5z',
    date: '2026-07-14',
    runtime: '45 min',
    part: 9,
  },
  {
    id: 'part-10',
    title: '14TH TUESDAY PART 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/Sm6aAWiy650?si=_o_NMfbL6vkEvaHW',
    date: '2026-07-14',
    runtime: '45 min',
    part: 10,
  },
  {
    id: 'part-11',
    title: '15TH WEDNESDAY PART 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/_iHbZ5Ikyfo?si=6PZR1yi_BX1io6xA',
    date: '2026-07-15',
    runtime: '45 min',
    part: 11,
  },
  {
    id: 'part-12',
    title: '15TH WEDNESDAY PART 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/9WQDBhgHrYw?si=WzHgiArdP5t-KRky',
    date: '2026-07-15',
    runtime: '45 min',
    part: 12,
  },
  {
    id: 'part-13',
    title: '16TH THURSDAY FULL EPISODE',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/37rpPY_6nXE?si=Ri6ipDnEokpu6jd9',
    date: '2026-07-16',
    runtime: '45 min',
    part: 13,
  },
  {
    id: 'part-14',
    title: '17TH FRIDAY FULL EPISODE',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/COBZjHY4LJI?si=nQIYl9lPpiXhE7Mi',
    date: '2026-07-17',
    runtime: '45 min',
    part: 14,
  },
  {
    id: 'part-15',
    title: '20TH MONDAY FULL EPISODE',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/pzCjzV7BJvM?si=UTuSE16z9QzoogSc',
    date: '2026-07-20',
    runtime: '45 min',
    part: 15,
  },
  {
    id: 'part-16',
    title: '21ST TUESDAY FULL EPISODE',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/Y8wsDdb106o?si=ymNT_8-9C9f9gn0-',
    date: '2026-07-21',
    runtime: '45 min',
    part: 16,
  },
  {
    id: 'part-17',
    title: '11TH AUGUST PART 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://fembed.co/embed/ytRm-ScUi_NVe',
    date: '2026-08-11',
    runtime: '45 min',
    part: 17,
  },
  {
    id: 'part-18',
    title: '11TH AUGUST PART 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://fembed.co/embed/LKu-El4_Ibjvo',
    date: '2026-08-11',
    runtime: '45 min',
    part: 18,
  },
]

const luluEpisodes: AyanaEpisode[] = [
  {
    id: 'episode-12',
    title: '6TH MONDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/QLtR4_5HOnw?si=gmhbgLaMwe206GYe',
    date: '2026-07-06',
    runtime: '27 min',
  },
  {
    id: 'episode-13',
    title: '7TH TUESDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/MtiY2BnuUfQ?si=kcPg620rSX4bXVYl',
    date: '2026-07-07',
    runtime: '27 min',
  },
  {    id: 'episode-18',
    title: '14TH TUESDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/CO_DbeR4cO0?is=WLq2B5-05-T5v-jR',
    date: '2026-07-14',
    runtime: '27 min',
  },
  {    id: 'episode-14',
    title: '8TH WEDNESDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/lJh-NpxFFxE?si=c9CHnlDgBndRti_B',
    date: '2026-07-08',
    runtime: '27 min',
  },
  {
    id: 'episode-15',
    title: '9TH THURSDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/mV8pR3Rj_7c?si=GjWJZr212Ww6S5tB',
    date: '2026-07-09',
    runtime: '27 min',
  },
  {
    id: 'episode-16',
    title: '10TH FRIDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/su2-c9vYLKQ?si=QlxQ0iFLChMcK9T_',
    date: '2026-07-10',
    runtime: '27 min',
  },
  {
    id: 'episode-17',
    title: '13TH MONDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/hMdCIW9g_7A?si=kJX8xXzPinRv3ME3',
    date: '2026-07-13',
    runtime: '27 min',
  },
  {
    id: 'episode-19',
    title: '15TH WEDNESDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/H0clpzYqLNs?si=YcAg-WX99NH6d_A3',
    date: '2026-07-15',
    runtime: '27 min',
  },
  {
    id: 'episode-20',
    title: '16TH THURSDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/uOY2FLjH30o?si=U8lGA8TvgbFrVCwL',
    date: '2026-07-16',
    runtime: '27 min',
  },
  {
    id: 'episode-21',
    title: '17TH FRIDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/s0Np9mMUbtc?si=-k8arWbkb9ID3soM',
    date: '2026-07-17',
    runtime: '27 min',
  },
  {
    id: 'episode-22',
    title: '20TH MONDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/X6tuMCIMrQA?si=Yzgi8PWnxY6eO-TI',
    date: '2026-07-20',
    runtime: '27 min',
  },
]

const laziziEpisodes: AyanaEpisode[] = [
  {
    id: 'episode-13',
    title: '6TH MONDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/1zh1FNGcWgg?si=_iBSbsPEXS_sAdMS',
    date: '2026-07-06',
    runtime: '27 min',
  },
  {
    id: 'episode-14',
    title: '7TH TUESDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/ejlgwFm4Kqo?si=BiCk8vS7-F8UA0WB',
    date: '2026-07-07',
    runtime: '27 min',
  },
  {
    id: 'episode-19',
    title: '14TH TUESDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/Ucs5jeVRqBI?is=AXlXZj7H4roCvRpR',
    date: '2026-07-14',
    runtime: '27 min',
  },
  {
    id: 'episode-15',
    title: '8TH WEDNESDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/F9gThLhicBw?si=6eZOTz2_DJzkLrnr',
    date: '2026-07-08',
    runtime: '27 min',
  },
  {
    id: 'episode-16',
    title: '9TH THURSDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/Q9fHx3WjctU?si=ZAMd7wCEXe5dWIrb',
    date: '2026-07-09',
    runtime: '27 min',
  },
  {
    id: 'episode-17',
    title: '10TH FRIDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/SQfEMY2JXgc?si=rh6cyWESuvJRxPnA',
    date: '2026-07-10',
    runtime: '27 min',
  },
  {
    id: 'episode-18',
    title: '13TH MONDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/pHf6KPeM800?si=qCY8sgsHPI7Jqt2-',
    date: '2026-07-13',
    runtime: '27 min',
  },
  {
    id: 'episode-23',
    title: '11TH AUGUST',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://fembed.co/embed/UvCc-dks3_S1h',
    date: '2026-08-11',
    runtime: '27 min',
  },
]

const secondFamilyEpisodes: AyanaEpisode[] = [
  {
    id: 'episode-1',
    title: 'Episode 1',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/tO4M-lw_fav8l',
    date: '2026-08-08',
    runtime: '45 min',
  },
  {
    id: 'episode-2',
    title: 'Episode 2',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/n-Z_EhKyM5plH',
    date: '2026-08-08',
    runtime: '45 min',
  },
  {
    id: 'episode-3',
    title: 'Episode 3',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/OIYo_R8ki-RL9',
    date: '2026-08-08',
    runtime: '45 min',
  },
  {
    id: 'episode-4',
    title: 'Episode 4',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/6p_iu-APoAg4v',
    date: '2026-08-08',
    runtime: '45 min',
  },
  {
    id: 'episode-5',
    title: 'Episode 5',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/U_lgI-eNM1nXr',
    date: '2026-08-08',
    runtime: '45 min',
  },
  {
    id: 'episode-6',
    title: 'Episode 6',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/BIpcKfl-ji_GN',
    date: '2026-08-08',
    runtime: '45 min',
  },
  {
    id: 'episode-7',
    title: 'Episode 7',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/iYs_X4PG-RUjd',
    date: '2026-08-09',
    runtime: '45 min',
  },
  {
    id: 'episode-8',
    title: 'Episode 8',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/tYd-QGx_wAEjx',
    date: '2026-08-10',
    runtime: '45 min',
  },
  {
    id: 'episode-9',
    title: 'Episode 9',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/2Q-7USFEuJ_Ta',
    date: '2026-08-11',
    runtime: '45 min',
  },
  {
    id: 'episode-10',
    title: 'Episode 10',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/4-hrHhHypC_wO',
    date: '2026-08-12',
    runtime: '45 min',
  },
  {
    id: 'episode-11',
    title: 'Episode 11',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/v8v_y-K6MN49g',
    date: '2026-08-13',
    runtime: '45 min',
  },
  {
    id: 'episode-12',
    title: 'Episode 12',
    thumbnail: '/secondfamily.jpeg',
    youtubeUrl: 'https://fembed.co/embed/m-gXBNn_jPs86',
    date: '2026-08-14',
    runtime: '45 min',
  },
]

const sortEpisodes = (episodes: AyanaEpisode[]) => [...episodes].sort((a, b) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
  if (dateDiff !== 0) return dateDiff
  return (a.part ?? 0) - (b.part ?? 0)
})

const getSeriesEpisodes = (seriesId?: string): AyanaEpisode[] => {
  if (seriesId === 'lulu') return sortEpisodes(luluEpisodes)
  if (seriesId === 'lazizi') return sortEpisodes(laziziEpisodes)
  if (seriesId === 'ayana') return sortEpisodes(ayanaEpisodes)
  if (seriesId === 'second-family') return sortEpisodes(secondFamilyEpisodes)
  return []
}

const recommendedSeries: MovieSummary[] = getOrderedKenyanSeriesItems()
  .filter((item) => item.id !== 'ayana')
  .slice(0, 6)
  .map((item) => ({
    id: item.id,
    title: item.title,
    poster: item.poster,
    rating: '8.5',
    year: item.year,
    type: 'tv' as const,
  }))

export default function KenyanSeriesDetails() {
  const { id } = useParams()
  const [selectedEpisodeId, setSelectedEpisodeId] = useState('')
  const [showTrailer, setShowTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlayerActive, setIsPlayerActive] = useState(false)
  const [, setIsPlayerExpanded] = useState(false)
  const item = useMemo(() => getKenyanSeriesItem(id), [id])
  const toast = useToast()
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()
  const { getAverageRatingForMedia } = useStore()
  const setWatchProgress = useStore((state) => state.setWatchProgress)
  const getWatchProgress = useStore((state) => state.getWatchProgress)
  const continueWatching = useStore((state) => state.continueWatching)

  const sortedEpisodes = useMemo(() => getSeriesEpisodes(item?.id), [item?.id])
  const selectedEpisode = sortedEpisodes.find((episode) => episode.id === selectedEpisodeId) ?? sortedEpisodes[0]

  useEffect(() => {
    if (!sortedEpisodes.length) return

    setSelectedEpisodeId((current) => {
      if (current && sortedEpisodes.some((episode) => episode.id === current)) {
        return current
      }
      return sortedEpisodes[0].id
    })
  }, [sortedEpisodes])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowTrailer(true)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [id])

  const getYoutubeEmbedUrl = (youtubeUrl?: string, disableSubtitles = false, shouldMute = false) => {
    if (!youtubeUrl) return ''

    const trimmedUrl = youtubeUrl.trim()
    if (trimmedUrl.includes('fembed.co/embed/')) return trimmedUrl

    const youtubeMatch = trimmedUrl.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/)
    if (!youtubeMatch?.[1]) return ''

    const params = new URLSearchParams()
    params.set('autoplay', '1')
    params.set('mute', shouldMute ? '1' : '0')
    params.set('controls', '1')
    params.set('rel', '0')
    params.set('modestbranding', '1')
    params.set('playsinline', '1')
    params.set('iv_load_policy', '3')
    if (disableSubtitles) params.set('cc_load_policy', '0')
    params.set('disablekb', '1')
    params.set('fs', '1')
    try {
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        params.set('origin', window.location.origin)
      }
    } catch {
      // ignore
    }

    return `https://www.youtube.com/embed/${youtubeMatch[1]}?${params.toString()}`
  }

  const trailerSrc = useMemo(() => {
    if (!item) return ''
    return getYoutubeEmbedUrl(item.youtubeUrl, item.id === 'lazizi', true)
  }, [item])

  const selectedEpisodeEmbedUrl = useMemo(() => {
    return getYoutubeEmbedUrl(selectedEpisode?.youtubeUrl, item?.id === 'lazizi', false)
  }, [selectedEpisode?.youtubeUrl, item?.id])

  const trailer = trailerSrc ? { key: `${item?.id ?? 'series'}-trailer`, embedUrl: trailerSrc } : null
  const inMyList = isInMyList(id || '')
  const progressKey = item ? `${item.id}_episode_${selectedEpisode?.id ?? 'latest'}` : `series_episode_latest`
  const progress = getWatchProgress(progressKey)

  if (!item) {
    return (
      <div className="min-h-screen bg-deepBlack px-4 py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-lg font-semibold">Series not found</p>
          <p className="text-sm text-gray-400">The Kenyan series you&apos;re looking for isn&apos;t available yet.</p>
          <Link to="/kenyan-series" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Kenyan Series
          </Link>
        </div>
      </div>
    )
  }

  const handleWatch = (episode: AyanaEpisode) => {
    setSelectedEpisodeId(episode.id)
    setShowTrailer(false)
    setIsPlayerActive(true)
    setIsPlayerExpanded(true)
    if (item) {
      setWatchProgress(`${item.id}_episode_${episode.id}`, 0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMyList = () => {
    if (!item || !id) return

    const userRating = id ? getAverageRatingForMedia(id) : 0
    const rating = userRating > 0 ? userRating.toFixed(1) : '8.5'

    if (inMyList) {
      removeFromMyList(id)
      return
    }

    addToMyList({ id, title: item.title, poster: item.poster, rating, year: item.year, type: 'tv' })
  }

  const handleShare = async () => {
    const shareData = { title: item.title, text: item.overview, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch {
      /* dismissed */
    }
  }

  const handleTrailer = () => {
    setShowTrailer(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinue = () => {
    if (!selectedEpisode) return
    setSelectedEpisodeId(selectedEpisode.id)
    setShowTrailer(false)
    setIsPlayerActive(true)
    setIsPlayerExpanded(true)
    toast.success('Resumed from your latest watch position')
  }

  const currentIndex = sortedEpisodes.findIndex((episode) => episode.id === selectedEpisode?.id)
  const previousEpisode = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : undefined
  const nextEpisode = currentIndex >= 0 && currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : undefined

  return (
    <div className="min-h-screen bg-deepBlack text-white">
      {(() => {
        const userRating = id ? getAverageRatingForMedia(id) : 0
        const rating = userRating > 0 ? userRating.toFixed(1) : '8.5'
        return (
          <>
            <DetailHero
              backdrop={item.backdrop}
              poster={item.poster}
              title={item.title}
              meta={[
                { icon: <MetaStar />, label: rating },
                { icon: <Calendar className="w-3.5 h-3.5" />, label: String(item.year) },
                { icon: <Clock3 className="w-3.5 h-3.5" />, label: item.runtime ?? '45 min' },
              ]}
              genres={item.genre.split('•').map((entry) => entry.trim()).filter(Boolean)}
              overview={item.overview}
              trailer={trailer}
              showTrailer={showTrailer}
              topBadges={['Citizen TV', 'Kenyan Series']}
            >
              <PlayButton onClick={handleContinue}>
                <Play className="w-5 h-5 fill-black" />
                Play Latest Episode
              </PlayButton>
              <IconAction icon={<Play className="w-5 h-5" />} label="Trailer" onClick={handleTrailer} />
              <IconAction icon={inMyList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />} label={inMyList ? 'In My List' : 'My List'} onClick={handleMyList} active={inMyList} />
              <IconAction icon={<Share2 className="w-5 h-5" />} label="Share" onClick={handleShare} />
              {trailer && showTrailer && (
                <IconAction icon={isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />} label={isMuted ? 'Unmute' : 'Mute'} onClick={() => setIsMuted(!isMuted)} />
              )}
            </DetailHero>

            <div className="container mx-auto px-3 py-6 sm:px-4 md:px-8 md:py-8">
        <section className="mb-8 md:mb-10">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Now Playing</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{selectedEpisode?.title}</h2>
                </div>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden bg-black">
              {isPlayerActive && selectedEpisode?.youtubeUrl ? (
                <div className="relative h-full w-full">
                  <iframe
                    title={`${item.title} episode player`}
                    src={selectedEpisodeEmbedUrl || ''}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlayerActive(false)
                      setIsPlayerExpanded(false)
                    }}
                    className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label="Close player"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-black via-black/90 to-primary/20 p-4">
                  <div className="max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Episode player</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{selectedEpisode?.title}</h3>
                    <p className="mt-2 text-sm text-gray-300">Tap below to launch the premium episode player and start watching.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayerActive(true)
                        setIsPlayerExpanded(true)
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 fill-black" />
                      Play Episode
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Calendar className="h-4 w-4 text-primary" /> {selectedEpisode?.date}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {previousEpisode && (
                  <button type="button" onClick={() => handleWatch(previousEpisode)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Previous Episode</button>
                )}
                {nextEpisode && (
                  <button type="button" onClick={() => handleWatch(nextEpisode)} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">Next Episode</button>
                )}
                <Link to="/kenyan-series" className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/20">Back to Kenyan Series</Link>
              </div>
            </div>
          </div>
        </section>

        {continueWatching.length > 0 && (
          <section className="mb-8 md:mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Continue Watching</h2>
              <span className="text-sm text-gray-400">Resume from your last position</span>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-gray-400">Progress saved: {Math.round(progress)}%</p>
                </div>
                <button type="button" onClick={handleContinue} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary/90">Resume</button>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8 md:mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Latest Episodes</h2>
            <p className="text-sm text-gray-400">Newest uploads first</p>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedEpisodes.map((episode) => (
              <article key={episode.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20">
                <img src={episode.thumbnail} alt={episode.title} className="h-20 w-full object-cover sm:h-24" />
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <p className="text-xs font-semibold text-primary">{episode.date}</p>
                  <h3 className="mt-1 text-sm font-semibold leading-tight text-white">{episode.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleWatch(episode)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-primary/90">Watch</button>
                    <button type="button" onClick={() => handleWatch(episode)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10">Open</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {id && item && (
          <ReviewsSection
            mediaId={id}
            mediaType="tv"
            mediaTitle={item.title}
            mediaPoster={item.poster}
          />
        )}

        <MediaRail title="More Kenyan Series" items={recommendedSeries} type="tv" basePath="/kenyan-series" />
            </div>
          </>
        )
      })()}
    </div>
  )
}
