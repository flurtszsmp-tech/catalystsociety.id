'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

/**
 * Deretan tombol tab (pola WAI-ARIA: panah kiri dan kanan, Home, End).
 * `panelId` dipakai bila semua tab berbagi satu panel yang isinya berganti
 * (Profil); tanpa itu, tiap tab menunjuk panelnya sendiri.
 */
export function TabBar({
  items,
  value,
  onChange,
  label,
  idPrefix,
  panelId,
}: {
  items: { id: string; label: ReactNode }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  idPrefix: string;
  panelId?: string;
}) {
  const tombol = useRef<(HTMLButtonElement | null)[]>([]);

  function tekan(e: KeyboardEvent, i: number) {
    const n = items.length;
    const ke = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (ke < 0) return;
    e.preventDefault();
    onChange(items[ke].id);
    tombol.current[ke]?.focus();
  }

  return (
    <div className="ps-tablist" role="tablist" aria-label={label}>
      {items.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              tombol.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-t-${t.id}`}
            aria-selected={on}
            aria-controls={panelId ?? `${idPrefix}-p-${t.id}`}
            tabIndex={on ? 0 : -1}
            className={on ? 'on' : undefined}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => tekan(e, i)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tab di dalam halaman, supaya halaman panjang muat satu layar tanpa membuang
 * isi. Panel yang tidak aktif tetap terpasang (hanya disembunyikan), jadi
 * isian dan gulir di dalamnya tidak hilang saat berpindah tab.
 */
export function Tabs({ items, label, initial, className = '' }: { items: TabItem[]; label: string; initial?: string; className?: string }) {
  const dasar = useId();
  const [aktif, setAktif] = useState(() => (initial && items.some((t) => t.id === initial) ? initial : items[0]?.id));
  // Tab yang hilang (misalnya Pengajuan saat belum ada pengajuan) jatuh ke tab pertama.
  const pilih = items.some((t) => t.id === aktif) ? aktif : items[0]?.id;

  return (
    <div className={`ps-tabs ${className}`}>
      <TabBar items={items} value={pilih} onChange={setAktif} label={label} idPrefix={dasar} />
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${dasar}-p-${t.id}`}
          aria-labelledby={`${dasar}-t-${t.id}`}
          hidden={t.id !== pilih}
          className="ps-tabpanel"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
