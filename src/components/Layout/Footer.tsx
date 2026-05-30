import { Facebook, Twitter, Instagram, Youtube, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Tv className="w-8 h-8 text-neonPink" />
              <span className="text-xl font-bold neon-text">PATRICK CINEMA TV</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Premium streaming experience with live sports, movies, TV series, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/movies" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  TV Series
                </Link>
              </li>
              <li>
                <Link to="/sports" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  Live Sports
                </Link>
              </li>
              <li>
                <Link to="/anime" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  Anime
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sports/football" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  Football
                </Link>
              </li>
              <li>
                <Link to="/sports/nba" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  NBA
                </Link>
              </li>
              <li>
                <Link to="/sports/ufc" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  UFC
                </Link>
              </li>
              <li>
                <Link to="/sports/f1" className="text-gray-400 hover:text-neonPink transition-colors text-sm">
                  Formula 1
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 glass rounded-full hover:bg-neonPink/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 glass rounded-full hover:bg-neonPink/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 glass rounded-full hover:bg-neonPink/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 glass rounded-full hover:bg-neonPink/20 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
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
