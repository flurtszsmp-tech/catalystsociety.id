/* ===========================================================
   Direktori Komunitas Kolaborasi Catalyst Society.

   DATA KOMUNITAS TIDAK ADA DI SINI. Tambah, ubah, atau hapus komunitas
   di komunitas/daftar.js, logonya di komunitas/logo/ (panduan: komunitas/README.md).
   Berkas ini hanya menggambar kartu, pita logo, saringan, dan halaman detail.
   Aturan tampil: field kosong tidak digambar, tombol Join mati kalau URL kosong.
   =========================================================== */
(function () {
  var wadah = document.getElementById('comGrid');

  function aman(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  var KANAL = {
    investments:   'Investments',
    ai_technology: 'AI & Technology',
    business:      'Business',
    builders:      'Builder',
    social_impact: 'Social Impact'
  };

  var LOGO = 'komunitas/logo/', LOGO_POLOS = 'komunitas/logo-polos/', SAMPUL = 'komunitas/sampul/';
  var DATA = (window.CATALYST_DAFTAR_KOMUNITAS || []).filter(function (k) {
    var ok = k && k.nama && k.logo && KANAL[k.kanal];
    if (!ok && window.console) console.warn('Komunitas dilewati (nama, logo, atau kanal salah):', k);
    return ok;
  }).map(function (k) {
    k.topik = k.topik || []; k.anggota = k.anggota || [];
    /* slug = alamat halaman detail (/?k=slug); kosong berarti dibuat dari nama */
    k.slug = k.slug || String(k.nama).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return k;
  });

  /* ---------- marquee logo mitra, geser tanpa henti seperti kumpul.id ----------
     Setiap baris memuat daftar dua kali supaya putarannya tanpa sambungan
     (keyframe menggeser tepat -50%). Salinan kedua disembunyikan dari
     pembaca layar. */
  var jalur = document.getElementById('pmMarquee');
  if (jalur) {
    var logoSel = function (k, salinan) {
      return '<li' + (salinan ? ' aria-hidden="true"' : '') + '><span class="pm-logo">' +
             '<img src="' + LOGO_POLOS + aman(k.logo) + '" data-cadangan="' + LOGO + aman(k.logo) + '" alt="' + (salinan ? '' : aman(k.nama)) + '" ' +
             'decoding="async" height="52"></span></li>';
    };
    var baris = function (daftar, kelas) {
      var isi = daftar.map(function (k) { return logoSel(k, false); }).join('') +
                daftar.map(function (k) { return logoSel(k, true); }).join('');
      return '<div class="pm-row ' + kelas + '"><ul>' + isi + '</ul></div>';
    };
    /* dua baris dari daftar yang sama, sebagian berbeda urutan supaya tidak kembar */
    var separuh = Math.ceil(DATA.length / 2);
    jalur.addEventListener('error', function (e) {
      var g = e.target;
      if (g.tagName === 'IMG' && g.dataset.cadangan) { g.src = g.dataset.cadangan; delete g.dataset.cadangan; }
    }, true);
    jalur.innerHTML = baris(DATA.slice(0, separuh), 'pm-a') +
                      baris(DATA.slice(separuh).concat(DATA.slice(0, 2)), 'pm-b');
  }


  if (!wadah) return;

  /* Seluruh kartu menjadi tautan ke komunitas: tautan paling langsung dulu,
     lalu tautan sosial apa pun. Kalau semua kosong, kartu bukan tautan (Rule 7). */
  function tautanGabung(k) {
    return k.wa || k.discord || k.web || k.ig || k.tiktok || '';
  }

  /* Halaman detail tiap komunitas tampil di landing lewat /?k=<slug>. */

  /* Sampul kartu dan halaman detail. Bila komunitas punya foto sampul (field cover,
     berkas di komunitas/sampul/), foto itu yang dipakai. Tanpa foto, sampul
     dibentuk dari logo komunitas yang diperbesar dan dikaburkan di atas warna kanal,
     jadi setiap komunitas tetap punya latar yang khas. */
  function sampul(k, kelas) {
    var foto = k.sampul ? SAMPUL + k.sampul : '';
    return '<span class="com-cover' + (kelas ? ' ' + kelas : '') + (foto ? ' foto' : '') + '" aria-hidden="true">' +
      (foto
        ? '<img class="com-cover-img" src="' + aman(foto) + '" alt="" loading="lazy" decoding="async">'
        : '<img class="com-cover-blur" src="' + LOGO + aman(k.logo) + '" alt="" loading="lazy" decoding="async">') +
      '<i class="com-cover-grid"></i><i class="com-cover-shade"></i></span>';
  }

  /* Bentuk kartu: sampul di atas, logo menumpang di tepi bawah sampul sebelah kiri,
     lalu nama, satu baris bidang (topik), dan garis meta berisi kanal. Klik membuka
     halaman detail komunitas. */
  function kartu(k) {
    var slug = k.slug;
    var url = slug ? '?k=' + slug : tautanGabung(k);
    var luar = !slug && url;
    var buka = url
      ? '<a class="com-card glass" href="' + aman(url) + '"' + (luar ? ' target="_blank" rel="noopener"' : '') + ' data-kanal="' + k.kanal + '">'
      : '<div class="com-card glass" data-kanal="' + k.kanal + '">';
    return buka.replace('class="com-card glass"', 'class="com-card glass com2"') +
      sampul(k) +
      '<span class="com-card-top">' +
        '<span class="com-logo"><img src="' + LOGO + aman(k.logo) + '" alt="' + aman(k.nama) + '" ' +
          'loading="lazy" decoding="async" width="52" height="52"></span>' +
        (url ? '<span class="com-out-wrap"><svg class="com-out" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></span>' : '') +
      '</span>' +
      '<h3 class="com-title" translate="no">' + aman(k.nama) +
        '<svg class="com-verified" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-spark4"/></svg></h3>' +
      '<span class="com-desc" translate="no">' + aman(k.topik.join(' · ')) + '</span>' +
      '<span class="com-meta" translate="no">' +
        '<span class="com-tag">' + KANAL[k.kanal] + '</span>' +
        '<span class="com-join-type">Community</span>' +
      '</span>' +
    (url ? '</a>' : '</div>');
  }

  /* Saringan kanal dan kata kunci bekerja bersama. Kata kunci dicocokkan ke nama,
     kanal, dan topik, tanpa membedakan huruf besar kecil. */
  var kanalAktif = '', kunci = '';
  function teks(kode) {
    var K = window.CATALYST_I18N, l = (document.documentElement.lang || 'id').slice(0, 2);
    return (K && ((K[l] && K[l][kode]) || (K.id && K.id[kode]))) || '';
  }
  function gambar(kanal) {
    if (kanal != null) kanalAktif = kanal;
    var q = kunci.trim().toLowerCase();
    var daftar = DATA.filter(function (k) {
      if (kanalAktif && k.kanal !== kanalAktif) return false;
      if (!q) return true;
      return [k.nama, KANAL[k.kanal] || '', k.topik.join(' ')].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    wadah.innerHTML = daftar.length ? daftar.map(kartu).join('')
      : '<p class="com-kosong" data-i18n="com.kosong">' + (teks('com.kosong') || 'Komunitas tidak ditemukan.') + '</p>';
    Array.prototype.forEach.call(wadah.children, function (c, i) {
      c.style.setProperty('--i', i % 8);
    });
    wadah.classList.add('in');
    /* Kartu baru lahir sesudah kamus dipasang, jadi teksnya diterjemahkan lagi. */
    if (window.terapkanBahasa) {
      var kode = (document.documentElement.lang || 'id').slice(0, 2);
      window.terapkanBahasa(kode === 'zh' ? 'zh' : kode);
    }
  }

  gambar('');

  var saring = document.getElementById('comFilter');
  if (saring) {
    saring.addEventListener('click', function (e) {
      var tombol = e.target.closest('button[data-kanal]');
      if (!tombol) return;
      Array.prototype.forEach.call(saring.querySelectorAll('button'), function (b) {
        b.classList.toggle('on', b === tombol);
      });
      gambar(tombol.dataset.kanal);
    });
  }

  var cari = document.getElementById('comCari');
  if (cari) {
    cari.addEventListener('input', function () { kunci = cari.value; gambar(null); });
    /* placeholder ikut bahasa aktif */
    var pasangPh = function () { var t = teks('com.cari'); if (t) { cari.placeholder = t; cari.setAttribute('aria-label', t); } };
    pasangPh();
    document.addEventListener('bahasa-berubah', pasangPh);
  }

  /* Hitung komunitas per kanal untuk angka di tombol saringan. */
  Array.prototype.forEach.call(document.querySelectorAll('#comFilter button[data-kanal]'), function (b) {
    var kanal = b.dataset.kanal;
    var n = kanal ? DATA.filter(function (k) { return k.kanal === kanal; }).length : DATA.length;
    var tanda = b.querySelector('i');
    if (tanda) tanda.textContent = n;
  });

  /* ===================== halaman detail komunitas (/?k=<slug>) =====================
     Tampil di dalam landing: header dan footer tetap milik landing, isi landing lain
     disembunyikan selama halaman detail terbuka. Teks panjang (deskripsi) dan kategori
     dari komunitas/daftar.js. */
  var BY_SLUG = {};
  DATA.forEach(function (k) { BY_SLUG[k.slug] = k; });
  /* ringkasan untuk bagian lain di halaman (Industri menampilkan logo per sektor) */
  window.CATALYST_KOMUNITAS = DATA.map(function (k) { return { nama: k.nama, kanal: k.kanal, logo: k.logo, slug: k.slug }; });
  var PLATFORM = [
    { kunci:'web', ikon:'i-globe', nama:'Website' }, { kunci:'wa', ikon:'i-wa', nama:'WhatsApp', isi:true },
    { kunci:'discord', ikon:'i-discord', nama:'Discord', isi:true }, { kunci:'ig', ikon:'i-ig', nama:'Instagram' },
    { kunci:'tiktok', ikon:'i-tiktok', nama:'TikTok', isi:true }
  ];
  var ANGGOTA = { free:'kd.free', premium:'kd.premium', selective:'kd.selective' };
  var ANGGOTA_ASLI = { free:'Free Membership', premium:'Premium Membership', selective:'Selective Membership' };
  var panel = document.getElementById('komunitasDetail'), slugAktif = '';
  function bahasaKini() { var l = (document.documentElement.lang || 'id').slice(0, 2); return l === 'zh' ? 'zh' : l === 'en' ? 'en' : 'id'; }
  function tx(kode, asli) { return teks(kode) || asli; }

  function isiDetail(slug) {
    var k = BY_SLUG[slug]; if (!k || !panel) return false;
    var l = bahasaKini(), des = k.deskripsi || {};
    var full = typeof des === 'string' ? des : (des[l] || des.en || des.id || '');
    var gabung = tautanGabung(k);
    var plat = PLATFORM.filter(function (p) { return k[p.kunci]; }).map(function (p) {
      return '<li><a href="' + aman(k[p.kunci]) + '" target="_blank" rel="noopener">' +
        '<svg class="kd-ik' + (p.isi ? ' isi' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + p.ikon + '"/></svg>' +
        '<span>' + p.nama + '</span><svg class="kd-out" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>';
    }).join('');
    var terkait = DATA.filter(function (x) { return x !== k && x.kanal === k.kanal; }).slice(0, 3);
    if (terkait.length < 3) terkait = terkait.concat(DATA.filter(function (x) { return x !== k && terkait.indexOf(x) < 0; }).slice(0, 3 - terkait.length));
    panel.innerHTML =
      '<div class="wrap">' +
        '<a class="kd-back" href="#community"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg><span>' + tx('kd.semua', 'Semua Komunitas') + '</span></a>' +
        '<div class="kd-hero" data-kanal="' + k.kanal + '">' + sampul(k, 'kd-cover') +
          '<span class="kd-hero-tag"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-spark4"/></svg>' + tx('kd.mitra', 'Community Partner Catalyst Society') + '</span>' +
          '<span class="kd-hero-kanal" translate="no">' + aman(KANAL[k.kanal]) + '</span>' +
        '</div>' +
        '<div class="kd-grid">' +
          '<div class="kd-utama">' +
            '<div class="kd-id kd-id2"><span class="com-logo kd-logo"><img src="' + LOGO + aman(k.logo) + '" alt="' + aman(k.nama) + '" width="76" height="76"></span>' +
              '<div><h1 class="kd-nama" translate="no">' + aman(k.nama) + '<svg class="com-verified" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-spark4"/></svg></h1>' +
              '<div class="kd-meta" translate="no">' + [KANAL[k.kanal], k.kategori, 'Community'].filter(Boolean).map(aman).join('<i></i>') + '</div></div></div>' +
            (full ? '<p class="kd-desk">' + aman(full) + '</p>' : '') +
            '<div class="kd-tags" translate="no">' + k.topik.map(function (t) { return '<span class="com-tag">' + aman(t) + '</span>'; }).join('') + '</div>' +
            '<div class="kd-anggota">' + k.anggota.map(function (a) { return '<span>' + aman(tx(ANGGOTA[a], ANGGOTA_ASLI[a] || a)) + '</span>'; }).join('') + '</div>' +
          '</div>' +
          '<aside class="kd-sisi">' +
            (gabung ? '<a class="kd-gabung" href="' + aman(gabung) + '" target="_blank" rel="noopener"><span>' + tx('kd.gabung', 'Gabung Komunitas') + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></a>' +
              '<p class="kd-catat">' + tx('kd.catat', 'Tombol ini membuka kanal resmi komunitas.') + '</p>'
              : '<span class="kd-gabung mati">' + tx('com.segera', 'Segera') + '</span>') +
            (plat ? '<div class="kd-plat-l">' + tx('kd.platform', 'Platform') + '</div><ul class="kd-plat">' + plat + '</ul>' : '') +
          '</aside>' +
        '</div>' +
        '<h2 class="kd-rel-j">' + tx('kd.terkait', 'Komunitas terkait') + '</h2>' +
        '<div class="com-grid kd-rel">' + terkait.map(kartu).join('') + '</div>' +
      '</div>';
    document.title = k.nama + ' · Catalyst Society';
    return true;
  }
  /* tinggi halaman berubah saat detail dibuka/ditutup: ukur ulang Lenis dulu, lalu loncat */
  function keY(y) {
    if (window.lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: true, force: true }); }
    else window.scrollTo(0, y);
  }
  function tampil(slug, gulir) {
    if (!isiDetail(slug)) return;
    slugAktif = slug;
    panel.hidden = false;
    document.documentElement.classList.add('mode-kd');
    if (gulir !== false) keY(0);
  }
  function tutup(keKomunitas) {
    if (!slugAktif) return;
    slugAktif = ''; panel.hidden = true; panel.innerHTML = '';
    document.documentElement.classList.remove('mode-kd');
    document.title = 'Catalyst Society. Accelerating Future Builders.';
    if (keKomunitas) { var c = document.getElementById('community'); if (c) keY(c.getBoundingClientRect().top + window.scrollY - 90); }
  }
  function dariAlamat() {
    var s = new URLSearchParams(location.search).get('k');
    if (s && BY_SLUG[s]) tampil(s); else tutup(location.hash === '#community');
  }
  /* klik kartu (grid landing maupun komunitas terkait): buka detail tanpa memuat ulang */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.com-card[href^="?k="]');
    if (a && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      var s = a.getAttribute('href').slice(3);
      history.pushState({ k: s }, '', '?k=' + s);
      tampil(s);
      return;
    }
    /* tautan jangkar (menu, tombol kembali) saat detail terbuka: kembali ke landing dulu */
    var j = e.target.closest && e.target.closest('a[href^="#"]');
    if (j && slugAktif) {
      history.pushState(null, '', location.pathname + j.getAttribute('href'));
      tutup(false);
    }
  }, true);
  /* Sorotan lembut mengikuti kursor di atas kartu komunitas. */
  if (matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.com2');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }
  window.addEventListener('popstate', dariAlamat);
  document.addEventListener('bahasa-berubah', function () { if (slugAktif) isiDetail(slugAktif); });
  dariAlamat();
})();
