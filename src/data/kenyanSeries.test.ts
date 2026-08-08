import { describe, expect, it } from 'vitest'
import { getOrderedKenyanSeriesItems } from './kenyanSeries'

describe('kenyanSeries ordering', () => {
  it('returns posts in display order for daily uploads', () => {
    expect(getOrderedKenyanSeriesItems().map((item) => item.id)).toEqual(['ayana', 'lulu', 'lazizi', 'second-family'])
  })
})
