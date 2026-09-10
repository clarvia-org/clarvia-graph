import AnalyticsRouteTracker from "@/components/AnalyticsRouteTracker";

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AnalyticsRouteTracker />
    </>
  );
}
