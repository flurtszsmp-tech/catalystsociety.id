/* Catalyst Cahaya: cahaya yang mengikuti penunjuk, sinar, dan percikan.
   Hanya menulis transform, jadi berjalan di compositor dan tidak memicu
   tata letak. Dimatikan bila perangkat meminta gerak dikurangi. */
(function(){
  'use strict';
  var kurangi = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var halus = matchMedia('(pointer:fine)').matches;

  /* vinyet statis */
  var vin = document.createElement('div');
  vin.className = 'vinyet';
  vin.setAttribute('aria-hidden', 'true');
  document.body.appendChild(vin);

  /* cahaya penunjuk, diperhalus dengan interpolasi */
  if(halus && !kurangi){
    var cp = document.createElement('div');
    cp.className = 'cahaya-p';
    cp.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cp);
    var tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty, jalan = false, diam = 0;
    function langkah(){
      x += (tx - x) * .14; y += (ty - y) * .14;
      cp.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if(Math.abs(tx - x) + Math.abs(ty - y) > .4){ requestAnimationFrame(langkah); }
      else { jalan = false; }
    }
    addEventListener('pointermove', function(e){
      tx = e.clientX; ty = e.clientY;
      cp.classList.add('hidup');
      if(!jalan){ jalan = true; requestAnimationFrame(langkah); }
    }, {passive:true});
    document.addEventListener('pointerleave', function(){ cp.classList.remove('hidup'); });
  }

  /* sinar dan percikan: dibuat sekali, ditaruh di hero, CTA, dan Summit */
  function acak(seed){ var s = seed; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function taruhPercik(induk, jumlah, seed){
    var r = acak(seed);
    for(var i = 0; i < jumlah; i++){
      var p = document.createElement('i');
      p.className = 'perc';
      p.setAttribute('aria-hidden', 'true');
      p.style.setProperty('--x', (4 + r() * 92).toFixed(1) + '%');
      p.style.setProperty('--y', (6 + r() * 84).toFixed(1) + '%');
      p.style.setProperty('--u', (9 + r() * 20).toFixed(0) + 'px');
      p.style.setProperty('--d', (7 + r() * 8).toFixed(1) + 's');
      p.style.setProperty('--t', (-r() * 8).toFixed(1) + 's');
      p.style.setProperty('--dx', ((r() - .5) * 50).toFixed(0) + 'px');
      p.style.setProperty('--dy', (-20 - r() * 56).toFixed(0) + 'px');
      induk.appendChild(p);
    }
  }
  function taruhSinar(induk){
    var s = document.createElement('div');
    s.className = 'sinar';
    s.setAttribute('aria-hidden', 'true');
    induk.insertBefore(s, induk.firstChild);
  }
  var hero = document.querySelector('.hero .h5-dekor');
  if(hero){ taruhSinar(hero); }
  var cta = document.querySelector('.cta');
  if(cta){ taruhSinar(cta); }
  var summit = document.querySelector('.summit');
  if(summit){ taruhSinar(summit); }
  /* hentikan animasi cahaya saat bagiannya di luar layar */
  if('IntersectionObserver' in window){
    var pantau = new IntersectionObserver(function(es){
      es.forEach(function(e){
        e.target.querySelectorAll('.sinar,.perc').forEach(function(n){ n.classList.toggle('jeda', !e.isIntersecting); });
      });
    });
    [document.getElementById('hero'), cta, summit].forEach(function(n){ if(n) pantau.observe(n); });
  }
  if(!kurangi){
    var heroEl = document.getElementById('hero');
    if(heroEl) taruhPercik(heroEl, 9, 7);
    if(cta) taruhPercik(cta, 7, 21);
    if(summit) taruhPercik(summit, 6, 33);
  }
})();
