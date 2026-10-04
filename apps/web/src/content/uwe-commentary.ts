import type { Lang } from "@/lib/i18n";

export type CommentaryCopy = {
  title: string;
  role: string;
  category: string;
  published: string;
  date: string;
  description: string;
  note: string;
  original: string;
  originalLink: string;
  quote: string;
  articleLabel: string;
  ctaTitle: string;
  ctaBody: string;
  cta: string;
  back: string;
  link: string;
  paragraphs: string[];
};

export const UWE_COMMENTARY: Record<Lang, CommentaryCopy> = {
  "en": {
    "title": "Helping families help themselves",
    "role": "journalist and entrepreneur",
    "category": "Guest commentary",
    "published": "Published on",
    "date": "4 October 2026",
    "description": "Journalist and entrepreneur Uwe Schneider reflects on the burden after a death and the free practical guidance offered by Clarvia.",
    "note": "Published with the author's permission. The text, received on 2 October 2026, was factually corrected with his agreement and lightly proofread. It reflects the author's personal views.",
    "original": "Translated by Clarvia from the German original.",
    "originalLink": "Read the German original",
    "quote": "Human kindness when it is most needed, helping people find their own way forward.",
    "articleLabel": "Commentary by Uwe Schneider",
    "ctaTitle": "Try Ask Clarvia",
    "ctaBody": "If someone you love is dying or has died, you can ask your question in English. You will receive practical guidance by email, free and without an account.",
    "cta": "Ask a question",
    "back": "Back to the homepage",
    "link": "Read the commentary",
    "paragraphs": [
      "There are moments when fate strikes without mercy. Losing someone you love is hard to bear, especially when they are among the people closest to you. Whether the death was expected or came suddenly, it leaves a deep gap in our lives. All at once, we find ourselves facing a task that can feel almost insurmountable.",
      "There are sometimes people who can offer a little help and well-meant advice. But alongside a profound loss come administrative and organisational responsibilities: dealing with authorities and insurers, and making arrangements with hospitals and funeral directors. For someone who is grieving, this can feel almost impossible. It is made harder by those in and around the funeral industry who are willing to treat bereaved people primarily as a source of revenue.",
      "Under these circumstances, finding space to grieve with dignity is difficult. That is why it is so welcome that Clarvia.org now offers access to a nonprofit association helping to make life a little more bearable for bereaved people, free of charge. Clarvia provides practical guidance on administrative and organisational questions and helps families understand the next steps and take them themselves. Even in the hardest hours, Clarvia.org helps people keep a clear head and find more room to grieve in their own way. Human kindness when it is most needed, helping people find their own way forward.",
      "It is good to see young nonprofit associations working towards a situation in which everyone benefits."
    ]
  },
  "fr": {
    "title": "Aider les familles à avancer par elles-mêmes",
    "role": "journaliste et entrepreneur",
    "category": "Contribution extérieure",
    "published": "Publié le",
    "date": "4 octobre 2026",
    "description": "Le journaliste et entrepreneur Uwe Schneider évoque les difficultés après un décès et l’orientation pratique gratuite proposée par Clarvia.",
    "note": "Publié avec l’autorisation de l’auteur. Le texte, reçu le 2 octobre 2026, a fait l’objet de corrections factuelles avec son accord et d’une légère relecture. Il exprime le point de vue personnel de l’auteur.",
    "original": "Traduit par Clarvia à partir de l’original allemand.",
    "originalLink": "Lire l’original allemand",
    "quote": "De l’humanité quand on en a le plus besoin, pour aider chacun à trouver son chemin.",
    "articleLabel": "Contribution d’Uwe Schneider",
    "ctaTitle": "Essayer Ask Clarvia",
    "ctaBody": "Si un proche est en fin de vie ou vient de décéder, vous pouvez poser votre question en français. Vous recevrez des indications pratiques par e-mail, gratuitement et sans créer de compte.",
    "cta": "Poser une question",
    "back": "Retour à l’accueil",
    "link": "Lire la contribution",
    "paragraphs": [
      "Il est des moments où le destin frappe sans pitié. Perdre un être cher est difficile à surmonter, surtout lorsqu’il fait partie de nos proches les plus intimes. Que le décès ait été prévisible ou qu’il survienne soudainement, il laisse un vide profond dans nos vies. Nous nous retrouvons alors, d’un seul coup, face à une tâche qui paraît presque insurmontable.",
      "Il arrive que des personnes puissent apporter un peu d’aide et des conseils bien intentionnés. Mais à la douleur de la perte s’ajoutent des obligations administratives et organisationnelles : les échanges avec les administrations et les assurances, ainsi que les démarches auprès des hôpitaux et des entreprises de pompes funèbres. Pour une personne endeuillée, tout cela peut sembler presque impossible à gérer. D’autant que certains acteurs du secteur funéraire et des activités qui l’entourent n’hésitent pas à voir avant tout dans les personnes endeuillées une source de revenus.",
      "Dans ces conditions, il est difficile de trouver l’espace nécessaire pour vivre son deuil avec dignité. Il est donc heureux que Clarvia.org donne désormais accès à une association à but non lucratif qui aide gratuitement à rendre la vie des personnes endeuillées un peu plus supportable. Clarvia apporte une orientation pratique sur les questions administratives et organisationnelles et aide les familles à comprendre les prochaines étapes pour les entreprendre elles-mêmes. Même dans les moments les plus difficiles, Clarvia.org aide à garder les idées claires et à trouver davantage de place pour vivre son deuil à sa manière. De l’humanité quand on en a le plus besoin, pour aider chacun à trouver son chemin.",
      "Il est bon de voir de jeunes associations à but non lucratif chercher à créer une situation dont chacun bénéficie."
    ]
  },
  "de": {
    "title": "Hilfe zur Selbsthilfe",
    "role": "Journalist und Unternehmer",
    "category": "Gastbeitrag",
    "published": "Veröffentlicht am",
    "date": "4. Oktober 2026",
    "description": "Ein Beitrag des Journalisten und Unternehmers Uwe Schneider über die Belastung nach einem Todesfall und kostenlose Orientierung durch Clarvia.",
    "note": "Mit freundlicher Genehmigung des Autors veröffentlicht. Der am 2. Oktober 2026 übermittelte Text wurde mit seiner Zustimmung sachlich korrigiert und leicht lektoriert. Der Beitrag gibt die persönliche Sicht des Autors wieder.",
    "original": "Originaltext auf Deutsch.",
    "originalLink": "Den deutschen Originaltext lesen",
    "quote": "Menschlichkeit, wenn es bitter nötig ist, auch zur Selbsthilfe.",
    "articleLabel": "Beitrag von Uwe Schneider",
    "ctaTitle": "Ask Clarvia ausprobieren",
    "ctaBody": "Wenn ein Angehöriger im Sterben liegt oder verstorben ist, können Sie Ihre Frage auf Deutsch stellen. Sie erhalten praktische Orientierung per E-Mail, kostenlos und ohne Benutzerkonto.",
    "cta": "Eine Frage stellen",
    "back": "Zur Startseite",
    "link": "Den Beitrag lesen",
    "paragraphs": [
      "Es gibt Stunden, an denen das Schicksal unbarmherzig zuschlägt. Der Verlust von geliebten Menschen ist schwer zu verarbeiten und noch unerträglicher und schon fast unmenschlich ist es, Persönlichkeiten aus dem nächsten Umfeld zu verlieren. Ob es eher erwartbar oder plötzlich und unerwartet eintrifft, dass der Tod eine tiefe Lücke in das Leben von uns furcht, plötzlich stehen wir allein vor einer nahezu unüberwindbaren Aufgabe.",
      "Ja, es gibt bisweilen Menschen, die mit gut gemeinten Ratschlägen ein wenig Hilfe anbieten und leisten können, aber zu einem schweren Verlust ergeben sich zusätzlich administrative und organisatorische Verpflichtungen, wie die Koordination von Behörden, Versicherungen sowie die Organisation mit Krankenhäusern und Beerdigungsunternehmen. Für den Trauernden entsteht plötzlich eine fast unlösbare Aufgabe; auch weil es in der Beerdigungsbranche und ringsherum Charaktere gibt, die Trauernde gern zu Umsatzbringern degradieren.",
      "Pietätvolle Trauerarbeit ist da kaum leistbar. Deshalb ist es wunderbar, dass mit Clarvia.org jetzt ein gemeinnütziger Verein erreichbar ist, der kostenlos das Leben von Hinterbliebenen ein wenig leichter ertragbar werden lässt. Clarvia bietet praktische Orientierung bei Verwaltungs- und Organisationsfragen und hilft Familien, die nächsten Schritte zu verstehen und selbst anzugehen. Clarvia.org hilft dabei, auch in den schwersten Stunden einen klaren Kopf behalten zu können und mehr Raum für die ganz persönliche Trauerverarbeitung zu finden. Menschlichkeit, wenn es bitter nötig ist, auch zur Selbsthilfe.",
      "Schön, dass es junge gemeinnützige Vereine gibt, die eine Win-win-win-Situation anstreben."
    ]
  },
  "lu": {
    "title": "Familljen hëllefen, selwer weiderzekommen",
    "role": "Journalist an Entrepreneur",
    "category": "Gaaschtbäitrag",
    "published": "Publizéiert den",
    "date": "4. Oktober 2026",
    "description": "De Journalist an Entrepreneur Uwe Schneider schreift iwwer d’Belaaschtung no engem Doudesfall an déi gratis praktesch Orientéierung vu Clarvia.",
    "note": "Mat der Erlaabnes vum Auteur publizéiert. Den Text, dee mir den 2. Oktober 2026 kruten, gouf mat sengem Accord sachlech korrigéiert a liicht iwwerschafft. De Bäitrag gëtt déi perséinlech Siicht vum Auteur erëm.",
    "original": "Vu Clarvia aus dem däitschen Original iwwersat.",
    "originalLink": "Den däitschen Originaltext liesen",
    "quote": "Mënschlechkeet, wann een se am meeschte brauch, fir de Leit ze hëllefen, hiren eegene Wee ze fannen.",
    "articleLabel": "Bäitrag vum Uwe Schneider",
    "ctaTitle": "Ask Clarvia ausprobéieren",
    "ctaBody": "Wann eng Persoun, déi Iech nosteet, am Stierwe läit oder gestuerwen ass, kënnt Dir Är Fro op Lëtzebuergesch stellen. Dir kritt praktesch Orientéierung per E-Mail, gratis an ouni Benotzerkont.",
    "cta": "Eng Fro stellen",
    "back": "Zréck op d’Startsäit",
    "link": "De Bäitrag liesen",
    "paragraphs": [
      "Et gi Momenter, an deenen d’Schicksal onbaarmhäerzeg zouschléit. Eng Persoun ze verléieren, déi ee gär huet, ass schwéier ze verkraaften, besonnesch wann et ee vun de Mënschen ass, déi engem am nooste stinn. Egal ob den Doud ze erwaarde war oder ganz onerwaart koum, en hannerléisst eng déif Lück an eisem Liewen. Op eemol sti mir eleng virun enger Aufgab, déi bal oniwwerwannbar schéngt.",
      "Heiansdo ginn et Leit, déi mat gutt gemengte Rotschléi e bëssen hëllefe kënnen. Mee bei de schwéiere Verloscht kommen nach administrativ an organisatoresch Flichten dobäi: den Austausch mat Administratiounen a Versécherungen, souwéi d’Ofsprooche mat Spideeler a Begriefnesentreprisen. Fir eng Persoun, déi trauert, kann dat alles bal onméiglech ze bewältege sinn. Dobäi kënnt, datt et am Begriefnessecteur an a sengem Ëmfeld Leit gëtt, déi a Persounen, déi traueren, virun allem eng Akommesquell gesinn.",
      "Ënner dësen Ëmstänn ass et schwéier, de néidege Raum ze fannen, fir a Würd ze traueren. Dofir ass et gutt, datt iwwer Clarvia.org elo e gemengnëtzege Veräin erreechbar ass, deen de Leit no engem Verloscht gratis hëlleft, hiert Liewen e bëssen erdréiglecher ze maachen. Clarvia bitt praktesch Orientéierung bei administrativen an organisatoresche Froen an hëlleft Familljen, déi nächst Schrëtt ze verstoen a selwer unzegoen. Och an de schwéierste Momenter hëlleft Clarvia.org, e klore Kapp ze behalen a méi Raum ze fannen, fir op seng eege Manéier ze traueren. Mënschlechkeet, wann een se am meeschte brauch, fir de Leit ze hëllefen, hiren eegene Wee ze fannen.",
      "Et ass gutt, datt jonk gemengnëtzeg Veräiner sech fir eng Situatioun asetzen, vun där jidderee profitéiert."
    ]
  }
};
