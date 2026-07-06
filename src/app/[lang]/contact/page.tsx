import { Metadata } from "next";
import ContactRedirect from "./ContactRedirect";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <ContactRedirect />;
}
