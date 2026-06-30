import StaticPageLayout from '../components/Legal/StaticPageLayout'

export default function Privacy() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p>Last updated: June 29, 2026</p>
      <p>
        NEXASTREAM (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This policy explains what
        information we collect and how we use it when you use our streaming platform.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Information we collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account information (email, name) if you create an account</li>
        <li>Watch history, favorites, and playback progress stored locally or synced to your account</li>
        <li>Usage data such as pages visited and features used to improve the service</li>
        <li>Device and browser information for compatibility and performance</li>
      </ul>

      <h2 className="text-xl font-semibold text-white pt-2">How we use your information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide and personalize your streaming experience</li>
        <li>To sync your list and watch progress across devices when signed in</li>
        <li>To improve site performance, security, and reliability</li>
        <li>To respond to support requests and legal notices</li>
      </ul>

      <h2 className="text-xl font-semibold text-white pt-2">Data storage</h2>
      <p>
        Guest users&apos; preferences are stored in your browser. Signed-in users may have data synced
        via our authentication provider. You can clear local data at any time through your browser
        settings.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your account data by contacting{' '}
        <a href="mailto:privacy@nexastream.com" className="text-primary hover:text-white transition-colors">
          privacy@nexastream.com
        </a>
        .
      </p>
    </StaticPageLayout>
  )
}
