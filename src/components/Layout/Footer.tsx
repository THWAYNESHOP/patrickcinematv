import { Facebook, Twitter, Instagram, Youtube, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10 mt-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-16 overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center space-x-3 group">
              <Tv className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
              <span className="text-2xl font-bold text-white tracking-tight">NEXASTREAM</span>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed">
              Premium streaming experience with live sports, movies, TV series, and more.
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
              >
                <Facebook className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-3 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-3 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
              >
                <Instagram className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
              <a
                href="#"
                className="p-3 bg-darkSurface border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
              >
                <Youtube className="w-5 h-5 text-gray-400 hover:text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-8 text-base">
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 hover:text-shadow-sm font-medium">
              Contact Us
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 hover:text-shadow-sm font-medium">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300 hover:text-shadow-sm font-medium">
              Terms of Service
            </Link>
            <Link to="/dmca" className="text-gray-400 hover:text-white transition-colors duration-300 hover:text-shadow-sm font-medium">
              DMCA
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-10 text-center">
          <p className="text-gray-400 text-base font-medium">
            © 2024 NEXASTREAM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
