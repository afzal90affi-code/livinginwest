import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | Living In West",
  description:
   "Disclaimer for Living In West: information accuracy, external links, AI-assisted content, advertising and professional advice.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#6D28D9]">
            Living In West
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Disclaimer
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* General Information */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            1. General Information
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            The information provided on Living In West (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is for
            general informational and educational purposes only. All information on this site is provided
            in good faith; however, we make no representation or warranty of any kind, express or implied,
            regarding the accuracy, adequacy, validity, reliability, availability or completeness of any
            information on the site.
          </p>
        </section>

        {/* Not Professional Advice */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            2. Not Professional Advice
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            Content on this website — including articles about travel, visas, housing, cost of living,
            finance and USA lifestyle — is not professional, legal, immigration or financial advice.
            Before making decisions based on any information from this site, you should consult a
            qualified professional (licensed immigration consultant, financial advisor, or attorney).
            Your use of this site does not create any advisor-client relationship.
          </p>
        </section>

        {/* External Links */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            3. External Links
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            This site may contain links to external websites — including government sources
            (USCIS, HUD), news publications and other third-party content. Some articles on this site
            are summaries of publicly available news, with links to original sources. Such external
            links are not investigated, monitored or checked for accuracy by us. We do not warrant,
            endorse or assume any liability for the accuracy or completeness of any information on
            third-party websites.
          </p>
        </section>

        {/* AI-Generated Content */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            4. AI-Assisted Content
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            Some articles on this site may be created with the assistance of artificial intelligence
            tools and editorial review. While we strive for accuracy, AI-generated summaries may contain
            errors or omissions. Always verify important information — especially visa rules, deadlines,
            prices and legal requirements — through official government websites before acting on it.
          </p>
        </section>

        {/* Errors and Omissions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            5. Errors and Omissions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            While we strive to keep information up to date and correct, laws, regulations, prices,
            procedures and policies change frequently. Living In West is not responsible for any errors
            or omissions, or for the results obtained from the use of this information. Content may
            change without notice.
          </p>
        </section>

        {/* Images & Media */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            6. Images &amp; Media
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            Some images used on this site may be sourced from third-party providers (stock photo
            services, AI-generated images) or used under license for editorial purposes. If you
            believe any image or content infringes your rights, please contact us through our{" "}
            <Link href="/contact-us" className="text-[#6D28D9] dark:text-purple-400 hover:underline font-semibold">
              Contact page
            </Link>{" "}
            and we will review and remove it promptly.
          </p>
        </section>

        {/* Consent */}
        <section>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
    7. No Government Affiliation &amp; Advertising
  </h2>
  <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
    Living In West is an independent website and is not affiliated with, endorsed by or
    connected to USCIS, HUD or any other government agency. This site may display
    advertisements from third-party networks such as Google AdSense and may contain
    affiliate links. We may earn compensation from these, which does not influence our
    editorial content. See our Privacy Policy for how cookies are used.
  </p>
</section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            8. Contact
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-7">
            If you have any questions about this Disclaimer, please reach out via our{" "}
            <Link href="/contact-us" className="text-[#6D28D9] dark:text-purple-400 hover:underline font-semibold">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}