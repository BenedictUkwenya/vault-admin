import Link from 'next/link';

const SUPPORT_EMAIL = 'blacklimitless888@gmail.com';

export const metadata = {
  title: 'Support | Black Limitless',
  description: 'Get support for Black Limitless.',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-vault-bg px-5 py-12 text-vault-textPrimary">
      <section className="mx-auto max-w-2xl rounded-3xl border border-vault-border bg-vault-card p-7 md:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-vault-accent">Black Limitless</p>
        <h1 className="font-display text-4xl font-bold">Support</h1>
        <p className="mt-4 leading-7 text-vault-textSecondary">
          Need help with your account, booking, deal redemption, membership, payment, or privacy request? Email our
          support team and include the email address on your Black Limitless account.
        </p>
        <a
          className="mt-8 inline-flex rounded-xl bg-vault-accent px-5 py-3 font-semibold text-black transition-opacity hover:opacity-90"
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Black Limitless support request')}`}
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="mt-10 text-sm text-vault-textSecondary">
          Read our <Link className="font-semibold text-vault-accent underline" href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
