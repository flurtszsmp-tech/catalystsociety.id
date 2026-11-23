'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Paragraf yang dipotong beberapa baris supaya kartu Home muat satu layar.
 * Tombol Selengkapnya hanya muncul bila teksnya memang terpotong.
 */
export function TeksRingkas({ children, baris = 3 }: { children: string; baris?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [buka, setBuka] = useState(false);
  const [terpotong, setTerpotong] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || buka) return;
    const ukur = () => setTerpotong(el.scrollHeight > el.clientHeight + 1);
    ukur();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(ukur);
    ro.observe(el);
    return () => ro.disconnect();
  }, [buka, children]);

  return (
    <>
      <p ref={ref} className={buka ? undefined : 'ps-ringkas'} style={{ WebkitLineClamp: buka ? undefined : baris }}>
        {children}
      </p>
      {(terpotong || buka) && (
        <button type="button" className="ps-lebih" aria-expanded={buka} onClick={() => setBuka((b) => !b)}>
          {buka ? 'Tutup' : 'Selengkapnya'}
        </button>
      )}
    </>
  );
}
