import { useEffect, useRef, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileNav from './MobileNav'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const tickingRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 50
        setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))
        tickingRef.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-deepBlack pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Navbar isScrolled={isScrolled} />
      <main className="pt-16 md:pt-20">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  )
}
