"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";

/* ── Types ── */
interface IntakeQuestion {
  id: string;
  path: string;
  label: string;
  label_en: string;
  label_fr: string;
  label_de: string;
  value_type: string;
  options: Array<{
    value: string;
    label_en: string;
    label_fr: string;
    label_de: string;
  }>;
}

interface Condition {
  id: string;
  title: string;
  expression: Record<string, unknown>;
}

interface TaskTemplate {
  id: string;
  title: string;
  action_type: string;
  authority_refs?: string[];
  deadline_refs?: string[];
  evidence_requirements?: {
    satisfy_if?: string;
    sets: Array<{ id?: string; operator?: string; evidence_type_refs: string[] }>;
  };
  rendering: {
    checklist_group: string;
    urgency_score?: number;
    urgency?: { score: number; label: string };
    dependency_rank?: number;
    user_visible_caveat?: string | null;
  };
}

interface Source {
  id: string;
  title: string;
  url?: string;
  publisher?: string;
}

interface Consequence {
  id: string;
  title: string;
  consequence_type: string;
  jurisdiction: string;
  distribution_status?: string;
  trigger: {
    life_event: string;
    condition_refs: string[];
  };
  task_template_refs: string[];
  source_refs?: string[];
}

interface Authority {
  id: string;
  name: string;
  name_en: string;
}

interface Deadline {
  id: string;
  title: string;
  deadline_type?: string;
  calculation?: {
    kind?: string;
    duration?: string;
    starts_from_fact?: string;
    calendar?: string;
    label?: string;
    anchor_event?: string;
    offset_hours?: number;
    if_weekend_or_holiday?: string;
  };
}

interface EvidenceType {
  id: string;
  canonical_name: string;
  synonyms?: string[];
}

interface RuntimeData {
  conditions: Condition[];
  consequences: Consequence[];
  task_templates: TaskTemplate[];
  authorities: Authority[];
  deadlines: Deadline[];
  evidence_types: EvidenceType[];
  sources: Source[];
}

interface IntakeData {
  questions: IntakeQuestion[];
}

interface ChecklistItem {
  id: string;
  title: string;
  status: "applies" | "needs_fact" | "does_not_apply";
  consequence_type: string;
  checklist_group: string;
  urgency: { score: number; label: string };
  authority?: Authority;
  deadline_label?: string;
  evidence?: EvidenceType[];
  missing_facts?: string[];
  sources?: Source[];
}

/* ── Checklist groups ── */
const GROUP_ORDER = [
  "immediate_formalities",
  "money_and_benefits",
  "cross_border_issues",
  "legal_and_succession",
  "housing_and_utilities",
  "personal_and_memorial",
];

const GROUP_LABELS: Record<string, { en: string; fr: string; de: string }> = {
  immediate_formalities: {
    en: "Immediate formalities",
    fr: "Formalités immédiates",
    de: "Sofortige Formalitäten",
  },
  money_and_benefits: {
    en: "Money and benefits",
    fr: "Argent et prestations",
    de: "Geld und Leistungen",
  },
  cross_border_issues: {
    en: "Cross-border issues",
    fr: "Questions transfrontalières",
    de: "Grenzüberschreitende Fragen",
  },
  legal_and_succession: {
    en: "Legal and succession",
    fr: "Juridique et succession",
    de: "Recht und Erbschaft",
  },
  housing_and_utilities: {
    en: "Housing and utilities",
    fr: "Logement et services",
    de: "Wohnung und Versorgung",
  },
  personal_and_memorial: {
    en: "Personal and memorial",
    fr: "Personnel et commémoratif",
    de: "Persönliches und Gedenken",
  },
};

