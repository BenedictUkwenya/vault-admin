import Link from 'next/link';

const SUPPORT_EMAIL = 'blacklimitless888@gmail.com';

type PageProps = {
  params: Promise<{ code: string }> | { code: string };
};

export async function generateMetadata({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const code = String(resolved.code || '').toUpperCase();
  return {
    title: `You're invited | Black Limitless`,
    description: `Join Black Limitless with invite code ${code}.`,
  };
}

export default async function ReferralLandingPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const code = String(resolved.code || '')
    .trim()
    .toUpperCase();
  const deepLink = `blacklimitless://ref/${code}`;

  return (
    <main className="min-h-screen bg-vault-bg px-5 py-12 text-vault-textPrimary">
      <section className="mx-auto max-w-lg rounded-3xl border border-vault-border bg-vault-card p-7 md:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-vault-accent">Black Limitless</p>
        <h1 className="font-display text-4xl font-bold">You&apos;re invited</h1>
        <p className="mt-4 leading-7 text-vault-textSecondary">
          A friend shared Black Limitless with you. Open the app and create your account — your invite code will be
          ready for you.
        </p>

        <div className="mt-8 rounded-2xl border border-vault-border bg-vault-bg px-5 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-vault-textSecondary">Your invite code</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-wider text-vault-accent">{code || '—'}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            className="inline-flex items-center justify-center rounded-xl bg-vault-accent px-5 py-3.5 font-semibold text-black transition-opacity hover:opacity-90"
            href={deepLink}
          >
            Open in Black Limitless
          </a>
          <p className="text-center text-sm text-vault-textSecondary">
            Don&apos;t have the app yet? Download it, then enter code <strong className="text-vault-textPrimary">{code}</strong>{' '}
            when you register.
          </p>
        </div>

        <p className="mt-10 text-sm text-vault-textSecondary">
          Questions?{' '}
          <a className="font-semibold text-vault-accent underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          {' · '}
          <Link className="font-semibold text-vault-accent underline" href="/privacy">
            Privacy
          </Link>
        </p>
      </section>
    </main>
  );
}
