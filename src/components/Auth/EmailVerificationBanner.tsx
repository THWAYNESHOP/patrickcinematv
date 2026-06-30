import { useState } from 'react'
import { Mail, X, RefreshCw } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function EmailVerificationBanner() {
  const { user, isEmailVerified, sendVerificationEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dismissed, setDismissed] = useState(false)

  if (!user || isEmailVerified() || dismissed) {
    return null
  }

  const handleResend = async () => {
    setLoading(true)
    setMessage('')
    try {
      await sendVerificationEmail()
      setMessage('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      setMessage(error.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 flex items-center gap-4" role="alert">
      <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-yellow-200 font-medium">
          Please verify your email to access all features
        </p>
        {message && (
          <p className={`text-xs mt-1 ${message.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
      <button
        onClick={handleResend}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          'Resend'
        )}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-yellow-500/60 hover:text-yellow-500 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
