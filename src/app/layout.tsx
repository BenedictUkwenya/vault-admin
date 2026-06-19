import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vault Portal',
  description: 'Vault — Role-based portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-vault-bg text-vault-textPrimary antialiased">{children}</body>
    </html>
  );
}
