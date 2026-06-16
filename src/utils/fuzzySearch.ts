import Fuse from 'fuse.js';

export interface SearchableItem {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'anime' | 'sports';
  year?: number;
  rating?: string;
  poster?: string;
  genre?: string[];
  language?: string;
}

export function createFuzzySearch(items: SearchableItem[]) {
  const fuse = new Fuse(items, {
    keys: [
      {
        name: 'title',
        weight: 0.7,
      },
      {
        name: 'genre',
        weight: 0.2,
      },
      {
        name: 'type',
        weight: 0.1,
      },
    ],
    threshold: 0.3,
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
  });

  return fuse;
}

export function performFuzzySearch(items: SearchableItem[], query: string): SearchableItem[] {
  if (!query || query.length < 2) {
    return items;
  }

  const fuse = createFuzzySearch(items);
  const results = fuse.search(query);
  
  return results.map((result) => result.item);
}

export function getSearchSuggestions(items: SearchableItem[], query: string, limit: number = 5): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const fuse = new Fuse(items, {
    keys: ['title'],
    threshold: 0.4,
    includeScore: true,
  });

  const results = fuse.search(query);
  return results.slice(0, limit).map((result) => result.item.title);
}
