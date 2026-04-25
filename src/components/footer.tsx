import Icon from "@/components/ui/icon"

export function Footer() {
  return (
    <footer className="bg-black border-t border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Bot" size={22} className="text-red-500" />
              <h2 className="font-orbitron text-2xl font-bold text-white">
                Умный<span className="text-red-500">AI</span>
              </h2>
            </div>
            <p className="font-space-mono text-gray-300 mb-6 max-w-md">
              Персональный ИИ-ассистент с памятью диалогов — помогает в работе, учёбе и жизни.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Icon name="Send" size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Icon name="Instagram" size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Icon name="Mail" size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-orbitron text-white font-semibold mb-4">Сервис</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Возможности
                </a>
              </li>
              <li>
                <a
                  href="#applications"
                  className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Применения
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Тарифы
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Вопросы
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-orbitron text-white font-semibold mb-4">Документы</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200">
                  Конфиденциальность
                </a>
              </li>
              <li>
                <a href="#" className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200">
                  Условия использования
                </a>
              </li>
              <li>
                <a href="#" className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200">
                  Контакты
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-red-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-space-mono text-gray-400 text-sm">2025 УмныйAI. Все права защищены.</p>
            <p className="font-space-mono text-gray-500 text-sm mt-4 md:mt-0">
              Подписка 100 ₽/мес · Отмена в любое время
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}