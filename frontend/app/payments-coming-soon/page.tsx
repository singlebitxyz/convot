import type { Metadata } from "next";
import { PaymentsComingSoonClient } from "./payments-coming-soon-client";

export const metadata: Metadata = {
  title: "Payments coming soon",
  description: "Payments are not yet enabled for Convot paid plans.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentsComingSoonPage() {
  return <PaymentsComingSoonClient />;
}

