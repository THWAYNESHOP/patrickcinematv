import { Link } from 'react-router-dom'
import StaticPageLayout from '../components/Legal/StaticPageLayout'

export default function Contact() {
  return (
    <StaticPageLayout title="Contact Us">
      <p>
        Have questions, feedback, or need support? Reach out to the NEXASTREAM team and we&apos;ll
        get back to you as soon as we can.
      </p>
      <section className="rounded-2xl border border-white/10 bg-darkSurface p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">General inquiries</h2>
          <a href="mailto:support@nexastream.com" className="text-primary hover:text-white transition-colors">
            support@nexastream.com
          </a>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Legal &amp; copyright</h2>
          <a href="mailto:legal@nexastream.com" className="text-primary hover:text-white transition-colors">
            legal@nexastream.com
          </a>
        </div>
      </section>
      <p className="text-sm text-gray-500">
        For copyright or DMCA requests, please include detailed information about the content in
        question. See our{' '}
        <Link to="/dmca" className="text-primary hover:text-white transition-colors">
          DMCA Policy
        </Link>{' '}
        for required details.
      </p>
    </StaticPageLayout>
  )
}
