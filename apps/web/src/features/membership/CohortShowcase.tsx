import Image from "next/image";
import { FOUNDING_STORIES, headlineStyle } from "@/app/[lang]/data";
import {
  computeMemberInitials,
  FOUNDING_COHORT_YEARS,
  getRemainingArchetypeSlots,
  localizeMemberCopy,
  PUBLISHED_ASSOCIATE_MEMBERS,
  type CohortArchetypeSlot,
} from "@/content/associate-members";
import { type Lang, l } from "@/lib/i18n";

export interface CohortShowcaseProps {
  lang: Lang;
  previewName: string;
  previewPublish: boolean;
}

function ArchetypeEmblem({ id }: { id: CohortArchetypeSlot["id"] }) {
  switch (id) {
    case "legal-estate":
      return (
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-current" fill="none" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7h14M7 7l-3 6h6L7 7zm10 0l-3 6h6l-3-6zM8 21h8" />
        </svg>
      );
    case "healthcare-palliative":
      return (
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-current" fill="none" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.6-7 10-7 10z" />
        </svg>
      );
    case "civic-tech":
      return (
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-current" fill="none" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3M13.5 6l-3 12" />
        </svg>
      );
    case "global-mobility":
      return (
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-current" fill="none" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 000 18M12 3a14.5 14.5 0 010 18" />
        </svg>
      );
    case "philanthropy":
      return (
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-current" fill="none" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9L12 3z" />
        </svg>
      );
    case "workplace-hr":
      return (
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-current" fill="none" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0" />
        </svg>
      );
  }
}

function LinkedInBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
      <path d="M19 3A2 2 0 0121 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function CohortShowcase({
  lang,
  previewName,
  previewPublish,
}: CohortShowcaseProps) {
  const remainingSlots = getRemainingArchetypeSlots(PUBLISHED_ASSOCIATE_MEMBERS.length);
  const trimmedName = previewName.trim();
  const displayPreviewName =
    trimmedName ||
    l(
      lang,
      "Your Name",
      "Votre nom",
      "Ihr Name",
      "Ären Numm",
    );
  const previewInitials = trimmedName
    ? computeMemberInitials(trimmedName)
    : l(lang, "YN", "VN", "IN", "ÄN");

  return (
    <section
      aria-labelledby="cohort-heading"
      className="mt-14 pt-12 border-t border-calm-blue-200/50 no-print"
    >
      <div className="max-w-3xl mb-8">
        <span className="badge badge-build mb-3">
          {l(
            lang,
            `Founding Cohort · ${FOUNDING_COHORT_YEARS}`,
            `Cohorte fondatrice · ${FOUNDING_COHORT_YEARS}`,
            `Gründerkohorte · ${FOUNDING_COHORT_YEARS}`,
            `Grënnerkohort · ${FOUNDING_COHORT_YEARS}`,
          )}
        </span>
        <h2
          id="cohort-heading"
          className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-3 text-balance"
          style={{ fontFamily: headlineStyle.fontFamily }}
        >
          {l(
            lang,
            "Associate Members & Mission Ambassadors",
            "Membres adhérents et ambassadeurs de la mission",
            "Assoziierte Mitglieder & Botschafter der Mission",
            "Assoziéiert Memberen & Ambassadeure vun der Missioun",
          )}
        </h2>
        <p className="text-base text-calm-blue-600 leading-relaxed text-pretty">
          {l(
            lang,
            "Leaders, practitioners, and philanthropists supporting Clarvia's non-profit mission for families worldwide.",
            "Dirigeants, praticiens et philanthropes engagés aux côtés de la mission à but non lucratif de Clarvia.",
            "Führungskräfte, Fachleute und Fördernde, die Clarvias gemeinnützige Mission für Familien weltweit unterstützen.",
            "Verantwortlecher, Fachleit a Philanthropen, déi d'Non-Profit-Missioun vu Clarvia fir Famillje weltwäit ënnerstëtzen.",
          )}
        </p>
      </div>

      {/* Founding Board Stewards Anchor (Large 96px portraits) */}
      <div className="glass-panel p-6 mb-6 border border-white/80">
        <p className="text-xs font-semibold uppercase tracking-wider text-calm-blue-600 mb-4">
          {l(
            lang,
            "Stewarded by Clarvia's Unpaid Founding Board",
            "Porté par le conseil d'administration fondateur bénévole de Clarvia",
            "Getragen vom ehrenamtlichen Gründungsvorstand von Clarvia",
            "Gedroe vum benevole Grënnungsverwaltungsrot vu Clarvia",
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FOUNDING_STORIES.map((founder) => (
            <div key={founder.name} className="flex items-center gap-4">
              <Image
                src={founder.photo}
                alt={founder.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md shrink-0"
                style={
                  founder.photo.includes("gunther")
                    ? { objectPosition: "center 20%" }
                    : undefined
                }
              />
              <div className="min-w-0">
                <p className="text-base font-semibold text-calm-blue-800">
                  {founder.name}
                </p>
                <p className="text-sm text-calm-blue-600">
                  {l(
                    lang,
                    founder.title.en,
                    founder.title.fr,
                    founder.title.de,
                    founder.title.lu,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Specimen Preview Card (Large 88px portrait preview) */}
      <div className="glass-panel p-6 mb-6 border-2 border-calm-lilac-300/80 bg-white/85">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-calm-lilac-600 bg-calm-lilac-100 px-2.5 py-1 rounded-full">
            {l(
              lang,
              "Live Preview · Your Recognition Card",
              "Aperçu en direct · Votre carte publique",
              "Live-Vorschau · Ihre öffentliche Karte",
              "Live-Virschau · Är ëffentlech Kaart",
            )}
          </span>
          <span className="text-xs text-calm-blue-600">
            {previewPublish
              ? l(
                  lang,
                  "Public listing enabled (LinkedIn portrait + link)",
                  "Publication activée (photo + lien LinkedIn)",
                  "Öffentliche Nennung aktiv (LinkedIn-Porträt + Link)",
                  "Ëffentlech Ernimmung aktiv (LinkedIn-Foto + Link)",
                )
              : l(
                  lang,
                  "Optional: check the recognition box in the form to publish",
                  "Facultatif : cochez la case dédiée dans le formulaire pour publier",
                  "Optional: im Formular aktivieren, um öffentlich genannt zu werden",
                  "Optional: am Formulaire aktivéieren, fir ëffentlech genannt ze ginn",
                )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center shrink-0 border-[3px] border-white shadow-md text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, #2b3a67, #7162ae)",
              }}
              aria-hidden="true"
            >
              <span className="text-xl leading-none">{previewInitials}</span>
              <span className="text-[9px] uppercase tracking-wider opacity-85 mt-1">
                {l(lang, "Portrait", "Photo", "Porträt", "Foto")}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-calm-blue-800 truncate">
                {displayPreviewName}
              </p>
              <p className="text-sm text-calm-blue-600">
                {l(
                  lang,
                  `Associate Member · Founding Cohort (${FOUNDING_COHORT_YEARS})`,
                  `Membre adhérent · Cohorte fondatrice (${FOUNDING_COHORT_YEARS})`,
                  `Assoziiertes Mitglied · Gründerkohorte (${FOUNDING_COHORT_YEARS})`,
                  `Assoziéierte Member · Grënnerkohort (${FOUNDING_COHORT_YEARS})`,
                )}
              </p>
              <p className="text-xs text-calm-blue-600 mt-0.5">
                {l(
                  lang,
                  "Displays your LinkedIn portrait and headline upon admission",
                  "Affiche votre photo et votre titre LinkedIn après admission",
                  "Zeigt nach Aufnahme Ihr LinkedIn-Porträt und Ihre Funktion",
                  "Weist no der Opnam Är LinkedIn-Foto an Ären Titel",
                )}
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-semibold text-calm-blue-700 bg-calm-blue-50 border border-calm-blue-200 px-3 py-1.5 rounded-full shrink-0">
            <LinkedInBadgeIcon />
            <span>LinkedIn</span>
          </span>
        </div>
      </div>

      {/* Cohort Grid: Prominent 96px Centered Portrait Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PUBLISHED_ASSOCIATE_MEMBERS.map((member) => (
          <div
            key={member.slug}
            className="glass-panel p-6 flex flex-col items-center text-center justify-between border border-white/80"
          >
            <div className="flex flex-col items-center">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md mb-3.5"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-[3px] border-white shadow-md bg-calm-blue-800 text-white text-xl font-semibold mb-3.5"
                  aria-hidden="true"
                >
                  {computeMemberInitials(member.name)}
                </div>
              )}
              <p className="text-base font-semibold text-calm-blue-800 leading-snug">
                {member.name}
              </p>
              {member.headline && (
                <p className="text-xs text-calm-blue-600 mt-1 leading-snug">
                  {localizeMemberCopy(lang, member.headline)}
                </p>
              )}
              <p className="text-[11px] font-medium text-calm-lilac-600 mt-1.5">
                {member.cohort} · {member.admittedYear}
              </p>
            </div>
            <div className="w-full mt-4 pt-3 border-t border-calm-blue-100/70 flex items-center justify-center">
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-calm-blue-700 hover:text-calm-blue-900 underline underline-offset-2"
              >
                <LinkedInBadgeIcon />
                <span>
                  {l(
                    lang,
                    "LinkedIn profile",
                    "Profil LinkedIn",
                    "LinkedIn-Profil",
                    "LinkedIn-Profil",
                  )}
                </span>
              </a>
            </div>
          </div>
        ))}

        {remainingSlots.map((slot, index) => {
          const seatNum = String(PUBLISHED_ASSOCIATE_MEMBERS.length + index + 1).padStart(
            2,
            "0",
          );
          return (
            <div
              key={slot.id}
              className="rounded-2xl p-6 bg-white/50 border border-dashed border-calm-blue-300/90 flex flex-col items-center text-center justify-between"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-calm-blue-100/80 border border-calm-blue-200 text-calm-blue-600 flex items-center justify-center mb-3.5">
                  <ArchetypeEmblem id={slot.id} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-calm-blue-600">
                  {l(
                    lang,
                    `Cohort Seat ${seatNum}`,
                    `Siège ${seatNum}`,
                    `Kohortenplatz ${seatNum}`,
                    `Kohorteplaz ${seatNum}`,
                  )}
                </p>
                <p className="text-sm font-semibold text-calm-blue-800 leading-snug mt-1">
                  {localizeMemberCopy(lang, slot.sector)}
                </p>
              </div>
              <p className="w-full mt-4 pt-3 border-t border-calm-blue-200/50 text-xs text-calm-blue-600">
                {localizeMemberCopy(lang, slot.descriptor)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Concise Asterisk Footnote */}
      <p className="mt-4 text-xs text-calm-blue-600 leading-relaxed text-pretty">
        {l(
          lang,
          "* Open Founding Cohort seats show illustrative professional fields until filled. Each placeholder is replaced by a member's portrait, name, and LinkedIn link when an Associate Member opts in to public recognition.",
          "* Les sièges ouverts de la cohorte fondatrice illustrent les domaines représentés jusqu'à leur attribution. Chaque emplacement est remplacé par la photo, le nom et le lien LinkedIn des membres adhérents qui choisissent la publication.",
          "* Offene Plätze der Gründerkohorte zeigen beispielhafte Berufsfelder bis zur Vergabe. Jeder Platzhalter wird durch Porträt, Namen und LinkedIn-Link aufgenommener Mitglieder ersetzt, die der Veröffentlichung zustimmen.",
          "* Oppen Plazen an der Grënnerkohort weisen illustrativ Beruffsfelder bis zu hirer Vergab. All Plazhalter gëtt duerch d'Foto, den Numm an de LinkedIn-Link vun opgeholle Memberen ersat, déi der Verëffentlechung zoustëmmen.",
        )}
      </p>
    </section>
  );
}
