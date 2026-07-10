import EmailVerificationBanner from './EmailVerificationBanner'
import { useAuthBridge } from '../../hooks/useAuthBridge'
import { useFirestoreRealtime, useFirestoreSync } from '../../hooks/useFirestoreSync'

export default function AuthRuntime() {
  useAuthBridge()
  useFirestoreSync()
  useFirestoreRealtime()

  return <EmailVerificationBanner />
}
