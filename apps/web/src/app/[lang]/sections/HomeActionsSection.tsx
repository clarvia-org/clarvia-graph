import Link from "next/link";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function HomeActionsSection({ lang }: { lang: Lang }) {
  const cards = [
    {
      title: l(lang, "Ask Clarvia", "Demandez à Clarvia", "Clarvia fragen", "Frot Clarvia"),
      body: l(
        lang,
        "Describe what happened. We reply by email, usually within a few minutes, with sources.",
        "Décrivez ce qui s’est passé. Nous vous répondons par e-mail, généralement en quelques minutes, avec des liens vers les sources.",
        "Schildern Sie, was passiert ist. Wir antworten Ihnen per E-Mail, in der Regel innerhalb weniger Minuten und mit Links zu den Quellen.",
        "Beschreift, wat geschitt ass. Mir äntweren Iech per E-Mail, normalerweis bannent e puer Minutten, a mat Linken op d’Quellen."
      ),
      href: `/${lang}#ask-us`,
      cta: l(lang, "Ask Clarvia →", "Demandez à Clarvia →", "Clarvia fragen →", "Frot Clarvia →"),
    },
    {
      title: l(lang, "Contact the organisation", "Contacter l’association", "Den Verein kontaktieren", "De Veräin kontaktéieren"),
      body: l(
        lang,
        "Partnerships, press, volunteering, and other questions. Use the contact form.",
        "Partenariats, demandes de presse, bénévolat et autres questions. Utilisez le formulaire de contact.",
        "Partnerschaften, Presseanfragen, ehrenamtliche Mitarbeit und andere Fragen. Nutzen Sie dafür das Kontaktformular.",
        "Partnerschaften, Presseufroen, Benevolat an aner Froen. Benotzt dofir de Kontaktformulaire."
      ),
      href: `/${lang}/contact`,
      cta: l(lang, "Contact →", "Contact →", "Kontakt →", "Kontakt →"),
    },
    {
      title: l(lang, "Donate", "Faire un don", "Spenden", "Spenden"),
      body: l(
        lang,
        "Keep the service free. Clarvia is a non-profit.",
        "Aidez-nous à maintenir ce service gratuit. Clarvia est une association à but non lucratif.",
        "Helfen Sie mit, das Angebot kostenlos zu halten. Clarvia ist ein gemeinnütziger Verein.",
        "Hëlleft eis, de Service gratis ze halen. Clarvia ass en net gewënnorientéierte Veräin."
      ),
      href: `/${lang}/support`,
      cta: l(lang, "Donate →", "Faire un don →", "Spenden →", "Spenden →"),
    },
  ];

  return (
    <section className="mb-16" aria-labelledby="what-you-can-do-heading">
      <h2
        id="what-you-can-do-heading"
        className="text-2xl sm:text-3xl font-semibold text-center mb-8"
        style={headlineStyle}
      >
        {l(lang, "What you can do", "Ce que vous pouvez faire", "Was Sie tun können", "Wat Dir maache kënnt")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {cards.map((card) => (
          <div key={card.href} className="glass-panel p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">{card.title}</h3>
            <p className="text-base text-calm-blue-600 leading-relaxed flex-grow mb-4">{card.body}</p>
            <Link
              href={card.href}
              className="text-calm-blue-700 font-medium hover:text-calm-blue-900 underline underline-offset-2 transition-colors"
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
