import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, LANGUAGES, s1 } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import { loadPublicChecklistTasks } from "@/lib/checklist-tasks";
import ChecklistPage from "./ChecklistPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "checklist",
    title: s1("Bereavement Checklist (Alpha) — Clarvia"),
    description: s1(
      "Generate a source-linked bereavement checklist in your browser. Personal facts stay on your device for that generation."
    ),
    index: true,
  });
}

export default async function ChecklistRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";
  const tasks = await loadPublicChecklistTasks();

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-calm-blue-500 mb-3">{s1("Alpha")}</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4" style={headlineStyle}>
          {s1("Bereavement checklist")}
        </h1>
        <p className="text-base text-calm-blue-700 leading-relaxed mb-4">
          {s1(
            "Answer a few questions to generate a practical checklist from reviewed, source-linked task data. If a task does not match the country or facts, use Ask Clarvia."
          )}
        </p>
        <p className="text-sm text-calm-blue-600 leading-relaxed mb-4">
          {s1(
            "Checklist conditions are evaluated in your browser, so the personal facts used to generate the checklist are not sent to Clarvia for that generation."
          )}
        </p>
        <p className="text-sm text-calm-blue-600 leading-relaxed mb-8">
          {s1("How tasks are sourced and reviewed is explained on")}{" "}
          <Link href={`/${lang}/how-it-works`} className="underline font-medium text-calm-blue-700">
            {s1("How it works")}
          </Link>
          .
        </p>

        <section className="mb-12" aria-labelledby="published-tasks-heading">
          <h2 id="published-tasks-heading" className="text-xl font-semibold text-calm-blue-800 mb-4" style={headlineStyle}>
            {s1("Published tasks")}
          </h2>
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="glass-panel p-4">
                <h3 className="font-semibold text-calm-blue-800 mb-1">{task.title}</h3>
                <p className="text-sm text-calm-blue-600 leading-relaxed">{task.description}</p>
                {task.sourceUrl ? (
                  <p className="text-sm mt-2">
                    <a href={task.sourceUrl} className="underline text-calm-blue-700" target="_blank" rel="noopener noreferrer">
                      {task.sourceTitle || s1("Official source")}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <ChecklistPage />

        <p className="mt-10 text-sm text-calm-blue-600">
          {s1("If these tasks do not match your country or facts,")}{" "}
          <Link href={`/${lang}#ask-us`} className="underline font-medium">
            {s1("Ask Clarvia")}
          </Link>
          .
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
