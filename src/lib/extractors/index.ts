export type StreamExtractorResult = {
  streamUrl: string
  streamType: 'hls' | 'mp4' | 'dash'
  subtitles?: Array<{ label: string; url: string }>
  headers?: Record<string, string>
}

abstract class BaseExtractor {
  protected async notImplemented(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number): Promise<StreamExtractorResult> {
    void tmdbId
    void kind
    void season
    void episode

    throw new Error(`${this.constructor.name} extraction is not implemented in this build.`)
  }
}

export class VidsrcTo extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Vidplay extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class VidsrcMe extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class VidLink extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class EmbedSt extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Moviesapi extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class VidsrcNet extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class VixSrc extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class TwoEmbed extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Videasy extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Vidflix extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class PrimeSrc extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Rabbitstream extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Megacloud extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Vidrock extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class Vidzee extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}

export class VidsrcRu extends BaseExtractor {
  async extract(tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) {
    return this.notImplemented(tmdbId, kind, season, episode)
  }
}
