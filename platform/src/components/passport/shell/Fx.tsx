'use client';

import { useEffect, useRef } from 'react';

/* Ubin kaca menyala mengikuti penunjuk, ditambah satu cahaya penunjuk
   yang bergerak halus. Hanya menulis variabel CSS dan transform, tanpa
   memicu tata letak; gambarnya diurus CSS. */
const UBIN =
  '.pass-card,.ps2-card,.pf-card,.jg-card,.cx-hero,.ps2-stage,.ps2-comm,.ps2-cert,.ps2-stat,.pass-step,.pass-com,.pass-hero';

export function Fx() {
  const cahaya = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;

    const cp = cahaya.current;
    let tx = innerWidth / 2;
    let ty = innerHeight / 3;
    let x = tx;
    let y = ty;
    let jalan = false;
    const langkah = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (cp) cp.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.4) requestAnimationFrame(langkah);
      else jalan = false;
    };
    const cahayaGerak = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      cp?.classList.add('hidup');
      if (!jalan) {
        jalan = true;
        requestAnimationFrame(langkah);
      }
    };
    const gerak = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.(UBIN) as HTMLElement | null;
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', `${e.clientX - r.left}px`);
      t.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    addEventListener('pointermove', cahayaGerak, { passive: true });
    document.addEventListener('pointermove', gerak, { passive: true });
    return () => {
      removeEventListener('pointermove', cahayaGerak);
      document.removeEventListener('pointermove', gerak);
    };
  }, []);

  return (
    <>
      <div className="vinyet" aria-hidden="true" />
      <div className="cahaya-p" ref={cahaya} aria-hidden="true" />
    </>
  );
}
