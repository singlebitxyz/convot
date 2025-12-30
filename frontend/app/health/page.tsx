import type { Metadata } from "next";
import { HealthClient } from "./health-client";

export const metadata: Metadata = {
  title: "System health",
  description: "Internal system health and performance metrics for Convot.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HealthPage() {
  return <HealthClient />;
}
