import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Living In West | Real Estate, Cities & Lifestyle",
  description:
    "Learn about Living In West, founded by Muhammad Afzal — an informational website covering US real estate, affordable cities, housing, relocation, construction, education, immigration, business, news, and everyday life.",
  alternates: {
    canonical: "https://livinginwest.com/about-us",
  },
};

const topics = [
  {
    title: "Real Estate & Housing",
    description:
      "Explore property markets, home prices, rental trends, homeownership, housing affordability, and property developments.",
    icon: "⌂",
  },
  {
    title: "US Cities & Cost of Living",
    description:
      "Compare cities, neighborhoods, living expenses, transportation, local amenities, and affordable places to live.",
    icon: "◎",
  },
  {
    title: "Moving & Relocation",
    description:
      "Research moving costs, neighborhoods, relocation planning, and practical considerations when choosing a new home.",
    icon: "↗",
  },
  {
    title: "Construction & Development",
    description:
      "Learn about construction activity, infrastructure, housing projects, urban development, and growing communities.",
    icon: "▦",
  },
  {
    title: "Education & Student Life",
    description:
      "Explore education options, student expenses, study opportunities, and practical information about student life.",
    icon: "▤",
  },
  {
    title: "Immigration & Government",
    description:
      "Read informational guides about visas, immigration processes, government programs, and policy developments.",
    icon: "◉",
  },
  {
    title: "Jobs, Careers & Business",
    description:
      "Discover employment trends, career information, entrepreneurship, business developments, and local economies.",
    icon: "↗",
  },
  {
    title: "Finance & Everyday Expenses",
    description:
      "Understand household budgeting, housing expenses, taxes, saving strategies, and personal finance topics.",
    icon: "$",
  },
  {
    title: "US News & Public Affairs",
    description:
      "Follow relevant developments in government, public policy, infrastructure, communities, and everyday life.",
    icon: "≡",
  },
  {
    title: "Travel & Destinations",
    description:
      "Discover destinations, regional highlights, travel planning ideas, and useful information for exploring new places.",
    icon: "✳",
  },
  {
    title: "Visa Information & Guides",
    description:
      "Learn about US visa types, application processes, required documents, and practical guidance for visitors, students, and workers.",
    icon: "▣",
  },
  {
    title: "Automotive & Transportation",
    description:
      "Explore vehicle information, automotive developments, transportation options, and mobility-related topics.",
    icon: "↔",
  },
];

const roles = [
  "Founder",
  "Software Developer",
  "Independent Research Writer",
];

