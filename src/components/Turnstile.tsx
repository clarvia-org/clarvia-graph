"use client";

import { useEffect, useRef } from "react";

const TURNSTILE_SITE_KEY = "0x4AAAAAAC_ookARAIHfv7sG";

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const render = () => {
      if (!containerRef.current || widgetId.current !== undefined) return;
      const w = (window as any).turnstile;
      if (!w) return;
      widgetId.current = w.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onVerify,
        "expired-callback": () => onVerify(""),
        theme: "light",
        size: "flexible",
      });
    };

    if ((window as any).turnstile) {
      render();
    } else {
      const check = setInterval(() => {
        if ((window as any).turnstile) { render(); clearInterval(check); }
      }, 200);
      return () => clearInterval(check);
    }
  }, [onVerify]);

  useEffect(() => {
    return () => {
      if (widgetId.current !== undefined) {
        (window as any).turnstile?.remove(widgetId.current);
        widgetId.current = undefined;
      }
    };
  }, []);

  return <div ref={containerRef} className="mt-1" />;
}
