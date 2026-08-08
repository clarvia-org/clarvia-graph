import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type Lang, l } from "@/lib/i18n";

export interface DonationSuccessTrackerProps {
  lang: Lang;
}

function SuccessTrackerInner({ lang }: DonationSuccessTrackerProps) {
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!donated || !sessionId) return;

    // Check if already tracked to deduplicate
    const trackingKey = `clarvia-donation-tracked-${sessionId}`;
    if (localStorage.getItem(trackingKey)) return;

    let isMounted = true;

    // Fetch session verification
    fetch(`/api/donate?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        // Ensure payment status is paid/complete
        if (data.payment_status === "paid" || data.status === "complete") {
          // Fire GA4 Event
          if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "donation_complete", {
              event_category: "engagement",
              event_label: "Stripe Donation Success",
              value: data.amount || undefined,
              currency: data.currency || "EUR",
              transaction_id: sessionId,
            });
          }

          // Save tracking state to prevent duplicate hits
          try {
            localStorage.setItem(trackingKey, "true");
          } catch {}
        }
      })
      .catch((err) => {
        console.error("Donation verification error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [donated, sessionId]);

  if (!donated) return null;

  return (
    <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
      <p className="text-green-800 font-medium">
        {l(
          lang,
          "Thank you for your support! You will receive a receipt from Stripe at the email address you provided.",
          "Merci pour votre soutien ! Vous recevrez un reçu de Stripe à l'adresse e-mail que vous avez indiquée.",
          "Vielen Dank für Ihre Unterstützung! Sie erhalten eine Quittung von Stripe an die von Ihnen angegebene E-Mail-Adresse.",
          "Merci fir Är Ënnerstëtzung! Dir kritt eng Quittung vu Stripe op déi E-Mail-Adress, déi Dir uginn hutt."
        )}
      </p>
    </div>
  );
}

export default function DonationSuccessTracker(props: DonationSuccessTrackerProps) {
  return (
    <Suspense fallback={null}>
      <SuccessTrackerInner {...props} />
    </Suspense>
  );
}
