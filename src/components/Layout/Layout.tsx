import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileNav from './MobileNav'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)

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
