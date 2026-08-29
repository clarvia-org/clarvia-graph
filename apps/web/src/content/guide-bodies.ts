import type { Lang } from "@/lib/i18n";
import type { GuideSlug } from "./guidance";

export type GuideBody = {
  slug: GuideSlug;
  headline: string;
  sections: Array<{ title?: string; html: string }>;
};

export const GUIDE_BODIES: GuideBody[] = [
  {
    slug: "first-steps-after-a-death",
    headline: "First steps after a death",
    sections: [
      {
        html: "The right first step depends on where the death occurred and where the person lived. Do not assume that one country's forms or deadlines apply somewhere else. Ask Clarvia can help from anywhere.",
      },
      {
        title: "If the death occurred in Luxembourg:",
        html: `<ol class="list-decimal pl-5 space-y-2"><li>A doctor prepares the medical attestation connected with the death declaration.</li><li>The death is declared to the civil registrar of the commune where it occurred. The reviewed Guichet.lu source states that this must be done within 24 hours.</li><li>Funeral or cremation arrangements require written authorization from the civil registrar. The reviewed source on this page's first official link states that, in principle, the body must be buried between 24 and 72 hours after the death occurred unless an extension is granted.</li><li>Keep the death certificate and other official documents available for later procedures. Banks, pension authorities, insurers, employers, and succession procedures may each ask for evidence.</li></ol>`,
      },
      {
        title: "If the death occurred elsewhere:",
        html: "Use the official guidance for that place. Tell Ask Clarvia where the person died, where they lived, and where the family is handling the next steps. Clarvia will not apply the Luxembourg deadlines above to another country.",
      },
      {
        title: "Official sources checked by Clarvia",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu: What to do in the event of a death</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu: Burial and cremation</a></li></ul>`,
      },
      {
        html: 'Not sure which rules apply? <a class="underline font-medium" href="#ask-bridge">Ask Clarvia</a> and include the countries involved.',
      },
    ],
  },
  {
    slug: "registering-a-death",
    headline: "Registering a death",
    sections: [
      {
        html: "For a death that occurred in Luxembourg, the reviewed Guichet.lu source says the family must declare the death to the civil registrar of the commune where it occurred, within 24 hours.",
      },
      {
        title: "What to prepare",
        html: "The current Guichet.lu page says the person making the declaration must present a valid identity document and the medical certificate attesting to the death. If possible, they should also present the deceased person's family record book (livret de famille), a certificate of identity, or another document showing civil status, such as a marriage certificate. Check the commune's current instructions before attending, especially if a document is unavailable or was issued in another country.",
      },
      {
        html: "Ask the commune what death-certificate extracts or multilingual copies are available and whether fees apply. Clarvia does not publish a number of copies or a fee because those details still require municipality-level verification.",
      },
      {
        title: "Official source checked by Clarvia",
        html: `<p><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu: What to do in the event of a death</a></p>`,
      },
      {
        html: 'This page summarizes reviewed task data for a death that occurred in Luxembourg and is not legal advice. If the death occurred elsewhere, or the family is dealing with more than one country, <a class="underline font-medium" href="#ask-bridge">Ask Clarvia</a> instead of relying on this deadline.',
      },
    ],
  },
  {
    slug: "funeral-or-cremation",
    headline: "Funeral or cremation",
    sections: [
      {
        html: "For a death in Luxembourg, burial or the deposit of ashes requires written authorization from the civil registrar of the commune where the death occurred. Confirm the current timing rule on the official burial and cremation page linked below; do not apply another country's funeral deadlines here.",
      },
      {
        html: "Cremation requires authorization from the civil registrar of the place of death. The reviewed source also identifies a medical certificate confirming that there is no sign or indication of violent death. Clarvia's public task data identifies additional cremation-specific evidence; confirm the current list with the civil registrar or funeral professional handling the arrangements.",
      },
      {
        title: "Official source checked by Clarvia",
        html: `<p><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu: Burial and cremation</a></p>`,
      },
      {
        html: 'This page covers the reviewed procedure for a death in Luxembourg. Timing and authorization rules differ elsewhere. If another country is involved, <a class="underline font-medium" href="#ask-bridge">Ask Clarvia</a> and state where the death occurred and where the funeral or cremation will take place.',
      },
    ],
  },
  {
    slug: "banks-and-financial-assets",
    headline: "Banks and financial assets after a death",
    sections: [
      {
        html: "The CSSF says that tracing a deceased person's assets is not within its competence. Heirs should contact Luxembourg banks and other financial-sector professionals directly.",
      },
      {
        html: "The reviewed CSSF source says an asset-tracing request should include a death certificate, a certified copy of the heir's identity card, and a legal document showing the heir's rights. If someone acts for the heirs, the source also identifies a proxy authorizing that person to act.",
      },
      {
        html: "Account handling, freezes, access, and fees vary by institution. Clarvia does not quote bank-specific rules or amounts until an official source for that institution has been reviewed.",
      },
      {
        title: "Official source checked by Clarvia",
        html: `<p><a class="underline" href="https://www.cssf.lu/en/tracing-assets/">CSSF: Tracing assets</a></p>`,
      },
      {
        html: 'This is practical signposting, not banking, financial, notarial, or succession advice. If you do not know which country or institution holds the assets, <a class="underline font-medium" href="#ask-bridge">Ask Clarvia</a> and explain what you already know.',
      },
    ],
  },
  {
    slug: "survivor-pension-and-bereavement-leave",
    headline: "Survivor pension and bereavement leave",
    sections: [
      {
        html: "A possible survivor pension and leave from an employer are separate procedures. Check both if the deceased was insured or pensioned in Luxembourg and you are an employee or apprentice.",
      },
      {
        title: "Apply for the CNAP survivor pension",
        html: "CNAP states that when an insured person or a recipient of an old-age or invalidity pension dies, a survivor pension may be paid. Possible beneficiaries are subject to award conditions; the CNAP page lists the surviving spouse, surviving partner, and orphans among the possible beneficiaries.",
      },
      {
        html: "Clarvia's approved public task identifies the CNAP application, death certificate, relationship evidence, bank details, and school evidence where relevant among the materials to prepare. Confirm the form and eligibility conditions with CNAP.",
      },
      {
        title: "Claim bereavement leave from your employer",
        html: "Guichet.lu says employees and apprentices may receive extraordinary leave for a death. The employee must expressly request it from the employer. The reviewed source says bereavement leave is taken when the event occurs and lists 3 days for the death of a spouse or partner and for a first-degree relative of the employee or the employee's spouse or partner.",
      },
      {
        title: "Official sources checked by Clarvia",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://cnap.public.lu/fr/pensions/pension-survie.html">CNAP: Survivor pension</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/sante/fin-vie/deces/conge-extraordinaire.html">Guichet.lu: Extraordinary leave for personal reasons</a></li></ul>`,
      },
      {
        html: 'Eligibility depends on the person\'s relationship, insurance history, employment status, and other facts. This page is not legal, employment, or pension advice. <a class="underline font-medium" href="#ask-bridge">Ask Clarvia</a> if the facts do not fit the summary or more than one country is involved.',
      },
    ],
  },
];

