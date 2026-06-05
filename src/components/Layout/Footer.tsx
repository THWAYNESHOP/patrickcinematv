import { Facebook, Twitter, Instagram, Youtube, Tv, Film, Tv2, Trophy, Shield, Footprints } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Tv className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-white tracking-tight">PATRICK CINEMA TV</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Premium streaming experience with live sports, movies, TV series, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base sm:text-lg">Quick Links</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/movies"
                className="flex min-w-0 items-center gap-3 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">Movies</span>
              </Link>
              <Link
                to="/tv"
                className="flex min-w-0 items-center gap-3 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Tv2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">TV Series</span>
              </Link>
              <Link
                to="/sports"
                className="flex min-w-0 items-center gap-3 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">Live Sports</span>
              </Link>
              <Link
                to="/anime"
                className="flex min-w-0 items-center gap-3 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">Anime</span>
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base sm:text-lg">Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/sports/football"
                className="flex min-w-0 items-center gap-2 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">Football</span>
              </Link>
              <Link
                to="/sports/nba"
                className="flex min-w-0 items-center gap-2 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">NBA</span>
              </Link>
              <Link
                to="/sports/ufc"
                className="flex min-w-0 items-center gap-2 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">UFC</span>
              </Link>
              <Link
                to="/sports/f1"
                className="flex min-w-0 items-center gap-2 min-h-12 rounded-lg border border-white/10 bg-darkSurface px-4 py-3 text-sm sm:text-base text-gray-300 transition-all duration-200 hover:border-primary/30 hover:bg-white/5 hover:text-white active:scale-[0.99]"
              >
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="truncate">Formula 1</span>
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
              >
                <Facebook className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-2.5 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-2.5 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
              >
                <Instagram className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-2.5 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300"
              >
                <Youtube className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
              Contact Us
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/dmca" className="text-gray-400 hover:text-white transition-colors duration-300">
              DMCA
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 PATRICK CINEMA TV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
