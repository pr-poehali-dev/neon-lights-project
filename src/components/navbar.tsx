import { useState } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { LanguageSelector } from "@/components/language-selector"
import { useLang } from "@/context/LanguageContext"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { tr } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Icon name="Bot" size={22} className="text-red-500" />
            <h1 className="font-orbitron text-xl font-bold text-white">
              Умный<span className="text-red-500">AI</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="font-geist text-white hover:text-red-500 transition-colors duration-200">
              {tr("nav_features")}
            </a>
            <a href="#pricing" className="font-geist text-white hover:text-red-500 transition-colors duration-200">
              {tr("nav_pricing")}
            </a>
            <a href="#faq" className="font-geist text-white hover:text-red-500 transition-colors duration-200">
              {tr("nav_faq")}
            </a>
            <LanguageSelector />
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => navigate("/chat")}
                className="bg-red-500 hover:bg-red-600 text-white font-geist border-0"
              >
                <Icon name="MessageSquare" size={16} className="mr-2" />
                Открыть чат
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-white hover:text-red-500 font-geist"
                >
                  {tr("nav_enter")}
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-red-500 hover:bg-red-600 text-white font-geist border-0"
                >
                  {tr("nav_cta")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-red-500 transition-colors duration-200"
            >
              {isOpen ? <Icon name="X" size={24} /> : <Icon name="Menu" size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/98 border-t border-red-500/20">
              <a
                href="#features"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav_features")}
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav_pricing")}
              </a>
              <a
                href="#faq"
                className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav_faq")}
              </a>
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              <div className="px-3 py-2 flex flex-col gap-2">
                {user ? (
                  <Button
                    onClick={() => { navigate("/chat"); setIsOpen(false) }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-geist border-0"
                  >
                    Открыть чат
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => { navigate("/auth"); setIsOpen(false) }}
                      className="w-full border-white/30 text-white font-geist"
                    >
                      {tr("nav_enter")}
                    </Button>
                    <Button
                      onClick={() => { navigate("/auth"); setIsOpen(false) }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-geist border-0"
                    >
                      {tr("nav_cta")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