const FR_GUIDE_BODIES: GuideBody[] = [
  {
    slug: "first-steps-after-a-death",
    headline: "Premières démarches après un décès",
    sections: [
      {
        html: "La première démarche dépend du lieu du décès et du pays où vivait la personne. N'utilisez pas automatiquement les formulaires ou les délais d'un autre pays. Demandez à Clarvia peut vous aider où que vous soyez.",
      },
      {
        title: "Si le décès a eu lieu au Luxembourg",
        html: `<ol class="list-decimal pl-5 space-y-2"><li>Un médecin établit le certificat médical nécessaire à la déclaration du décès.</li><li>Le décès doit être déclaré à l'officier de l'état civil de la commune où il a eu lieu. Selon la page de Guichet.lu que nous avons vérifiée, cette déclaration doit être faite dans les 24 heures.</li><li>L'inhumation ou la crémation nécessite une autorisation écrite de l'officier de l'état civil. La première source officielle liée sur cette page indique qu'en principe, l'inhumation doit avoir lieu entre 24 et 72 heures après le décès, sauf prolongation accordée.</li><li>Conservez l'acte de décès et les autres documents officiels. Les banques, caisses de pension, assurances, employeurs et démarches de succession peuvent chacun demander un justificatif.</li></ol>`,
      },
      {
        title: "Si le décès a eu lieu ailleurs",
        html: "Consultez les informations officielles du lieu du décès. Indiquez à Demandez à Clarvia où la personne est décédée, où elle vivait et dans quel pays la famille effectue les démarches. Clarvia n'appliquera pas les délais luxembourgeois ci-dessus à un autre pays.",
      },
      {
        title: "Sources officielles vérifiées par Clarvia",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu : Que faire en cas de décès</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu : Inhumation et crémation</a></li></ul>`,
      },
      {
        html: 'Vous ne savez pas quelles règles s\'appliquent ? <a class="underline font-medium" href="#ask-bridge">Demandez à Clarvia</a> en précisant les pays concernés.',
      },
    ],
  },
  {
    slug: "registering-a-death",
    headline: "Déclarer un décès",
    sections: [
      {
        html: "Lorsqu'un décès a lieu au Luxembourg, la page de Guichet.lu que nous avons vérifiée indique que la famille doit le déclarer dans les 24 heures à l'officier de l'état civil de la commune où il a eu lieu.",
      },
      {
        title: "Documents à préparer",
        html: "La page actuelle de Guichet.lu précise que la personne qui fait la déclaration doit présenter une pièce d'identité valable et le certificat médical attestant le décès. Si possible, elle doit également présenter le livret de famille de la personne décédée, un certificat d'identité ou un autre document indiquant son état civil, par exemple un acte de mariage. Vérifiez les consignes actuelles de la commune avant de vous déplacer, surtout si un document manque ou a été délivré dans un autre pays.",
      },
      {
        html: "Demandez à la commune quels extraits de l'acte de décès ou quelles copies plurilingues peuvent être délivrés, et si des frais s'appliquent. Clarvia n'indique ni nombre de copies ni montant, car ces informations doivent encore être vérifiées auprès de chaque commune.",
      },
      {
        title: "Source officielle vérifiée par Clarvia",
        html: `<p><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu : Que faire en cas de décès</a></p>`,
      },
      {
        html: 'Cette page résume des démarches vérifiées pour un décès survenu au Luxembourg. Elle ne constitue pas un conseil juridique. Si le décès a eu lieu ailleurs ou si plusieurs pays sont concernés, <a class="underline font-medium" href="#ask-bridge">demandez à Clarvia</a> au lieu de vous fier à ce délai.',
      },
    ],
  },
  {
    slug: "funeral-or-cremation",
    headline: "Inhumation ou crémation",
    sections: [
      {
        html: "Pour un décès survenu au Luxembourg, l'inhumation ou le dépôt des cendres nécessite une autorisation écrite de l'officier de l'état civil de la commune où le décès a eu lieu. Vérifiez le délai actuellement en vigueur sur la page officielle consacrée à l'inhumation et à la crémation, liée ci-dessous. N'appliquez pas ici les délais d'un autre pays.",
      },
      {
        html: "Une crémation nécessite l'autorisation de l'officier de l'état civil du lieu du décès. La source vérifiée mentionne également un certificat médical attestant l'absence de signe ou d'indice de mort violente. Les données publiques de Clarvia recensent d'autres justificatifs propres à la crémation. Confirmez la liste actuelle auprès de l'officier de l'état civil ou de l'entreprise de pompes funèbres chargée des démarches.",
      },
      {
        title: "Source officielle vérifiée par Clarvia",
        html: `<p><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu : Inhumation et crémation</a></p>`,
      },
      {
        html: 'Cette page présente la procédure vérifiée pour un décès survenu au Luxembourg. Les délais et autorisations diffèrent dans les autres pays. Si un autre pays est concerné, <a class="underline font-medium" href="#ask-bridge">demandez à Clarvia</a> en précisant le lieu du décès et le lieu prévu pour l\'inhumation ou la crémation.',
      },
    ],
  },
  {
    slug: "banks-and-financial-assets",
    headline: "Banques et avoirs financiers après un décès",
    sections: [
      {
        html: "La CSSF précise qu'il ne relève pas de sa compétence de rechercher les avoirs d'une personne décédée. Les héritiers doivent contacter directement les banques luxembourgeoises et les autres professionnels du secteur financier.",
      },
      {
        html: "Selon la source de la CSSF que nous avons vérifiée, une demande de recherche d'avoirs doit comprendre un acte de décès, une copie certifiée conforme de la pièce d'identité de l'héritier et un document juridique établissant ses droits. Lorsqu'une autre personne agit pour les héritiers, la source prévoit également une procuration l'autorisant à agir.",
      },
      {
        html: "Le traitement des comptes, les éventuels blocages, les conditions d'accès et les frais varient selon les établissements. Clarvia ne publie aucune règle ni aucun montant propre à une banque tant qu'une source officielle de cet établissement n'a pas été vérifiée.",
      },
      {
        title: "Source officielle vérifiée par Clarvia",
        html: `<p><a class="underline" href="https://www.cssf.lu/en/tracing-assets/">CSSF : Recherche d'avoirs</a></p>`,
      },
      {
        html: 'Ces informations vous orientent dans vos démarches. Elles ne constituent pas un conseil bancaire, financier, notarial ou successoral. Si vous ignorez dans quel pays ou établissement se trouvent les avoirs, <a class="underline font-medium" href="#ask-bridge">demandez à Clarvia</a> en indiquant ce que vous savez déjà.',
      },
    ],
  },
  {
    slug: "survivor-pension-and-bereavement-leave",
    headline: "Pension de survie et congé en cas de décès",
    sections: [
      {
        html: "Une éventuelle pension de survie et le congé accordé par l'employeur sont deux démarches distinctes. Vérifiez les deux si la personne décédée était assurée ou pensionnée au Luxembourg et si vous êtes salarié ou apprenti.",
      },
      {
        title: "Demander la pension de survie de la CNAP",
        html: "La CNAP indique qu'une pension de survie peut être versée après le décès d'un assuré ou d'un bénéficiaire d'une pension de vieillesse ou d'invalidité. Son attribution est soumise à des conditions. La page de la CNAP cite notamment le conjoint survivant, le partenaire survivant et les orphelins parmi les bénéficiaires possibles.",
      },
      {
        html: "La démarche publique approuvée par Clarvia mentionne, parmi les documents à préparer, la demande de la CNAP, l'acte de décès, la preuve du lien avec la personne décédée, les coordonnées bancaires et, le cas échéant, un certificat de scolarité. Confirmez le formulaire et les conditions d'attribution auprès de la CNAP.",
      },
      {
        title: "Demander le congé en cas de décès à votre employeur",
        html: "Guichet.lu indique que les salariés et les apprentis peuvent bénéficier d'un congé extraordinaire en cas de décès. Le salarié doit le demander expressément à son employeur. Selon la source vérifiée, ce congé doit être pris au moment de l'événement. Elle prévoit trois jours en cas de décès du conjoint ou du partenaire, ainsi que d'un parent au premier degré du salarié, de son conjoint ou de son partenaire.",
      },
      {
        title: "Sources officielles vérifiées par Clarvia",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://cnap.public.lu/fr/pensions/pension-survie.html">CNAP : Pension de survie</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/sante/fin-vie/deces/conge-extraordinaire.html">Guichet.lu : Congé extraordinaire pour raisons personnelles</a></li></ul>`,
      },
      {
        html: 'L\'éligibilité dépend notamment du lien avec la personne décédée, du parcours d\'assurance et de la situation professionnelle. Cette page ne constitue pas un conseil juridique, professionnel ou en matière de pension. <a class="underline font-medium" href="#ask-bridge">Demandez à Clarvia</a> si votre situation ne correspond pas à ce résumé ou si plusieurs pays sont concernés.',
      },
    ],
  },
];

