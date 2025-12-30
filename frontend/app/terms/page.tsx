import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Convot.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-4 text-foreground/70">
        These terms govern use of Convot. This is a lightweight placeholder so
        the site has valid, crawlable legal pages; you should replace this with
        your finalized terms.
      </p>

      <div className="mt-10 space-y-6 text-sm text-foreground/70 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Acceptable use
          </h2>
          <p className="mt-2">
            Don’t use Convot for illegal activity, to infringe rights, or to
            harm others. You are responsible for the content you upload and the
            bots you deploy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Service</h2>
          <p className="mt-2">
            Convot is provided “as is” without warranties. Features may change
            over time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            For questions, use the{" "}
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
