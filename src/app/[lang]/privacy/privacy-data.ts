import { type Lang } from "@/lib/i18n";

export type PolicySection = {
  heading: string;
  body: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
};

export type PolicyData = {
  title: string;
  lastUpdated: string;
  sections: PolicySection[];
};

export const privacyCookiePolicy: Record<Exclude<Lang, "lu">, PolicyData> = {
  en: {
    title: "Privacy & Cookie Policy",
    lastUpdated: "Last updated: 24 July 2026",
    sections: [
      {
        heading: "1. What Clarvia.org collects",
        body: [
          "Clarvia ASBL operates Clarvia.org. We respect your privacy and use optional analytics and advertising cookies only if you choose to accept them.",
          "Clarvia.org collects limited technical information needed to keep the website secure and working.",
          "If you click “Accept all”, Clarvia.org also uses Google Analytics and Google Ads measurement to understand website traffic, improve our bereavement checklists, and measure donation campaign effectiveness.",
          "We do not use advertising personalization or remarketing unless this policy and our consent banner are updated.",
          "If you contact us for free bereavement administrative guidance or support, we also process the personal data you choose to share as described in section 5."
        ]
      },
      {
        heading: "2. Cookies and consent",
        body: [
          "Optional Google Analytics and Google Ads cookies are disabled by default.",
          "No optional analytics or advertising cookies are written to your device unless you click “Accept all”.",
          "If you click “Decline / Essential only”, optional cookies remain blocked. Google may receive limited cookieless measurement signals where supported by Google Consent Mode, but analytics and advertising storage remain denied.",
          "You can change or withdraw your choice at any time by clicking “Cookie settings” in the website footer."
        ]
      },
      {
        heading: "3. Cookies Clarvia.org may use if you accept",
        body: [
          "Actual cookies may vary depending on your browser, consent choice, and Google’s services."
        ],
        table: {
          headers: ["Cookie", "Provider", "Purpose", "Expiry"],
          rows: [
            ["_ga", "Google Analytics", "Distinguishes users for website analytics.", "Up to 2 years"],
            ["_ga_K67M5B4932", "Google Analytics", "Persists session state for analytics.", "Up to 2 years"],
            ["_gcl_au", "Google Ads / Google Tag", "Helps measure advertising and donation conversions.", "Up to 3 months"],
            ["_gcl_aw", "Google Ads", "Stores Google ad click information for conversion attribution.", "Up to 90 days"]
          ]
        }
      },
      {
        heading: "4. External donation services",
        body: [
          "Clarvia.org may link to or redirect you to external donation services, such as Stripe, GitHub Sponsors, or Open Collective.",
          "Those services are separate from Clarvia.org and operate under their own privacy and cookie policies. Clarvia ASBL is not responsible for cookies or tracking used on external websites.",
          "Please do not include sensitive family, health, or bereavement details in payment references or donation messages."
        ]
      },
      {
        heading: "5. Contact and support requests",
        body: [
          "When you contact us by email or through a form for free bereavement administrative guidance or support, we process the personal data you choose to share. This may include your name, contact details, preferred language, the contents of your message, and any documents or other information you provide.",
          "We use this information only to understand your request, communicate with you, and provide helpful assistance.",
          "To help us respond accurately and in the appropriate language, we may use artificial intelligence tools, including large language models, to:",
          "• translate messages;",
          "• assist with research and information gathering; and",
          "• prepare draft reply suggestions for review by a Clarvia volunteer.",
          "These AI service providers act as processors on Clarvia’s behalf and under Clarvia’s instructions. We use only providers that offer appropriate data-processing agreements. Under our arrangements with them, they are not permitted to use the content you send us to train their general-purpose models.",
          "AI tools may assist our volunteers, but a Clarvia volunteer remains responsible for the response sent to you.",
          "Lawful basis: Clarvia’s legitimate interests under Article 6(1)(f) of the GDPR—specifically, providing the free guidance or support you requested and doing so accurately and efficiently.",
          "Retention: We keep correspondence for as long as reasonably necessary to provide the guidance or support you requested and to maintain continuity, including where a matter remains unresolved or may require follow-up over an extended period. We periodically review requests to determine whether the correspondence is still needed. Once a matter is concluded and related follow-up is no longer reasonably expected, we delete or anonymise the correspondence unless continued retention is required by law or necessary to establish, exercise, or defend legal claims.",
          "Access: Human access is limited to authorised Clarvia volunteers handling your request. Our contracted service providers may process the data only as needed to provide their services to Clarvia and in accordance with our instructions.",
          "Please share only the information needed for us to help you. In particular, avoid sending unnecessary sensitive family, health, financial, identification, or bereavement details."
        ]
      },
      {
        heading: "6. Your rights and choices",
        body: [
          "You can control cookies through your browser settings or change your preferences at any time using the “Cookie settings” link in the footer. Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.",
          "Under the GDPR, you have the right to:",
          "• access your personal data;",
          "• correct inaccurate or incomplete personal data;",
          "• request deletion of your personal data;",
          "• request restriction of processing; and",
          "• object to processing based on Clarvia’s legitimate interests.",
          "These rights may be subject to conditions and exceptions under applicable law.",
          "If you believe your data is handled incorrectly, you have the right to lodge a complaint with the Luxembourg data protection authority, the CNPD—Commission nationale pour la protection des données."
        ]
      },
      {
        heading: "7. International data transfers",
        body: [
          "Some of Clarvia’s service providers, including Google and providers used to assist with contact and support requests, may process personal data outside the European Economic Area.",
          "Where a provider in the United States is certified under the EU–US Data Privacy Framework, Clarvia may rely on that framework as the recognized transfer mechanism. Where the framework does not apply, Clarvia uses another valid transfer mechanism where required, such as the European Commission’s Standard Contractual Clauses, together with any additional safeguards required by law.",
          "Accepting optional cookies controls whether Clarvia permits optional Google Analytics and Google Ads storage on your device. It is separate from the legal safeguards Clarvia uses for any international transfer of personal data."
        ]
      },
      {
        heading: "8. Contact details",
        body: [
          "Clarvia ASBL, registered with the Luxembourg RCS under number F15680, is the controller of your data for Clarvia.org.",
          "For privacy questions or to exercise your data-protection rights, please contact us using the “Contact Us” form available on our homepage at clarvia.org."
        ]
      },
      {
        heading: "9. Changes",
        body: [
          "We may update this policy when Clarvia.org, our donation setup, our measurement tools, or the way we handle contact and support requests changes."
        ]
      }
    ]
  },

  fr: {
    title: "Politique de confidentialité et de cookies",
    lastUpdated: "Dernière mise à jour : 24 juillet 2026",
    sections: [
      {
        heading: "1. Ce que Clarvia.org collecte",
        body: [
          "Clarvia ASBL exploite Clarvia.org. Nous respectons votre vie privée et n’utilisons des cookies optionnels d’analyse et de publicité que si vous choisissez de les accepter.",
          "Clarvia.org collecte des informations techniques limitées nécessaires au bon fonctionnement et à la sécurité du site.",
          "Si vous cliquez sur « Tout accepter », Clarvia.org utilise également Google Analytics et la mesure Google Ads afin de comprendre le trafic du site, d’améliorer nos listes de démarches après un décès et de mesurer l’efficacité des campagnes de dons.",
          "Nous n'utilisons pas la personnalisation publicitaire ou le remarketing à moins que cette politique et notre bannière de consentement ne soient mises à jour.",
          "Si vous nous contactez pour obtenir des conseils administratifs ou un soutien gratuits suite à un décès, nous traitons également les données personnelles que vous choisissez de partager, comme décrit à la section 5."
        ]
      },
      {
        heading: "2. Cookies et consentement",
        body: [
          "Les cookies optionnels de Google Analytics et Google Ads sont désactivés par défaut.",
          "Aucun cookie optionnel d’analyse ou de publicité n’est écrit sur votre appareil sauf si vous cliquez sur « Tout accepter ».",
          "Si vous cliquez sur « Refuser / Essentiel uniquement », les cookies optionnels restent bloqués. Google peut recevoir des signaux de mesure limités sans cookies lorsque Google Consent Mode le permet, mais le stockage analytique et publicitaire reste refusé.",
          "Vous pouvez modifier ou retirer votre choix à tout moment en cliquant sur « Paramètres des cookies » dans le pied de page du site."
        ]
      },
      {
        heading: "3. Cookies que Clarvia.org peut utiliser si vous acceptez",
        body: [
          "Les cookies effectivement utilisés peuvent varier selon votre navigateur, votre choix de consentement et les services de Google."
        ],
        table: {
          headers: ["Cookie", "Fournisseur", "Finalité", "Durée"],
          rows: [
            ["_ga", "Google Analytics", "Distingue les utilisateurs à des fins d’analyse du site.", "Jusqu’à 2 ans"],
            ["_ga_K67M5B4932", "Google Analytics", "Conserve l’état de session pour l’analyse.", "Jusqu’à 2 ans"],
            ["_gcl_au", "Google Ads / Google Tag", "Aide à mesurer les conversions publicitaires et les dons.", "Jusqu’à 3 mois"],
            ["_gcl_aw", "Google Ads", "Stocke les informations de clic publicitaire Google pour l’attribution des conversions.", "Jusqu’à 90 jours"]
          ]
        }
      },
      {
        heading: "4. Services de don externes",
        body: [
          "Clarvia.org peut contenir des liens vers des services de don externes ou vous y rediriger, notamment Stripe, GitHub Sponsors ou Open Collective.",
          "Ces services sont distincts de Clarvia.org et fonctionnent selon leurs propres politiques de confidentialité et de cookies. Clarvia ASBL n’est pas responsable des cookies ou du suivi utilisés sur des sites externes.",
          "Veuillez ne pas inclure d’informations sensibles concernant votre famille, votre santé ou un deuil dans les références de paiement ou les messages de don."
        ]
      },
      {
        heading: "5. Demandes de contact et d'assistance",
        body: [
          "Lorsque vous nous contactez par e-mail ou via un formulaire pour obtenir des conseils administratifs ou une assistance gratuite suite à un décès, nous traitons les données personnelles que vous choisissez de partager. Cela peut inclure votre nom, vos coordonnées, votre langue préférée, le contenu de votre message et tous les documents ou autres informations que vous fournissez.",
          "Nous utilisons ces informations uniquement pour comprendre votre demande, communiquer avec vous et vous apporter une aide utile.",
          "Pour nous aider à répondre avec précision et dans la langue appropriée, nous pouvons utiliser des outils d’intelligence artificielle, notamment de grands modèles linguistiques, pour :",
          "• traduire les messages ;",
          "• aider à la recherche et à la collecte d’informations ; et",
          "• préparer des propositions de réponses rédigées pour examen par un bénévole de Clarvia.",
          "Ces prestataires de services d'IA agissent en tant que sous-traitants pour le compte de Clarvia et selon les instructions de Clarvia. Nous faisons appel uniquement à des prestataires proposant des accords de traitement de données appropriés. Conformément aux accords conclus avec eux, ils ne sont pas autorisés à utiliser le contenu que vous nous envoyez pour entraîner leurs modèles généraux.",
          "Les outils d'IA peuvent assister nos bénévoles, mais un bénévole de Clarvia reste responsable de la réponse qui vous est envoyée.",
          "Base légale : Les intérêts légitimes de Clarvia en vertu de l'article 6(1)(f) du RGPD, plus précisément : fournir les conseils ou l'assistance gratuits que vous avez demandés, de manière exacte et efficace.",
          "Conservation : Nous conservons la correspondance aussi longtemps que raisonnablement nécessaire pour fournir les conseils ou l'assistance demandés et assurer la continuité, y compris lorsqu'une affaire reste non résolue ou peut nécessiter un suivi sur une période prolongée. Nous révisons périodiquement les demandes pour déterminer si la correspondance est toujours nécessaire. Une fois l'affaire conclue et qu'aucun suivi ultérieur n'est raisonnablement attendu, nous supprimons ou anonymisons la correspondance, sauf si une conservation prolongée est requise par la loi ou nécessaire pour constater, exercer ou défendre des droits en justice.",
          "Accès : L'accès humain est limité aux bénévoles autorisés de Clarvia traitant votre demande. Nos prestataires sous contrat ne peuvent traiter les données que dans la mesure nécessaire à la fourniture de leurs services à Clarvia et conformément à nos instructions.",
          "Veuillez partager uniquement les informations nécessaires pour nous permettre de vous aider. En particulier, évitez d'envoyer des informations sensibles inutiles concernant la famille, la santé, les finances, l'identification ou un deuil."
        ]
      },
      {
        heading: "6. Vos droits et choix",
        body: [
          "Vous pouvez contrôler les cookies via les paramètres de votre navigateur ou modifier vos préférences à tout moment en utilisant le lien « Paramètres des cookies » dans le pied de page. Le retrait du consentement n'affecte pas la licéité du traitement effectué avant ce retrait.",
          "En vertu du RGPD, vous avez le droit de :",
          "• accéder à vos données personnelles ;",
          "• corriger des données personnelles inexactes ou incomplètes ;",
          "• demander la suppression de vos données personnelles ;",
          "• demander la limitation du traitement ; et",
          "• vous opposer au traitement fondé sur les intérêts légitimes de Clarvia.",
          "Ces droits peuvent être soumis à des conditions et exceptions prévues par la loi applicable.",
          "Si vous estimez que vos données sont traitées de manière incorrecte, vous avez le droit d’introduire une réclamation auprès de l’autorité luxembourgeoise de protection des données, la CNPD — Commission nationale pour la protection des données."
        ]
      },
      {
        heading: "7. Transferts internationaux de données",
        body: [
          "Certains prestataires de services de Clarvia, y compris Google et les prestataires utilisés pour répondre aux demandes de contact et d'assistance, peuvent traiter des données personnelles en dehors de l'Espace économique européen.",
          "Lorsqu'un prestataire aux États-Unis est certifié au titre du cadre de protection des données UE–États-Unis (EU–US Data Privacy Framework), Clarvia peut s'appuyer sur ce cadre comme mécanisme de transfert reconnu. Lorsque ce cadre ne s'applique pas, Clarvia utilise un autre mécanisme de transfert valide si nécessaire, tel que les clauses contractuelles types de la Commission européenne, ainsi que toute garantie supplémentaire requise par la loi.",
          "L'acceptation des cookies optionnels contrôle si Clarvia autorise le stockage optionnel de Google Analytics et Google Ads sur votre appareil. Cela est distinct des garanties juridiques que Clarvia utilise pour tout transfert international de données personnelles."
        ]
      },
      {
        heading: "8. Coordonnées",
        body: [
          "Clarvia ASBL, inscrite au RCS Luxembourg sous le numéro F15680, est le responsable du traitement de vos données pour Clarvia.org.",
          "Pour toute question relative à la confidentialité ou pour exercer vos droits en matière de protection des données, veuillez nous contacter au moyen du formulaire « Contact Us » disponible sur notre page d’accueil à clarvia.org."
        ]
      },
      {
        heading: "9. Modifications",
        body: [
          "Nous pouvons mettre à jour cette politique lorsque Clarvia.org, notre système de dons, nos outils de mesure ou la façon dont nous traitons les demandes de contact et d'assistance changent."
        ]
      }
    ]
  },

  de: {
    title: "Datenschutz- und Cookie-Richtlinie",
    lastUpdated: "Zuletzt aktualisiert: 24. Juli 2026",
    sections: [
      {
        heading: "1. Was Clarvia.org erhebt",
        body: [
          "Clarvia ASBL betreibt Clarvia.org. Wir respektieren Ihre Privatsphäre und verwenden optionale Analyse- und Werbe-Cookies nur, wenn Sie diese ausdrücklich akzeptieren.",
          "Clarvia.org erhebt begrenzte technische Informationen, die erforderlich sind, um die Website sicher und funktionsfähig zu halten.",
          "Wenn Sie auf „Alle akzeptieren“ klicken, verwendet Clarvia.org außerdem Google Analytics und Google Ads-Messung, um den Website-Verkehr zu verstehen, unsere Checklisten für Trauer- und Nachlasssituationen zu verbessern und die Wirksamkeit von Spendenkampagnen zu messen.",
          "Wir verwenden keine personalisierte Werbung und kein Remarketing, es sei denn, diese Richtlinie und unser Einwilligungsbanner werden entsprechend aktualisiert.",
          "Wenn Sie uns für eine kostenlose administrative Beratung oder Unterstützung im Trauerfall kontaktieren, verarbeiten wir auch die personenbezogenen Daten, die Sie uns mitteilen, wie in Abschnitt 5 beschrieben."
        ]
      },
      {
        heading: "2. Cookies und Einwilligung",
        body: [
          "Optionale Cookies von Google Analytics und Google Ads sind standardmäßig deaktiviert.",
          "Es werden keine optionalen Analyse- oder Werbe-Cookies auf Ihrem Gerät gespeichert, es sei denn, Sie klicken auf „Alle akzeptieren“.",
          "Wenn Sie auf „Ablehnen / Nur erforderlich“ klicken, bleiben optionale Cookies blockiert. Google kann, sofern von Google Consent Mode unterstützt, begrenzte cookielose Messsignale erhalten; Analyse- und Werbespeicherung bleiben jedoch verweigert.",
          "Sie können Ihre Auswahl jederzeit ändern oder widerrufen, indem Sie im Footer der Website auf „Cookie-Einstellungen“ klicken."
        ]
      },
      {
        heading: "3. Cookies, die Clarvia.org verwenden kann, wenn Sie zustimmen",
        body: [
          "Die tatsächlich verwendeten Cookies können je nach Browser, Einwilligungsentscheidung und Google-Diensten variieren."
        ],
        table: {
          headers: ["Cookie", "Anbieter", "Zweck", "Ablauf"],
          rows: [
            ["_ga", "Google Analytics", "Unterscheidet Nutzer für Website-Analysen.", "Bis zu 2 Jahre"],
            ["_ga_K67M5B4932", "Google Analytics", "Speichert den Sitzungsstatus für Analysen.", "Bis zu 2 Jahre"],
            ["_gcl_au", "Google Ads / Google Tag", "Hilft bei der Messung von Werbung und Spenden-Conversions.", "Bis zu 3 Monate"],
            ["_gcl_aw", "Google Ads", "Speichert Informationen zu Google-Anzeigenklicks für die Conversion-Zuordnung.", "Bis zu 90 Tage"]
          ]
        }
      },
      {
        heading: "4. Externe Spendendienste",
        body: [
          "Clarvia.org kann auf externe Spendendienste wie Stripe, GitHub Sponsors oder Open Collective verlinken oder Sie dorthin weiterleiten.",
          "Diese Dienste sind von Clarvia.org getrennt und unterliegen ihren eigenen Datenschutz- und Cookie-Richtlinien. Clarvia ASBL ist nicht verantwortlich für Cookies oder Tracking auf externen Websites.",
          "Bitte geben Sie keine sensiblen Informationen zu Familie, Gesundheit oder Trauerfällen in Zahlungsreferenzen oder Spendennachrichten an."
        ]
      },
      {
        heading: "5. Kontakt- und Unterstützungsanfragen",
        body: [
          "Wenn Sie uns per E-Mail oder über ein Formular für eine kostenlose administrative Beratung oder Unterstützung im Trauerfall kontaktieren, verarbeiten wir die personenbezogenen Daten, die Sie uns mitteilen. Dies kann Ihren Namen, Ihre Kontaktdaten, Ihre bevorzugte Sprache, den Inhalt Ihrer Nachricht sowie alle von Ihnen bereitgestellten Dokumente oder sonstigen Informationen umfassen.",
          "Wir verwenden diese Informationen ausschließlich, um Ihre Anfrage zu verstehen, mit Ihnen zu kommunizieren und Ihnen hilfreiche Unterstützung zu bieten.",
          "Um eine genaue und sprachlich passende Antwort zu gewährleisten, können wir Werkzeuge der künstlichen Intelligenz, einschließlich großer Sprachmodelle (LLMs), verwenden, um:",
          "• Nachrichten zu übersetzen;",
          "• bei der Recherche und Informationsbeschaffung zu unterstützen; und",
          "• Entwürfe für Antwortvorschläge zur Prüfung durch ein ehrenamtliches Mitglied von Clarvia zu erstellen.",
          "Diese KI-Dienstanbieter handeln als Auftragsverarbeiter im Auftrag und nach Weisung von Clarvia. Wir nutzen nur Anbieter, die angemessene Auftragsverarbeitungsverträge anbieten. Gemäß unseren Vereinbarungen mit ihnen ist es ihnen nicht gestattet, die von Ihnen übermittelten Inhalte zum Training ihrer allgemeinen Modelle zu verwenden.",
          "KI-Werkzeuge können unsere Ehrenamtlichen unterstützen, aber ein ehrenamtliches Mitglied von Clarvia bleibt für die an Sie gesendete Antwort verantwortlich.",
          "Rechtsgrundlage: Die berechtigten Interessen von Clarvia gemäß Artikel 6 Abs. 1 lit. f DSGVO – konkret die präzise und effiziente Erbringung der von Ihnen angeforderten kostenlosen Beratung oder Unterstützung.",
          "Speicherdauer: Wir bewahren die Korrespondenz so lange auf, wie es für die Erbringung der angeforderten Beratung oder Unterstützung und zur Gewährleistung der Kontinuität erforderlich ist, einschließlich der Fälle, in denen eine Angelegenheit ungelöst bleibt oder ein Weiterverfolgen über einen längeren Zeitraum erfordern kann. Wir überprüfen Anfragen regelmäßig, um festzustellen, ob die Korrespondenz noch benötigt wird. Sobald eine Angelegenheit abgeschlossen ist und keine weitere Nachverfolgung mehr zu erwarten ist, löschen oder anonymisieren wir die Korrespondenz, es sei denn, eine längere Aufbewahrung ist gesetzlich vorgeschrieben oder zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich.",
          "Zugriff: Der menschliche Zugriff ist auf autorisierte ehrenamtliche Mitarbeiter von Clarvia beschränkt, die Ihre Anfrage bearbeiten. Unsere vertraglich gebundenen Dienstanbieter dürfen die Daten nur soweit verarbeiten, wie dies zur Erbringung ihrer Dienstleistungen für Clarvia und gemäß unseren Anweisungen erforderlich ist.",
          "Bitte teilen Sie nur die Informationen mit, die für unsere Hilfe erforderlich sind. Vermeiden Sie insbesondere die Angabe unnötiger sensibler Familien-, Gesundheits-, Finanz-, Identifikations- oder Trauerfalldetails."
        ]
      },
      {
        heading: "6. Ihre Rechte und Wahlmöglichkeiten",
        body: [
          "Sie können Cookies über Ihre Browsereinstellungen kontrollieren oder Ihre Präferenzen jederzeit über den Link „Cookie-Einstellungen“ im Footer ändern. Der Widerruf der Einwilligung berührt nicht die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung.",
          "Nach der DSGVO haben Sie das Recht auf:",
          "• Auskunft über Ihre personenbezogenen Daten;",
          "• Berichtigung unrichtiger oder unvollständiger Daten;",
          "• Löschung Ihrer personenbezogenen Daten;",
          "• Einschränkung der Verarbeitung;",
          "• Widerspruch gegen die Verarbeitung auf der Grundlage der berechtigten Interessen von Clarvia.",
          "Diese Rechte können an Bedingungen und Ausnahmen nach geltendem Recht geknüpft sein.",
          "Wenn Sie der Ansicht sind, dass Ihre Daten falsch behandelt werden, haben Sie das Recht, eine Beschwerde bei der luxemburgischen Datenschutzbehörde, der CNPD — Commission Nationale pour la Protection des Données, einzureichen."
        ]
      },
      {
        heading: "7. Internationale Datenübermittlungen",
        body: [
          "Einige Dienstanbieter von Clarvia, einschließlich Google und Dienstanbietern zur Unterstützung bei Kontakt- und Unterstützungsanfragen, können personenbezogene Daten außerhalb des Europäischen Wirtschaftsraums verarbeiten.",
          "Wenn ein Anbieter in den USA nach dem EU–US Data Privacy Framework zertifiziert ist, kann sich Clarvia auf diesen Rahmen als anerkannten Übermittlungsmechanismus stützen. Wo dieser Rahmen nicht gilt, nutzt Clarvia bei Bedarf einen anderen gültigen Übermittlungsmechanismus, wie die Standardvertragsklauseln der Europäischen Kommission, zusammen mit allen gesetzlich erforderlichen zusätzlichen Schutzmaßnahmen.",
          "Die Akzeptanz optionaler Cookies steuert, ob Clarvia die optionale Speicherung von Google Analytics und Google Ads auf Ihrem Gerät zulässt. Dies ist getrennt von den rechtlichen Schutzmaßnahmen, die Clarvia für internationale Übermittlungen personenbezogener Daten anwendet."
        ]
      },
      {
        heading: "8. Kontaktdaten",
        body: [
          "Clarvia ASBL, eingetragen im RCS Luxemburg unter der Nummer F15680, ist für Clarvia.org der Verantwortliche für die Verarbeitung Ihrer Daten.",
          "Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Datenschutzrechte kontaktieren Sie uns bitte über das Formular „Contact Us“ auf unserer Homepage unter clarvia.org."
        ]
      },
      {
        heading: "9. Änderungen",
        body: [
          "Wir können diese Richtlinie aktualisieren, wenn sich Clarvia.org, unser Spendensystem, unsere Messwerkzeuge oder die Art und Weise, wie wir Kontakt- und Unterstützungsanfragen bearbeiten, ändern."
        ]
      }
    ]
  }
} as const;
