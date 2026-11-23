/* Catalyst Launch: gerak landing.
   Tiga hal saja: ubin menyala mengikuti penunjuk, hero bergeser halus
   mengikuti penunjuk, dan rel bagian dengan percikan yang naik mengikuti gulir.
   Semua dimatikan atau disederhanakan bila perangkat meminta gerak dikurangi. */
(function(){
  'use strict';
  var kurangi = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var halus = matchMedia('(pointer:fine)').matches;
  var jepit = function(n,a,b){ return n < a ? a : n > b ? b : n; };
  var BINTANG = 'M126.5 -87.7 Q108.05 -84.22 104.8 -64.5 Q101.55 -84.22 83.1 -87.7 Q101.55 -91.18 104.8 -110.9 Q108.05 -91.18 126.5 -87.7 Z';

  /* ---------- ubin menyala ---------- */
  if(halus && !kurangi){
    var UBIN = '.ab-sub li,.ab-utama,.pg-card,.pl-steps button,.val-cell,.com-card';
    document.addEventListener('pointermove', function(e){
      var t = e.target.closest && e.target.closest(UBIN);
      if(!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, {passive:true});

    /* ---------- hero bergeser halus ---------- */
    var hero = document.getElementById('hero');
    if(hero){
      hero.addEventListener('pointermove', function(e){
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      }, {passive:true});
      hero.addEventListener('pointerleave', function(){
        hero.style.setProperty('--px', 0);
        hero.style.setProperty('--py', 0);
      });
    }
  }

  /* ---------- jalur di tepi kiri ---------- */
  var bagian = [
    ['hero', 'Start'], ['about', 'About Us'], ['ecosystem', 'Ecosystem'],
    ['community', 'Community'], ['programs', 'Programs'], ['summit', 'Summit'],
    ['alur', 'Path'], ['join', 'Join'], ['kolaborasi', 'Collaborate']
  ].map(function(b){ return {el: document.getElementById(b[0]), nama: b[1], id: b[0]}; })
   .filter(function(b){ return b.el; });

  var rel = null;
  if(bagian.length > 2){
    rel = document.createElement('nav');
    rel.className = 'jalur';
    rel.setAttribute('aria-label', 'Jalur halaman');
    var n = bagian.length;
    var html = '<i class="j-garis"></i><i class="j-isi"></i>';
    bagian.forEach(function(b, i){
      html += '<a href="#' + b.id + '" data-t="' + b.nama + '" style="top:' + (i / (n - 1) * 100) + '%" aria-label="' + b.nama + '"></a>';
    });
    html += '<span class="j-bintang" aria-hidden="true"><svg viewBox="82 -112 46 48"><path d="' + BINTANG + '"/></svg></span>';
    rel.innerHTML = html;
    document.body.appendChild(rel);
  }

  /* ---------- pembaruan saat gulir ---------- */
  var menunggu = false;
  function perbarui(){
    menunggu = false;
    var vh = innerHeight, tengah = vh * .5;
    if(rel){
      var idx = 0, frak = 0;
      for(var i = 0; i < bagian.length; i++){
        var r = bagian[i].el.getBoundingClientRect();
        if(r.top <= tengah){ idx = i; frak = jepit((tengah - r.top) / Math.max(r.height, 1), 0, 1); }
      }
      var p = bagian.length > 1 ? (idx + frak) / (bagian.length - 1) : 0;
      rel.style.setProperty('--p', (jepit(p, 0, 1) * 100).toFixed(2) + '%');
      var tautan = rel.querySelectorAll('a');
      tautan.forEach(function(a, i){
        a.classList.toggle('lewat', i <= idx);
        a.classList.toggle('kini', i === idx);
      });
    }
  }
  function jadwal(){ if(!menunggu){ menunggu = true; requestAnimationFrame(perbarui); } }
  /* jalur hanya tampil selama halaman bergulir, lalu memudar */
  var redup = 0;
  function tampilkanJalur(){
    if(!rel) return;
    rel.classList.add('aktif');
    clearTimeout(redup);
    redup = setTimeout(function(){ rel.classList.remove('aktif'); }, 1300);
  }
  addEventListener('scroll', tampilkanJalur, {passive:true});
  addEventListener('scroll', jadwal, {passive:true});
  addEventListener('resize', jadwal, {passive:true});
  addEventListener('load', jadwal);
  jadwal();
})();
