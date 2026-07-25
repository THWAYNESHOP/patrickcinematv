import { useCallback, useMemo, useState } from 'react'
import { Send, MessageCircle, X } from 'lucide-react'
import { sendAiMessage } from '../../api/ai'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'system-welcome',
      role: 'system',
      text: 'Ask me anything about NEXASTREAM, live sports, movies, or navigation.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const flushAssistantTyping = useCallback(() => {
    setMessages((current) => current.filter((message) => message.id !== 'assistant-typing'))
  }, [])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)
    setMessages((current) => [...current, { id: 'assistant-typing', role: 'assistant', text: '...' }])

    try {
      const response = await sendAiMessage(trimmed)
      flushAssistantTyping()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.output || 'I could not generate a response. Please try again.',
      }

      setMessages((current) => [...current, assistantMessage])
    } catch (sendError) {
      flushAssistantTyping()
      setError(sendError instanceof Error ? sendError.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end md:bottom-8 md:right-8">
      {isOpen && (
        <div className="w-[320px] max-w-full rounded-[28px] border border-white/10 bg-darkSurface/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">NEXASTREAM AI</p>
              <h2 className="text-base font-semibold text-white">Gemini chat</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto px-4 py-3 space-y-3 text-sm text-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl p-3 ${message.role === 'user' ? 'bg-white/5 text-white self-end' : 'bg-white/10 text-gray-200'}`}
              >
                <div className="text-[13px] font-semibold uppercase tracking-[0.24em] text-primary mb-1">
                  {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Assistant' : 'System'}
                </div>
                <p className="whitespace-pre-wrap break-words leading-6">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the app, movies, or sports..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
            />
            {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-black transition hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Thinking…' : 'Send'}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black shadow-2xl shadow-primary/30 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label={isOpen ? 'Close Gemini chat' : 'Open Gemini chat'}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  )
}
