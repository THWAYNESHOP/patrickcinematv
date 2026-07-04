import { useEffect, useCallback } from 'react'
import { getPageState, setPageState } from '../utils/pageStateCache'

export type PageCacheData = Record<string, unknown>

export function usePageState(pageKey: string) {
  useEffect(() => {
    const state = getPageState(pageKey)
    if (state?.scrollY !== undefined && typeof window !== 'undefined') {
      window.scrollTo({ top: state.scrollY, behavior: 'auto' })
    }
  }, [pageKey])

  useEffect(() => {
    const handleScroll = () => {
      setPageState(pageKey, { scrollY: window.scrollY })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pageKey])

  const getCarouselPosition = useCallback(
    (carouselId: string) => {
      const state = getPageState(pageKey)
      return state?.carouselPositions?.[carouselId] ?? 0
    },
    [pageKey],
  )

  const setCarouselPosition = useCallback(
    (carouselId: string, scrollLeft: number) => {
      setPageState(pageKey, { carouselPositions: { [carouselId]: scrollLeft } })
    },
    [pageKey],
  )

  const getFocusedCardId = useCallback(
    (carouselId: string) => {
      const state = getPageState(pageKey)
      return state?.focusedCardIds?.[carouselId] ?? null
    },
    [pageKey],
  )

  const setFocusedCardId = useCallback(
    (carouselId: string, cardId: string) => {
      setPageState(pageKey, { focusedCardIds: { [carouselId]: cardId } })
    },
    [pageKey],
  )

  const getPageData = useCallback(
    <T extends PageCacheData = PageCacheData>(key: string) => {
      const state = getPageState(pageKey)
      return (state?.data?.[key] as T) ?? null
    },
    [pageKey],
  )

  const setPageData = useCallback(
    (key: string, data: unknown) => {
      setPageState(pageKey, { data: { [key]: data } })
    },
    [pageKey],
  )

  return {
    getCarouselPosition,
    setCarouselPosition,
    getFocusedCardId,
    setFocusedCardId,
    getPageData,
    setPageData,
  }
}
