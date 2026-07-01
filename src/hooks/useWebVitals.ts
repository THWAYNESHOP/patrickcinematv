import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'

export function useWebVitals() {
  useEffect(() => {
    const logMetric = (metric: Metric) => {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric)
      }

      // Send to analytics service in production
      if (import.meta.env.PROD) {
        // Replace with your analytics service
        // analytics.track('web_vital', {
        //   name: metric.name,
        //   value: metric.value,
        //   rating: metric.rating,
        // })
      }
    }

    onCLS(logMetric)
    onINP(logMetric)
    onFCP(logMetric)
    onLCP(logMetric)
    onTTFB(logMetric)
  }, [])
}
