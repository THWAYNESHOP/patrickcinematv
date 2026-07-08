export interface KenyanSeriesItem {
  id: string
  title: string
  description: string
  poster: string
  youtubeUrl: string
  trailerUrl: string
  tag?: string
  genre: string
  year: number
  runtime?: string
  backdrop: string
  overview: string
  displayOrder: number
}

export const kenyanSeriesItems: KenyanSeriesItem[] = [
  {
    id: 'ayana',
    title: 'AYANA',
    description: 'Ayana is now available with the full episode experience.',
    poster: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/JgS6vbjh5jA?si=JLuvl4RuNKUEGrAD',
    trailerUrl: 'https://youtu.be/JgS6vbjh5jA?si=JLuvl4RuNKUEGrAD',
    tag: 'New',
    genre: 'Drama • Family • Romance • Mystery',
    year: 2026,
    runtime: 'Approx. 45 min/ep',
    backdrop: '/ayana.jpg',
    overview: 'This post brings the Ayana video directly into the experience with the new requested title and link.',
    displayOrder: 1,
  },
  {
    id: 'lulu',
    title: 'Lulu',
    description: 'Lulu is a gripping Kenyan crime drama that follows the powerful Tindo family, whose wealth and influence conceal a dangerous criminal empire.',
    poster: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/-Im-CnxHSLM?si=9jmnC0HC66nat-nR',
    trailerUrl: 'https://youtu.be/-Im-CnxHSLM?si=9jmnC0HC66nat-nR',
    tag: 'Trending',
    genre: 'Crime • Drama • Family • Thriller',
    year: 2026,
    runtime: 'Approx. 45 min/ep',
    backdrop: '/lulu.jpg',
    overview: 'When the family patriarch\'s death sparks a fierce struggle for control, hidden secrets, betrayals, revenge, and deadly power games threaten to destroy the dynasty from within. As loyalties shift and enemies close in, every decision could mean the difference between survival and destruction.',
    displayOrder: 2,
  },
  {
    id: 'lazizi',
    title: 'Lazizi',
    description: 'Lazizi is a captivating Kenyan drama set in the sugarcane belt of Western Kenya. It follows Mark Mbotela, a wealthy sugar factory mogul whose decision to run for governor is driven by a desperate need to protect the dark secrets of his past.',
    poster: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/9c0WvhoE-pA?si=Q_2dxW23sK6Y2M4Q',
    trailerUrl: 'https://youtu.be/9c0WvhoE-pA?si=Q_2dxW23sK6Y2M4Q',
    tag: 'Daily',
    genre: 'Drama • Political • Family • Romance',
    year: 2026,
    runtime: 'Approx. 45 min/ep',
    backdrop: '/lazizi.jpg',
    overview: 'As hidden truths resurface, forbidden love, family rivalries, betrayal, and political ambition collide, threatening to destroy the empire he has spent a lifetime building.',
    displayOrder: 3,
  },
]

export function getKenyanSeriesItem(id?: string) {
  if (!id) return null

  const normalizedId = id.toLowerCase()

  return (
    getOrderedKenyanSeriesItems().find((item) => item.id === normalizedId || `${item.id}-${item.id}` === normalizedId) ?? null
  )
}

export function getOrderedKenyanSeriesItems() {
  return [...kenyanSeriesItems].sort((a, b) => a.displayOrder - b.displayOrder)
}
