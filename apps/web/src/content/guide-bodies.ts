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
        html: "Clarvia's approved public task identifies the CNAP application, death certificate, relationship evidence, bank details, and—where relevant—school evidence among the materials to prepare. Confirm the form and eligibility conditions with CNAP.",
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
