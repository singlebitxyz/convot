import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Convot collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-foreground/70">
        This page describes how Convot handles data. We are keeping this concise
        for now and will expand it as the product evolves.
      </p>

      <div className="mt-10 space-y-6 text-sm text-foreground/70 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            What we collect
          </h2>
          <p className="mt-2">
            Account information (email) and product usage data required to run
            the service. If you upload documents or provide URLs/text, that
            content is processed to build your bot’s knowledge base.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            How we use data
          </h2>
          <p className="mt-2">
            To provide the Convot product (authentication, bot training, chat
            responses, and analytics). We don’t sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            Questions? Reach out via the{" "}
            <a
              href="https://github.com/singlebitxyz/convot/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              support tracker
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="text-sm text-foreground/70 underline underline-offset-4 hover:text-foreground"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
