import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Icon from "@/components/ui/icon"

const pricingFeatures = [
  "Неограниченные сообщения",
  "Память всех диалогов",
  "Анализ данных и документов",
  "Переводы на любой язык",
  "Решение задач любой сложности",
  "Советы и поддержка 24/7",
  "Доступ с любого устройства",
]

export function CTASection() {
  return (
    <>
      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Простая и честная цена</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Один тариф — всё включено. Никаких скрытых платежей.
          </p>
          <div className="max-w-sm mx-auto">
            <Card className="glow-border border-red-500/50 bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400" />
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon name="Sparkles" size={20} className="text-red-500" />
                  <span className="text-red-500 font-semibold text-sm font-orbitron">ПОЛНЫЙ ДОСТУП</span>
                </div>
                <CardTitle className="text-6xl font-extrabold text-foreground font-orbitron">
                  89 ₽
                </CardTitle>
                <p className="text-muted-foreground text-lg">в месяц</p>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-3 mb-8 text-left">
                  {pricingFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-card-foreground">
                      <Icon name="Check" size={16} className="text-red-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg py-6 pulse-button border-0"
                >
                  Подключить за 89 ₽
                </Button>
                <p className="text-muted-foreground text-sm mt-4">Отмена в любой момент</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="slide-up">
            <h2 className="text-5xl font-bold text-white mb-6 font-sans text-balance">
              Ваш личный ИИ-ассистент ждёт вас
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Попробуйте умного ассистента с памятью диалогов уже сегодня.
              Всего 89 рублей в месяц — отмена в любой момент.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 pulse-button text-lg px-8 py-4"
              >
                Начать сейчас
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4 bg-transparent"
              >
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}