const DE_GUIDE_BODIES: GuideBody[] = [
  {
    slug: "first-steps-after-a-death",
    headline: "Erste Schritte nach einem Todesfall",
    sections: [
      {
        html: "Der richtige erste Schritt hängt davon ab, wo der Todesfall eingetreten ist und wo die verstorbene Person gelebt hat. Übertragen Sie Formulare oder Fristen nicht einfach von einem Land auf ein anderes. Clarvia fragen kann Ihnen unabhängig vom Land weiterhelfen.",
      },
      {
        title: "Wenn der Todesfall in Luxemburg eingetreten ist",
        html: `<ol class="list-decimal pl-5 space-y-2"><li>Eine Ärztin oder ein Arzt stellt die ärztliche Bescheinigung für die Meldung des Todesfalls aus.</li><li>Der Todesfall wird beim Standesamt der Gemeinde gemeldet, in der er eingetreten ist. Laut der von uns geprüften Seite von Guichet.lu muss dies innerhalb von 24 Stunden geschehen.</li><li>Für eine Bestattung oder Einäscherung ist eine schriftliche Genehmigung des Standesamts erforderlich. Die erste auf dieser Seite verlinkte amtliche Quelle besagt, dass die Bestattung grundsätzlich zwischen 24 und 72 Stunden nach Eintritt des Todes erfolgen muss, sofern keine Verlängerung gewährt wird.</li><li>Bewahren Sie die Sterbeurkunde und andere amtliche Unterlagen für spätere Verfahren auf. Banken, Rentenstellen, Versicherungen, Arbeitgeber und Nachlassverfahren können jeweils Nachweise verlangen.</li></ol>`,
      },
      {
        title: "Wenn der Todesfall in einem anderen Land eingetreten ist",
        html: "Nutzen Sie die amtlichen Informationen des betreffenden Landes. Teilen Sie Clarvia fragen mit, wo die Person gestorben ist, wo sie gelebt hat und in welchem Land die Familie die nächsten Schritte erledigt. Clarvia wendet die oben genannten luxemburgischen Fristen nicht auf ein anderes Land an.",
      },
      {
        title: "Von Clarvia geprüfte amtliche Quellen",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu: Was bei einem Todesfall zu tun ist</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu: Bestattung und Einäscherung</a></li></ul>`,
      },
      {
        html: 'Sie sind nicht sicher, welche Regeln gelten? <a class="underline font-medium" href="#ask-bridge">Fragen Sie Clarvia</a> und nennen Sie die beteiligten Länder.',
      },
    ],
  },
  {
    slug: "registering-a-death",
    headline: "Einen Todesfall melden",
    sections: [
      {
        html: "Bei einem Todesfall in Luxemburg muss die Familie den Todesfall laut der von uns geprüften Seite von Guichet.lu innerhalb von 24 Stunden beim Standesamt der Gemeinde melden, in der er eingetreten ist.",
      },
      {
        title: "Diese Unterlagen sollten Sie vorbereiten",
        html: "Nach der aktuellen Seite von Guichet.lu muss die Person, die den Todesfall meldet, einen gültigen Ausweis und die ärztliche Todesbescheinigung vorlegen. Wenn möglich, sollte sie außerdem das Familienstammbuch der verstorbenen Person, eine Identitätsbescheinigung oder ein anderes Dokument zum Personenstand vorlegen, etwa eine Heiratsurkunde. Prüfen Sie vor Ihrem Termin die aktuellen Vorgaben der Gemeinde, insbesondere wenn ein Dokument fehlt oder in einem anderen Land ausgestellt wurde.",
      },
      {
        html: "Fragen Sie die Gemeinde, welche Auszüge aus der Sterbeurkunde oder mehrsprachigen Abschriften erhältlich sind und ob Gebühren anfallen. Clarvia nennt weder eine bestimmte Zahl von Abschriften noch einen Betrag, weil diese Angaben auf Gemeindeebene noch geprüft werden müssen.",
      },
      {
        title: "Von Clarvia geprüfte amtliche Quelle",
        html: `<p><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu: Was bei einem Todesfall zu tun ist</a></p>`,
      },
      {
        html: 'Diese Seite fasst geprüfte Aufgaben für einen Todesfall in Luxemburg zusammen und stellt keine Rechtsberatung dar. Wenn der Todesfall in einem anderen Land eingetreten ist oder mehrere Länder betroffen sind, <a class="underline font-medium" href="#ask-bridge">fragen Sie Clarvia</a>, statt sich auf diese Frist zu verlassen.',
      },
    ],
  },
  {
    slug: "funeral-or-cremation",
    headline: "Bestattung oder Einäscherung",
    sections: [
      {
        html: "Bei einem Todesfall in Luxemburg ist für eine Bestattung oder die Beisetzung der Asche eine schriftliche Genehmigung des Standesamts der Gemeinde erforderlich, in der der Todesfall eingetreten ist. Prüfen Sie die aktuell geltende Frist auf der unten verlinkten amtlichen Seite zu Bestattung und Einäscherung. Wenden Sie hier keine Bestattungsfristen eines anderen Landes an.",
      },
      {
        html: "Für eine Einäscherung ist die Genehmigung des Standesamts am Sterbeort erforderlich. Die geprüfte Quelle nennt außerdem eine ärztliche Bescheinigung, wonach keine Anzeichen oder Hinweise auf einen gewaltsamen Tod vorliegen. Clarvias öffentliche Aufgabendaten nennen weitere Nachweise, die speziell für die Einäscherung benötigt werden. Bestätigen Sie die aktuelle Liste beim Standesamt oder beim beauftragten Bestattungsunternehmen.",
      },
      {
        title: "Von Clarvia geprüfte amtliche Quelle",
        html: `<p><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu: Bestattung und Einäscherung</a></p>`,
      },
      {
        html: 'Diese Seite behandelt das geprüfte Verfahren für einen Todesfall in Luxemburg. Fristen und Genehmigungen unterscheiden sich in anderen Ländern. Wenn ein weiteres Land betroffen ist, <a class="underline font-medium" href="#ask-bridge">fragen Sie Clarvia</a> und nennen Sie den Sterbeort sowie den Ort der geplanten Bestattung oder Einäscherung.',
      },
    ],
  },
  {
    slug: "banks-and-financial-assets",
    headline: "Banken und Finanzvermögen nach einem Todesfall",
    sections: [
      {
        html: "Die CSSF weist darauf hin, dass die Suche nach Vermögenswerten einer verstorbenen Person nicht in ihren Zuständigkeitsbereich fällt. Erben sollten sich direkt an luxemburgische Banken und andere Fachleute des Finanzsektors wenden.",
      },
      {
        html: "Laut der von uns geprüften CSSF-Quelle sollte eine Anfrage zur Ermittlung von Vermögenswerten eine Sterbeurkunde, eine beglaubigte Kopie des Ausweises der Erbin oder des Erben sowie ein Rechtsdokument enthalten, das die Erbberechtigung nachweist. Handelt eine andere Person für die Erben, nennt die Quelle zusätzlich eine entsprechende Vollmacht.",
      },
      {
        html: "Der Umgang mit Konten, Sperren, Zugriffsrechten und Gebühren unterscheidet sich je nach Institut. Clarvia veröffentlicht keine bankspezifischen Regeln oder Beträge, solange keine amtliche Quelle des betreffenden Instituts geprüft wurde.",
      },
      {
        title: "Von Clarvia geprüfte amtliche Quelle",
        html: `<p><a class="underline" href="https://www.cssf.lu/en/tracing-assets/">CSSF: Vermögenswerte ermitteln</a></p>`,
      },
      {
        html: 'Diese Informationen dienen der praktischen Orientierung und sind keine Bank-, Finanz-, notarielle oder erbrechtliche Beratung. Wenn Sie nicht wissen, in welchem Land oder bei welchem Institut sich die Vermögenswerte befinden, <a class="underline font-medium" href="#ask-bridge">fragen Sie Clarvia</a> und schildern Sie, was Sie bereits wissen.',
      },
    ],
  },
  {
    slug: "survivor-pension-and-bereavement-leave",
    headline: "Hinterbliebenenrente und Sonderurlaub im Todesfall",
    sections: [
      {
        html: "Eine mögliche Hinterbliebenenrente und Sonderurlaub beim Arbeitgeber sind zwei getrennte Verfahren. Prüfen Sie beides, wenn die verstorbene Person in Luxemburg versichert war oder dort eine Rente bezogen hat und Sie angestellt oder in Ausbildung sind.",
      },
      {
        title: "CNAP-Hinterbliebenenrente beantragen",
        html: "Nach Angaben der CNAP kann nach dem Tod einer versicherten Person oder einer Empfängerin beziehungsweise eines Empfängers einer Alters- oder Invalidenrente eine Hinterbliebenenrente gezahlt werden. Für die Bewilligung gelten bestimmte Voraussetzungen. Die CNAP-Seite nennt unter anderem überlebende Ehe- und Lebenspartner sowie Waisen als mögliche Begünstigte.",
      },
      {
        html: "Clarvias freigegebene öffentliche Aufgabe nennt den CNAP-Antrag, die Sterbeurkunde, einen Nachweis der Beziehung, Bankangaben und gegebenenfalls eine Schulbescheinigung als vorzubereitende Unterlagen. Bestätigen Sie das Formular und die Anspruchsvoraussetzungen bei der CNAP.",
      },
      {
        title: "Sonderurlaub beim Arbeitgeber beantragen",
        html: "Laut Guichet.lu können Beschäftigte und Auszubildende bei einem Todesfall Sonderurlaub erhalten. Dieser muss ausdrücklich beim Arbeitgeber beantragt werden. Die geprüfte Quelle besagt, dass der Urlaub zum Zeitpunkt des Ereignisses genommen wird. Sie nennt drei Tage beim Tod einer Ehe- oder Lebenspartnerin beziehungsweise eines Ehe- oder Lebenspartners sowie einer verwandten Person ersten Grades der beschäftigten Person oder ihrer Partnerin beziehungsweise ihres Partners.",
      },
      {
        title: "Von Clarvia geprüfte amtliche Quellen",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://cnap.public.lu/fr/pensions/pension-survie.html">CNAP: Hinterbliebenenrente</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/sante/fin-vie/deces/conge-extraordinaire.html">Guichet.lu: Sonderurlaub aus persönlichen Gründen</a></li></ul>`,
      },
      {
        html: 'Der Anspruch hängt unter anderem von der Beziehung zur verstorbenen Person, dem Versicherungsverlauf und der Beschäftigungssituation ab. Diese Seite ist keine Rechts-, Arbeits- oder Rentenberatung. <a class="underline font-medium" href="#ask-bridge">Fragen Sie Clarvia</a>, wenn Ihre Angaben nicht zu dieser Zusammenfassung passen oder mehrere Länder betroffen sind.',
      },
    ],
  },
];

