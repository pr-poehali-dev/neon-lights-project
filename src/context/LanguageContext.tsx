import { createContext, useContext, useState, ReactNode } from "react"
import { Language, t } from "@/lib/i18n"

interface LanguageContextType {
  lang: Language
  setLang: (l: Language) => void
  tr: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ru",
  setLang: () => {},
  tr: (k) => k,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("lang") as Language) || "ru"
  })

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem("lang", l)
  }

  const tr = (key: string) => t[lang]?.[key] ?? t["ru"][key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
