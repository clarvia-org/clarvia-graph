"""Approved, application-owned email text.

Every constant here is reviewed content that the model must never generate. The
footer is reproduced from the approved composition templates and must not be
paraphrased. Deterministic operational bodies each end with the required
``Lex.`` sign-off so they pass through the same composer.
"""

from __future__ import annotations

LEX_FROM_NAME = "Lex from Clarvia"
LEX_FROM_ADDRESS = "lex@clarvia.org"

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
<a href="https://clarvia.org/en/contact" style="color:#888">contact form</a> on our website.</p>
<p style="margin:0 0 6px;font-size:12px;color:#888">Tip: Lex can continue a conversation for up to
five replies in the same email thread. For further help after that, send a new email to
<a href="mailto:lex@clarvia.org" style="color:#888">lex@clarvia.org</a> with a short summary.</p>
<p style="margin:0;font-size:12px;color:#888">
<a href="https://clarvia.org/en/privacy" style="color:#888">Privacy Policy</a> &middot;
<a href="https://clarvia.org/en/contact" style="color:#888">Contact Clarvia</a> &middot;
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
https://clarvia.org/en/contact

Tip: Lex can continue a conversation for up to five replies in the same email thread. For further help after that, send a new email to lex@clarvia.org with a short summary.

Privacy Policy: https://clarvia.org/en/privacy
Contact Clarvia: https://clarvia.org/en/contact
Website: https://clarvia.org/en
""".strip()

# Appended after the LLM body (which already ends with Lex.) on the 5th reply.
THREAD_LAST_REPLY_NOTE = (
    "Note: This is the last Lex reply in this thread. Further replies here will "
    "not be processed. For more help, send a new email to lex@clarvia.org with a "
    "short summary of your situation."
)

THREAD_LAST_REPLY_NOTE_HTML = (
    '<p style="margin:24px 0 0;font-family:sans-serif;font-size:14px;color:#222">'
    "Note: This is the last Lex reply in this thread. Further replies here will "
    "not be processed. For more help, send a new email to "
    '<a href="mailto:lex@clarvia.org">lex@clarvia.org</a> with a short summary '
    "of your situation."
    "</p>"
)

THREAD_CLOSED_BODY = (
    "Lex can only continue a conversation for five replies in the same email "
    "thread. This thread has reached that limit, so further replies here are "
    "not processed.\n\n"
    "To keep going, send a new email to lex@clarvia.org with a short summary of "
    "your situation and what you need next.\n\n"
    "Lex."
)

RATE_LIMIT_BODY = (
    "Lex can answer up to five emails per day from the same address. Today's "
    "limit has been reached, so this message was not processed.\n\n"
    "Your full daily quota of five will be available again tomorrow. If you "
    "still need help then, reply in your existing thread (if it still has Lex "
    "replies left) or send a new email to lex@clarvia.org.\n\n"
    "Lex."
)

RATE_LIMIT_SUBJECT = "Lex daily limit reached"

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
    "I\u2019m sorry \u2014 this is a lot to hold at once, and I couldn\u2019t finish "
    "a full verified answer in one pass. Reply with the country (or countries) "
    "involved, the city or commune if you know it, and the main thing you need "
    "help with first. I\u2019ll continue from there.\n\nLex."
)

TEMPORARY_UNAVAILABILITY_BODY = (
    "Lex is temporarily unavailable due to high demand. Please try again "
    "tomorrow. If someone is in immediate danger, contact the local emergency "
    "services where they are now.\n\nLex."
)


__all__ = [
    "LEX_FROM_NAME",
    "LEX_FROM_ADDRESS",
    "FOOTER_HTML",
    "FOOTER_TEXT",
    "THREAD_LAST_REPLY_NOTE",
    "THREAD_LAST_REPLY_NOTE_HTML",
    "THREAD_CLOSED_BODY",
    "RATE_LIMIT_BODY",
    "RATE_LIMIT_SUBJECT",
    "RECIPIENT_LIMIT_BODY",
    "ATTACHMENT_ONLY_BODY",
    "TECHNICAL_FAILURE_BODY",
    "TEMPORARY_UNAVAILABILITY_BODY",
]