/* ── Client-side JsonLogic evaluator (minimal) ── */
function evaluateJsonLogic(
  expression: Record<string, unknown>,
  data: Record<string, unknown>
): boolean | null {
  const keys = Object.keys(expression);
  if (keys.length !== 1) return null;
  const op = keys[0];
  const args = expression[op] as unknown[];

  const resolveValue = (v: unknown): unknown => {
    if (v && typeof v === "object" && "var" in v) {
      const varName = (v as { var: string }).var;
      const parts = varName.split(".");
      let current: unknown = data;
      for (const part of parts) {
        if (current === null || current === undefined || typeof current !== "object") {
          return undefined;
        }
        current = (current as Record<string, unknown>)[part];
      }
      return current;
    }
    return v;
  };

  if (op === "==") {
    const left = resolveValue(args[0]);
    const right = resolveValue(args[1]);
    if (left === undefined || right === undefined) return null;
    return left == right;
  }
  if (op === "===") {
    const left = resolveValue(args[0]);
    const right = resolveValue(args[1]);
    if (left === undefined || right === undefined) return null;
    return left === right;
  }
  if (op === "!=") {
    const left = resolveValue(args[0]);
    const right = resolveValue(args[1]);
    if (left === undefined || right === undefined) return null;
    return left != right;
  }
  if (op === "!==") {
    const left = resolveValue(args[0]);
    const right = resolveValue(args[1]);
    if (left === undefined || right === undefined) return null;
    return left !== right;
  }
  if (op === "and") {
    let hasUnknown = false;
    for (const arg of args) {
      const result = evaluateJsonLogic(arg as Record<string, unknown>, data);
      if (result === false) return false;
      if (result === null) hasUnknown = true;
    }
    return hasUnknown ? null : true;
  }
  if (op === "or") {
    let hasUnknown = false;
    for (const arg of args) {
      const result = evaluateJsonLogic(arg as Record<string, unknown>, data);
      if (result === true) return true;
      if (result === null) hasUnknown = true;
    }
    return hasUnknown ? null : false;
  }
  return null;
}

function buildNestedData(facts: Record<string, string>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(facts)) {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return data;
}

/* ── ISO 8601 duration formatter ── */
function formatDuration(duration: string): string {
  const match = duration.match(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/);
  if (!match) return duration;
  const years = match[1] ? parseInt(match[1]) : 0;
  const months = match[2] ? parseInt(match[2]) : 0;
  const weeks = match[3] ? parseInt(match[3]) : 0;
  const days = match[4] ? parseInt(match[4]) : 0;
  const hours = match[5] ? parseInt(match[5]) : 0;
  const minutes = match[6] ? parseInt(match[6]) : 0;
  const parts: string[] = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  return parts.length ? `within ${parts.join(" ")}` : duration;
}

