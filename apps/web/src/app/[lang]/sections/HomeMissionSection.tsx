import Link from "next/link";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function HomeMissionSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-16" aria-labelledby="who-we-are-heading">
      <h2
        id="who-we-are-heading"
        className="text-2xl sm:text-3xl font-semibold text-center mb-4"
        style={headlineStyle}
      >
        {l(
          lang,
          "Why Clarvia exists",
          "Un service gratuit d’intérêt général proposé par Clarvia ASBL",
          "Ein kostenloses gemeinnütziges Angebot von Clarvia ASBL",
          "E gratis Service am Déngscht vun der Allgemengheet vu Clarvia ASBL"
        )}
      </h2>
      <div className="glass-panel p-6 sm:p-8 max-w-3xl mx-auto space-y-4">
        <p className="text-base text-calm-blue-600 leading-relaxed">
          {l(
            lang,
            "Clarvia ASBL is a registered non-profit association in Luxembourg (RCS F15680), dedicated to helping families navigate the administrative burden that follows the death of a loved one. All of our services are free, multilingual, and open to the public.",
            "Clarvia ASBL est une association sans but lucratif enregistrée au Luxembourg (RCS F15680). Elle aide les familles à faire face aux démarches administratives qui suivent le décès d'un proche. Tous nos services sont gratuits, multilingues et accessibles au public.",
            "Clarvia ASBL ist ein in Luxemburg eingetragener gemeinnütziger Verein (RCS F15680). Wir unterstützen Familien dabei, die administrativen Aufgaben zu bewältigen, die nach dem Tod eines nahestehenden Menschen entstehen. Alle unsere Angebote sind kostenlos, mehrsprachig und öffentlich zugänglich.",
            "Clarvia ASBL ass eng zu Lëtzebuerg registréiert Associatioun ouni Gewënnzweck (RCS F15680). Si hëlleft Familljen, sech an den administrativen Demarchen nom Doud vun engem nooste Mënsch zurechtzefannen. All eis Servicer si gratis, méisproocheg an ëffentlech zougänglech."
          )}
        </p>
        <p className="text-base text-calm-blue-700 font-medium leading-relaxed">
          {l(
            lang,
            "Clarvia is a non-profit association. We do not charge fees, display advertisements, or monetise personal data. There are no premium tiers or paid features. All services are free for every family.",
            "Clarvia est une association sans but lucratif. Nous ne facturons aucun frais, n'affichons pas de publicité et ne monétisons pas les données personnelles. Il n'existe ni offre premium ni fonctionnalité payante : tous les services sont gratuits pour toutes les familles.",
            "Clarvia ist ein gemeinnütziger Verein. Wir erheben keine Gebühren, schalten keine Werbung und monetarisieren keine personenbezogenen Daten. Es gibt keine Premium-Stufen und keine kostenpflichtigen Funktionen. Alle Angebote sind für jede Familie kostenlos.",
            "Clarvia ass eng Associatioun ouni Gewënnzweck. Mir froe keng Fraisen, weisen keng Reklammen a verdéngen net un perséinlechen Donnéeën. Et gëtt keng Premium-Offeren a keng bezuelte Funktiounen. All Servicer si fir all Famill gratis."
          )}
        </p>
        <p>
          <Link
            href={`/${lang}/about`}
            className="text-calm-blue-700 font-medium hover:text-calm-blue-900 underline underline-offset-2 transition-colors"
          >
            {l(lang, "About Clarvia →", "À propos de Clarvia →", "Über Clarvia →", "Iwwer Clarvia →")}
          </Link>
        </p>
      </div>
    </section>
  );
}
