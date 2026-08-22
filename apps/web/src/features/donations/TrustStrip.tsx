import { type Lang, l } from "@/lib/i18n";

export interface TrustStripProps {
  lang: Lang;
}

export default function TrustStrip({ lang }: TrustStripProps) {
  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 border border-white/60 space-y-3 text-sm text-calm-blue-600 leading-relaxed">
        <h2 className="text-base font-semibold text-calm-blue-800">
          {l(
            lang,
            "How we use donations",
            "Comment nous utilisons les dons",
            "Wie wir Spenden verwenden",
            "Wéi mir Spende benotzen"
          )}
        </h2>
        <p>
          {l(
            lang,
            "Donations fund our free services: worldwide email guidance and the Luxembourg checklist. We do not show ads, and we do not sell data.",
            "Les dons financent nos services gratuits : notre accompagnement par e-mail dans le monde entier et la checklist Luxembourg. Nous n’affichons aucune publicité et ne vendons aucune donnée.",
            "Spenden finanzieren unsere kostenlosen Angebote: weltweite Orientierung per E-Mail und die Luxemburg-Checkliste. Wir zeigen keine Werbung und verkaufen keine Daten.",
            "Spende finanzéieren eis gratis Servicer: Orientéierung per E-Mail weltwäit an d’Lëtzebuerg-Checklëscht. Mir weise keng Reklammen a verkafe keng Daten."
          )}
        </p>
        <p>
          {l(
            lang,
            "Payments are processed through Stripe, Open Collective, and GitHub Sponsors. Clarvia ASBL does not currently issue tax certificates.",
            "Les paiements sont traités par Stripe, Open Collective et GitHub Sponsors. Clarvia ASBL ne délivre actuellement aucun certificat fiscal.",
            "Zahlungen werden über Stripe, Open Collective und GitHub Sponsors abgewickelt. Clarvia ASBL stellt derzeit keine Spendenbescheinigungen aus.",
            "D’Bezuelunge ginn iwwer Stripe, Open Collective a GitHub Sponsors ofgewéckelt. Clarvia ASBL stellt de Moment keng Steierbescheinegungen aus."
          )}
        </p>
        <p>
          {l(
            lang,
            "Our 2026 accounts have not yet been filed. Open Collective shows live income and eligible expenses:",
            "Nos comptes pour 2026 n’ont pas encore été déposés. Open Collective présente en temps réel nos recettes et les dépenses admissibles :",
            "Unser Jahresabschluss für 2026 wurde noch nicht eingereicht. Auf Open Collective können Sie unsere laufenden Einnahmen und die anerkannten Ausgaben einsehen:",
            "Eis Konte fir 2026 sinn nach net agereecht ginn. Op Open Collective kënnt Dir eis aktuell Recetten an déi eligible Ausgaben gesinn:"
          )}{" "}
          <a
            href="https://opencollective.com/clarvia-org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2"
          >
            opencollective.com/clarvia-org
          </a>
        </p>
      </div>

      {/* Legal, Privacy and Transparency Grid */}
      <div
        className="border-t border-calm-blue-200/50 pt-8 space-y-6 text-xs text-calm-blue-500 leading-relaxed"
        aria-label="Transparency metadata"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legal / nonprofit info */}
          <div>
            <h3 className="font-semibold text-calm-blue-700 mb-1.5">
              {l(
                lang,
                "Nonprofit Status & Registrations",
                "Statut d'association & Enregistrements",
                "Gemeinnützigkeit & Registrierungen",
                "Status als ASBL & Registréierungen"
              )}
            </h3>
            <p>
              {l(
                lang,
                "Clarvia ASBL is registered as a non-profit association in Luxembourg under RCS F15680. We operate transparently and build open workflows as a public service.",
                "Clarvia ASBL est enregistrée comme association sans but lucratif au Luxembourg sous le numéro RCS F15680. Nous opérons en toute transparence et construisons des parcours ouverts au service du public.",
                "Clarvia ASBL ist in Luxemburg als gemeinnützige Vereinigung unter der Nummer RCS F15680 eingetragen. Wir arbeiten transparent und bauen offene Abläufe als öffentlichen Dienst auf.",
                "Clarvia ASBL ass zu Lëtzebuerg als Association sans but lucratif ënner der Nummer RCS F15680 registréiert. Mir schaffen transparent a bauen oppen Ofleef als ëffentleche Service op."
              )}
            </p>
          </div>

          {/* Donation receipts warning */}
          <div>
            <h3 className="font-semibold text-calm-blue-700 mb-1.5">
              {l(
                lang,
                "Donation Acknowledgements",
                "Accusés de réception des dons",
                "Spendenbestätigungen",
                "Bestätegunge fir Donen"
              )}
            </h3>
            <p>
              {l(
                lang,
                "Clarvia ASBL does not currently issue tax certificates. Any confirmation we send is an acknowledgement of support, not a tax-deductible receipt.",
                "Clarvia ASBL ne délivre pas de certificats fiscaux actuellement. Toute confirmation envoyée est un accusé de réception de votre soutien, et non un reçu déductible des impôts.",
                "Clarvia ASBL stellt derzeit keine steuerlichen Spendenbescheinigungen aus. Jede Bestätigung ist eine Bestätigung Ihrer Unterstützung, keine abzugsfähige Bescheinigung.",
                "Clarvia ASBL stellt de Moment keng Steierzertifikater aus. All Bestätegung, déi mir schécken, ass eng Unerkennung vun Ärer Ënnerstëtzung, net eng steierlech ofsetzbar Quittung."
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-calm-blue-100/50">
          {/* Privacy details */}
          <div>
            <h3 className="font-semibold text-calm-blue-700 mb-1.5">
              {l(
                lang,
                "Privacy & Donor Records",
                "Confidentialité & Dossiers donateurs",
                "Datenschutz & Spenderdaten",
                "Dateschutz & Donateurendonnéeën"
              )}
            </h3>
            <p>
              {l(
                lang,
                "We collect only minimal records required for transaction processing via Stripe. Donation records are strictly isolated from any family support checklist usage data.",
                "Nous collectons le minimum nécessaire pour traiter la transaction via Stripe. Les dossiers donateurs sont strictement isolés de toute donnée d'utilisation des listes d'accompagnement.",
                "Wir erfassen nur die für die Transaktionsabwicklung über Stripe erforderlichen Mindestdaten. Spenderdaten werden strikt getrennt von Nutzungsdaten der Checklisten aufbewahrt.",
                "Mir sammele just déi minimal Donnéeën, déi fir d'Veraarbechtung vun der Transaktioun iwwer Stripe néideg sinn. Donateurendonnéeë gi strikt getrennt vun all Benotzerdonnéeë vun de Checklëschten opbewahrt."
              )}
            </p>
          </div>

          {/* Sensitive info warning */}
          <div>
            <h3 className="font-semibold text-calm-blue-700 mb-1.5">
              {l(lang, "Content Warning", "Mise en garde", "Wichtiger Hinweis", "Wichtegen Hiweis")}
            </h3>
            <p className="text-calm-blue-400">
              {l(
                lang,
                "Please do not write any health details, personal family records, or information about a deceased person in payment reference fields or support messages.",
                "Veuillez ne pas inscrire de détails sur la santé, de données familiales ou d'informations sur un défunt dans les champs de référence de paiement ou messages.",
                "Bitte tragen Sie keine Gesundheitsdetails, Familiendaten oder Informationen über einen Verstorbenen in Zahlungsreferenzen oder Nachrichten ein.",
                "Schreift wgl. keng Gesondheetsdetailer, privat Familljedonnéeën oder Informatiounen iwwer eng verstuerwen Persoun an d'Bezuelreferenz oder an Ënnerstëtzungsmessagen."
              )}
            </p>
          </div>
        </div>

        {/* Legal & Contact Links */}
        <div className="text-center pt-4 border-t border-calm-blue-100/50 flex justify-center items-center gap-4">
          <a
            href={`/${lang}/privacy`}
            className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors"
          >
            {l(
              lang,
              "Privacy Policy",
              "Politique de confidentialité",
              "Datenschutzerklärung",
              "Dateschutzerklärung"
            )}
          </a>
          <span className="text-calm-blue-200" aria-hidden="true">|</span>
          <a
            href={`/${lang}/privacy#terms`}
            className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors"
          >
            {l(
              lang,
              "Terms of Use",
              "Conditions d'utilisation",
              "Nutzungsbedingungen",
              "Notzungsbedéngungen"
            )}
          </a>
          <span className="text-calm-blue-200" aria-hidden="true">|</span>
          <a
            href={`/${lang}/contact`}
            className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors"
          >
            {l(
              lang,
              "Contact",
              "Contact",
              "Kontakt",
              "Kontakt"
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
