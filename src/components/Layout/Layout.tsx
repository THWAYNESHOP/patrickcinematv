import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileNav from './MobileNav'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
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

  const isPlayerPage = /^(\/movie\/|\/tv\/|\/sports\/)/.test(location.pathname)

  return (
    <div className={`min-h-screen bg-deepBlack ${isPlayerPage ? 'pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-0' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'}`}>
      <Navbar isScrolled={isScrolled} isPlayerPage={isPlayerPage} />
      <main className={`pt-14 sm:pt-16 md:pt-20 ${isPlayerPage ? 'pb-2 sm:pb-4 md:pb-8' : ''}`}>{children}</main>
      <Footer />
      <MobileNav isPlayerPage={isPlayerPage} />
    </div>
  )
}
