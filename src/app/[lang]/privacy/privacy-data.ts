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
    lastUpdated: "Last updated: 5 July 2026",
    sections: [
      {
        heading: "1. What Clarvia.org collects",
        body: [
          "Clarvia ASBL operates Clarvia.org. We respect your privacy and use optional analytics and advertising cookies only if you choose to accept them.",
          "Clarvia.org collects limited technical information needed to keep the website secure and working.",
          "If you click “Accept all”, Clarvia.org also uses Google Analytics and Google Ads measurement to understand website traffic, improve our bereavement checklists, and measure donation campaign effectiveness.",
          "We do not use advertising personalization or remarketing unless this policy and our consent banner are updated."
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
        heading: "5. Your rights and choices",
        body: [
          "You can control cookies through your browser settings or change your preferences at any time using the “Cookie settings” link in the footer.",
          "Under the GDPR, you have the right to access, correct, delete, or restrict the processing of your data, as well as the right to object. If you believe your data is handled incorrectly, you have the right to lodge a complaint with the Luxembourg data protection authority, the CNPD — Commission Nationale pour la Protection des Données."
        ]
      },
      {
        heading: "6. International data transfers",
        body: [
          "By accepting optional cookies, you agree that your data may be transferred to and processed by Google LLC in the United States.",
          "Google LLC is certified under the EU–US Data Privacy Framework, which provides a recognized mechanism for transfers of personal data from the European Economic Area to certified organizations in the United States."
        ]
      },
      {
        heading: "7. Contact details",
        body: [
          "Clarvia ASBL, registered with the Luxembourg RCS under number F15680, is the controller of your data for Clarvia.org.",
          "For any privacy questions, please contact us using the “Contact Us” form available on our homepage at clarvia.org."
        ]
      },
      {
        heading: "8. Changes",
        body: [
          "We may update this policy when Clarvia.org, our donation setup, or our measurement tools change."
        ]
      }
    ]
  },

  fr: {
    title: "Politique de confidentialité et de cookies",
    lastUpdated: "Dernière mise à jour : 5 juillet 2026",
    sections: [
      {
        heading: "1. Ce que Clarvia.org collecte",
        body: [
          "Clarvia ASBL exploite Clarvia.org. Nous respectons votre vie privée et n’utilisons des cookies optionnels d’analyse et de publicité que si vous choisissez de les accepter.",
          "Clarvia.org collecte des informations techniques limitées nécessaires au bon fonctionnement et à la sécurité du site.",
          "Si vous cliquez sur « Tout accepter », Clarvia.org utilise également Google Analytics et la mesure Google Ads afin de comprendre le trafic du site, d’améliorer nos listes de démarches après un décès et de mesurer l’efficacité des campagnes de dons.",
          "We do not use advertising personalization or remarketing unless this policy and our consent banner are updated."
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
        heading: "5. Vos droits et choix",
        body: [
          "Vous pouvez contrôler les cookies via les paramètres de votre navigateur ou modifier vos préférences à tout moment en utilisant le lien « Paramètres des cookies » dans le pied de page.",
          "En vertu du RGPD, vous avez le droit d’accéder à vos données, de les corriger, de les supprimer, d’en limiter le traitement, ainsi que le droit de vous opposer au traitement. Si vous estimez que vos données sont traitées de manière incorrecte, vous avez le droit d’introduire une réclamation auprès de l’autorité luxembourgeoise de protection des données, la CNPD — Commission Nationale pour la Protection des Données."
        ]
      },
      {
        heading: "6. Transferts internationaux de données",
        body: [
          "En acceptant les cookies optionnels, vous acceptez que vos données puissent être transférées à Google LLC aux États-Unis et y être traitées.",
          "Google LLC est certifiée au titre du cadre de protection des données UE–États-Unis, qui fournit un mécanisme reconnu pour les transferts de données personnelles depuis l’Espace économique européen vers des organisations certifiées aux États-Unis."
        ]
      },
      {
        heading: "7. Coordonnées",
        body: [
          "Clarvia ASBL, inscrite au RCS Luxembourg sous le numéro F15680, est le responsable du traitement de vos données pour Clarvia.org.",
          "Pour toute question relative à la confidentialité, veuillez nous contacter au moyen du formulaire « Contact Us » disponible sur notre page d’accueil à clarvia.org."
        ]
      },
      {
        heading: "8. Modifications",
        body: [
          "Nous pouvons mettre à jour cette politique lorsque Clarvia.org, notre système de dons ou nos outils de mesure changent."
        ]
      }
    ]
  },

  de: {
    title: "Datenschutz- und Cookie-Richtlinie",
    lastUpdated: "Zuletzt aktualisiert: 5. Juli 2026",
    sections: [
      {
        heading: "1. Was Clarvia.org erhebt",
        body: [
          "Clarvia ASBL betreibt Clarvia.org. Wir respektieren Ihre Privatsphäre und verwenden optionale Analyse- und Werbe-Cookies nur, wenn Sie diese ausdrücklich akzeptieren.",
          "Clarvia.org erhebt begrenzte technische Informationen, die erforderlich sind, um die Website sicher und funktionsfähig zu halten.",
          "Wenn Sie auf „Alle akzeptieren“ klicken, verwendet Clarvia.org außerdem Google Analytics und Google Ads-Messung, um den Website-Verkehr zu verstehen, unsere Checklisten für Trauer- und Nachlasssituationen zu verbessern und die Wirksamkeit von Spendenkampagnen zu messen.",
          "Wir verwenden keine personalisierte Werbung und kein Remarketing, es sei denn, diese Richtlinie und unser Einwilligungsbanner werden entsprechend aktualisiert."
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
          "Diese Dienste sind von Clarvia.org getrennt und unterliegen ihren eigenen Datenschutz- und Cookie-Richtlinien. Clarvia ASBL is nicht verantwortlich für Cookies oder Tracking auf externen Websites.",
          "Bitte geben Sie keine sensiblen Informationen zu Familie, Gesundheit oder Trauerfällen in Zahlungsreferenzen oder Spendennachrichten an."
        ]
      },
      {
        heading: "5. Ihre Rechte und Wahlmöglichkeiten",
        body: [
          "Sie können Cookies über Ihre Browsereinstellungen kontrollieren oder Ihre Präferenzen jederzeit über den Link „Cookie-Einstellungen“ im Footer ändern.",
          "Nach der DSGVO haben Sie das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer Daten sowie das Recht, der Verarbeitung zu widersprechen. Wenn Sie der Ansicht sind, dass Ihre Daten falsch behandelt werden, haben Sie das Recht, eine Beschwerde bei der luxemburgischen Datenschutzbehörde, der CNPD — Commission Nationale für die Protection des Données, einzureichen."
        ]
      },
      {
        heading: "6. Internationale Datenübermittlungen",
        body: [
          "Wenn Sie optionale Cookies akzeptieren, stimmen Sie zu, dass Ihre Daten an Google LLC in den Vereinigten Staaten übertragen und dort verarbeitet werden können.",
          "Google LLC ist nach dem EU–US Data Privacy Framework zertifiziert. Dieses stellt einen anerkannten Mechanismus für die Übermittlung personenbezogener Daten aus dem Europäischen Wirtschaftsraum an zertifizierte Organisationen in den Vereinigten Staaten bereit."
        ]
      },
      {
        heading: "7. Kontaktdaten",
        body: [
          "Clarvia ASBL, eingetragen im RCS Luxemburg unter der Nummer F15680, ist für Clarvia.org der Verantwortliche für die Verarbeitung Ihrer Daten.",
          "Bei Fragen zum Datenschutz kontaktieren Sie uns bitte über das Formular „Contact Us“ auf unserer Homepage unter clarvia.org."
        ]
      },
      {
        heading: "8. Änderungen",
        body: [
          "Wir können diese Richtlinie aktualisieren, wenn sich Clarvia.org, unser Spendensystem oder unsere Messwerkzeuge ändern."
        ]
      }
    ]
  }
} as const;
