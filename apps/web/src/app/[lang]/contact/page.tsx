import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, l, LANGUAGES, hreflangLanguages } from "@/lib/i18n";
import Header from "@/components/Header";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import FormsSection from "../sections/FormsSection";

const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Contact Clarvia ASBL",
    description:
      "Contact Clarvia ASBL, a Luxembourg nonprofit (RCS F15680). Use this form for partnerships, press, volunteering, and general questions.",
  },
  fr: {
    title: "Contacter Clarvia ASBL",
    description:
      "Contactez Clarvia ASBL, une association luxembourgeoise à but non lucratif (RCS F15680). Utilisez ce formulaire pour les partenariats, les demandes de presse, le bénévolat et les questions générales.",
  },
  de: {
    title: "Clarvia ASBL kontaktieren",
    description:
      "Kontaktieren Sie Clarvia ASBL, einen gemeinnützigen Verein aus Luxemburg (RCS F15680). Nutzen Sie dieses Formular für Partnerschaften, Presseanfragen, ehrenamtliche Mitarbeit und allgemeine Fragen.",
  },
  lu: {
    title: "Clarvia ASBL kontaktéieren",
    description:
      "Kontaktéiert Clarvia ASBL, en net gewënnorientéierte Veräin aus Lëtzebuerg (RCS F15680). Benotzt dëse Formulaire fir Partnerschaften, Presseufroen, Benevolat an allgemeng Froen.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/contact`,
      languages: hreflangLanguages("contact"),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/contact`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;

  return (
    <>
      <Header lang={lang} />

      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6 text-center"
          style={headlineStyle}
        >
          {l(lang, "Contact Clarvia", "Contacter Clarvia", "Clarvia kontaktieren", "Clarvia kontaktéieren")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed text-center max-w-2xl mx-auto mb-10">
          {l(
            lang,
            "If someone you love is terminally ill or has died, please use Ask us on the homepage. Lex replies by email. This page is for everything else: partnerships, press, volunteering, and general questions.",
            "Si l’un de vos proches est en phase terminale ou est décédé, veuillez utiliser « Posez-nous votre question » sur la page d’accueil. Lex vous répondra par e-mail. Cette page est destinée à toutes les autres demandes : partenariats, presse, bénévolat et questions générales.",
            "Wenn ein geliebter Mensch unheilbar krank ist oder verstorben ist, nutzen Sie bitte „Fragen Sie uns“ auf der Startseite. Lex antwortet Ihnen per E-Mail. Diese Seite ist für alle anderen Anliegen gedacht: Partnerschaften, Presseanfragen, ehrenamtliche Mitarbeit und allgemeine Fragen.",
            "Wann eng Persoun, déi Iech nosteet, onheelbar krank ass oder gestuerwen ass, benotzt wgl. „Frot eis“ op der Startsäit. De Lex äntwert Iech per E-Mail. Dës Säit ass fir all aner Uleies geduecht: Partnerschaften, Presseufroen, Benevolat an allgemeng Froen."
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href={`/${lang}#ask-us`}
            className="btn-primary inline-flex items-center justify-center px-6 py-2.5 text-sm"
          >
            {l(lang, "Ask us", "Posez-nous votre question", "Fragen Sie uns", "Frot eis")}
          </Link>
          <Link
            href={`/${lang}/support`}
            className="btn-secondary inline-flex items-center justify-center px-6 py-2.5 text-sm"
          >
            {l(lang, "Donate", "Faire un don", "Spenden", "Spenden")}
          </Link>
        </div>

        <section className="mb-12" aria-labelledby="contact-org-heading">
          <h2
            id="contact-org-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4 text-center"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Organisation", "L’association", "Organisation", "Organisatioun")}
          </h2>
          <div className="glass-panel p-6 space-y-2 text-sm text-calm-blue-600 max-w-xl mx-auto">
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Legal name", "Nom légal", "Rechtsname", "Juristeschen Numm")}:
              </span>{" "}
              CLARVIA ASBL
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Type", "Type", "Rechtsform", "Form")}:
              </span>{" "}
              {l(
                lang,
                "Non-profit association (ASBL) under Luxembourg law",
                "Association sans but lucratif (ASBL) de droit luxembourgeois",
                "Gemeinnütziger Verein (ASBL) nach luxemburgischem Recht",
                "Associatioun ouni Gewënnzweck (ASBL) no lëtzebuergeschem Recht"
              )}
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Registration", "Enregistrement", "Registrierung", "Aschreiwung")}:
              </span>{" "}
              RCS Luxembourg F15680
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Address", "Adresse", "Adresse", "Adress")}:
              </span>{" "}
              46, Rue de la Lavande · 1923 Luxembourg
            </p>
          </div>
        </section>

        <FormsSection
          lang={lang}
          showFeedback={false}
          showContact
          contactHeading={l(lang, "Write to us", "Écrivez-nous", "Schreiben Sie uns", "Schreift eis")}
          contactIntro={l(
            lang,
            "We welcome contact from:",
            "Nous sommes heureux d’échanger avec :",
            "Wir freuen uns über Nachrichten von:",
            "Mir freeën eis iwwer Noriichte vun:"
          )}
        />
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
