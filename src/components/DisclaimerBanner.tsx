export function DisclaimerBanner() {
  return (
    <section
      aria-label="Important limitation"
      className="rounded-2xl border border-line bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold">Administrative guidance only</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Clarvia provides administrative guidance based on official sources.
        It is not a substitute for individualized legal advice, tax advice,
        inheritance advice, emergency assistance, grief counselling, or case
        management.
      </p>
    </section>
  );
}
