"use client";

import { useState } from "react";
import { type Lang, l } from "@/lib/i18n";
import { useForm } from "@/lib/useForm";
import Turnstile from "@/components/Turnstile";
import { headlineStyle } from "../data";

export default function FormsSection({ lang }: { lang: Lang }) {
  const feedbackForm = useForm();
  const [fbHardest, setFbHardest] = useState("");
  const [fbWish, setFbWish] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [feedbackToken, setFeedbackToken] = useState<string | null>("");

  const contactForm = useForm();
  const [ctName, setCtName] = useState("");
  const [ctEmail, setCtEmail] = useState("");
  const [ctSubject, setCtSubject] = useState("");
  const [ctMessage, setCtMessage] = useState("");
  const [contactToken, setContactToken] = useState<string | null>("");

  return (
    <>
      {/* ═══ Share Your Experience ═══ */}
      <section id="experience" className="mb-20 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
          {l(lang, "Share your experience", "Partager votre expérience", "Teilen Sie Ihre Erfahrung", "Deelt Är Erfarung")}
        </h2>
        <p className="text-base text-calm-blue-600 text-center max-w-2xl mx-auto mb-3 leading-relaxed">
          {l(lang, "If you have managed practical steps after losing a loved one in Luxembourg, your experience can help us design a better service.", "Si vous avez dû gérer des démarches pratiques après la perte d'un proche au Luxembourg, votre expérience peut nous aider à concevoir un meilleur service.", "Wenn Sie in Luxemburg nach dem Verlust eines nahestehenden Menschen praktische Schritte organisieren mussten, kann Ihre Erfahrung uns helfen, einen besseren Service zu entwickeln.", "Wann Dir no engem Verloscht vun engem nooste Mënsch zu Lëtzebuerg praktesch Schrëtt hutt misse maachen, kann Är Erfarung eis hëllefen, e bessere Service ze gestalten.")}
        </p>
        <p className="text-sm text-calm-blue-500 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
          {l(lang, "You do not need to share private details. We are especially interested in practical obstacles: What was hardest to understand? Which documents were difficult to find? Which institutions or steps were unclear? What would have helped most? Which language would have made the process easier?", "Vous n'avez pas besoin de partager des informations privées. Nous nous intéressons surtout aux obstacles pratiques : qu'est-ce qui a été le plus difficile à comprendre ? Quels documents ont été compliqués à trouver ? Quelles institutions ou démarches n'étaient pas claires ? Qu'est-ce qui vous aurait le plus aidé ? Dans quelle langue le processus aurait-il été plus simple ?", "Sie müssen keine privaten Details teilen. Besonders interessieren uns praktische Hürden: Was war am schwersten zu verstehen? Welche Dokumente waren schwer zu finden? Welche Behörden, Institutionen oder Schritte waren unklar? Was hätte am meisten geholfen? In welcher Sprache wäre der Prozess leichter gewesen?", "Dir musst keng privat Detailer deelen. Eis interesséiere virun allem praktesch Hürden: Wat war am schwéiersten ze verstoen? Wéi eng Dokumenter waren schwéier ze fannen? Wéi eng Institutiounen oder Schrëtt waren onkloer? Wat hätt Iech am meeschten gehollef? A wéi enger Sprooch wier de Prozess méi einfach gewiescht?")}
        </p>

        <div className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto">
          {feedbackForm.status === "sent" ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-3">🙏</div>
              <p className="text-lg font-medium" style={{ color: "#2b3a67" }}>
                {l(lang, "Thank you for sharing", "Merci pour votre partage", "Vielen Dank fürs Teilen", "Merci fir Är Matdeelung")}
              </p>
              <p className="text-base text-calm-blue-500 mt-1">
                {l(lang, "Your experience will help us build a better service.", "Votre expérience nous aidera à construire un meilleur service.", "Ihre Erfahrung hilft uns, einen besseren Dienst aufzubauen.", "Är Erfarung hëlleft eis, e bessere Service opzebauen.")}
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                feedbackForm.submit(
                  "/api/feedback",
                  { hardest: fbHardest, wishExisted: fbWish, email: fbEmail, turnstileToken: feedbackToken ?? "" },
                  () => {
                    if (typeof window !== "undefined" && typeof window.gtag === "function") {
                      window.gtag("event", "feedback_submit", {
                        event_category: "engagement",
                        event_label: "Feedback Form Submit",
                      });
                    }
                  }
                );
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="fb-hardest"  className="block text-sm font-semibold text-calm-blue-800 mb-1.5">
                  {l(lang, "What was the most difficult part?", "Quelle a été la partie la plus difficile ?", "Was war der schwierigste Teil?", "Wat war dat Schwéierst?")}
                </label>
                <textarea rows={3} id="fb-hardest" value={fbHardest} onChange={(e) => setFbHardest(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent resize-none" />
              </div>
              <div>
                <label htmlFor="fb-wish"  className="block text-sm font-semibold text-calm-blue-800 mb-1.5">
                  {l(lang, "What would have helped most?", "Qu'est-ce qui vous aurait le plus aidé ?", "Was hätte Ihnen am meisten geholfen?", "Wat hätt Iech am meeschten gehollef?")}
                </label>
                <textarea rows={3} id="fb-wish" value={fbWish} onChange={(e) => setFbWish(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent resize-none" />
              </div>
              <div>
                <label htmlFor="fb-email"  className="block text-sm font-semibold text-calm-blue-800 mb-1.5">
                  {l(lang, "Email (optional)", "Adresse e-mail (facultatif)", "E-Mail (optional)", "E-Mail-Adress (optional)")}
                </label>
                <input type="email" id="fb-email" value={fbEmail} onChange={(e) => setFbEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent" />
              </div>
              <Turnstile onVerify={setFeedbackToken} />
              {feedbackForm.errorMsg && (
                <p className="text-[#c8102e] text-sm bg-red-50 p-3 rounded-lg border border-red-200">{feedbackForm.errorMsg}</p>
              )}
              <button type="submit" disabled={feedbackForm.status === "sending" || (!fbHardest && !fbWish)}
                className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {feedbackForm.status === "sending"
                  ? l(lang, "Sending...", "Envoi...", "Senden...", "Gëtt geschéckt...")
                  : l(lang, "Share your experience", "Partager votre expérience", "Erfahrung teilen", "Deelt Är Erfarung")}
              </button>
            </form>
          )}

          <p className="text-xs text-calm-blue-400 text-center mt-4 leading-relaxed">
            {l(lang, "Please do not send identification numbers, medical records, bank details, confidential legal information, or private documents through this form.", "Merci de ne pas envoyer de numéros d'identification, de dossiers médicaux, de coordonnées bancaires, d'informations juridiques confidentielles ou de documents privés via ce formulaire.", "Bitte senden Sie über dieses Formular keine Identifikationsnummern, medizinischen Unterlagen, Bankdaten, vertraulichen rechtlichen Informationen oder privaten Dokumente.", "Schéckt wgl. keng Identifikatiounsnummeren, medezinesch Dossieren, Bankdetailer, vertraulech juristesch Informatiounen oder privat Dokumenter iwwer dëse Formulaire.")}
          </p>
        </div>
      </section>

      {/* ═══ Contact ═══ */}
      <section id="contact" className="mb-10 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
          {l(lang, "Work with us", "Travailler avec nous", "Mit uns zusammenarbeiten", "Mat eis zesummeschaffen")}
        </h2>
        <p className="text-base text-calm-blue-600 text-center max-w-2xl mx-auto mb-3 leading-relaxed">
          {l(lang, "Clarvia is currently in its build and validation phase. We welcome contact from:", "Clarvia est actuellement en phase de construction et de validation. Nous sommes ouverts aux échanges avec :", "Clarvia befindet sich derzeit in der Aufbau- und Validierungsphase. Wir freuen uns über Kontakt von:", "Clarvia ass de Moment an der Opbau- a Validéierungsphas. Mir freeën eis iwwer Kontakt vun:")}
        </p>
        <ul className="text-sm text-calm-blue-500 max-w-md mx-auto mb-8 leading-relaxed space-y-1.5">
          {[
            { en: "families willing to share practical experience", fr: "familles souhaitant partager leur expérience pratique", de: "Familien, die ihre praktische Erfahrung teilen möchten" },
            { en: "professionals working with bereaved families", fr: "professionnels travaillant avec des familles en deuil", de: "Fachleute, die mit trauernden Familien arbeiten" },
            { en: "social-sector organisations", fr: "organisations du secteur social", de: "Organisationen des Sozialsektors" },
            { en: "communes and public-interest actors", fr: "communes et acteurs d'intérêt public", de: "Gemeinden und Akteure des öffentlichen Interesses" },
            { en: "notaries, lawyers, tax professionals, and administrative experts", fr: "notaires, avocats, fiscalistes et experts administratifs", de: "Notare, Anwälte, Steuerberater und Verwaltungsexperten" },
            { en: "translators and accessibility specialists", fr: "traducteurs et spécialistes de l'accessibilité", de: "Übersetzer und Barrierefreiheits-Spezialisten" },
            { en: "potential partners and volunteers", fr: "partenaires potentiels et bénévoles", de: "potenzielle Partner und Freiwillige" },
          ].map((item, i) => (
            <li key={i} className="flex items-baseline gap-2.5">
              <span className="text-calm-lilac-400 flex-shrink-0 text-xs leading-none">●</span>
              <span>{l(lang, item.en, item.fr, item.de)}</span>
            </li>
          ))}
        </ul>

        <div className="glass-panel p-6 sm:p-8 max-w-xl mx-auto">
          {contactForm.status === "sent" ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✉️</div>
              <p className="text-base font-medium text-calm-lilac-600">
                {l(lang, "Message sent - we will be in touch!", "Message envoyé - nous vous recontacterons !", "Nachricht gesendet - wir melden uns!", "Message geschéckt – mir mellen eis!")}
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                contactForm.submit(
                  "/api/contact",
                  { name: ctName, email: ctEmail, subject: ctSubject, message: ctMessage, turnstileToken: contactToken ?? "" },
                  () => {
                    if (typeof window !== "undefined" && typeof window.gtag === "function") {
                      window.gtag("event", "contact_submit", {
                        event_category: "engagement",
                        event_label: "Contact Form Submit",
                      });
                    }
                  }
                );
              }}
              className="space-y-3"
            >
              <input aria-label={l(lang, "Your name", "Votre nom", "Ihr Name", "Ären Numm")} type="text" value={ctName} onChange={(e) => setCtName(e.target.value)} required
                placeholder={l(lang, "Your name", "Votre nom", "Ihr Name", "Ären Numm")}
                className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent" />
              <input aria-label={l(lang, "Your email", "Votre email", "Ihre E-Mail", "Är E-Mail-Adress")} type="email" value={ctEmail} onChange={(e) => setCtEmail(e.target.value)} required
                placeholder={l(lang, "Your email", "Votre email", "Ihre E-Mail", "Är E-Mail-Adress")}
                className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent" />
              <input aria-label={l(lang, "Subject", "Objet", "Betreff", "Betreff")} type="text" value={ctSubject} onChange={(e) => setCtSubject(e.target.value)}
                placeholder={l(lang, "Subject (optional)", "Objet (facultatif)", "Betreff (optional)", "Betreff (optional)")}
                className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent" />
              <textarea aria-label={l(lang, "Your message", "Votre message", "Ihre Nachricht", "Äre Message")} rows={3} value={ctMessage} onChange={(e) => setCtMessage(e.target.value)} required
                placeholder={l(lang, "Your message", "Votre message", "Ihre Nachricht", "Äre Message")}
                className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent resize-none" />
              <Turnstile onVerify={setContactToken} />
              {contactForm.errorMsg && (
                <p className="text-[#c8102e] text-sm bg-red-50 p-3 rounded-lg border border-red-200">{contactForm.errorMsg}</p>
              )}
              <button type="submit" disabled={contactForm.status === "sending"}
                className="btn-secondary w-full py-3 text-base inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                {contactForm.status === "sending" ? l(lang, "Sending...", "Envoi...", "Senden...", "Gëtt geschéckt...") : l(lang, "Send message", "Envoyer le message", "Nachricht senden", "Message schécken")}
              </button>
            </form>
          )}

        </div>
      </section>
    </>
  );
}
