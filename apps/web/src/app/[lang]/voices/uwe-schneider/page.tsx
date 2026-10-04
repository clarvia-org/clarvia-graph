import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/page-meta";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";

const paragraphs = [
  "Es gibt Stunden, an denen das Schicksal unbarmherzig zuschlägt. Der Verlust von geliebten Menschen ist schwer zu verarbeiten und noch unerträglicher und schon fast unmenschlich ist es, Persönlichkeiten aus dem nächsten Umfeld zu verlieren. Ob es eher erwartbar oder plötzlich und unerwartet eintrifft, dass der Tod eine tiefe Lücke in das Leben von uns furcht, plötzlich stehen wir allein vor einer nahezu unüberwindbaren Aufgabe.",
  "Ja, es gibt bisweilen Menschen, die mit gut gemeinten Ratschlägen ein wenig Hilfe anbieten und leisten können, aber zu einem schweren Verlust ergeben sich zusätzlich administrative und organisatorische Verpflichtungen, wie die Koordination von Behörden, Versicherungen sowie die Organisation mit Krankenhäusern und Beerdigungsunternehmen. Für den Trauernden entsteht plötzlich eine fast unlösbare Aufgabe; auch weil es in der Beerdigungsbranche und ringsherum Charaktere gibt, die Trauernde gern zu Umsatzbringern degradieren.",
  "Pietätvolle Trauerarbeit ist da kaum leistbar. Deshalb ist es wunderbar, dass mit Clarvia.org jetzt ein gemeinnütziger Verein erreichbar ist, der kostenlos das Leben von Hinterbliebenen ein wenig leichter ertragbar werden lässt. Clarvia bietet praktische Orientierung bei Verwaltungs- und Organisationsfragen und hilft Familien, die nächsten Schritte zu verstehen und selbst anzugehen. Clarvia.org hilft dabei, auch in den schwersten Stunden einen klaren Kopf behalten zu können und mehr Raum für die ganz persönliche Trauerverarbeitung zu finden. Menschlichkeit, wenn es bitter nötig ist, auch zur Selbsthilfe.",
  "Schön, dass es junge gemeinnützige Vereine gibt, die eine Win-win-win-Situation anstreben."
];

export const metadata: Metadata = pageMetadata({
  lang: "de",
  pathAfterLang: "voices/uwe-schneider",
  title: "Hilfe zur Selbsthilfe: Uwe Schneider über Clarvia | Clarvia",
  description: "Ein Beitrag des Journalisten und Unternehmers Uwe Schneider über die Belastung nach einem Todesfall und kostenlose Orientierung durch Clarvia.",
});

export default async function CommentaryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "de") redirect("/de/voices/uwe-schneider");

  return (
    <>
      <Header lang="de" />
      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <p className="text-sm text-calm-blue-500 mb-3">
          Gastbeitrag · Veröffentlicht am <time dateTime="2026-10-04">4. Oktober 2026</time>
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mb-6" style={headlineStyle}>
          Hilfe zur Selbsthilfe
        </h1>
        <p className="text-base font-medium text-calm-blue-800 mb-2">
          Uwe Schneider, Journalist und Unternehmer
        </p>
        <p className="text-sm text-calm-blue-500 mb-8">Berlin / Potsdam / Usedom</p>
        <p className="text-sm text-calm-blue-600 leading-relaxed mb-10 border-l-2 border-calm-blue-200 pl-4">
          Mit freundlicher Genehmigung des Autors veröffentlicht. Der am 2. Oktober 2026
          übermittelte Text wurde mit seiner Zustimmung sachlich korrigiert und leicht
          lektoriert. Der Beitrag gibt die persönliche Sicht des Autors wieder.
        </p>
        <article lang="de" aria-label="Beitrag von Uwe Schneider" className="space-y-6 text-base text-calm-blue-700 leading-relaxed">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </article>
        <div className="mt-12 glass-panel p-6">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>Ask Clarvia ausprobieren</h2>
          <p className="text-calm-blue-700 mb-4">
            Wenn ein Angehöriger im Sterben liegt oder verstorben ist, können Sie Ihre
            Frage auf Deutsch stellen. Sie erhalten praktische Orientierung per E-Mail,
            kostenlos und ohne Benutzerkonto.
          </p>
          <Link href="/ask?lang=de" className="font-medium text-calm-blue-600 underline">Eine Frage stellen</Link>
        </div>
        <p className="mt-10">
          <Link href="/de" className="text-sm font-medium text-calm-blue-600 underline">Zur Startseite</Link>
        </p>
      </main>
      <FooterSection lang="de" />
    </>
  );
}
