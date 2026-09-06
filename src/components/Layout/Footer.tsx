import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black py-6 md:py-10 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 text-center">
        <div className="flex flex-col items-center gap-4 md:gap-5">
          {/* Brand */}
          <Link to="/" className="group inline-block">
            <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase transition-all duration-300 group-hover:text-primary">
              <span className="text-primary">NEXA</span>STREAM
            </span>
          </Link>

          {/* Contact */}
          <a
            href="mailto:contact@nexastream.com"
            className="text-white font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-white/20 hover:decoration-primary/50"
          >
            contact@nexastream.com
          </a>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-5 md:gap-8 text-xs md:text-sm font-bold tracking-widest uppercase text-gray-500 mt-1">
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/dmca" className="hover:text-white transition-colors">DMCA</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
