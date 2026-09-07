import type { AyanaEpisode } from '../types/kenyanSeries'

export interface KenyanSeriesEpisodeRow {
  id: string
  series_id: string
  title: string
  thumbnail: string | null
  video_url: string
  air_date: string
  runtime: string | null
  part: number | null
  display_order: number | null
  is_published: boolean
}

export async function fetchKenyanSeriesEpisodes(seriesId: string): Promise<AyanaEpisode[]> {
  const response = await fetch(`/api/kenyan-series?series_id=${encodeURIComponent(seriesId)}`)
  if (!response.ok) throw new Error('Kenyan Series episodes could not be loaded.')

  const rows = (await response.json()) as KenyanSeriesEpisodeRow[]
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail || '/ayana.jpg',
    youtubeUrl: row.video_url,
    date: row.air_date,
    runtime: row.runtime || undefined,
    part: row.part ?? undefined,
  }))
}
