import { type Lang, l } from "@/lib/i18n";

export default function ProblemSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-16">
      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto">
        <p className="text-base text-calm-blue-600 leading-relaxed mb-4">
          {l(lang, "When someone passes away, families are suddenly expected to handle administration, documents, institutions, urgent steps, funeral matters, succession-related questions, and personal memories - often while in shock.", "Lorsqu'une personne décède, les familles doivent soudainement gérer des démarches administratives, des documents, des institutions, des urgences, des questions liées aux obsèques, à la succession et aux souvenirs personnels - souvent alors qu'elles sont encore sous le choc.", "Wenn ein Mensch stirbt, müssen Angehörige plötzlich Verwaltung, Dokumente, Behörden, dringende Schritte, Bestattungsfragen, Nachlassthemen und persönliche Erinnerungen ordnen - oft mitten im Schock.", "Wann e Mënsch stierft, musse Familljen op eemol Administratioun, Dokumenter, Institutiounen, dréngend Schrëtt, Begriefnesfroen, Successiounsthemen a perséinlech Erënnerungen ugoen – dacks nach am Schock.")}
        </p>
        <p className="text-base text-calm-blue-600 leading-relaxed mb-4">
          {l(lang, "For many people, this is harder because of language barriers, cross-border family situations, limited financial means, unfamiliarity with local systems, or simply not knowing who to ask.", "Pour beaucoup, cette période est rendue encore plus difficile par la barrière de la langue, des situations familiales transfrontalières, des moyens financiers limités, une méconnaissance du système luxembourgeois ou simplement le fait de ne pas savoir à qui s'adresser.", "Für viele Menschen wird dies zusätzlich erschwert: durch Sprachbarrieren, grenzüberschreitende Familiensituationen, begrenzte finanzielle Mittel, fehlende Vertrautheit mit den luxemburgischen Systemen oder schlicht durch die Frage, an wen man sich überhaupt wenden kann.", "Fir vill Leit ass dat nach méi schwéier wéinst Sproochebarrièren, grenziwwerschreidende Familljesituatiounen, begrenzte finanzielle Mëttelen, Onvertrautheet mam lëtzebuergesche System oder einfach well se net wëssen, wien se froe sollen.")}
        </p>
        <p className="text-base text-calm-blue-600 leading-relaxed mb-6 italic">
          {l(lang, "The information may exist, but it is often scattered, technical, and difficult to navigate at the very moment families have the least capacity to search.", "L'information existe parfois, mais elle est souvent dispersée, technique et difficile à comprendre au moment même où les familles ont le moins d'énergie pour chercher.", "Informationen gibt es zwar, doch sie sind oft verstreut, technisch formuliert und schwer zu überblicken - gerade in dem Moment, in dem Familien am wenigsten Kraft zum Suchen haben.", "D'Informatioune kënnen existéieren, mee si sinn dacks verspreet, technesch formuléiert a schwéier ze iwwersi – grad an deem Moment, wou Familljen am mannste Kraaft hunn ze sichen.")}
        </p>
        <p className="text-base text-calm-blue-700 font-medium text-center">
          {l(lang, "Clarvia exists to make this guidance easier to access for everyone.", "Clarvia existe pour rendre cet accompagnement plus accessible à toutes et à tous.", "Clarvia wurde gegründet, um diese Orientierung für alle leichter zugänglich zu machen.", "Clarvia ass dofir do, dës Orientéierung fir jidderee méi einfach zougänglech ze maachen.")}
        </p>
      </div>
    </section>
  );
}
