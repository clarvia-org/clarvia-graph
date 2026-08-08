"use client";

import DonationLandingPage from "@/features/donations/DonationLandingPage";
import { DEFAULT_CONFIG } from "@/features/donations/landing-page-config";

export default function SupportPage() {
  return <DonationLandingPage config={DEFAULT_CONFIG} />;
}
