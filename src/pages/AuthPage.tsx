import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useLang } from "@/context/LanguageContext"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const { tr } = useLang()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      navigate("/chat")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-4 left-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <Icon name="Bot" size={20} className="text-red-500" />
        <span className="font-orbitron text-white font-bold">Умный<span className="text-red-500">AI</span></span>
      </div>
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-zinc-900 border border-red-500/20 rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Bot" size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white font-orbitron">
            {mode === "login" ? tr("auth_login") : tr("auth_register")}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">УмныйAI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <Label className="text-gray-300 mb-1 block">{tr("auth_name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr("auth_name")}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-500"
                required
              />
            </div>
          )}
          <div>
            <Label className="text-gray-300 mb-1 block">{tr("auth_email")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-1 block">{tr("auth_password")}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-5 border-0 mt-2"
          >
            {loading ? (
              <Icon name="Loader2" size={18} className="animate-spin mr-2" />
            ) : null}
            {mode === "login" ? tr("auth_login") : tr("auth_register")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <span className="text-gray-400">
              {tr("auth_no_account")}{" "}
              <button onClick={() => setMode("register")} className="text-red-400 hover:text-red-300 font-medium">
                {tr("auth_register")}
              </button>
            </span>
          ) : (
            <span className="text-gray-400">
              {tr("auth_have_account")}{" "}
              <button onClick={() => setMode("login")} className="text-red-400 hover:text-red-300 font-medium">
                {tr("auth_login")}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
