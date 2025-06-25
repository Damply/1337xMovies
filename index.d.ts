export type Accuracy = 'high' | 'medium' | 'low'

export interface TorrentQuery {
  anilistId: number
  anidbAid?: number
  anidbEid?: number
  titles: string[]
  episode?: number
  episodeCount?: number
  resolution: '2160' | '1080' | '720' | '540' | '480' | ''
  exclusions: string[]
  type?: 'sub' | 'dub'
}

export interface TorrentResult {
  title: string
  link: string
  id?: number
  seeders: number
  leechers: number
  downloads: number
  accuracy: Accuracy
  hash: string
  size: number
  date: Date
  type?: 'batch' | 'best' | 'alt'
}

export type SearchFunction = (query: TorrentQuery) => Promise<TorrentResult[]>

export class TorrentSource {
  test: () => Promise<boolean>
  single: SearchFunction
  batch: SearchFunction
  movie: SearchFunction
}
