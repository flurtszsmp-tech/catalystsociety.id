import type { Metadata } from 'next';
import { PassportProvider } from '@/components/passport/PassportProvider';
import { PassportShell } from '@/components/passport/shell/PassportShell';
import { ToastProvider } from '@/components/ui/Toast';
import { dmSans } from '@/lib/fonts';
import '@/styles/ui.css';
import '@/styles/passport.css';
import '@/styles/passport-halo.css';
import '@/styles/passport-launch.css';
import '@/styles/passport-kecil.css';

export const metadata: Metadata = {
  title: { absolute: 'Catalyst Passport', template: '%s — Catalyst Passport' },
  robots: { index: false, follow: false },
};

export default async function PassportLayout({ children }: { children: React.ReactNode }) {
  // Ekspor statis (GitHub Pages) tidak punya server, jadi sesi tidak bisa divalidasi di sini.
  // Penjaga sesi dipasang skrip di <head> (scripts/salin-passport.py) dan PassportProvider
  // memeriksa sesi Supabase di browser; RLS di database tetap penjaga utama data.

  return (
    <div className={`pass pass-halo ${dmSans.variable}`}>
      <ToastProvider>
        <PassportProvider>
          <PassportShell>{children}</PassportShell>
        </PassportProvider>
      </ToastProvider>
    </div>
  );
}
