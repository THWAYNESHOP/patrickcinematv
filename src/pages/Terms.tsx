import StaticPageLayout from '../components/Legal/StaticPageLayout'

export default function Terms() {
  return (
    <StaticPageLayout title="Terms of Service">
      <p>Last updated: June 29, 2026</p>
      <p>
        By accessing or using NEXASTREAM, you agree to these Terms of Service. If you do not agree,
        please do not use the platform.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Use of the service</h2>
      <p>
        NEXASTREAM is provided for personal, non-commercial entertainment purposes. You agree not to
        misuse the service, attempt unauthorized access, or interfere with its operation.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Content</h2>
      <p>
        Content availability may change without notice. Third-party streams and metadata are provided
        by external sources. NEXASTREAM does not claim ownership of third-party content and makes no
        warranties regarding availability or quality.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activity under your account. Notify us immediately of any unauthorized use.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Limitation of liability</h2>
      <p>
        NEXASTREAM is provided &quot;as is&quot; without warranties of any kind. We are not liable for
        interruptions, data loss, or damages arising from use of the service to the fullest extent
        permitted by law.
      </p>

      <h2 className="text-xl font-semibold text-white pt-2">Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the service after changes
        constitutes acceptance of the updated terms.
      </p>
    </StaticPageLayout>
  )
}
