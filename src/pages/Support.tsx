import { useState } from 'react'
import { HeartHandshake, Smartphone, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { requestSupportPayment } from '../api/daraja'
import StaticPageLayout from '../components/Legal/StaticPageLayout'

const QUICK_AMOUNTS = [50, 100, 200, 500]

export default function Support() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState(100)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await requestSupportPayment({
        phoneNumber,
        amount,
        accountReference: 'NEXASTREAM_SUPPORT',
        transactionDesc: 'Support NEXASTREAM',
      })

      setSuccessMessage(response.CustomerMessage || 'Support request sent. Check your phone.')
      setPhoneNumber('')
      setAmount(100)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to process support payment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StaticPageLayout title="Support NEXASTREAM">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/15 via-darkSurface to-darkSurface p-6 shadow-[0_24px_80px_rgba(229,9,20,0.16)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Support the vision</p>
              <h2 className="text-2xl font-semibold text-white">Fuel the next chapter of NEXASTREAM</h2>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
            Send a quick STK Push from your phone and help keep the platform growing. It takes less than a minute and works directly with M-PESA.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure STK Push
              </div>
              <p className="mt-2 text-sm text-gray-400">Fast, trusted confirmation on your device.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Smartphone className="h-4 w-4 text-primary" />
                Phone-based payment
              </div>
              <p className="mt-2 text-sm text-gray-400">No app installs or complicated steps needed.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-primary" />
                Instant support
              </div>
              <p className="mt-2 text-sm text-gray-400">Your support helps us improve the experience.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-darkSurface/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            STK Push form
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label htmlFor="support-phone" className="mb-2 block text-sm font-medium text-gray-300">
                MPESA Phone Number
              </label>
              <input
                id="support-phone"
                type="tel"
                inputMode="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <p className="mt-2 text-sm text-gray-500">Use a Kenyan number such as 0712... or 0112...</p>
            </div>

            <div>
              <label htmlFor="support-amount" className="mb-2 block text-sm font-medium text-gray-300">
                Amount (KES)
              </label>
              <input
                id="support-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition hover:border-primary/50 hover:text-white"
                >
                  KES {quickAmount}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending STK Push…' : 'Send Support Payment'}
            </button>
          </div>

          {successMessage && (
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </StaticPageLayout>
  )
}
