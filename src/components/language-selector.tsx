import { LANGUAGES } from "@/lib/i18n"
import { useLang } from "@/context/LanguageContext"

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang()

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`text-xs px-2 py-1 rounded transition-colors duration-200 font-mono ${
            lang === l.code
              ? "bg-red-500 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title={l.label}
        >
          {l.flag} {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
