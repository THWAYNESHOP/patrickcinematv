import StaticPageLayout from '../components/Legal/StaticPageLayout'

export default function Dmca() {
  return (
    <StaticPageLayout title="DMCA Policy">
      <p>Last updated: June 29, 2026</p>
      <p>
        NEXASTREAM respects intellectual property rights and responds to valid Digital Millennium
        Copyright Act (DMCA) notices.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Filing a takedown notice</h2>
      <p>To submit a DMCA notice, please include:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Your contact information (name, address, phone, email)</li>
        <li>Identification of the copyrighted work claimed to be infringed</li>
        <li>Identification of the material on NEXASTREAM and its location (URL)</li>
        <li>A statement of good faith belief that use is not authorized</li>
        <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act</li>
        <li>Your physical or electronic signature</li>
      </ul>

      <section className="rounded-2xl border border-white/10 bg-darkSurface p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Send notices to</h2>
        <a href="mailto:dmca@nexastream.com" className="text-primary hover:text-white transition-colors">
          dmca@nexastream.com
        </a>
      </section>

      <h2 className="text-xl font-semibold text-white pt-2">Counter-notification</h2>
      <p>
        If you believe content was removed in error, you may submit a counter-notification with the
        information required under the DMCA. We will forward it to the original complainant and may
        restore content if appropriate.
      </p>
    </StaticPageLayout>
  )
}
