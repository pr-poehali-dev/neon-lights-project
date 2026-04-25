import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Как работает память диалогов?",
      answer:
        "Ассистент сохраняет историю всех ваших разговоров и использует её в каждом новом диалоге. Он помнит ваши предпочтения, прошлые задачи и контекст — и автоматически учитывает это в ответах.",
    },
    {
      question: "Что происходит после оплаты?",
      answer:
        "Сразу после успешной оплаты ваш аккаунт активируется и вы получаете полный доступ к чату. Никаких задержек — начинаете пользоваться мгновенно.",
    },
    {
      question: "Можно ли отменить подписку?",
      answer:
        "Да, подписку можно отменить в любое время в личном кабинете. После отмены доступ сохраняется до конца оплаченного периода.",
    },
    {
      question: "На каких языках работает ассистент?",
      answer:
        "Ассистент понимает и отвечает на русском, английском и десятках других языков. Вы можете переключаться между языками прямо в диалоге.",
    },
    {
      question: "Есть ли ограничения на количество сообщений?",
      answer:
        "В рамках подписки вы можете отправлять неограниченное количество сообщений. Пользуйтесь столько, сколько нужно.",
    },
    {
      question: "Мои данные в безопасности?",
      answer:
        "Все диалоги хранятся в зашифрованном виде и доступны только вам. Мы не передаём ваши данные третьим лицам.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Всё, что нужно знать об ИИ-ассистенте, подписке и работе сервиса.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}