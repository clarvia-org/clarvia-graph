"use client";

import { useState, useCallback } from "react";

export function useForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = useCallback(async (url: string, data: Record<string, string>, onSuccess?: () => void) => {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const r = await res.json();
        throw new Error(r.error || "Something went wrong");
      }
      setStatus("sent");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, []);

  return { status, errorMsg, submit, reset: () => setStatus("idle") };
}
