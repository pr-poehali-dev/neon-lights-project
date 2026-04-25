import { Timeline } from "@/components/ui/timeline"

export function ApplicationsTimeline() {
  const data = [
    {
      title: "Работа и бизнес",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Ассистент поможет составить бизнес-план, написать коммерческое предложение, проанализировать рынок
            и найти решение любой рабочей задачи — быстро и качественно.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Анализ данных, таблиц и отчётов
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Написание текстов, писем, презентаций
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Советы по стратегии и принятию решений
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Учёба и саморазвитие",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Объяснит сложную тему простым языком, решит задачу с пояснениями, поможет подготовиться к экзамену
            и составит индивидуальный план обучения под ваши цели.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Математика, физика, химия, история — любые предметы
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Переводы и изучение иностранных языков
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Персональный план обучения и мотивация
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Личная жизнь и здоровье",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Выслушает, поддержит, поможет разобраться в сложной ситуации. Даст советы по здоровью, питанию,
            путешествиям и любым личным вопросам — как умный друг, который всегда рядом.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Советы по здоровью, питанию и спорту
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Помощь в планировании путешествий
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Эмоциональная поддержка и разбор ситуаций
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="applications" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Помогает во всём</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Один ассистент — безграничные возможности. Помогает в работе, учёбе и личной жизни,
            помня весь контекст ваших разговоров.
          </p>
        </div>

        <div className="relative">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  )
}