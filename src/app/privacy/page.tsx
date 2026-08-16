import Link from 'next/link';

const SUPPORT_EMAIL = 'blacklimitless888@gmail.com';

export const metadata = {
  title: 'Privacy Policy | Black Limitless',
  description: 'Privacy Policy for Black Limitless.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-vault-bg px-5 py-12 text-vault-textPrimary">
      <article className="mx-auto max-w-3xl rounded-3xl border border-vault-border bg-vault-card p-7 md:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-vault-accent">Black Limitless</p>
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-vault-textSecondary">Last updated: August 16, 2026</p>

        <div className="mt-10 space-y-8 text-vault-textSecondary">
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">Information we collect</h2>
            <p>
              We collect the information needed to operate Black Limitless, including account details, profile details,
              bookings, deal redemptions, and optional photos or location details that you choose to provide.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">How we use information</h2>
            <p>
              We use information to provide memberships, local deals, bookings, support, fraud prevention, and product
              improvements. Payments are processed by Stripe. Authentication, data storage, and media hosting are
              provided by service providers that process data on our behalf.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">Sharing and retention</h2>
            <p>
              We do not sell personal information. We only share information with businesses when it is necessary to
              deliver a booking, redemption, or other service you request, and with service providers supporting the app.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">Your choices</h2>
            <p>
              You can update your profile in the app. You can permanently delete your account from Profile → Delete
              Account; deletion also cancels an active membership. Contact us if you need help with a privacy request.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">Contact</h2>
            <a className="font-semibold text-vault-accent underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </section>
        </div>

        <p className="mt-10 text-sm text-vault-textSecondary">
          Need help? <Link className="font-semibold text-vault-accent underline" href="/support">Contact support</Link>.
        </p>
      </article>
    </main>
  );
}
