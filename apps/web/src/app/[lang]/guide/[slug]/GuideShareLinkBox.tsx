"use client";

import Link from "next/link";
import { type HTMLAttributes, useEffect, useId, useMemo, useRef } from "react";
import { headlineStyle } from "@/app/[lang]/data";
import { getGuideUiCopy } from "@/content/corridor-guide-ui";
import { trackGuideShareCopy } from "@/lib/analytics";
import type { Lang } from "@/lib/i18n";

export type CopyKind = "url" | "html" | "text";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildGuideHtmlSnippet(params: {
  canonicalUrl: string;
  anchorTitle: string;
  suffix: string;
}): string {
  return `<a href="${escapeHtml(params.canonicalUrl)}">${escapeHtml(params.anchorTitle)}</a> — ${escapeHtml(params.suffix)}`;
}

export function buildGuideTextSnippet(params: {
  canonicalUrl: string;
  anchorTitle: string;
  suffix: string;
}): string {
  return `${params.anchorTitle} — ${params.suffix}: ${params.canonicalUrl}`;
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacyCopy(text);
    }
  }
  return legacyCopy(text);
}

interface InvokerCommandEvent extends Event {
  command?: string;
  source?: Element | null;
}

function ShareCopyControl({
  command,
  commandFor,
  copyKind,
  label,
}: {
  command: `--copy-${CopyKind}`;
  commandFor: string;
  copyKind: CopyKind;
  label: string;
}) {
  const invokerProps = {
    command,
    commandfor: commandFor,
  } as unknown as HTMLAttributes<HTMLButtonElement>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        {...invokerProps}
        data-copy-kind={copyKind}
        className="group inline-flex items-center gap-1.5 min-h-11 min-w-6 px-3.5 py-2 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 text-xs sm:text-sm font-semibold text-calm-blue-800 cursor-pointer motion-reduce:transition-none data-[copied]:border-emerald-300 data-[copied]:bg-emerald-50 data-[copied]:text-emerald-800 data-[failed]:border-rose-300 data-[failed]:bg-rose-50 data-[failed]:text-rose-800"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 block group-data-[copied]:hidden group-data-[failed]:hidden"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 hidden group-data-[copied]:block"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 hidden group-data-[failed]:block"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span>{label}</span>
      </button>
      <span
        role="status"
        className="text-xs font-semibold text-calm-blue-700 transition-opacity duration-150 motion-reduce:transition-none opacity-0 pointer-events-none data-[visible]:opacity-100 data-[failed]:text-rose-700"
      />
    </span>
  );
}