const LU_GUIDE_BODIES: GuideBody[] = [
  {
    slug: "first-steps-after-a-death",
    headline: "Éischt Schrëtt no engem Doudesfall",
    sections: [
      {
        html: "De richtegen éischte Schrëtt hänkt dovun of, wou d'Persoun gestuerwen ass a wou si gewunnt huet. Benotzt net einfach d'Formulairen oder d'Friste vun engem anere Land. Clarvia froen kann Iech onofhängeg vum Land weiderhëllefen.",
      },
      {
        title: "Wann d'Persoun zu Lëtzebuerg gestuerwen ass",
        html: `<ol class="list-decimal pl-5 space-y-2"><li>Eng Doktesch oder en Dokter stellt de medezineschen Attest aus, dee fir d'Meldung vum Doudesfall néideg ass.</li><li>Den Doudesfall gëtt beim Zivilstandsbeamte vun der Gemeng gemellt, an där en agetrueden ass. No der Säit vu Guichet.lu, déi mir iwwerpréift hunn, muss dat bannent 24 Stonne geschéien.</li><li>Fir e Begriefnes oder eng Anäscherung ass eng schrëftlech Autorisatioun vum Zivilstandsbeamten néideg. Déi éischt offiziell Quell op dëser Säit seet, datt d'Begriefnes am Prinzip tëscht 24 an 72 Stonnen nom Doud muss stattfannen, ausser et gëtt eng Verlängerung accordéiert.</li><li>Versuergt den Doudesakt an aner offiziell Dokumenter fir spéider Demarchen. Banken, Pensiounskeesen, Assurancen, Patronen a Successiounsdemarchë kënnen all en Noweis verlaangen.</li></ol>`,
      },
      {
        title: "Wann d'Persoun an engem anere Land gestuerwen ass",
        html: "Benotzt déi offiziell Informatioune vum betraffene Land. Sot Clarvia froen, wou d'Persoun gestuerwen ass, wou si gewunnt huet an a wéi engem Land d'Famill déi nächst Schrëtt mécht. Clarvia applizéiert déi lëtzebuergesch Fristen hei uewen net op en anert Land.",
      },
      {
        title: "Offiziell Quellen, déi Clarvia iwwerpréift huet",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu: Wat bei engem Doudesfall ze maachen ass</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu: Begriefnes an Anäscherung</a></li></ul>`,
      },
      {
        html: 'Dir sidd net sécher, wéi eng Reegelen uwennbar sinn? <a class="underline font-medium" href="#ask-bridge">Frot Clarvia</a> a nennt déi betraffe Länner.',
      },
    ],
  },
  {
    slug: "registering-a-death",
    headline: "En Doudesfall mellen",
    sections: [
      {
        html: "Bei engem Doudesfall zu Lëtzebuerg muss d'Famill en no der Säit vu Guichet.lu, déi mir iwwerpréift hunn, bannent 24 Stonne beim Zivilstandsbeamte vun der Gemeng mellen, an där en agetrueden ass.",
      },
      {
        title: "Dës Dokumenter sollt Dir preparéieren",
        html: "No der aktueller Säit vu Guichet.lu muss déi Persoun, déi den Doudesfall mellt, e gültegen Ausweis an de medezineschen Doudesattest virleeën. Wa méiglech, soll si och d'Familljebuch vun der verstuerwener Persoun, e Certificat d'identité oder en anert Dokument zum Zivilstand virleeën, zum Beispill e Bestietnesakt. Kontrolléiert virum Rendez-vous déi aktuell Ufuerderunge vun der Gemeng, besonnesch wann en Dokument feelt oder an engem anere Land ausgestallt gouf.",
      },
      {
        html: "Frot d'Gemeng, wéi eng Extraiten aus dem Doudesakt oder méisproocheg Kopien disponibel sinn an ob Taxen ufalen. Clarvia nennt weder eng bestëmmten Unzuel u Kopien nach e Betrag, well dës Informatiounen nach op Gemengenniveau musse kontrolléiert ginn.",
      },
      {
        title: "Offiziell Quell, déi Clarvia iwwerpréift huet",
        html: `<p><a class="underline" href="https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html">Guichet.lu: Wat bei engem Doudesfall ze maachen ass</a></p>`,
      },
      {
        html: 'Dës Säit resuméiert iwwerpréift Aufgabe fir en Doudesfall zu Lëtzebuerg a stellt keng juristesch Berodung duer. Wann d\'Persoun an engem anere Land gestuerwen ass oder méi Länner betraff sinn, <a class="underline font-medium" href="#ask-bridge">frot Clarvia</a>, amplaz Iech op dës Frist ze verloossen.',
      },
    ],
  },
  {
    slug: "funeral-or-cremation",
    headline: "Begriefnes oder Anäscherung",
    sections: [
      {
        html: "Bei engem Doudesfall zu Lëtzebuerg ass fir e Begriefnes oder d'Bäisetze vun der Äsche eng schrëftlech Autorisatioun vum Zivilstandsbeamte vun der Gemeng néideg, an där den Doudesfall agetrueden ass. Kontrolléiert déi aktuell Frist op der offizieller Säit iwwer Begriefnes an Anäscherung, déi hei ënne verlinkt ass. Benotzt hei keng Begriefnesfriste vun engem anere Land.",
      },
      {
        html: "Fir eng Anäscherung ass d'Autorisatioun vum Zivilstandsbeamte vum Doudesuert néideg. Déi iwwerpréift Quell nennt och e medezineschen Attest, deen confirméiert, datt et keen Zeechen oder Indice vun engem gewaltsamen Doud gëtt. Déi ëffentlech Aufgabendonnéeë vu Clarvia nennen zousätzlech Noweiser speziell fir d'Anäscherung. Confirméiert déi aktuell Lëscht beim Zivilstandsbeamten oder beim Bestattungsentreprener, deen d'Demarchen iwwerhëlt.",
      },
      {
        title: "Offiziell Quell, déi Clarvia iwwerpréift huet",
        html: `<p><a class="underline" href="https://guichet.public.lu/fr/citoyens/famille-education/succession/deces/enterrement-incineration.html">Guichet.lu: Begriefnes an Anäscherung</a></p>`,
      },
      {
        html: 'Dës Säit behandelt déi iwwerpréift Prozedur fir en Doudesfall zu Lëtzebuerg. Fristen an Autorisatioune sinn an anere Länner anescht. Wann en anert Land betraff ass, <a class="underline font-medium" href="#ask-bridge">frot Clarvia</a> a nennt den Doudesuert an d\'Plaz vum geplangte Begriefnes oder vun der geplangter Anäscherung.',
      },
    ],
  },
  {
    slug: "banks-and-financial-assets",
    headline: "Banken a Finanzverméigen no engem Doudesfall",
    sections: [
      {
        html: "D'CSSF weist drop hin, datt d'Sich no Verméigenswäerter vun enger verstuerwener Persoun net an hire Kompetenzberäich fält. Ierwe solle sech direkt u lëtzebuergesch Banken an aner Fachleit aus dem Finanzsecteur wenden.",
      },
      {
        html: "No der CSSF-Quell, déi mir iwwerpréift hunn, soll eng Ufro fir Verméigenswäerter ze sichen en Doudesakt, eng begleewegt Kopie vum Ausweis vum Ierwen an e juristescht Dokument enthalen, dat d'Ierfrecht noweist. Wann eng aner Persoun fir d'Ierwen handelt, nennt d'Quell zousätzlech eng entspriechend Vollmacht.",
      },
      {
        html: "Den Ëmgang mat Konten, Spären, Zougangsrechter an Taxen ass jee no Institut anescht. Clarvia verëffentlecht keng bankspezifesch Reegelen oder Beträg, soulaang keng offiziell Quell vum betraffenen Institut iwwerpréift gouf.",
      },
      {
        title: "Offiziell Quell, déi Clarvia iwwerpréift huet",
        html: `<p><a class="underline" href="https://www.cssf.lu/en/tracing-assets/">CSSF: Verméigenswäerter sichen</a></p>`,
      },
      {
        html: 'Dës Informatioune bidden eng praktesch Orientéierung a si keng Bank-, Finanz-, notariell oder Successiounsberodung. Wann Dir net wësst, a wéi engem Land oder bei wéi engem Institut d\'Verméigenswäerter leien, <a class="underline font-medium" href="#ask-bridge">frot Clarvia</a> a beschreift, wat Dir scho wësst.',
      },
    ],
  },
  {
    slug: "survivor-pension-and-bereavement-leave",
    headline: "Iwwerliewenspensioun a Sondercongé am Doudesfall",
    sections: [
      {
        html: "Eng méiglech Iwwerliewenspensioun an de Sondercongé beim Patron sinn zwou getrennten Demarchen. Kontrolléiert béides, wann déi verstuerwe Persoun zu Lëtzebuerg verséchert war oder hei eng Pensioun krut an Dir Salarié oder Léierbouf beziehungsweise Léiermeedche sidd.",
      },
      {
        title: "Eng Iwwerliewenspensioun bei der CNAP ufroen",
        html: "No den Informatioune vun der CNAP kann nom Doud vun enger versécherter Persoun oder enger Persoun, déi eng Alters- oder Invaliditéitspensioun krut, eng Iwwerliewenspensioun bezuelt ginn. Fir d'Accordéiere gëlle bestëmmte Konditiounen. D'Säit vun der CNAP nennt ënner anerem den iwwerliewenden Ehepartner oder Partner an d'Weesekanner als méiglech Beneficiairen.",
      },
      {
        html: "Déi fräiginn ëffentlech Aufgab vu Clarvia nennt d'Demande bei der CNAP, den Doudesakt, en Noweis vun der Bezéiung, Bankdetailer an, wann néideg, e Schoulcertificat als Dokumenter, déi ze preparéiere sinn. Confirméiert de Formulaire an d'Konditioune bei der CNAP.",
      },
      {
        title: "Sondercongé beim Patron ufroen",
        html: "No Guichet.lu kënne Salariéen a Léierbouwen oder Léiermeedercher bei engem Doudesfall Sondercongé kréien. Dëse muss ausdrécklech beim Patron ugefrot ginn. Déi iwwerpréift Quell seet, datt de Congé zum Zäitpunkt vum Evenement geholl gëtt. Si nennt dräi Deeg beim Doud vum Ehepartner oder Partner an och beim Doud vun enger Familljememberin oder engem Familljemember am éischte Grad vum Salarié oder vu sengem Partner.",
      },
      {
        title: "Offiziell Quellen, déi Clarvia iwwerpréift huet",
        html: `<ul class="list-disc pl-5 space-y-1"><li><a class="underline" href="https://cnap.public.lu/fr/pensions/pension-survie.html">CNAP: Iwwerliewenspensioun</a></li><li><a class="underline" href="https://guichet.public.lu/fr/citoyens/sante/fin-vie/deces/conge-extraordinaire.html">Guichet.lu: Sondercongé aus perséinleche Grënn</a></li></ul>`,
      },
      {
        html: 'D\'Recht hänkt ënner anerem vun der Bezéiung mat der verstuerwener Persoun, dem Versécherungsverlaf an der Aarbechtssituatioun of. Dës Säit ass keng juristesch, Aarbechts- oder Pensiounsberodung. <a class="underline font-medium" href="#ask-bridge">Frot Clarvia</a>, wann Är Informatiounen net bei dëse Resumé passen oder méi Länner betraff sinn.',
      },
    ],
  },
];

export function guideBodyForLanguage(lang: Lang, slug: GuideSlug): GuideBody | undefined {
  const bodies =
    lang === "fr"
      ? FR_GUIDE_BODIES
      : lang === "de"
        ? DE_GUIDE_BODIES
        : lang === "lu"
          ? LU_GUIDE_BODIES
          : GUIDE_BODIES;
  return bodies.find((body) => body.slug === slug);
}
