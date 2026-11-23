import { DM_Sans } from 'next/font/google';

// Huruf nada Halo Putih, sama dengan hero landing. Dipakai dasbor dan profil publik.
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-dm',
});
