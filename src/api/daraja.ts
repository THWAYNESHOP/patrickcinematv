export interface SupportPaymentRequest {
  phoneNumber: string
  amount: number
  accountReference?: string
  transactionDesc?: string
}

export interface SupportPaymentResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
  [key: string]: unknown
}

export async function requestSupportPayment(
  body: SupportPaymentRequest,
): Promise<SupportPaymentResponse> {
  const response = await fetch('/api/support/stk-push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let payload: { error?: unknown } | null = null

    if (text) {
      try {
        payload = JSON.parse(text) as { error?: unknown } | null
      } catch {
        payload = null
      }
    }

    const message = typeof payload?.error === 'string'
      ? payload.error
      : text || 'Unable to send support payment request.'

    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return response.json()
}