export default function GuideShareLinkBox({
  slug,
  lang,
  siteLang,
  canonicalUrl,
  anchorTitle,
  boxId = "link-this-guide",
  heading,
  body,
  snippetSuffix,
  plainTextOverride,
}: {
  slug: string;
  lang: string;
  siteLang: Lang;
  canonicalUrl: string;
  anchorTitle: string;
  boxId?: string;
  heading?: string;
  body?: string;
  snippetSuffix?: string;
  plainTextOverride?: string;
}) {
  const ui = useMemo(() => getGuideUiCopy(lang), [lang]);
  const baseId = useId();
  const urlInputId = `${baseId}-url`;
  const htmlCodeId = `${baseId}-html`;
  const htmlCaptionId = `${baseId}-html-caption`;
  const textCodeId = `${baseId}-text`;
  const textCaptionId = `${baseId}-text-caption`;

  const resolvedSuffix = snippetSuffix ?? ui.shareSnippetSuffix;
  const resolvedHeading = heading ?? ui.shareBoxHeading;
  const resolvedBody = body ?? ui.shareBoxBody;
  const headingId = `${boxId}-heading`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<WeakMap<HTMLButtonElement, number>>(new WeakMap());
  const rafsRef = useRef<WeakMap<HTMLButtonElement, number>>(new WeakMap());
  const activeButtonsRef = useRef<Set<HTMLButtonElement>>(new Set());
  const lastAnnouncementRef = useRef<string>("");

  const htmlSnippet = useMemo(
    () =>
      buildGuideHtmlSnippet({
        canonicalUrl,
        anchorTitle,
        suffix: resolvedSuffix,
      }),
    [canonicalUrl, anchorTitle, resolvedSuffix],
  );

  const textSnippet = useMemo(
    () =>
      plainTextOverride ??
      buildGuideTextSnippet({
        canonicalUrl,
        anchorTitle,
        suffix: resolvedSuffix,
      }),
    [plainTextOverride, canonicalUrl, anchorTitle, resolvedSuffix],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timers = timersRef.current;
    const rafs = rafsRef.current;
    const activeButtons = activeButtonsRef.current;

    function clearPendingForButton(button: HTMLButtonElement) {
      const prevTimer = timers.get(button);
      if (prevTimer !== undefined) {
        window.clearTimeout(prevTimer);
        timers.delete(button);
      }
      const prevRaf = rafs.get(button);
      if (prevRaf !== undefined) {
        window.cancelAnimationFrame(prevRaf);
        rafs.delete(button);
      }
    }

    function report(button: HTMLButtonElement, ok: boolean) {
      const tip = button.nextElementSibling;
      clearPendingForButton(button);

      button.removeAttribute("data-copied");
      button.removeAttribute("data-failed");

      let message = ok ? ui.shareCopiedStatus : ui.shareCopyFailedStatus;
      if (message === lastAnnouncementRef.current) {
        message += "\u00A0";
      }
      lastAnnouncementRef.current = message;

      if (tip instanceof HTMLElement) {
        tip.removeAttribute("data-visible");
        tip.removeAttribute("data-failed");
        tip.textContent = "";
      }

      void button.offsetWidth;
      button.setAttribute(ok ? "data-copied" : "data-failed", "");
      if (tip instanceof HTMLElement && !ok) {
        tip.setAttribute("data-failed", "");
      }

      const rafId = window.requestAnimationFrame(() => {
        rafs.delete(button);
        if (tip instanceof HTMLElement) {
          tip.setAttribute("data-visible", "");
          tip.textContent = message;
        }
      });
      rafs.set(button, rafId);
      activeButtons.add(button);

      const timerId = window.setTimeout(() => {
        button.removeAttribute("data-copied");
        button.removeAttribute("data-failed");
        if (tip instanceof HTMLElement) {
          tip.removeAttribute("data-visible");
          tip.removeAttribute("data-failed");
          tip.textContent = "";
        }
        timers.delete(button);
        activeButtons.delete(button);
      }, 2000);
      timers.set(button, timerId);
    }

    async function handleCopy(button: HTMLButtonElement, target: HTMLElement) {
      const raw =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
          ? target.value
          : (target.textContent ?? "");
      const text = raw.trim();
      if (!text) return;

      const ok = await copyTextToClipboard(text);
      report(button, ok);

      if (ok) {
        const copyKind = button.dataset.copyKind as CopyKind | undefined;
        if (copyKind === "url" || copyKind === "html" || copyKind === "text") {
          trackGuideShareCopy({
            slug,
            language: lang === "lu" ? "lb" : lang,
            copy_format: copyKind,
          });
        }
      }
    }

    const cleanupPending = () => {
      for (const btn of activeButtons) {
        clearPendingForButton(btn);
      }
      activeButtons.clear();
    };

    if ("CommandEvent" in window) {
      const onCommand = (event: Event) => {
        const cmdEvent = event as InvokerCommandEvent;
        if (!cmdEvent.command?.startsWith("--copy")) return;
        const button = cmdEvent.source;
        const target = cmdEvent.target;
        if (button instanceof HTMLButtonElement && target instanceof HTMLElement) {
          void handleCopy(button, target);
        }
      };

      container.addEventListener("command", onCommand, true);
      return () => {
        container.removeEventListener("command", onCommand, true);
        cleanupPending();
      };
    }

    const onClick = (event: MouseEvent) => {
      const targetEl = event.target;
      if (!(targetEl instanceof Element)) return;
      const button = targetEl.closest('button[command^="--copy"]');
      if (!(button instanceof HTMLButtonElement)) return;
      const commandForId = button.getAttribute("commandfor");
      const target = commandForId ? document.getElementById(commandForId) : null;
      if (target instanceof HTMLElement) {
        void handleCopy(button, target);
      }
    };

    container.addEventListener("click", onClick);
    return () => {
      container.removeEventListener("click", onClick);
      cleanupPending();
    };
  }, [slug, lang, ui.shareCopiedStatus, ui.shareCopyFailedStatus]);

  return (
    <div
      ref={containerRef}
      id={boxId}
      className="mt-8 p-5 sm:p-6 rounded-xl bg-white/65 border border-calm-blue-200"
    >
      <h2
        id={headingId}
        className="text-base sm:text-lg font-semibold text-calm-blue-800 mb-1.5"
        style={headlineStyle}
      >
        {resolvedHeading}
      </h2>
      <p className="text-sm text-calm-blue-600 leading-relaxed mb-4">
        {resolvedBody}
      </p>

      <label
        htmlFor={urlInputId}
        className="block text-xs font-semibold text-calm-blue-700 mb-1.5"
      >
        {ui.shareUrlLabel}
      </label>
      <input
        id={urlInputId}
        type="text"
        readOnly
        dir="ltr"
        value={canonicalUrl}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full min-h-11 px-3.5 py-2 rounded-lg border border-calm-blue-200 bg-white text-xs sm:text-sm text-calm-blue-800 font-mono text-left"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ShareCopyControl
          command="--copy-url"
          commandFor={urlInputId}
          copyKind="url"
          label={ui.shareCopyUrlButton}
        />
        <ShareCopyControl
          command="--copy-html"
          commandFor={htmlCodeId}
          copyKind="html"
          label={ui.shareCopyHtmlButton}
        />
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-semibold text-calm-blue-700 hover:text-calm-blue-900 select-none py-1">
          {ui.sharePreviewSummary}
        </summary>
        <div className="mt-3 pt-3 border-t border-calm-blue-100">
          <p id={htmlCaptionId} className="text-xs font-semibold text-calm-blue-700 mb-1">
            {ui.shareHtmlLabel}
          </p>
          <pre
            role="region"
            aria-labelledby={htmlCaptionId}
            tabIndex={0}
            dir="ltr"
            className="overflow-x-auto rounded-lg border border-calm-blue-200 bg-white p-3 text-xs text-calm-blue-800 font-mono text-left"
          >
            <code id={htmlCodeId}>{htmlSnippet}</code>
          </pre>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p id={textCaptionId} className="text-xs font-semibold text-calm-blue-700">
              {ui.shareTextLabel}
            </p>
            <ShareCopyControl
              command="--copy-text"
              commandFor={textCodeId}
              copyKind="text"
              label={ui.shareCopyTextButton}
            />
          </div>
          <pre
            role="region"
            aria-labelledby={textCaptionId}
            tabIndex={0}
            className="mt-1 overflow-x-auto rounded-lg border border-calm-blue-200 bg-white p-3 text-xs text-calm-blue-800 font-mono whitespace-pre-wrap break-words"
          >
            <code id={textCodeId}>{textSnippet}</code>
          </pre>

          <p className="mt-3 text-xs">
            <Link
              href={`/${siteLang}/partners`}
              className="font-medium text-calm-blue-600 underline hover:text-calm-blue-800"
            >
              {ui.sharePartnersLinkLabel}
            </Link>
          </p>
        </div>
      </details>
    </div>
  );
}
