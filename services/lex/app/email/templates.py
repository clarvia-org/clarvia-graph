"""Approved, application-owned email text.

Every constant here is reviewed content that the model must never generate. The
continuation note and footer are reproduced verbatim from blueprint sections 19
and 20 and must not be paraphrased. The deterministic operational bodies each
end with the required ``Lex.`` sign-off so they pass through the same composer.
"""

from __future__ import annotations

LEX_FROM_NAME = "Lex from Clarvia"
LEX_FROM_ADDRESS = "lex@clarvia.org"

CONTINUATION_TEXT = (
    "We're happy to help with anything else. Just reply to this email for "
    "follow-up questions on this topic, or send a fresh email to "
    "lex@clarvia.org for a different matter."
)

CONTINUATION_HTML = """
<p style="margin:24px 0 0;font-family:sans-serif;font-size:14px;color:#222">
We're happy to help with anything else. Just reply to this email for follow-up
questions on this topic, or send a fresh email to
<a href="mailto:lex@clarvia.org">lex@clarvia.org</a> for a different matter.
</p>
""".strip()

FOOTER_HTML = """
<div style="font-size:13px;color:#555;font-family:sans-serif;border-top:1px solid #ddd;padding-top:12px;margin-top:24px">
<p style="margin:0 0 10px">Clarvia is a nonprofit. If you found this helpful, please consider
<a href="https://clarvia.org/en/support" style="color:#1a73e8">making a donation</a>
to keep this service free for everyone who needs it.</p>
<p style="margin:0 0 14px">We're also looking for volunteers to help develop our open-source tools.
If you'd like to contribute, visit us on
<a href="https://github.com/clarvia-org" style="color:#1a73e8">GitHub</a>.</p>
<p style="margin:0 0 6px;font-size:12px;color:#888">Lex is Clarvia's AI-powered information
service. It uses Clarvia's source-backed workflow system to organise official rules, requirements,
documents, deadlines and contact information into practical guidance and signposting.</p>
<p style="margin:0 0 6px;font-size:12px;color:#888">Clarvia does not provide emergency, legal,
tax, medical, psychological, notarial, banking, financial or succession advice. Information may
depend on your circumstances and may change. Please verify important requirements with the relevant
official authority or a qualified professional.</p>
<p style="margin:0 0 6px;font-size:12px;color:#888">Lex may produce incomplete or incorrect
information. To report an issue or contact Clarvia, please use the
<a href="https://clarvia.org/en#contact" style="color:#888">contact form</a> on our website.</p>
<p style="margin:0 0 6px;font-size:12px;color:#888">Tip: long conversation threads can become
difficult for Lex to follow. For the best results, send a new message
rather than replying after 8 or more exchanges in the same thread.</p>
<p style="margin:0;font-size:12px;color:#888">
<a href="https://clarvia.org/en/privacy" style="color:#888">Privacy Policy</a> &middot;
<a href="https://clarvia.org/en#contact" style="color:#888">Contact Clarvia</a> &middot;
<a href="https://clarvia.org/en" style="color:#888">clarvia.org</a></p>
</div>
""".strip()

FOOTER_TEXT = """
Clarvia is a nonprofit. If you found this helpful, please consider making a donation to keep this service free for everyone who needs it:
https://clarvia.org/en/support

We're also looking for volunteers to help develop our open-source tools. If you'd like to contribute, visit us on GitHub:
https://github.com/clarvia-org

Lex is Clarvia's AI-powered information service. It uses Clarvia's source-backed workflow system to organise official rules, requirements, documents, deadlines and contact information into practical guidance and signposting.

Clarvia does not provide emergency, legal, tax, medical, psychological, notarial, banking, financial or succession advice. Information may depend on your circumstances and may change. Please verify important requirements with the relevant official authority or a qualified professional.

Lex may produce incomplete or incorrect information. To report an issue or contact Clarvia, please use the contact form on our website:
https://clarvia.org/en#contact

Tip: long conversation threads can become difficult for Lex to follow. For the best results, send a new message rather than replying after 8 or more exchanges in the same thread.

Privacy Policy: https://clarvia.org/en/privacy
Contact Clarvia: https://clarvia.org/en#contact
Website: https://clarvia.org/en
""".strip()

# Deterministic operational response bodies. Each is a complete response body,
# signed "Lex.", passed through the same continuation + footer composer.

RATE_LIMIT_BODY = (
    "Our service is currently limited to 10 requests per day from the same "
    "address. This limit helps us keep the service free and available for "
    "everyone. Please try again tomorrow.\n\nLex."
)

RATE_LIMIT_BODY_EMERGENCY = (
    "Our service is currently limited to 10 requests per day from the same "
    "address. This limit helps us keep the service free and available for "
    "everyone. Please try again tomorrow. If someone is in immediate danger, "
    "contact the local emergency services where they are now.\n\nLex."
)

RECIPIENT_LIMIT_BODY = (
    "Lex can only process a request when no more than 10 people would receive "
    "the response. Please resend your question with a smaller To and CC list. "
    "The contents of this message have not been processed.\n\nLex."
)

ATTACHMENT_ONLY_BODY = (
    "Lex does not read attachments in this version. Please paste the key facts "
    "or your question into the message, including the country concerned.\n\nLex."
)

TECHNICAL_FAILURE_BODY = (
    "I\u2019m sorry, but Lex could not prepare a reliable response to this "
    "request. Please try again later. Your question has not been answered."
    "\n\nLex."
)

TEMPORARY_UNAVAILABILITY_BODY = (
    "Lex is temporarily unavailable due to high demand. Please try again "
    "tomorrow. If someone is in immediate danger, contact the local emergency "
    "services where they are now.\n\nLex."
)


__all__ = [
    "LEX_FROM_NAME",
    "LEX_FROM_ADDRESS",
    "CONTINUATION_TEXT",
    "CONTINUATION_HTML",
    "FOOTER_HTML",
    "FOOTER_TEXT",
    "RATE_LIMIT_BODY",
    "RATE_LIMIT_BODY_EMERGENCY",
    "RECIPIENT_LIMIT_BODY",
    "ATTACHMENT_ONLY_BODY",
    "TECHNICAL_FAILURE_BODY",
    "TEMPORARY_UNAVAILABILITY_BODY",
]
