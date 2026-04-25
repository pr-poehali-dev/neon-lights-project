import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useLang } from "@/context/LanguageContext"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Icon from "@/components/ui/icon"
import { API } from "@/lib/api"

interface Session {
  id: number
  title: string
  updated_at: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  created_at?: string
}

export default function ChatPage() {
  const { user, token, loading, logout, refreshUser } = useAuth()
  const { tr, lang, setLang } = useLang()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) navigate("/auth")
  }, [user, loading])

  useEffect(() => {
    if (user) loadSessions()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })

  const loadSessions = async () => {
    const res = await fetch(`${API.chat}/sessions`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setSessions(data.sessions)
    }
  }

  const createSession = async () => {
    const res = await fetch(`${API.chat}/sessions`, {
      method: "POST",
      headers: authHeaders(),
    })
    if (res.ok) {
      const data = await res.json()
      setSessions((prev) => [data.session, ...prev])
      setCurrentSession(data.session)
      setMessages([])
      setSidebarOpen(false)
    } else {
      const data = await res.json()
      if (data.error === "subscription_required") {
        // will be shown via UI
      }
    }
  }

  const loadMessages = async (session: Session) => {
    setCurrentSession(session)
    setMessages([])
    setSidebarOpen(false)
    const res = await fetch(`${API.chat}/sessions/${session.id}/messages`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || sending) return
    const userMsg: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    const res = await fetch(`${API.chat}/sessions/${currentSession.id}/messages`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: userMsg.content }),
    })
    const data = await res.json()
    setSending(false)

    if (res.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      // Update session title
      await loadSessions()
    } else {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ошибка — попробуйте ещё раз." }])
    }
  }

  const handlePayment = async () => {
    setPaymentLoading(true)
    const res = await fetch(`${API.payment}/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ return_url: window.location.href }),
    })
    const data = await res.json()
    setPaymentLoading(false)
    if (res.ok && data.payment_url) {
      window.location.href = data.payment_url
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleLangChange = async (newLang: typeof lang) => {
    setLang(newLang)
    if (token) {
      await fetch(`${API.auth}/lang`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ lang: newLang }),
      })
      refreshUser()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Icon name="Loader2" size={32} className="text-red-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const isSubscribed = user.is_subscribed

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-30 h-full w-72 bg-zinc-950 border-r border-white/10 flex flex-col transition-transform duration-200`}
      >
        {/* Logo */}
        <div
          className="p-4 border-b border-white/10 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Icon name="Bot" size={20} className="text-red-500" />
          <span className="font-orbitron text-white font-bold text-sm">
            Умный<span className="text-red-500">AI</span>
          </span>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <Button
            onClick={createSession}
            disabled={!isSubscribed}
            className="w-full bg-red-500 hover:bg-red-600 text-white border-0 justify-start gap-2"
          >
            <Icon name="Plus" size={16} />
            {tr("chat_new")}
          </Button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs text-gray-500 px-2 pb-2 font-mono">{tr("chat_history")}</p>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-600 px-2">—</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadMessages(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 mb-1 truncate ${
                  currentSession?.id === s.id
                    ? "bg-red-500/20 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {s.title}
              </button>
            ))
          )}
        </div>

        {/* User info + language */}
        <div className="p-3 border-t border-white/10 space-y-3">
          <LanguageSelector />
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
              <Icon name="LogOut" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/10 flex items-center px-4 gap-3 bg-zinc-950/50">
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="Menu" size={20} />
          </button>
          <span className="text-white font-medium text-sm truncate flex-1">
            {currentSession ? currentSession.title : "УмныйAI"}
          </span>
          {isSubscribed && (
            <span className="text-xs text-green-500 flex items-center gap-1 hidden sm:flex">
              <Icon name="CheckCircle" size={12} />
              Подписка активна
            </span>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!isSubscribed ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Bot" size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{tr("chat_subscribe")}</h2>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">{tr("chat_subscribe_desc")}</p>
                <Button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold border-0 px-8 py-5"
                >
                  {paymentLoading ? <Icon name="Loader2" size={18} className="animate-spin mr-2" /> : null}
                  {tr("chat_subscribe_btn")}
                </Button>
              </div>
            </div>
          ) : !currentSession ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="MessageSquarePlus" size={28} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Начните новый диалог</h2>
                <p className="text-gray-400 text-sm mb-4">Нажмите «+» в боковом меню, чтобы создать чат</p>
                <Button onClick={createSession} className="bg-red-500 hover:bg-red-600 text-white border-0">
                  <Icon name="Plus" size={16} className="mr-2" />
                  {tr("chat_new")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4 max-w-3xl mx-auto w-full">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">Напишите первое сообщение...</div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="Bot" size={16} className="text-red-400" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-red-500 text-white rounded-tr-sm"
                        : "bg-zinc-800 text-gray-100 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="User" size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="Bot" size={16} className="text-red-400" />
                  </div>
                  <div className="bg-zinc-800 text-gray-400 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2">
                    <Icon name="Loader2" size={14} className="animate-spin" />
                    {tr("chat_thinking")}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {isSubscribed && currentSession && (
          <div className="p-4 border-t border-white/10 bg-zinc-950/50">
            <div className="max-w-3xl mx-auto flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tr("chat_placeholder")}
                rows={1}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-500 resize-none flex-1 max-h-40"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="bg-red-500 hover:bg-red-600 text-white border-0 flex-shrink-0 h-10 w-10 p-0"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">Enter — отправить · Shift+Enter — новая строка</p>
          </div>
        )}
      </div>
    </div>
  )
}
