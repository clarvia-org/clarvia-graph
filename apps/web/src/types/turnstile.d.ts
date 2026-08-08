interface TurnstileInstance {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
    },
  ): string;
  remove(widgetId: string): void;
}

interface Window {
  turnstile?: TurnstileInstance;
}
