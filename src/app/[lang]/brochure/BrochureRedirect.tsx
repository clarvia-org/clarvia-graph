"use client";

import { useEffect } from "react";

export default function BrochureRedirect() {
  useEffect(() => {
    window.location.replace("/brochure.html");
  }, []);

  return null;
}