const focusAreas = [
  "US Cities",
  "Housing & Real Estate",
  "Cost of Living",
  "Relocation",
  "Education",
  "Immigration",
  "Business & Economy",
];

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-white text-gray-800 transition-colors dark:bg-gray-950 dark:text-gray-200">
      {/* Founder Schema (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Muhammad Afzal",
            jobTitle: "Founder & Writer",
            description:
              "Software developer, digital entrepreneur, and independent research writer. Founder of Living In West and operator of AutoBrothers.pk.",
            image: "https://livinginwest.com/afzal.jpeg",
            url: "https://livinginwest.com/about-us",
            worksFor: {
              "@type": "Organization",
              name: "Living In West",
              url: "https://livinginwest.com",
            },
            knowsAbout: [
              "US Real Estate",
              "US Housing Market",
              "US Cities",
              "Automotive",
              "Software Development",
              "US Market Economics",
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-800/20" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-800/10" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-700 dark:text-violet-400">
            About Living In West
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-gray-950 dark:text-white md:text-6xl">
            Explore places. Understand opportunities. Make informed choices.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Living In West is an informational website exploring real estate,
            US cities, housing, relocation, education, business, government
            developments, and the many topics that shape everyday life.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Explore Articles →
            </Link>

            <Link
              href="/contact-us"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-white dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-10 md:py-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-400">
            Who We Are
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-950 dark:text-white md:text-4xl">
            Information for a changing world.
          </h2>
        </div>

        <div className="space-y-5 text-base leading-8 text-gray-600 dark:text-gray-300">
          <p>
            Choosing where to live, researching a property market, planning a
            move, or comparing education and career options often involves
            many connected decisions.
          </p>
          <p>
            Living In West aims to make these subjects easier to explore
            through accessible articles, practical guides, and information
            that helps readers identify the questions they need to research.
          </p>
          <p>
            Our primary editorial focus includes the United States, with
            relevant coverage of other Western countries and international
            developments where appropriate.
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="border-y border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-400">
              Our Coverage
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
              What We Cover
            </h2>
            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              Our articles cover a range of connected topics related to places,
              housing, opportunities, and everyday life.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <article
                key={topic.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:hover:border-violet-700"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {topic.icon}
                </div>

                <p className="mt-5 text-xs font-bold tracking-widest text-gray-400">
                  TOPIC {String(index + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                  {topic.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {topic.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission and editorial approach */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:px-10 md:py-20">
        <div className="rounded-3xl bg-gray-900 p-8 text-white md:p-10 dark:bg-gray-800">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
            Our Mission
          </p>
          <h2 className="mt-5 text-3xl font-bold leading-tight">
            Make useful information easier to understand.
          </h2>
          <p className="mt-5 leading-8 text-gray-300">
            We aim to publish accessible information that helps readers
            research cities, housing, relocation, education, business, and
            everyday opportunities with greater confidence.
          </p>
        </div>

        <div className="py-2">
          <h2 className="text-3xl font-bold text-gray-950 dark:text-white">
            Our Editorial Approach
          </h2>

          <div className="mt-6 space-y-5 leading-8 text-gray-600 dark:text-gray-300">
            <p>
              Depending on the subject, our articles may draw on official
              government resources, public datasets, research publications,
              institutional information, and other identifiable sources.
            </p>
            <p>
              We recognize that prices, regulations, statistics, and policies
              can change. Readers should check publication dates and verify
              important details through original and authoritative sources.
            </p>
            <p>
              Some content may be developed with the assistance of AI tools.
              We aim to review material for clarity and usefulness, while
              recognizing that important claims may require independent
              verification.
            </p>
          </div>
        </div>
      </section>

      {/* Founder & Writer */}
      <section className="border-y border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          {/* Section heading */}
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-400">
              Our Team
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
              Meet the Founder &amp; Writer
            </h2>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            {/* ===== Photo column ===== */}
            <div>
              <div className="relative mx-auto w-full max-w-sm lg:mx-0">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-violet-200/60 via-transparent to-blue-200/60 blur-xl dark:from-violet-900/40 dark:to-blue-900/30" />

                <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
                  <Image
                    src="/afzal.jpeg"
                    alt="Muhammad Afzal — Founder and Writer of Living In West"
                    width={640}
                    height={640}
                    className="aspect-square w-full object-cover"
                  />

                  <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-gray-950 dark:text-white">
                        Muhammad Afzal
                      </p>

                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Founder
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus areas */}
              <div className="mx-auto mt-6 w-full max-w-sm lg:mx-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Focus Areas
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== Bio column ===== */}
            <div>
              <div className="space-y-5 text-base leading-8 text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-900 dark:text-white">
                    Muhammad Afzal
                  </strong>{" "}
                  is a software developer, digital entrepreneur, and
                  independent research writer with an interest in technology,
                  business, automobiles, and life in the United States.
                </p>

                <p>
                  He founded Living In West to help readers better understand
                  life in America through practical, research-based articles
                  on cities, housing, real estate, cost of living, relocation,
                  education, immigration, business, and emerging developments.
                  His work focuses on gathering information from reliable
                  sources, reviewing available data, and presenting complex
                  topics in a clear and accessible way.
                </p>

                <p>
                  With a background in website development and experience
                  working on digital projects, Afzal combines his technical
                  knowledge with an interest in research, online publishing,
                  and useful information for everyday readers.
                </p>

                <p>
                  Through Living In West, Afzal aims to make reliable
                  information easier to understand and help readers make more
                  informed decisions about living, working, studying, and
                  exploring opportunities in the United States.
                </p>
              </div>

              {/* AutoBrothers card */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl text-orange-500 dark:bg-orange-950">
                    ⚙
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-950 dark:text-white">
                      Also operates AutoBrothers.pk
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
                      He also operates{" "}
                      <Link
                        href="https://autobrothers.pk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-orange-600 hover:underline dark:text-orange-400"
                      >
                        AutoBrothers.pk
                      </Link>
                      , an automotive-focused business website covering used
                      and imported auto parts, engines, vehicle components,
                      and automotive-related information. This work reflects
                      his broader interest in automobiles, technology, and
                      practical business solutions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Editorial approach */}
              <div className="mt-6 rounded-2xl bg-violet-50 p-6 dark:bg-violet-950/40">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  Editorial Approach
                </p>

                <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-300">
                  His articles are developed through independent research,
                  with an emphasis on factual accuracy, clear explanations,
                  and relevant sources. Living In West provides informational
                  content and does not replace professional legal, financial,
                  real estate, or immigration advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reader transparency */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="rounded-3xl border border-gray-200 p-8 md:p-10 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
            Information for Our Readers
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-gray-600 dark:text-gray-300">
            Living In West provides general informational and educational
            content. Our articles do not replace professional legal,
            immigration, financial, medical, or real estate advice. Prices,
            policies, and requirements may change, so readers should verify
            important information and consult qualified professionals when
            appropriate.
          </p>

          <Link
            href="/disclaimer"
            className="mt-5 inline-flex font-semibold text-violet-700 underline underline-offset-4 dark:text-violet-400"
          >
            Read our Disclaimer →
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-10 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-400">
              Get in Touch
            </p>

            <h2 className="mt-4 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
              We welcome your feedback.
            </h2>

            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              Have a question, suggestion, or correction about our content?
              Visit our Contact page to get in touch.
            </p>
          </div>

          <Link
            href="/contact-us"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-violet-700 px-7 py-4 font-semibold text-white transition hover:bg-violet-800"
          >
            Contact Living In West →
          </Link>
        </div>
      </section>
    </main>
  );
}