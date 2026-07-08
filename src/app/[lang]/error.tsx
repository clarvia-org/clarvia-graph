"use client";

import { useParams } from "next/navigation";
import { type Lang, l } from "@/lib/i18n";

export default function ErrorPage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--color-heading, #2b3a67)" }}
        >
          {l(
            lang,
            "Something went wrong",
            "Une erreur est survenue",
            "Etwas ist schiefgelaufen"
          )}
        </h2>
        <p className="text-slate-600 mb-6">
          {l(
            lang,
            "An unexpected error occurred. Please try again.",
            "Une erreur inattendue s'est produite. Veuillez réessayer.",
            "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
          )}
        </p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-3"
        >
          {l(lang, "Try again", "Réessayer", "Erneut versuchen")}
        </button>
      </div>
    </div>
  );
}