/* ── The page component ── */
export default function ChecklistPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [runtime, setRuntime] = useState<RuntimeData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"intake" | "results">("intake");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [unknownQuestions, setUnknownQuestions] = useState<IntakeQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/data/clarvia/intake/bereavement.json").then((r) => r.json()),
      fetch("/data/clarvia/runtime/bereavement.json").then((r) => r.json()),
    ]).then(([intakeData, runtimeData]) => {
      setIntake(intakeData);
      setRuntime(runtimeData);
      setLoading(false);
    });
  }, []);

  // Generate checklist
  const generateChecklist = useCallback(() => {
    if (!runtime) return;

    // Check which questions have UNKNOWN answers
    const unknownQuestions: IntakeQuestion[] = [];
    for (const [qId, value] of Object.entries(answers)) {
      if (value === "UNKNOWN") {
        const question = intake?.questions.find((q) => q.id === qId);
        if (question) unknownQuestions.push(question);
      }
    }

    // Build nested facts (skip UNKNOWN)
    const factMap: Record<string, string> = {};
    for (const [qId, value] of Object.entries(answers)) {
      const question = intake?.questions.find((q) => q.id === qId);
      if (question && value && value !== "UNKNOWN") {
        factMap[question.path] = value;
      }
    }
    const data = buildNestedData(factMap);

    // Evaluate conditions
    const conditionResults = new Map<string, boolean | null>();
    for (const condition of runtime.conditions) {
      const result = evaluateJsonLogic(condition.expression as Record<string, unknown>, data);
      conditionResults.set(condition.id, result);
    }

    // Build checklist items — but only include items whose conditions
    // are definitively true. Items that are "needs_fact" because of an
    // UNKNOWN answer are NOT shown as individual tasks (that would show
    // every possible alternative). Instead we show a single prompt card.
    const generated: ChecklistItem[] = [];
    const authorityMap = new Map(runtime.authorities.map((a) => [a.id, a]));
    const deadlineMap = new Map(runtime.deadlines.map((d) => [d.id, d]));
    const evidenceMap = new Map(runtime.evidence_types.map((e) => [e.id, e]));
    const sourceMap = new Map(runtime.sources?.map((s) => [s.id, s]) ?? []);

    for (const consequence of runtime.consequences) {
      // Publication gate: skip non-public consequences (safety filter)
      if (consequence.distribution_status && consequence.distribution_status !== 'public_open' && consequence.distribution_status !== 'public_metadata_only') continue;

      // Check all conditions
      const conditionRefs = consequence.trigger.condition_refs ?? [];
      let status: "applies" | "needs_fact" | "does_not_apply" = "applies";
      const missingFacts: string[] = [];

      for (const ref of conditionRefs) {
        const result = conditionResults.get(ref);
        if (result === false) {
          status = "does_not_apply";
          break;
        }
        if (result === null) {
          status = "needs_fact";
          const condition = runtime.conditions.find((c) => c.id === ref);
          if (condition) {
            const varRefs: string[] = [];
            extractVarRefs(condition.expression, varRefs);
            missingFacts.push(...varRefs);
          }
        }
      }

      // Skip items that don't apply
      if (status === "does_not_apply") continue;

      // Skip needs_fact items — we handle these with prompt cards instead
      if (status === "needs_fact") continue;

      // Expand task templates (only for items that definitively apply)
      for (const templateId of consequence.task_template_refs) {
        const template = runtime.task_templates.find((t) => t.id === templateId);
        if (!template) continue;

        const authority = template.authority_refs?.[0]
          ? authorityMap.get(template.authority_refs[0])
          : undefined;

        const deadline = template.deadline_refs?.[0]
          ? deadlineMap.get(template.deadline_refs[0])
          : undefined;

        const evidence = template.evidence_requirements?.sets
          .flatMap((s) => s.evidence_type_refs)
          .map((id) => evidenceMap.get(id))
          .filter(Boolean) as EvidenceType[] | undefined;

        // Resolve sources for this consequence
        const sources = (consequence.source_refs ?? [])
          .map((id) => sourceMap.get(id))
          .filter(Boolean) as Source[];

        generated.push({
          id: `${consequence.id}::${template.id}`,
          title: template.title,
          status,
          consequence_type: consequence.consequence_type,
          checklist_group: template.rendering.checklist_group,
          urgency: {
            score: template.rendering.urgency_score ?? template.rendering.urgency?.score ?? 50,
            label: template.rendering.urgency?.label ??
              ((template.rendering.urgency_score ?? 50) >= 90 ? "urgent" :
               (template.rendering.urgency_score ?? 50) >= 70 ? "important" : "normal"),
          },
          authority,
          deadline_label: deadline?.calculation?.label ??
            (deadline?.calculation?.duration
              ? formatDuration(deadline.calculation.duration)
              : deadline?.title),
          evidence,
          missing_facts: missingFacts.length > 0 ? missingFacts : undefined,
          sources: sources.length > 0 ? sources : undefined,
        });
      }
    }

    // Sort by group order, then urgency
    generated.sort((a, b) => {
      const ga = GROUP_ORDER.indexOf(a.checklist_group);
      const gb = GROUP_ORDER.indexOf(b.checklist_group);
      if (ga !== gb) return (ga === -1 ? 99 : ga) - (gb === -1 ? 99 : gb);
      return (b.urgency?.score ?? 0) - (a.urgency?.score ?? 0);
    });

    setItems(generated);
    setUnknownQuestions(unknownQuestions);
    setStep("results");
  }, [runtime, intake, answers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-calm-blue-500 animate-pulse">
          {l(lang, "Loading…", "Chargement…", "Wird geladen…")}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ═══ Header ═══ */}
      <header
        aria-label={l(lang, "Site header", "En-tête du site", "Seitenkopf")}
        className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative"
      >
        <Link
          href={`/${lang}`}
          aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia Startseite")}
          className="block"
        >
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <nav
          aria-label={l(lang, "Language switcher", "Sélecteur de langue", "Sprachauswahl")}
          className="flex items-center gap-2"
        >
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={`/${code}/checklist`}
              aria-label={l(
                lang,
                `Switch to ${code.toUpperCase()}`,
                `Passer en ${code.toUpperCase()}`,
                `Zu ${code.toUpperCase()} wechseln`
              )}
              aria-current={lang === code ? "page" : undefined}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                lang === code
                  ? "bg-white text-calm-blue-800 shadow-sm border border-calm-blue-200"
                  : "text-calm-blue-500 hover:bg-white/40"
              }`}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* ═══ Alpha banner ═══ */}
        <div className="mb-8 p-4 rounded-xl border-2 border-amber-300 bg-amber-50/80 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div className="space-y-3">
              <div>
                <p className="font-bold text-amber-950 text-sm">
                  {l(
                    lang,
                    "Alpha Prototype - Not Legal Advice",
                    "Prototype Alpha - Ceci n'est pas un avis juridique",
                    "Alpha-Prototyp - Keine Rechtsberatung"
                  )}
                </p>
                <p className="text-amber-900 text-xs mt-1 leading-relaxed">
                  {l(
                    lang,
                    "This is an early alpha prototype of the Clarvia Bereavement Checklist, provided for testing and demonstration only. It dynamically pulls content from the open-source clarvia-graph repository (https://github.com/clarvia-org/clarvia-graph) on GitHub. No sensitive or personal data is included.",
                    "Il s'agit d'un premier prototype alpha de la liste de contrôle de deuil Clarvia, fourni uniquement à des fins de test et de démonstration. Il récupère dynamiquement le contenu du dépôt open-source clarvia-graph (https://github.com/clarvia-org/clarvia-graph) sur GitHub. Aucune donnée sensible ou personnelle n'est incluse.",
                    "Dies ist ein früher Alpha-Prototyp der Clarvia-Trauer-Checkliste, der nur zu Test- und Demonstrationszwecken bereitgestellt wird. Er lädt Inhalte dynamisch aus dem Open-Source-Repository clarvia-graph (https://github.com/clarvia-org/clarvia-graph) auf GitHub. Es sind keine sensiblen oder persönlichen Daten enthalten."
                  )}
                </p>
              </div>

              <div>
                <p className="font-semibold text-amber-950 text-xs">
                  {l(
                    lang,
                    "Standards & Licenses",
                    "Normes & Licences",
                    "Standards & Lizenzen"
                  )}
                </p>
                <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">
                  {l(
                    lang,
                    "Uses native schemas compatible with: CPSV-AP, CCCEV, ELI (planned), PROV-O (planned). Licenses: Code & tooling - EUPL-1.2; Graph data - CC-BY-4.0; Schemas & vocabularies - CC0 or Apache-2.0.",
                    "Utilise des schémas natifs compatibles avec : CPSV-AP, CCCEV, ELI (prévu), PROV-O (prévu). Licences : Code & outils - EUPL-1.2 ; Données du graphe - CC-BY-4.0 ; Schémas & vocabulaires - CC0 ou Apache-2.0.",
                    "Verwendet native Schemata, die kompatibel sind mit: CPSV-AP, CCCEV, ELI (geplant), PROV-O (geplant). Lizenzen: Code & Werkzeuge - EUPL-1.2; Graphendaten - CC-BY-4.0; Schemata & Vokabulare - CC0 oder Apache-2.0."
                  )}
                </p>
              </div>

              <div>
                <p className="font-semibold text-amber-950 text-xs">
                  {l(
                    lang,
                    "Important",
                    "Important",
                    "Wichtig"
                  )}
                </p>
                <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">
                  {l(
                    lang,
                    "For informational purposes only. Not legal, tax, or professional advice. Always consult qualified professionals. Data provided \"as is\" with no warranties.",
                    "Uniquement à des fins d'information. Ceci ne constitue pas un conseil juridique, fiscal ou professionnel. Consultez toujours des professionnels qualifiés. Données fournies « en l'état » sans aucune garantie.",
                    "Nur zu Informationszwecken. Keine Rechts-, Steuer- oder sonstige Fachberatung. Konsultieren Sie immer qualifizierte Fachleute. Die Daten werden ohne Mängelgewähr und ohne Gewährleistungen bereitgestellt."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2"
          style={headlineStyle}
        >
          {l(
            lang,
            "Bereavement Checklist",
            "Liste de démarches en cas de décès",
            "Checkliste im Trauerfall"
          )}
        </h1>
        <p className="text-calm-blue-500 text-sm mb-8">
          {l(
            lang,
            "Answer a few questions to get a personalised list of administrative steps.",
            "Répondez à quelques questions pour obtenir une liste personnalisée de démarches administratives.",
            "Beantworten Sie einige Fragen, um eine personalisierte Liste der Verwaltungsschritte zu erhalten."
          )}
        </p>

        {step === "intake" && intake && (
          <IntakeWizard
            lang={lang}
            questions={intake.questions}
            answers={answers}
            onAnswer={(qId, value) =>
              setAnswers((prev) => ({ ...prev, [qId]: value }))
            }
            onGenerate={generateChecklist}
          />
        )}

        {step === "results" && (
          <ChecklistResults
            lang={lang}
            items={items}
            unknownQuestions={unknownQuestions}
            onReset={() => {
              setStep("intake");
              setAnswers({});
              setItems([]);
              setUnknownQuestions([]);
            }}
          />
        )}
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="py-8 px-6 text-center text-xs text-calm-blue-400">
        <p>
          © {new Date().getFullYear()} CLARVIA ASBL ·{" "}
          <Link href={`/${lang}/about`} className="underline hover:text-calm-blue-600">
            {l(lang, "About", "À propos", "Über uns")}
          </Link>
        </p>
      </footer>
    </>
  );
}

/* ── IntakeWizard component ── */
function IntakeWizard({
  lang,
  questions,
  answers,
  onAnswer,
  onGenerate,
}: {
  lang: Lang;
  questions: IntakeQuestion[];
  answers: Record<string, string>;
  onAnswer: (qId: string, value: string) => void;
  onGenerate: () => void;
}) {
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => {
        // Build options based on question type
        const options = q.options && q.options.length > 0
          ? q.options
          : q.value_type === "boolean"
            ? [
                { value: "true", label_en: "Yes", label_fr: "Oui", label_de: "Ja" },
                { value: "false", label_en: "No", label_fr: "Non", label_de: "Nein" },
                { value: "UNKNOWN", label_en: "I don't know", label_fr: "Je ne sais pas", label_de: "Ich weiß nicht" },
              ]
            : null;

        return (
          <div
            key={q.id}
            className="glass-panel p-6 rounded-xl transition-all"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <label className="block text-sm font-semibold text-calm-blue-800 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-calm-blue-100 text-calm-blue-600 text-xs font-bold mr-2">
                {idx + 1}
              </span>
              {lang === "fr" ? q.label_fr : lang === "de" ? q.label_de : q.label_en}
            </label>

            {options ? (
              /* Button-grid for jurisdiction_code, boolean, and enum with options */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.map((opt) => {
                  const selected = answers[q.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onAnswer(q.id, opt.value)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        selected
                          ? "bg-calm-blue-800 text-white border-calm-blue-800 shadow-md"
                          : "bg-white/60 text-calm-blue-700 border-calm-blue-200 hover:border-calm-blue-400 hover:bg-white"
                      }`}
                    >
                      {lang === "fr"
                        ? opt.label_fr
                        : lang === "de"
                          ? opt.label_de
                          : opt.label_en}
                    </button>
                  );
                })}
              </div>
            ) : q.value_type === "integer" ? (
              /* Numeric input for integer types */
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  value={answers[q.id] && answers[q.id] !== "UNKNOWN" ? answers[q.id] : ""}
                  onChange={(e) => onAnswer(q.id, e.target.value || "UNKNOWN")}
                  placeholder="0"
                  className="w-32 px-4 py-2.5 rounded-lg text-sm border border-calm-blue-200 bg-white/60 text-calm-blue-800 focus:outline-none focus:border-calm-blue-400 focus:ring-1 focus:ring-calm-blue-400"
                />
                <button
                  onClick={() => onAnswer(q.id, "UNKNOWN")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    answers[q.id] === "UNKNOWN"
                      ? "bg-calm-blue-800 text-white border-calm-blue-800 shadow-md"
                      : "bg-white/60 text-calm-blue-700 border-calm-blue-200 hover:border-calm-blue-400 hover:bg-white"
                  }`}
                >
                  {l(lang, "I don't know", "Je ne sais pas", "Ich weiß nicht")}
                </button>
              </div>
            ) : (
              /* Fallback: text input for enum without options */
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={answers[q.id] && answers[q.id] !== "UNKNOWN" ? answers[q.id] : ""}
                  onChange={(e) => onAnswer(q.id, e.target.value || "UNKNOWN")}
                  placeholder={l(lang, "Enter value…", "Saisir une valeur…", "Wert eingeben…")}
                  className="flex-grow px-4 py-2.5 rounded-lg text-sm border border-calm-blue-200 bg-white/60 text-calm-blue-800 focus:outline-none focus:border-calm-blue-400 focus:ring-1 focus:ring-calm-blue-400"
                />
                <button
                  onClick={() => onAnswer(q.id, "UNKNOWN")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    answers[q.id] === "UNKNOWN"
                      ? "bg-calm-blue-800 text-white border-calm-blue-800 shadow-md"
                      : "bg-white/60 text-calm-blue-700 border-calm-blue-200 hover:border-calm-blue-400 hover:bg-white"
                  }`}
                >
                  {l(lang, "I don't know", "Je ne sais pas", "Ich weiß nicht")}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={onGenerate}
        disabled={!allAnswered}
        className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all ${
          allAnswered
            ? "btn-primary shadow-lg hover:shadow-xl"
            : "bg-calm-blue-100 text-calm-blue-400 cursor-not-allowed"
        }`}
      >
        {l(
          lang,
          "Generate checklist",
          "Générer la liste de démarches",
          "Checkliste erstellen"
        )}
      </button>
    </div>
  );
}

/* ── ChecklistResults component ── */
function ChecklistResults({
  lang,
  items,
  unknownQuestions,
  onReset,
}: {
  lang: Lang;
  items: ChecklistItem[];
  unknownQuestions: IntakeQuestion[];
  onReset: () => void;
}) {
  // Group items by checklist_group
  const groups = GROUP_ORDER.filter((g) => items.some((i) => i.checklist_group === g));

  const appliesCount = items.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📋</span>
          <h2
            className="text-lg font-semibold text-calm-blue-800"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Your checklist", "Votre liste de démarches", "Ihre Checkliste")}
          </h2>
        </div>
        <p className="text-sm text-calm-blue-500">
          {appliesCount > 0 &&
            l(
              lang,
              `${appliesCount} item${appliesCount > 1 ? "s" : ""} applicable`,
              `${appliesCount} élément${appliesCount > 1 ? "s" : ""} applicable${appliesCount > 1 ? "s" : ""}`,
              `${appliesCount} zutreffende${appliesCount > 1 ? "r" : ""} Punkt${appliesCount > 1 ? "e" : ""}`
            )}
        </p>
      </div>

      {/* Unknown question prompt cards */}
      {unknownQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wide flex items-center gap-2">
            <span className="w-8 h-px bg-amber-300" />
            {l(lang, "More information needed", "Informations supplémentaires nécessaires", "Weitere Informationen erforderlich")}
          </h3>
          {unknownQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/60 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">❓</span>
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {lang === "fr" ? q.label_fr : lang === "de" ? q.label_de : q.label_en}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {l(
                      lang,
                      "Your checklist may be incomplete because this answer is unknown. Once you have this information, come back and generate a new checklist.",
                      "Votre liste pourrait être incomplète car cette réponse est inconnue. Une fois cette information obtenue, revenez générer une nouvelle liste.",
                      "Ihre Checkliste ist möglicherweise unvollständig, da diese Antwort unbekannt ist. Sobald Sie diese Information haben, erstellen Sie eine neue Checkliste."
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items by group */}
      {groups.map((group) => {
        const groupItems = items.filter((i) => i.checklist_group === group);
        const groupLabel = GROUP_LABELS[group] ?? { en: group, fr: group, de: group };

        return (
          <section key={group} className="space-y-3">
            <h3 className="text-sm font-bold text-calm-blue-600 uppercase tracking-wide flex items-center gap-2">
              <span className="w-8 h-px bg-calm-blue-200" />
              {l(lang, groupLabel.en, groupLabel.fr, groupLabel.de)}
            </h3>

            {groupItems.map((item) => (
              <ChecklistItemCard key={item.id} item={item} lang={lang} />
            ))}
          </section>
        );
      })}

      {items.length === 0 && unknownQuestions.length === 0 && (
        <div className="glass-panel p-8 rounded-xl text-center">
          <p className="text-calm-blue-500 text-sm">
            {l(
              lang,
              "No items match your situation based on the answers provided. This may be because the alpha prototype has very limited coverage.",
              "Aucun élément ne correspond à votre situation sur la base des réponses fournies. Cela peut être dû à la couverture très limitée du prototype alpha.",
              "Keine Einträge passen zu Ihrer Situation basierend auf den gegebenen Antworten. Dies kann daran liegen, dass der Alpha-Prototyp eine sehr begrenzte Abdeckung hat."
            )}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onReset}
          className="btn-secondary px-6 py-2.5 text-sm rounded-xl"
        >
          {l(lang, "Start over", "Recommencer", "Neu starten")}
        </button>
        <Link
          href={`/${lang}`}
          className="btn-secondary px-6 py-2.5 text-sm rounded-xl inline-flex items-center"
        >
          {l(lang, "Back to home", "Retour à l'accueil", "Zurück zur Startseite")}
        </Link>
      </div>
    </div>
  );
}

/* ── Single checklist item card ── */
function ChecklistItemCard({
  item,
  lang,
}: {
  item: ChecklistItem;
  lang: Lang;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    applies: {
      icon: "✔",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      label: l(lang, "Applies", "Applicable", "Zutreffend"),
    },
    needs_fact: {
      icon: "?",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      label: l(
        lang,
        "More info needed",
        "Informations supplémentaires nécessaires",
        "Weitere Informationen nötig"
      ),
    },
    does_not_apply: {
      icon: "✘",
      color: "text-calm-blue-400",
      bg: "bg-calm-blue-50 border-calm-blue-200",
      label: l(lang, "Does not apply", "Non applicable", "Nicht zutreffend"),
    },
  };

  const s = statusConfig[item.status];

  const urgencyColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    important: "bg-amber-100 text-amber-700",
    normal: "bg-calm-blue-100 text-calm-blue-600",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all cursor-pointer hover:shadow-sm ${s.bg}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <span className={`text-lg mt-0.5 ${s.color} font-bold`}>{s.icon}</span>
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-calm-blue-800 leading-snug">
              {item.title}
            </h4>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                urgencyColors[item.urgency.label] ?? urgencyColors.normal
              }`}
            >
              {l(
                lang,
                item.urgency.label,
                item.urgency.label === "urgent"
                  ? "urgent"
                  : item.urgency.label === "important"
                    ? "important"
                    : "normal",
                item.urgency.label === "urgent"
                  ? "dringend"
                  : item.urgency.label === "important"
                    ? "wichtig"
                    : "normal"
              )}
            </span>
          </div>

          {/* Compact info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-calm-blue-500">
            {item.authority && (
              <span>→ {item.authority.name_en}</span>
            )}
            {item.deadline_label && (
              <span>⏰ {item.deadline_label}</span>
            )}
            {item.consequence_type && (
              <span className="capitalize">
                {item.consequence_type === "obligation"
                  ? l(lang, "Obligation", "Obligation", "Pflicht")
                  : item.consequence_type === "right_or_benefit" || item.consequence_type === "right"
                    ? l(lang, "Right / Benefit", "Droit / Prestation", "Recht / Leistung")
                    : item.consequence_type === "administrative_step"
                      ? l(lang, "Administrative step", "Démarche administrative", "Verwaltungsschritt")
                      : item.consequence_type === "routing_decision"
                        ? l(lang, "Decision point", "Point de décision", "Entscheidungspunkt")
                        : l(lang, item.consequence_type, item.consequence_type, item.consequence_type)}
              </span>
            )}
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-calm-blue-200/50 space-y-2 text-xs text-calm-blue-600">
              {item.evidence && item.evidence.length > 0 && (
                <div>
                  <span className="font-semibold">
                    {l(lang, "Documents needed:", "Documents nécessaires :", "Benötigte Dokumente:")}
                  </span>
                  <ul className="list-disc list-inside mt-1 ml-1">
                    {item.evidence.map((e) => (
                      <li key={e.id}>{e.canonical_name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.sources && item.sources.length > 0 && (
                <div>
                  <span className="font-semibold">
                    {l(lang, "Sources:", "Sources :", "Quellen:")}
                  </span>
                  <ul className="mt-1 ml-1 space-y-0.5">
                    {item.sources.map((s) => (
                      <li key={s.id} className="flex items-center gap-1">
                        <span className="text-calm-blue-400">🔗</span>
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-calm-blue-600 hover:text-calm-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {s.title}
                          </a>
                        ) : (
                          <span>{s.title}</span>
                        )}
                        {s.publisher && (
                          <span className="text-calm-blue-400">— {s.publisher}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.status === "needs_fact" && item.missing_facts && (
                <p className="text-amber-600">
                  {l(
                    lang,
                    "We need more information to determine if this applies to your situation.",
                    "Nous avons besoin de plus d'informations pour déterminer si cela s'applique à votre situation.",
                    "Wir benötigen weitere Informationen, um festzustellen, ob dies auf Ihre Situation zutrifft."
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Utility ── */
function extractVarRefs(expression: unknown, refs: string[]): void {
  if (expression === null || expression === undefined) return;
  if (typeof expression !== "object") return;
  if (Array.isArray(expression)) {
    for (const item of expression) extractVarRefs(item, refs);
    return;
  }
  const obj = expression as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 1 && keys[0] === "var") {
    refs.push(obj["var"] as string);
  } else {
    for (const v of Object.values(obj)) extractVarRefs(v, refs);
  }
}
