export type YAMatrixQuadrant =
  | 'GLOSSY_ROMCOM'
  | 'ATMOSPHERIC_SCENIC'
  | 'ELITE_AMBITION'
  | 'DARK_GRITTY'

export interface YAMediaItem {
  id: string
  title: string
  type: 'movie' | 'tv' | 'book'
  tmdbKeywords?: string[]
  vibeTags: string[]
  stakesLevel: 'low' | 'medium' | 'high'
}

export type YAMatrixOutput = Record<YAMatrixQuadrant, YAMediaItem[]>

export function classifyYAMatrix(item: YAMediaItem): YAMatrixQuadrant {
  const tags = new Set([...item.vibeTags, ...(item.tmdbKeywords || [])].map((tag) => tag.toLowerCase()))

  if (
    tags.has('neon') ||
    tags.has('gritty') ||
    tags.has('mystery') ||
    (item.stakesLevel === 'high' && tags.has('dark'))
  ) {
    return 'DARK_GRITTY'
  }

  if (tags.has('sports') || tags.has('college') || tags.has('boarding-school') || tags.has('ambition')) {
    return 'ELITE_AMBITION'
  }

  if (tags.has('coastal') || tags.has('beach') || tags.has('adventure') || tags.has('summer')) {
    return 'ATMOSPHERIC_SCENIC'
  }

  return 'GLOSSY_ROMCOM'
}

export function sortYATeenSection(mediaList: YAMediaItem[]): YAMatrixOutput {
  const matrix: YAMatrixOutput = {
    GLOSSY_ROMCOM: [],
    ATMOSPHERIC_SCENIC: [],
    ELITE_AMBITION: [],
    DARK_GRITTY: [],
  }

  for (const item of mediaList) {
    matrix[classifyYAMatrix(item)].push(item)
  }

  return matrix
}
