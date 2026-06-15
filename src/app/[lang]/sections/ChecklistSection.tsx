"use client";

import { useState } from "react";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, CHECKLIST_TOPICS, FEATURES } from "../data";

export default function ChecklistSection({ lang }: { lang: Lang }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const previewThumb = `/checklist-preview-${lang}-thumb.jpg`;
  const previewFull = `/checklist-preview-${lang}.jpg`;

  return (
    <section className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
        {l(lang,
          "A free bereavement service for Luxembourg",
          "Un service gratuit d'accompagnement après décès pour le Luxembourg",
          "Ein kostenloses Unterstützungsangebot im Trauerfall für Luxemburg"
        )}
      </h2>
      <p className="text-base sm:text-lg text-calm-blue-600 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
        {l(lang,
          "Clarvia's first project is a free digital service that helps families understand the practical steps after a loss in Luxembourg.",
          "Le premier projet de Clarvia est un service numérique gratuit qui aide les familles à comprendre les démarches pratiques à effectuer après un décès au Luxembourg.",
          "Clarvias erstes Projekt ist ein kostenloser digitaler Service, der Familien hilft, die praktischen Schritte nach einem Todesfall in Luxemburg zu verstehen."
        )}
      </p>

      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto mb-8">
        <p className="text-base text-calm-blue-700 font-medium mb-4">
          {l(lang,
            "The service will guide families through relevant topics such as:",
            "Le service guidera les familles à travers des sujets essentiels tels que :",
            "Der Service wird Familien durch relevante Themen führen, darunter:"
          )}
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
          {CHECKLIST_TOPICS.map((item, i) => (
            <li key={i} className="flex items-baseline gap-2.5 text-base text-calm-blue-600">
              <span className="text-calm-lilac-400 flex-shrink-0 text-sm leading-none">●</span>
              <span>{l(lang, item.en, item.fr, item.de)}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-calm-blue-500 leading-relaxed pt-4 border-t border-calm-blue-100">
          {l(lang,
            "Clarvia will not replace legal, notarial, tax, medical, psychological, banking, financial, or succession advice. It will help families understand where to start, what to prepare, and when to seek professional support.",
            "Clarvia ne remplace pas les conseils juridiques, notariaux, fiscaux, médicaux, psychologiques, bancaires, financiers ou successoraux. Le service aide les familles à comprendre par où commencer, quoi préparer et à quel moment faire appel à des professionnels qualifiés.",
            "Clarvia ersetzt keine rechtliche, notarielle, steuerliche, medizinische, psychologische, bankfachliche, finanzielle oder nachlassbezogene Beratung. Der Service hilft Familien zu verstehen, wo sie beginnen können, was vorzubereiten ist und wann professionelle Unterstützung sinnvoll ist."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
        {FEATURES.map((f, i) => (
          <div key={i} className="glass-panel p-6 text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#2b3a67" }}>
              {l(lang, f.en_title, f.fr_title, f.de_title)}
            </h3>
            <p className="text-base text-calm-blue-600">{l(lang, f.en, f.fr, f.de)}</p>
          </div>
        ))}
      </div>

      {/* ── Checklist Preview Thumbnail ── */}
      <div className="max-w-2xl mx-auto text-center">
        <h3
          className="text-xl sm:text-2xl font-semibold mb-3"
          style={headlineStyle}
        >
          {l(lang,
            "What the checklist is being built to look like",
            "Ce que la liste de démarches est conçue pour devenir",
            "Wie die Checkliste aussehen soll"
          )}
        </h3>
        <p className="text-sm sm:text-base text-calm-blue-500 mb-6 leading-relaxed max-w-xl mx-auto">
          {l(lang,
            "The image below illustrates the type of step-by-step guidance Clarvia is working to deliver. It is not a finished product — the content, design, and features are still being developed and validated.",
            "L'image ci-dessous illustre le type d'accompagnement étape par étape que Clarvia travaille à offrir. Il ne s'agit pas d'un produit finalisé — le contenu, le design et les fonctionnalités sont encore en cours de développement et de validation.",
            "Das Bild unten zeigt, welche Art von schrittweiser Orientierung Clarvia entwickeln möchte. Es handelt sich nicht um ein fertiges Produkt — Inhalte, Design und Funktionen werden noch entwickelt und geprüft."
          )}
        </p>

        <button
          onClick={() => setLightboxOpen(true)}
          className="group relative inline-block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-zoom-in border border-calm-blue-200/60"
          aria-label={l(lang,
            "View full checklist preview",
            "Voir l'aperçu complet de la liste de démarches",
            "Vollständige Vorschau der Checkliste anzeigen"
          )}
        >
          {/* Thumbnail image */}
          <img
            src={previewThumb}
            alt={l(lang,
              "Illustrative preview of the Clarvia bereavement checklist for Luxembourg",
              "Aperçu illustratif de la liste de démarches Clarvia pour le Luxembourg",
              "Illustrative Vorschau der Clarvia-Checkliste im Trauerfall für Luxemburg"
            )}
            className="w-full max-w-sm mx-auto block"
            loading="lazy"
            style={{ maxHeight: "500px", objectFit: "cover", objectPosition: "top" }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-calm-blue-900/0 group-hover:bg-calm-blue-900/10 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm text-calm-blue-700 text-sm font-medium px-4 py-2 rounded-full shadow-md">
              🔍 {l(lang, "Click to enlarge", "Cliquer pour agrandir", "Klicken zum Vergrößern")}
            </span>
          </div>

          {/* Illustrative badge */}
          <span className="absolute top-3 right-3 bg-calm-lilac-100/90 backdrop-blur-sm text-calm-lilac-600 text-xs font-semibold px-3 py-1 rounded-full border border-calm-lilac-200/60 uppercase tracking-wider">
            {l(lang, "Illustrative", "Illustratif", "Illustrativ")}
          </span>
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={l(lang, "Checklist preview", "Aperçu de la liste de démarches", "Vorschau der Checkliste")}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="fixed top-4 right-4 z-[10000] bg-white/90 backdrop-blur-sm text-calm-blue-700 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors text-xl font-bold"
            aria-label={l(lang, "Close", "Fermer", "Schließen")}
          >
            ✕
          </button>

          {/* Illustrative banner */}
          <div className="fixed top-4 left-4 z-[10000] bg-calm-lilac-100/95 backdrop-blur-sm text-calm-lilac-600 text-xs sm:text-sm font-medium px-4 py-2 rounded-full border border-calm-lilac-200/60 shadow-sm">
            {l(lang,
              "Illustrative preview — not a finished product",
              "Aperçu illustratif — il ne s'agit pas d'un produit finalisé",
              "Illustrative Vorschau — kein fertiges Produkt"
            )}
          </div>

          {/* Full-size image */}
          <img
            src={previewFull}
            alt={l(lang,
              "Full preview of the Clarvia bereavement checklist for Luxembourg",
              "Aperçu complet de la liste de démarches Clarvia pour le Luxembourg",
              "Vollständige Vorschau der Clarvia-Checkliste im Trauerfall für Luxemburg"
            )}
            className="max-w-4xl w-full my-16 mx-4 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

