/* nova-controls.js — floating search + view toggles (grid/list, thumbs, floaty).
   State persists in localStorage. No dependencies. */
(function () {
  var list = document.getElementById('gamesList');
  if (!list) return;
  var KEY = 'nova_ui_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
  function apply(s) {
    list.classList.toggle('list-mode', !!s.list);
    list.classList.toggle('no-thumbs', !s.thumbs);
    list.classList.toggle('floaty-mode', !!s.floaty);
    var v = document.getElementById('tg-view');
    var t = document.getElementById('tg-thumbs');
    var f = document.getElementById('tg-floaty');
    if (v) { v.classList.toggle('active', !s.list); v.textContent = s.list ? '☰ List' : '▦ Grid'; }
    if (t) t.classList.toggle('active', s.thumbs !== false);
    if (f) f.classList.toggle('active', !!s.floaty);
  }

  var state = load();
  if (state.thumbs === undefined) state.thumbs = true; // default: thumbs ON
  apply(state);

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
  bind('tg-view', function () {
    state.list = !state.list; save(state); apply(state);
  });
  bind('tg-thumbs', function () {
    state.thumbs = !(state.thumbs !== false); save(state); apply(state);
  });
  bind('tg-floaty', function () {
    state.floaty = !state.floaty; save(state); apply(state);
  });
})();
