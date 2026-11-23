'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { usePassport } from '@/components/passport/PassportProvider';
import { TabBar } from '@/components/passport/sections/Tabs';
import { Icon } from '@/components/ui/Icon';
import { AvatarCard } from './AvatarCard';
import { CvCard } from './CvCard';
import { publicPath } from './links';
import { ProfileForm, type BagianProfil } from './ProfileForm';
import { PageHead, WithProfile } from './WithProfile';

type TabProfil = BagianProfil | 'cv';

const TAB: { id: TabProfil; label: string }[] = [
  { id: 'identitas', label: 'Identitas' },
  { id: 'tautan', label: 'Tautan sosial' },
  { id: 'cv', label: 'CV' },
];

export function ProfileView() {
  const { profile } = usePassport();
  const dasar = useId();
  const [tab, setTab] = useState<TabProfil>('identitas');
  // Elemen yang dituju tautan #tautan atau #cv, digulir sesudah tabnya terlihat.
  const lompat = useRef<string | null>(null);

  // Tautan dari dasbor (#tautan, #cv) membuka tab yang sesuai.
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h !== 'tautan' && h !== 'cv') return;
    lompat.current = h;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab(h);
  }, []);

  useEffect(() => {
    if (!lompat.current) return;
    const el = document.getElementById(lompat.current);
    lompat.current = null;
    el?.scrollIntoView({ block: 'start' });
    el?.focus({ preventScroll: true });
  }, [tab]);

  return (
    <>
      <PageHead
        title="Profil"
        lead="Foto, identitas, tautan sosial, dan CV yang tampil di Passport Anda."
      >
        {profile && (
          <a className="ui-btn ui-btn-ghost" href={publicPath(profile.slug)}>
            <Icon name="user" />
            Lihat profil publik
          </a>
        )}
      </PageHead>

      <WithProfile>
        {(p) => (
          <>
            {/* Tiga tab supaya Profil muat satu layar. Semua tab berbagi satu panel: kartu yang
                bukan milik tab aktif disembunyikan, sehingga formulir tetap satu dan isian yang
                belum disimpan tidak hilang saat berpindah tab. */}
            <TabBar
              items={TAB}
              value={tab}
              onChange={(id) => setTab(id as TabProfil)}
              label="Bagian profil"
              idPrefix={dasar}
              panelId={`${dasar}-panel`}
            />
            <div
              className={`pf-kisi pf-kisi-profil tab-${tab}`}
              role="tabpanel"
              id={`${dasar}-panel`}
              aria-labelledby={`${dasar}-t-${tab}`}
            >
              {!p.isPublic && (
                <p className="pf-note">
                  <Icon name="shield" />
                  <span>
                    Profil Anda sedang privat, jadi halaman publik hanya bisa Anda lihat sendiri.{' '}
                    <Link href="/passport/settings">Ubah di Pengaturan</Link>
                  </span>
                </p>
              )}
              <AvatarCard profile={p} />
              <ProfileForm profile={p} bagian={tab === 'cv' ? null : tab} onGalat={setTab} />
              <CvCard profile={p} />
            </div>
          </>
        )}
      </WithProfile>
    </>
  );
}
