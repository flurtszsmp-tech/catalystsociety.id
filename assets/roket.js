/* Roket "Apa yang Anda dapatkan?".
   Satu siklus 14 detik mengatur semuanya supaya geraknya saling menyambung:
     0.08  pintu terbuka          0.12  astronot keluar
     0.22  melayang dan melambai  0.38  berputar di udara      0.48  hilang keseimbangan
     0.53  kembali masuk          0.62  pintu dibanting, roket bergetar
     0.72  api mulai sekarat dan tersendat, roket turun pelan
     0.885 api menyala lagi dengan semburan dan percikan, roket terdorong naik
   Delapan poin mengorbit roket pada dua lintasan dan melambat saat disentuh.
   Klik satu poin membuka papan penjelasan; roket tetap terlihat di kiri.
   Loop hanya berjalan saat panel terlihat dan tab aktif. Gerak dikurangi: semua diam. */
(function () {
  'use strict';
  var root = document.getElementById('roket');
  if (!root) return;
  var ruang = document.getElementById('rkRuang');
  var roket = root.querySelector('.rk-roket');
  var api = root.querySelector('.rk-api'), kilat = root.querySelector('.rk-api-kilat');
  var percik = [].slice.call(root.querySelectorAll('.rk-percik'));
  var pintu = root.querySelector('.rk-pintu');
  var astro = root.querySelector('.rk-astro');
  var bag = { tubuh: astro.querySelector('.a-tubuh'), kepala: astro.querySelector('.a-kepala'), kanan: astro.querySelector('.a-lambai'), kiri: astro.querySelector('.a-kiri') };
  var lint = root.querySelectorAll('.rk-lintasan ellipse');
  var titik = [].slice.call(root.querySelectorAll('.rk-titik'));
  var papan = document.getElementById('ecoDetail');
  var kurangi = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hp = matchMedia('(max-width:760px)');
  var SIKLUS = 14000, TILT = -10 * Math.PI / 180;
  var KUNCI = { opportunity: 'eco.opp', business: 'eco.biz', networks: 'eco.net', capital: 'eco.cap',
    partners: 'eco.par', mentors: 'eco.mentor', career: 'eco.career', community: 'eco.comm' };

  function bahasa() { var l = (document.documentElement.lang || 'id').slice(0, 2); return l === 'zh' ? 'zh' : l === 'en' ? 'en' : 'id'; }
  function t(k) { var K = window.CATALYST_I18N; if (!K) return ''; var v = K[bahasa()] && K[bahasa()][k]; return v != null ? v : (K.id && K.id[k]) || ''; }
  function dua(n) { return (n < 10 ? '0' : '') + n; }
  function jepit(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function antara(p, a, b) { return jepit((p - a) / (b - a)); }
  function keluarKubik(x) { return 1 - Math.pow(1 - x, 3); }
  function masukKubik(x) { return x * x * x; }
  function halusKubik(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function keluarBalik(x) { var c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }

  /* ---------- geometri ---------- */
  var W = 0, H = 0, cx = 0, cy = 0, rh = 0, aL = 0, bL = 0, aD = 0, bD = 0, ukuranTitik = [];
  /* poin genap di lintasan dalam, ganjil di luar; sudut awal diselang supaya tidak menumpuk */
  var sudut = titik.map(function (b, i) { return i % 2 === 0 ? (i / 2) * Math.PI / 2 + .35 : ((i - 1) / 2) * Math.PI / 2 + 1.15; });
  function ukur() {
    var r = ruang.getBoundingClientRect();
    W = r.width; H = r.height; rh = roket.offsetHeight;
    cx = W / 2; cy = hp.matches ? rh * .5 + 20 : H / 2;
    aL = Math.min(W * .47, rh * 1.3); bL = aL * .36; aD = aL * .66; bD = bL * .64;
    /* di bawah radius 340 piksel label bisa bersentuhan: label titik di belakang roket disembunyikan, muncul saat disorot */
    ruang.classList.toggle('rapat', aL < 340);
    [[lint[0], aD, bD], [lint[1], aL, bL]].forEach(function (x) {
      x[0].setAttribute('cx', cx); x[0].setAttribute('cy', cy); x[0].setAttribute('rx', x[1]); x[0].setAttribute('ry', x[2]);
      x[0].setAttribute('transform', 'rotate(' + (TILT * 180 / Math.PI) + ' ' + cx + ' ' + cy + ')');
    });
    /* lebar tombol, tinggi, dan jarak tepi ke pusat planet (padding 10 + setengah planet) */
    ukuranTitik = titik.map(function (b) { var pl = b.querySelector('.rk-planet'); return [b.offsetWidth, b.offsetHeight, 10 + (pl ? pl.offsetWidth : 10) / 2]; });
  }

  /* ---------- orbit ---------- */
  var laju = 1, ditahan = false;
  function letakOrbit() {
    if (hp.matches) { titik.forEach(function (b) { b.style.transform = ''; b.classList.remove('kiri', 'belakang'); }); return; }
    titik.forEach(function (b, i) {
      var dalam = i % 2 === 0, a = dalam ? aD : aL, bb = dalam ? bD : bL, th = sudut[i];
      var X = a * Math.cos(th), Y = bb * Math.sin(th);
      var x = cx + X * Math.cos(TILT) - Y * Math.sin(TILT), y = cy + X * Math.sin(TILT) + Y * Math.cos(TILT);
      var kiri = x < cx, w = ukuranTitik[i][0], h = ukuranTitik[i][1];
      b.classList.toggle('kiri', kiri);
      b.classList.toggle('belakang', Math.sin(th) < -.15);
      var o = ukuranTitik[i][2];
      b.style.transform = 'translate3d(' + (kiri ? x - (w - o) : x - o).toFixed(1) + 'px,' + (y - h / 2).toFixed(1) + 'px,0)';
    });
  }

  /* ---------- percikan (Web Animations, satu kali per pemicu) ---------- */
  function semburPercik(kuat) {
    percik.forEach(function (p, i) {
      var arah = (Math.random() - .5) * 1.4, jauh = rh * (.12 + Math.random() * .22) * kuat;
      p.animate([
        { opacity: 1, transform: 'translate(0,0) scale(1)' },
        { opacity: 0, transform: 'translate(' + (Math.sin(arah) * jauh).toFixed(1) + 'px,' + (Math.cos(arah) * jauh).toFixed(1) + 'px) scale(.4)' }
      ], { duration: 520 + i * 90, easing: 'cubic-bezier(.2,.7,.3,1)' });
    });
  }

  /* ---------- satu bingkai ---------- */
  var waktu = 0, pLama = 0, percikBerikut = 1600;
  function bingkai(dt) {
    waktu += dt;
    var p = (waktu % SIKLUS) / SIKLUS;

    /* api */
    var nyala = 1, turun = 0, putar = 0;
    if (p >= .72 && p < .86) {
      var u = antara(p, .72, .86);
      nyala = 1 - .75 * halusKubik(u);
      if (Math.random() < .12 + .45 * u) nyala *= .12 + Math.random() * .3;   /* tersendat */
      turun = 14 * halusKubik(u); putar = 2.4 * halusKubik(u);
    } else if (p >= .86 && p < .885) {
      nyala = .03 + Math.random() * .05; turun = 14; putar = 2.4;
    } else if (p >= .885 && p < .96) {
      var v = antara(p, .885, .96);
      nyala = 1 + .7 * (1 - keluarKubik(v));
      turun = 14 * (1 - keluarKubik(antara(p, .885, .91))) - 18 * Math.sin(Math.PI * antara(p, .885, .94));
      putar = 2.4 * (1 - keluarKubik(v));
    }
    if (pLama < .885 && p >= .885) semburPercik(1.4);
    if (p < pLama) percikBerikut = 1600;
    percikBerikut -= dt;
    if (percikBerikut <= 0 && nyala > .8) { semburPercik(.6); percikBerikut = 1400 + Math.random() * 900; }
    var kedip = .88 + .07 * Math.sin(waktu * .031) + .05 * Math.sin(waktu * .077) + Math.random() * .06;
    api.style.setProperty('--api', nyala.toFixed(3));
    api.style.setProperty('--kedip', kedip.toFixed(3));
    kilat.style.opacity = p >= .885 && p < .93 ? (1 - antara(p, .885, .93)).toFixed(3) : '0';

    /* roket: melayang, turun saat api sekarat, bergetar saat pintu dibanting */
    var dy = Math.sin(waktu / 4700 * 2 * Math.PI) * 6 + turun, dx = Math.sin(waktu / 6100 * 2 * Math.PI) * 3;
    if (p >= .62 && p < .665) { var g = 1 - antara(p, .62, .665); dx += (Math.random() - .5) * 3 * g; dy += (Math.random() - .5) * 3 * g; }
    var miring = 14 + Math.sin(waktu / 6100 * 2 * Math.PI) * 1.2 + putar;
    roket.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) rotate(' + miring.toFixed(2) + 'deg)';

    /* pintu */
    var sp = 0;
    if (p >= .08 && p < .13) sp = -72 * keluarBalik(antara(p, .08, .13));
    else if (p >= .13 && p < .62) sp = -72;
    else if (p >= .62 && p < .645) sp = -72 * (1 - masukKubik(antara(p, .62, .645)));
    else if (p >= .645 && p < .67) sp = -12 * Math.sin(Math.PI * antara(p, .645, .67));
    pintu.style.setProperty('--pintu', sp.toFixed(1) + 'deg');

    /* astronot */
    astronot(p);
    pLama = p;
    if (!hp.matches) {
      if (!ditahan || laju > .001) {
        laju += ((ditahan ? 0 : 1) - laju) * Math.min(1, dt / 260);
        /* kedua lintasan berputar sama cepat: susunan titik tetap, jadi label tidak pernah bertumpuk */
        for (var i = 0; i < sudut.length; i++) sudut[i] += dt * laju * 2 * Math.PI / 64000;
      }
      letakOrbit();
    }
  }

  function astronot(p) {
    if (p < .12 || p >= .62) { astro.style.opacity = '0'; return; }
    var rr = ruang.getBoundingClientRect(), rp = pintu.getBoundingClientRect();
    var x0 = rp.left - rr.left + rp.width / 2, y0 = rp.top - rr.top + rp.height / 2;
    var aw = rh * .2, ah = aw * 150 / 120;   /* lebar astronot di CSS = 0.2 x tinggi roket */
    var P1x = x0 + rh * .42, P1y = y0 - rh * .3, P2x = x0 + rh * .6, P2y = y0 - rh * .46;
    var x = x0, y = y0, s = 1, o = 1, rot = 0, tubuh = 0, kepala = 0, kanan = 162, kiri = 14, u;
    if (p < .22) {
      u = antara(p, .12, .22); var e = keluarKubik(u);
      x = x0 + (P1x - x0) * e; y = y0 + (P1y - y0) * e - Math.sin(Math.PI * e) * rh * .08;
      s = .3 + .7 * e; o = Math.min(1, u * 4); rot = -12 * (1 - e); kanan = 162 - 120 * e;
    } else if (p < .38) {
      u = antara(p, .22, .38);
      x = P1x + Math.sin(2 * Math.PI * u * 1.5) * rh * .035; y = P1y + Math.cos(2 * Math.PI * u * 1.2) * rh * .028;
      kanan = 34 + 26 * Math.sin(2 * Math.PI * u * 4);
      kiri = u < .45 ? 14 : -58 - 24 * Math.sin(2 * Math.PI * u * 4 + 1.2);
      kepala = 8 * Math.sin(2 * Math.PI * u * 2); tubuh = 5 * Math.sin(2 * Math.PI * u);
    } else if (p < .48) {
      u = antara(p, .38, .48); var h = halusKubik(u), busur = Math.sin(Math.PI * h);
      x = P1x + (P2x - P1x) * busur; y = P1y + (P2y - P1y) * busur;
      rot = 360 * h; kanan = 120; kiri = -100;
    } else if (p < .53) {
      u = antara(p, .48, .53); var tarik = Math.sin(Math.PI * u) * .3;
      x = P1x + (x0 - P1x) * tarik; y = P1y + (y0 - P1y) * tarik;
      kanan = 70 * Math.sin(2 * Math.PI * u * 6); kiri = -60 - 50 * Math.sin(2 * Math.PI * u * 6 + 1);
      tubuh = 18 * Math.sin(2 * Math.PI * u * 3); kepala = -10 * Math.sin(2 * Math.PI * u * 3);
    } else {
      u = antara(p, .53, .62); var m = masukKubik(u);
      x = P1x + (x0 - P1x) * m; y = P1y + (y0 - P1y) * m;
      s = 1 - .7 * m; o = u > .8 ? (1 - u) / .2 : 1; rot = 10 * m; kanan = 160; kiri = 14;
    }
    astro.style.opacity = o.toFixed(3);
    astro.style.transform = 'translate3d(' + (x - aw * .5).toFixed(1) + 'px,' + (y - ah * .8).toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
    bag.tubuh.style.transform = 'rotate(' + tubuh.toFixed(1) + 'deg)';
    bag.kepala.style.transform = 'rotate(' + kepala.toFixed(1) + 'deg)';
    bag.kanan.style.transform = 'rotate(' + kanan.toFixed(1) + 'deg)';
    bag.kiri.style.transform = 'rotate(' + kiri.toFixed(1) + 'deg)';
  }

  /* ---------- loop: hanya saat terlihat dan tab aktif ---------- */
  var terlihat = false, jalan = false, lalu = 0, dijeda = false;
  function langkah(now) {
    if (!terlihat || document.hidden || dijeda) { jalan = false; return; }
    var dt = lalu ? Math.min(50, now - lalu) : 16; lalu = now;
    bingkai(dt);
    requestAnimationFrame(langkah);
  }
  function mulai() { if (!jalan && terlihat && !document.hidden && !kurangi && !dijeda) { jalan = true; lalu = 0; requestAnimationFrame(langkah); } }

  /* tombol jeda */
  var jeda = root.querySelector('.rk-jeda');
  function labelJeda() { jeda.querySelector('.sr-only').textContent = t(dijeda ? 'rk.putar' : 'rk.jeda') || (dijeda ? 'Putar animasi' : 'Jeda animasi'); }
  if (jeda) {
    jeda.addEventListener('click', function () {
      dijeda = !dijeda;
      jeda.setAttribute('aria-pressed', dijeda ? 'true' : 'false');
      root.classList.toggle('diam', dijeda);
      labelJeda(); mulai();
    });
    document.addEventListener('bahasa-berubah', function () { setTimeout(labelJeda); });
  }

  /* ---------- papan penjelasan ---------- */
  var aktif = -1, buka = false, gantiT = 0;
  function isiPapan() {
    if (aktif < 0) return;
    var b = titik[aktif], k = KUNCI[b.dataset.n];
    papan.querySelector('h4').textContent = b.querySelector('.rk-label b').textContent;
    papan.querySelector('.rk-p-no').textContent = dua(aktif + 1) + ' / ' + dua(titik.length);
    papan.querySelector('.ed-lead').innerHTML = t(k + '.p');
    papan.querySelector('.ed-list').innerHTML = [1, 2, 3].map(function (n) { return '<li>' + t(k + '.' + n) + '</li>'; }).join('');
  }
  function pilih(i) {
    var ganti = buka && i !== aktif;
    aktif = i;
    titik.forEach(function (b, n) { b.classList.toggle('on', n === i); b.setAttribute('aria-pressed', n === i ? 'true' : 'false'); });
    if (ganti) { papan.classList.add('ganti'); clearTimeout(gantiT); gantiT = setTimeout(function () { isiPapan(); papan.classList.remove('ganti'); }, 220); }
    else isiPapan();
    setBuka(true);
  }
  function setBuka(b, kembalikanFokus) {
    buka = b;
    root.classList.toggle('buka', b);
    papan.inert = !b;
    if (!b) {
      if (kembalikanFokus && aktif >= 0) titik[aktif].focus({ preventScroll: true });
      return;
    }
    if (innerWidth < 1000) setTimeout(function () {
      var r = papan.getBoundingClientRect();
      if (r.bottom > innerHeight) {
        var y = scrollY + r.bottom - innerHeight + 24;
        if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 520);
  }
  titik.forEach(function (b, i) { b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', function () { pilih(i); }); });
  papan.querySelector('.rk-tutup').addEventListener('click', function () { setBuka(false, true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && buka) setBuka(false, true); });
  document.addEventListener('bahasa-berubah', function () { isiPapan(); setTimeout(function () { ukur(); letakOrbit(); }); });

  /* orbit melambat halus hanya saat kursor berada di atas sebuah titik atau titik difokus lewat keyboard;
     setelah diklik orbit tetap berjalan (fokus dari klik mouse tidak menahan putaran) */
  titik.forEach(function (b) {
    b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') ditahan = true; });
    b.addEventListener('pointerleave', function () { ditahan = false; });
    b.addEventListener('focus', function () { if (b.matches(':focus-visible')) ditahan = true; });
    b.addEventListener('blur', function () { ditahan = false; });
  });

  /* untuk uji gambar: lompat ke titik tertentu dalam siklus (0 sampai 1) */
  root.lompatSiklus = function (p) { waktu = SIKLUS * p - 16; pLama = p; bingkai(16); };

  /* ---------- mulai ---------- */
  papan.inert = true;
  function siapkan() { ukur(); letakOrbit(); if (kurangi) { api.style.setProperty('--api', 1); api.style.setProperty('--kedip', 1); } }
  if ('ResizeObserver' in window) new ResizeObserver(function () { ukur(); letakOrbit(); }).observe(ruang);
  else addEventListener('resize', function () { ukur(); letakOrbit(); });
  hp.addEventListener && hp.addEventListener('change', siapkan);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(siapkan);
  var img = roket.querySelector('img');
  if (img && !img.complete) img.addEventListener('load', siapkan, { once: true });
  siapkan();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      terlihat = es[0].isIntersecting;
      root.classList.toggle('jalan', terlihat && !kurangi);
      mulai();
    }, { threshold: .1 }).observe(root);
  } else { terlihat = true; root.classList.add('jalan'); mulai(); }
  document.addEventListener('visibilitychange', mulai);
})();
