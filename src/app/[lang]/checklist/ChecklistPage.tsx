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
  authority_refs: string[];
  deadline_refs: string[];
  evidence_requirements?: {
    sets: Array<{ evidence_type_refs: string[] }>;
  };
  rendering: {
    checklist_group: string;
    urgency: { score: number; label: string };
  };
}

interface Consequence {
  id: string;
  title: string;
  consequence_type: string;
  jurisdiction: string;
  trigger: {
    life_event: string;
    condition_refs: string[];
  };
  task_template_refs: string[];
}

interface Authority {
  id: string;
  name: string;
  name_en: string;
}

interface Deadline {
  id: string;
  title: string;
  calculation?: {
    label: string;
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
}

/* ── Checklist groups ── */
const GROUP_ORDER = [
  "immediate_formalities",
  "money_and_benefits",
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

/* ── The page component ── */
export default function ChecklistPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [runtime, setRuntime] = useState<RuntimeData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"intake" | "results">("intake");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/clarvia-data/intake/bereavement.json").then((r) => r.json()),
      fetch("/clarvia-data/runtime/bereavement.json").then((r) => r.json()),
    ]).then(([intakeData, runtimeData]) => {
      setIntake(intakeData);
      setRuntime(runtimeData);
      setLoading(false);
    });
  }, []);

  // Generate checklist
  const generateChecklist = useCallback(() => {
    if (!runtime) return;

    // Build nested facts
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

    // Build checklist items
    const generated: ChecklistItem[] = [];
    const authorityMap = new Map(runtime.authorities.map((a) => [a.id, a]));
    const deadlineMap = new Map(runtime.deadlines.map((d) => [d.id, d]));
    const evidenceMap = new Map(runtime.evidence_types.map((e) => [e.id, e]));

    for (const consequence of runtime.consequences) {
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
          // Find which question path maps to this condition
          const condition = runtime.conditions.find((c) => c.id === ref);
          if (condition) {
            const varRefs: string[] = [];
            extractVarRefs(condition.expression, varRefs);
            missingFacts.push(...varRefs);
          }
        }
      }

      if (status === "does_not_apply") continue;

      // Expand task templates
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

        generated.push({
          id: `${consequence.id}::${template.id}`,
          title: template.title,
          status,
          consequence_type: consequence.consequence_type,
          checklist_group: template.rendering.checklist_group,
          urgency: template.rendering.urgency,
          authority,
          deadline_label: deadline?.calculation?.label,
          evidence,
          missing_facts: missingFacts.length > 0 ? missingFacts : undefined,
        });
      }
    }

    // Sort by group order, then urgency
    generated.sort((a, b) => {
      const ga = GROUP_ORDER.indexOf(a.checklist_group);
      const gb = GROUP_ORDER.indexOf(b.checklist_group);
      if (ga !== gb) return ga - gb;
      return b.urgency.score - a.urgency.score;
    });

    setItems(generated);
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
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {l(
                  lang,
                  "Alpha Prototype — Not Legal Advice",
                  "Prototype Alpha — Ceci n'est pas un avis juridique",
                  "Alpha-Prototyp — Keine Rechtsberatung"
                )}
              </p>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                {l(
                  lang,
                  "This is an early technical prototype with very limited coverage. It currently only includes 2 items for Luxembourg. The information shown is for testing purposes only and must not be relied upon. Always consult qualified professionals for legal, tax, and pension matters.",
                  "Ceci est un prototype technique précoce avec une couverture très limitée. Il ne comprend actuellement que 2 éléments pour le Luxembourg. Les informations affichées sont à des fins de test uniquement et ne doivent pas être utilisées comme référence. Consultez toujours des professionnels qualifiés pour les questions juridiques, fiscales et de pension.",
                  "Dies ist ein früher technischer Prototyp mit sehr begrenzter Abdeckung. Er enthält derzeit nur 2 Einträge für Luxemburg. Die angezeigten Informationen dienen nur zu Testzwecken und dürfen nicht als Grundlage verwendet werden. Konsultieren Sie immer qualifizierte Fachleute für rechtliche, steuerliche und Rentenangelegenheiten."
                )}
              </p>
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
            onReset={() => {
              setStep("intake");
              setAnswers({});
              setItems([]);
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
      {questions.map((q, idx) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {q.options.map((opt) => {
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
        </div>
      ))}

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
  onReset,
}: {
  lang: Lang;
  items: ChecklistItem[];
  onReset: () => void;
}) {
  // Group items by checklist_group
  const groups = GROUP_ORDER.filter((g) => items.some((i) => i.checklist_group === g));

  const appliesCount = items.filter((i) => i.status === "applies").length;
  const needsFactCount = items.filter((i) => i.status === "needs_fact").length;

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
          {needsFactCount > 0 &&
            ` · ${needsFactCount} ${l(
              lang,
              "need more information",
              "nécessitent plus d'informations",
              "benötigen weitere Informationen"
            )}`}
        </p>
      </div>

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

      {items.length === 0 && (
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
                  : l(lang, "Right", "Droit", "Recht")}
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
