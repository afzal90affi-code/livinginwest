import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Living In West',
  description:
    'How Living In West (livinginwest.com) collects, uses, shares, and protects your information, including cookies, Google AdSense advertising, and your GDPR & CCPA privacy rights.',
  alternates: { canonical: 'https://livinginwest.com/privacy-policy' },
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-white dark:bg-gray-950 py-20 md:py-32 transition-colors">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 text-gray-900 dark:text-gray-100">
          Privacy Policy
        </h1>

        <div className="prose prose-lg prose-gray max-w-none space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            <em>Last updated: November 24, 2026</em>
          </p>

          <p>
            This Privacy Policy explains how <strong>Living In West</strong> (“we”, “us”, or “our”)
            collects, uses, shares, and protects your information when you visit{' '}
            <strong>livinginwest.com</strong> (the “Site”), read our articles, subscribe to our
            newsletter, or contact us. Living In West is an independent digital publication that
            provides guides and practical information on immigration, finance, health, travel,
            food, and everyday life for people who are planning to move to — or are already living
            in — Western countries.
          </p>
          <p>
            By using the Site, you agree to the practices described in this policy. If you do not
            agree with any part of it, please stop using the Site. This policy applies only to
            information collected through the Site and the services we control. It does not apply
            to third-party websites we link to, or to the practices of advertising partners, which
            are described in their own privacy policies and in the relevant sections below.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>We collect two broad categories of information:</p>
          <p>
            <strong>Information you provide directly.</strong> This is information you choose to
            give us, for example:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Newsletter sign-up:</strong> your name (optional) and email address, so we
              can send you articles, guides, and updates you have asked for.
            </li>
            <li>
              <strong>Contact forms and email:</strong> your name, email address, and the content
              of your message when you contact us through our contact page or write to us by
              email.
            </li>
          </ul>
          <p>
            <strong>Information collected automatically.</strong> Like most websites, our servers
            and analytics tools automatically log certain technical information when you browse,
            including your IP address, browser type and version, device type, operating system,
            referring website, the pages you view, the time you spend on pages, and your
            approximate location (derived from your IP address). This data helps us operate,
            secure, and improve the Site and is not used to identify you personally.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>operate, maintain, and improve the Site and its content;</li>
            <li>
              send you newsletters and updates you have requested — you can unsubscribe at any
              time using the link included in every email;
            </li>
            <li>respond to your questions, feedback, and support requests;</li>
            <li>
              analyze readership patterns (which topics are read, where readers come from) so we
              can improve our articles, layout, and performance;
            </li>
            <li>
              display advertising on the Site, including personalized advertising through Google
              AdSense (see Section 5);
            </li>
            <li>detect, prevent, and address fraud, abuse, and security issues;</li>
            <li>comply with our legal obligations.</li>
          </ul>
          <p>
            <strong>Legal bases (for visitors in the EEA and UK):</strong> we process your
            personal data on the following grounds — your <em>consent</em> (marketing emails and
            non-essential cookies), our <em>legitimate interests</em> (running, securing, funding,
            and improving the Site, including through advertising), and <em>legal obligations</em>{' '}
            where applicable.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            3. Cookies &amp; Similar Technologies
          </h2>
          <p>
            Cookies are small text files that websites store on your device to remember
            information about you. We use both first-party cookies (set by the Site) and
            third-party cookies (set by our service and advertising partners). The Site uses the
            following categories of cookies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Essential cookies</strong> — necessary for the Site to function, such as
              session management and security features. These cannot be switched off.
            </li>
            <li>
              <strong>Analytics cookies</strong> — help us understand how visitors use the Site
              (pages visited, referral sources, devices) so we can improve our content.
            </li>
            <li>
              <strong>Advertising cookies</strong> — set by Google AdSense and its partner vendors
              to serve ads, limit how often you see the same ad, measure campaign performance, and
              (with your consent) make ads more relevant to you.
            </li>
          </ul>
          <p>
            You can control or delete cookies through your browser settings; each browser works
            differently, so check your browser’s help menu for instructions. Please note that
            blocking some cookies may affect how parts of the Site work. Where required by law —
            for example, for visitors in the European Union or the United Kingdom — we ask for
            your consent before setting non-essential cookies, and you may change or withdraw that
            consent at any time.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            4. Analytics
          </h2>
          <p>
            We may use Google Analytics or similar analytics services to understand how visitors
            use the Site — for example, which articles are most read, how long visitors stay, and
            which pages send them to us. This information is aggregated and is not used to
            identify you personally. You can prevent Google Analytics from recognizing you on
            future visits by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            5. Google AdSense &amp; Advertising Cookies
          </h2>
          <p>
            We display advertising on the Site through Google AdSense. Advertising is what keeps
            Living In West free for readers, and it is funded entirely by ad revenue rather than
            by charging visitors.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Third-party vendors, including Google, use cookies (including the DoubleClick DART
              cookie) to serve ads based on your prior visits to this Site and other websites.
            </li>
            <li>
              Google’s use of advertising cookies enables it and its partners to serve ads to you
              based on your visit to our Site and/or other sites on the Internet.
            </li>
            <li>
              These cookies may use information about your visits to this and other sites — but
              not your name, address, email address, or telephone number — to serve more relevant
              advertisements.
            </li>
          </ul>
          <p>
            You may opt out of personalized advertising at any time by visiting{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also
            opt out of many third-party vendors’ use of cookies for personalized advertising by
            visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a>,
            and visitors from the EEA or UK can manage their advertising preferences at{' '}
            <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">www.youronlinechoices.com</a>. Opting out
            does not mean you will stop seeing ads — it means the ads you see will be less
            relevant to your interests. Where required by law, we will obtain your consent before
            advertising cookies are set or personalized ads are served.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            6. Third-Party Links &amp; Affiliate Content
          </h2>
          <p>
            Our articles regularly link to external websites — such as government portals (for
            example USCIS), official statistics, news sources, and useful tools. We are not
            responsible for the content or privacy practices of these third-party sites, and we
            encourage you to review their privacy policies before providing them with any
            personal information.
          </p>
          <p>
            From time to time, some articles may contain affiliate or sponsored links. If you make
            a purchase through an affiliate link, we may earn a small commission at no additional
            cost to you. Sponsored or affiliate content will always be identified as such. Any
            information you provide after clicking through to a third-party site is governed by
            that third party’s privacy policy, not ours.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            7. How We Share Information
          </h2>
          <p>
            We do not sell your personal information. We share it only in the following limited
            circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Service providers</strong> — trusted companies that help us operate the
              Site, such as hosting providers, email delivery services, analytics providers, and
              advertising partners (such as Google). These providers process data on our behalf or
              under their own privacy policies when serving ads.
            </li>
            <li>
              <strong>Legal reasons</strong> — when we believe it is required by law, legal
              process, or government request, or when necessary to protect the rights, property,
              or safety of Living In West, our readers, or others.
            </li>
            <li>
              <strong>Business transfers</strong> — if Living In West is ever involved in a
              merger, acquisition, or sale of assets, your information may be transferred as part
              of that transaction, and this policy would continue to apply to it.
            </li>
          </ul>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            8. Data Retention
          </h2>
          <p>
            We keep your personal information only as long as necessary for the purposes described
            in this policy. Newsletter subscription data is retained until you unsubscribe or ask
            us to delete it. Contact form messages and related correspondence are retained for up
            to 24 months so we can reference earlier conversations. Aggregated analytics data may
            be retained according to the settings of our analytics providers. We may retain
            certain information for longer where required by law, to resolve disputes, or to
            enforce our agreements.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            9. Data Security
          </h2>
          <p>
            We take reasonable technical and organizational measures to help protect your
            information from loss, theft, misuse, and unauthorized access — including serving the
            Site over HTTPS (encrypted connection) and limiting access to personal data to those
            who need it. However, no method of transmission over the Internet or method of
            electronic storage is 100% secure, and we cannot guarantee absolute security. Any
            transmission of information to us is at your own risk.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            10. Your Privacy Rights
          </h2>
          <p>Depending on where you live, you may have some or all of the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>to access the personal information we hold about you and request a copy;</li>
            <li>to correct inaccurate or incomplete information;</li>
            <li>to request deletion of your personal information;</li>
            <li>to restrict or object to certain processing, including direct marketing;</li>
            <li>to receive your data in a portable, commonly used format;</li>
            <li>to withdraw your consent at any time, without affecting prior processing.</li>
          </ul>
          <p>
            <strong>For visitors in the EEA and UK (GDPR):</strong> in addition to the rights
            above, you have the right to lodge a complaint with your national data protection
            authority if you believe we have processed your data unlawfully.
          </p>
          <p>
            <strong>For visitors in California (CCPA/CPRA):</strong> you have the right to know
            what personal information is collected, to delete it, to correct it, and to limit its
            use. We do not sell personal information for money. Some personalized advertising may
            be considered “sharing” under California law; you can opt out through{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>,{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a>, and any
            “Do Not Sell or Share My Personal Information” link we make available on the Site.
          </p>
          <p>
            <strong>Do Not Track:</strong> some browsers offer a “Do Not Track” (DNT) signal.
            Because there is no common industry standard for interpreting DNT, we do not currently
            respond to it; however, we honor opt-out preference signals such as Global Privacy
            Control (GPC) where required by law.
          </p>
          <p>
            <strong>How to exercise your rights:</strong> email us at{' '}
            <a href="mailto:contact@livinginwest.com">contact@livinginwest.com</a> or use our{' '}
            <Link href="/contact-us">contact page</Link>. We may need to verify
            your identity before acting on a request, and we will respond within the timeframe
            required by applicable law (generally within 30 days).
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            11. Children’s Privacy
          </h2>
          <p>
            The Site is not directed at children under 13 (or the equivalent minimum age in your
            jurisdiction), and we do not knowingly collect personal information from children. If
            you believe a child has provided us with personal information, please contact us and
            we will delete it promptly.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            12. International Data Transfers
          </h2>
          <p>
            Your information may be processed in the United States or other countries whose data
            protection laws may differ from those in your home country. Where we transfer
            personal data from the EEA or UK to a country that has not been recognized as
            providing an adequate level of protection, we rely on appropriate safeguards, such as
            the European Commission’s Standard Contractual Clauses.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            13. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our
            practices, our services, or the law. When we do, we will revise the “Last updated”
            date at the top of this page, and material changes will be highlighted on this page.
            Your continued use of the Site after any changes take effect means you accept the
            updated policy, so we encourage you to review it periodically.
          </p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            14. Contact Us
          </h2>
          <p>
            If you have questions, requests, or complaints about this Privacy Policy or about how
            we handle your personal information, you can reach us at:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Email: <a href="mailto:contact@livinginwest.com">contact@livinginwest.com</a>
            </li>
            <li>
              Contact page:{' '}
              <Link href="/contact-us">livinginwest.com/contact-us</Link>
            </li>
          </ul>
          <p>
            We aim to respond to every genuine privacy request within 30 days. For advertising or
            guest post inquiries, please use the relevant department on our contact page so your
            message reaches the right team faster.
          </p>
        </div>
      </div>
    </div>
  );
}
