(function () {
  var body = document.body;
  var main = document.getElementById('main');
  var sw = document.getElementById('sw');
  var slime = document.getElementById('slime');
  var screenEl = document.getElementById('screen');
  var endwrap = document.getElementById('endwrap');
  var ending = document.getElementById('ending');
  var stops = [].slice.call(document.querySelectorAll('.stop'));
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- tune these to your art (all in art pixels, art = 288 x 162) ---- */
  var ART_W = 288, ART_H = 162;
  var SLIME_W = 15;                  // how wide your slime sprite is in art pixels
  var FEET_X = 146.5, FEET_Y = 145;  // where the slime's feet stand in scene 10 and scene 11

  if (reduce) body.classList.remove('lamp');

  /* ---------- 1. headlamp ---------- */
  var lx = innerWidth / 2, ly = innerHeight * 0.5;
  function move(x, y) {
    lx = x; ly = y;
    var r = main.getBoundingClientRect();
    main.style.setProperty('--x', (x - r.left) + 'px');
    main.style.setProperty('--y', (y - r.top) + 'px');
  }
  addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); });
  addEventListener('touchmove', function (e) {
    var t = e.touches[0]; move(t.clientX, t.clientY);
  }, { passive: true });

  /* ---------- 2. slime falls through the page ---------- */
  function size() {
    var k = screenEl.offsetWidth / ART_W;          // screen pixels per art pixel
    endwrap.style.width = screenEl.offsetWidth + 'px';   // ending uses the same scale as the hero
    sw.style.width = SLIME_W * k + 'px';
  }

  function heroX() {                               // x where the slime's left edge goes
    var s = screenEl.getBoundingClientRect();
    return s.left + s.width * (FEET_X / ART_W) - sw.offsetWidth / 2;
  }

  // y of the slime's FEET for each stop:
  //   -1 = hero, 0..n-1 = gap under each section, n = ground in the ending
  function feetY(i) {
    var r;
    if (i < 0) {
      r = screenEl.getBoundingClientRect();
      return r.top + scrollY + r.height * (FEET_Y / ART_H);
    }
    if (i >= stops.length) {
      r = endwrap.getBoundingClientRect();
      return r.top + scrollY + r.height * (FEET_Y / ART_H);
    }
    var bottom = stops[i].getBoundingClientRect().bottom;
    var next = (i + 1 < stops.length ? stops[i + 1] : ending).getBoundingClientRect().top;
    return (bottom + next) / 2 + scrollY;          // middle of the gap below the section
  }

  // which stop the slime should be at, based on what you're reading
  function active() {
    var a = -1;
    stops.forEach(function (s, i) {
      if (s.getBoundingClientRect().top < innerHeight * 0.55) a = i;
    });
    if (ending.getBoundingClientRect().top < innerHeight * 0.5) a = stops.length;
    return a;
  }

  var current = -9;
  function place(instant) {
    size();
    var a = active();
    if (a === current && !instant) return;
    current = a;

    slime.classList.remove('land');
    if (instant || reduce) sw.style.transition = 'none';
    sw.style.left = heroX() + 'px';
    sw.style.top = (feetY(a) - sw.offsetHeight) + 'px';
    if (instant || reduce) { sw.offsetHeight; sw.style.transition = ''; }
  }

  // squash when it lands
  sw.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'top') slime.classList.add('land');
  });

  addEventListener('scroll', function () { move(lx, ly); place(false); }, { passive: true });
  addEventListener('resize', function () { current = -9; place(true); });
  addEventListener('load', function () { place(true); move(lx, ly); });  // after images load, so sizes are right
  place(true);
  move(lx, ly);
})();