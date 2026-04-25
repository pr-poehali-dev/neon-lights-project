import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"

const features = [
  {
    title: "Память диалогов",
    description: "Ассистент помнит всю историю ваших разговоров и использует её для точных персонализированных советов.",
    icon: "BrainCircuit",
    badge: "Память",
  },
  {
    title: "Анализ данных",
    description: "Загрузите таблицы, документы или текст — ИИ проанализирует, найдёт закономерности и даст выводы.",
    icon: "BarChart3",
    badge: "Аналитика",
  },
  {
    title: "Переводы и тексты",
    description: "Переводит на любой язык, пишет письма, посты, резюме и любые тексты в нужном стиле.",
    icon: "Languages",
    badge: "Языки",
  },
  {
    title: "Решение задач",
    description: "Математика, логика, программирование, юридические вопросы — ИИ разберёт задачу любой сложности.",
    icon: "Lightbulb",
    badge: "Задачи",
  },
  {
    title: "Советы и поддержка",
    description: "Задаёт уточняющие вопросы, вникает в ситуацию и даёт конкретные советы — по делу и с заботой.",
    icon: "HeartHandshake",
    badge: "Поддержка",
  },
  {
    title: "Все сферы жизни",
    description: "Здоровье, бизнес, учёба, отношения, путешествия — универсальный помощник без ограничений.",
    icon: "Globe",
    badge: "Универсал",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Что умеет ваш ИИ-ассистент</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Один умный помощник для любых задач — доступен 24/7 по цене чашки кофе в месяц
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon name={feature.icon} size={32} className="text-red-500" fallback="Sparkles" />
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}