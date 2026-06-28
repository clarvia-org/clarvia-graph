"use client";

import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function VideoSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20">
      <div className="glass-panel p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Text content - Left on desktop */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-left" style={headlineStyle}>
              {l(lang,
                "Follow Our Journey",
                "Suivez notre parcours",
                "Folgen Sie unserer Reise"
              )}
            </h2>
            <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
              {l(lang,
                "No one should have to figure out the practical side of loss alone. We are building a free, practical service to support families when it matters most, and we are learning from families, caregivers, and professionals along the way. Follow our updates and watch our progress on YouTube.",
                "Personne ne devrait avoir à affronter seul les aspects pratiques d'un décès. Nous construisons un service gratuit et pratique pour accompagner les familles au moment où elles en ont le plus besoin, en apprenant chaque jour des familles, des soignants et des professionnels. Suivez nos actualités et notre progression sur YouTube.",
                "Niemand sollte die praktischen Aspekte eines Verlusts allein bewältigen müssen. Wir bauen ein kostenloses, praktisches Angebot auf, um Familien zu unterstützen, wenn es am wichtigsten ist, und lernen dabei ständig von Familien, Pflegenden und Fachkräften. Verfolgen Sie unsere Updates und unseren Fortschritt auf YouTube."
              )}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.youtube.com/playlist?list=UUQt8JlIa-fBlV9s4_6hHsAg"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 text-base inline-flex items-center gap-2"
              >
                <span>📺</span>
                {l(lang, "Watch Playlist on YouTube", "Voir la playlist sur YouTube", "Playlist auf YouTube ansehen")}
              </a>
            </div>
          </div>

          {/* Video player - Right on desktop */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border border-white/50 bg-slate-900">
              <iframe
                src="https://www.youtube-nocookie.com/embed/videoseries?list=UUQt8JlIa-fBlV9s4_6hHsAg&autoplay=1&mute=1&rel=0"
                title="Clarvia - Follow Our Journey"
                aria-label="Clarvia Follow Our Journey YouTube playlist. The video starts automatically with sound muted. Use the player controls to pause, play, or unmute."
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
