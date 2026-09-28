export const CLARVIA_LINKEDIN_URL = "https://www.linkedin.com/company/clarvia-org";

const LINK_LABEL = "LinkedIn";

function LinkedInMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      className="h-6 w-6"
    >
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z"
      />
    </svg>
  );
}

const externalLinkClass =
  "text-[#0A66C2] hover:text-[#004182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calm-blue-400";

export function LinkedInLogoLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={CLARVIA_LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Clarvia on LinkedIn"
      className={`inline-flex items-center justify-center min-h-11 min-w-11 ${externalLinkClass} ${className}`}
    >
      <LinkedInMark />
    </a>
  );
}

export function LinkedInFollowLine({ text }: { text: string }) {
  const index = text.indexOf(LINK_LABEL);
  const link = (
    <a
      href={CLARVIA_LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline ${externalLinkClass}`}
    >
      {index === -1 ? text : LINK_LABEL}
    </a>
  );

  return (
    <p className="text-sm text-calm-blue-600 max-w-2xl mx-auto mt-6 leading-relaxed">
      {index === -1 ? (
        link
      ) : (
        <>
          {text.slice(0, index)}
          {link}
          {text.slice(index + LINK_LABEL.length)}
        </>
      )}
    </p>
  );
}
