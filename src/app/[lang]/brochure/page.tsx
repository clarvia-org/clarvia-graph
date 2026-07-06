import { Metadata } from "next";
import BrochureRedirect from "./BrochureRedirect";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <BrochureRedirect />;
}
