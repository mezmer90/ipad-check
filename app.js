/* iPad (A16) Check: checklist plus hardware tests. Plain JS, no build step. */
(function () {
  "use strict";
  var D = window.IPC_DATA;
  var KEY = "ipad_a16_check_v1";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- device facts (private ones come from the link fragment, never from the site files) ---------- */
  var FACT_DEFS = [
    ["model", "Model", "iPad (A16), 128 GB, Wi-Fi"],
    ["part", "Part number", "MD3Y4HN/A"],
    ["serial", "Serial", "the serial from the seller's screenshot"],
    ["storage", "Storage", "128 GB"],
    ["colour", "Colour", "Silver"],
    ["ios", "iPadOS", "27.0"],
    ["warranty", "Warranty to", "4 Jan 2027"],
    ["battery", "Battery", "Normal, 96% max capacity, 91 cycles, 80% limit on"],
    ["bdates", "Battery dates", "Made Nov 2025, first used Jan 2026"],
    ["acct", "Apple Account on it", "the seller's account"],
    ["price", "Asking price", "₹30,000"]
  ];

  var canSave = true;
  var state = load();
  function load() {
    var s = null;
    try { s = JSON.parse(window.localStorage.getItem(KEY) || "null"); } catch (e) { s = null; canSave = false; }
    if (!s || typeof s !== "object" || Array.isArray(s)) s = null;
    if (!s) { s = { status: presetStatus(), notes: {}, facts: {}, tests: {} }; }
    var clean = { status: {}, notes: {}, facts: {}, tests: {} };
    var isObj = function (o) { return o && typeof o === "object" && !Array.isArray(o); };
    var VALID = { ok: 1, issue: 1, na: 1 };
    if (isObj(s.status)) Object.keys(s.status).forEach(function (k) { if (VALID[s.status[k]] === 1) clean.status[k] = s.status[k]; });
    if (isObj(s.tests)) Object.keys(s.tests).forEach(function (k) { if (s.tests[k] === "ok" || s.tests[k] === "issue") clean.tests[k] = s.tests[k]; });
    if (isObj(s.notes)) Object.keys(s.notes).forEach(function (k) { if (typeof s.notes[k] === "string") clean.notes[k] = s.notes[k].slice(0, 2000); });
    if (isObj(s.facts)) Object.keys(s.facts).forEach(function (k) { if (typeof s.facts[k] === "string") clean.facts[k] = s.facts[k].slice(0, 200); });
    return clean;
  }
  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { canSave = false; }
    if (typeof renderProgress === "function" && $("#save-note")) $("#save-note").textContent = saveText();
  }
  function saveText() { return canSave ? "Your marks and notes are saved in this browser on this device, so you can close and reopen the page." : "Saving is not available (private browsing?), so keep this tab open during the inspection."; }
  function presetStatus() {
    var o = {};
    Object.keys(D.PRESET).forEach(function (k) { if (D.PRESET[k].st) o[k] = D.PRESET[k].st; });
    return o;
  }
  /* Import facts from #f=<base64 JSON> so personal details never sit in the public files. */
  (function importHash() {
    var m = location.hash.match(/[#&]f=([^&]+)/);
    if (!m) return;
    try {
      var b = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
      var json = decodeURIComponent(escape(atob(b)));
      var obj = JSON.parse(json);
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("bad");
      var okKeys = {}; FACT_DEFS.forEach(function (f) { okKeys[f[0]] = 1; });
      Object.keys(obj).forEach(function (k) { if (okKeys[k] === 1 && typeof obj[k] === "string" && obj[k].trim()) state.facts[k] = obj[k].trim().slice(0, 200); });
      save();
    } catch (e) { /* ignore a bad fragment */ }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e2) { /* ignore */ }
  })();
  function fact(k) {
    if (state.facts[k]) return state.facts[k];
    for (var i = 0; i < FACT_DEFS.length; i++) if (FACT_DEFS[i][0] === k) return FACT_DEFS[i][2];
    return "";
  }
  function fill(s) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return fact(k); }); }

  /* ---------- tabs ---------- */
  function showTab(name, anchor) {
    if (name !== "tests") {
      try { camWanted = ""; stopCam(); stopMic(); stopTones(); stopMotion(); closeColour(); closeTouch(); } catch (e) { /* tests not initialised yet */ }
    }
    $$(".tab").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === name); });
    $$(".panel").forEach(function (p) { p.classList.toggle("on", p.id === "tab-" + name); });
    try { sessionStorage.setItem("ipc_tab", name); } catch (e) { /* ignore */ }
    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) setTimeout(function () { el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30);
    } else window.scrollTo(0, 0);
  }
  $$(".tab").forEach(function (b) { b.addEventListener("click", function () { showTab(b.getAttribute("data-tab")); }); });

  /* ---------- checklist ---------- */
  var ALL = [];
  D.SECTIONS.forEach(function (s) { s.items.forEach(function (i) { ALL.push(i); }); });
  var SEV = { deal: "Deal-breaker", imp: "Important", nice: "Nice to check" };
  var TEST_NAME = { colours: "colour test", touch: "touch grid", speakers: "speaker test", mic: "mic test", camera: "camera test", motion: "motion test", pencil: "drawing pad" };
  var filter = "all";
  var openSecs = {};
  D.SECTIONS.forEach(function (s) { openSecs[s.id] = !s.collapsed; });

  function renderChecklist() {
    var host = $("#sections");
    var html = "";
    D.SECTIONS.forEach(function (s) {
      var items = s.items.filter(function (i) {
        var st = state.status[i.id];
        return filter === "all" ? true : filter === "todo" ? !st : st === "issue";
      });
      if (!items.length) return;
      var done = s.items.filter(function (i) { return state.status[i.id]; }).length;
      html += '<details class="sec" data-sec="' + s.id + '"' + (openSecs[s.id] || filter !== "all" ? " open" : "") + '><summary><span>' + esc(s.title) + '</span><span class="muted small">' + done + "/" + s.items.length + "</span></summary><div class=\"sec-body\">";
      items.forEach(function (i) {
        var st = state.status[i.id];
        var pre = D.PRESET[i.id];
        html += '<div class="item' + (st === "ok" || st === "na" ? " settled" : "") + '" id="it-' + i.id + '"><div class="it-head"><span class="it-title">' + esc(fill(i.t)) + '</span><span class="pill ' + i.sev + '">' + SEV[i.sev] + "</span>" + (pre && pre.pending && !st ? '<span class="pill pend">Pending</span>' : "") + "</div>";
        html += '<div class="how">' + esc(fill(i.how)) + "</div>";
        if (pre) html += '<div class="pre' + (pre.pending ? " pend" : "") + '">' + esc(fill(pre.note)) + "</div>";
        if (i.test) html += '<button class="btn go-test" data-go="' + i.test + '">Open ' + TEST_NAME[i.test] + "</button>";
        html += '<div class="st">' + ["ok", "issue", "na"].map(function (k) {
          return '<button class="' + k + (st === k ? " on" : "") + '" data-set="' + i.id + '" data-v="' + k + '" aria-pressed="' + (st === k) + '">' + (st === k ? (k === "ok" ? "\u2713 " : k === "issue" ? "\u2715 " : "") : "") + (k === "ok" ? "OK" : k === "issue" ? "Issue" : "N/A") + "</button>";
        }).join("") + "</div></div>";
      });
      html += '<textarea data-note="' + s.id + '" placeholder="Notes: anything to remember or negotiate on">' + esc(state.notes[s.id] || "") + "</textarea></div></details>";
    });
    host.innerHTML = html;
    renderProgress();
  }
  function renderProgress() {
    var done = ALL.filter(function (i) { return state.status[i.id]; }).length;
    var issues = ALL.filter(function (i) { return state.status[i.id] === "issue"; }).length;
    var pct = Math.round(done / ALL.length * 100);
    $("#pct").textContent = pct + "% checked";
    $("#prog-sub").textContent = done + " of " + ALL.length + " items, " + issues + " with issues";
    $("#bar-ok").style.width = ((done - issues) / ALL.length * 100) + "%";
    $("#bar-bad").style.width = (issues / ALL.length * 100) + "%";
    var deal = ALL.filter(function (i) { return i.sev === "deal" && state.status[i.id] !== "na"; });
    var bad = deal.filter(function (i) { return state.status[i.id] === "issue"; });
    var pend = deal.filter(function (i) { return !state.status[i.id]; });
    var c = $("#deal");
    if (bad.length) { c.className = "callout danger"; c.innerHTML = "<b>" + bad.length + " deal-breaker" + (bad.length > 1 ? "s" : "") + " failed. Do not buy unless fixed:</b> " + esc(bad.map(function (i) { return fill(i.t); }).join("; ")); }
    else if (pend.length) { c.className = "callout warning"; c.innerHTML = "<b>" + pend.length + " of " + deal.length + " deal-breakers still to check:</b> " + esc(pend.map(function (i) { return fill(i.t); }).join("; ")); }
    else { c.className = "callout success"; c.innerHTML = "<b>All deal-breakers passed.</b> Review any Important issues for price negotiation, then follow the handover steps."; }
    $$(".seg").forEach(function (b) {
      var f = b.getAttribute("data-filter");
      var n = f === "all" ? ALL.length : f === "todo" ? ALL.length - done : issues;
      b.textContent = (f === "all" ? "All" : f === "todo" ? "To check" : "Issues") + " (" + n + ")";
      b.classList.toggle("on", f === filter);
    });
    $("#save-note").textContent = saveText();
  }
  function setStatus(id, v, toggle) {
    if (toggle && state.status[id] === v) delete state.status[id]; else state.status[id] = v;
    save();
  }

  $("#sections").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-set")) {
      setStatus(b.getAttribute("data-set"), b.getAttribute("data-v"), true);
      var y = window.scrollY;
      renderChecklist(); renderMarks();
      window.scrollTo(0, y);
    } else if (b.hasAttribute("data-go")) {
      showTab("tests", "t-" + b.getAttribute("data-go"));
    }
  });
  $("#sections").addEventListener("input", function (e) {
    var t = e.target;
    if (t.hasAttribute("data-note")) { state.notes[t.getAttribute("data-note")] = t.value; save(); }
  });
  $("#sections").addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.hasAttribute && d.hasAttribute("data-sec") && filter === "all") openSecs[d.getAttribute("data-sec")] = d.open;
  }, true);
  $$(".seg").forEach(function (b) { b.addEventListener("click", function () { filter = b.getAttribute("data-filter"); renderChecklist(); }); });

  var armed = false, armT = 0;
  $("#reset").addEventListener("click", function () {
    var b = $("#reset");
    if (!armed) {
      armed = true; b.textContent = "Tap again to reset to the photo pre-marks"; b.classList.add("armed");
      armT = setTimeout(function () { armed = false; b.textContent = "Reset checklist"; b.classList.remove("armed"); }, 4000);
      return;
    }
    clearTimeout(armT); armed = false; b.textContent = "Reset checklist"; b.classList.remove("armed");
    state.status = presetStatus(); state.notes = {}; state.tests = {}; filter = "all"; save(); renderChecklist(); renderMarks();
  });
  $("#copy-sum").addEventListener("click", function () {
    var lines = ["iPad (A16) inspection summary, " + new Date().toLocaleString()];
    var issues = ALL.filter(function (i) { return state.status[i.id] === "issue"; });
    var todo = ALL.filter(function (i) { return !state.status[i.id]; });
    lines.push("Issues: " + (issues.length ? issues.map(function (i) { return fill(i.t); }).join("; ") : "none"));
    lines.push("Not checked: " + (todo.length ? todo.map(function (i) { return fill(i.t); }).join("; ") : "none"));
    D.SECTIONS.forEach(function (s) { if (state.notes[s.id]) lines.push(s.title + " notes: " + state.notes[s.id]); });
    var txt = lines.join("\n");
    var ok = function () { $("#copy-sum").textContent = "Copied"; setTimeout(function () { $("#copy-sum").textContent = "Copy summary"; }, 1500); };
    var legacy = function () {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.left = "0"; ta.style.opacity = "0"; ta.style.fontSize = "16px";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { ta.setSelectionRange(0, txt.length); } catch (e) { /* ignore */ }
      var done = false;
      try { done = document.execCommand("copy"); } catch (e2) { done = false; }
      document.body.removeChild(ta);
      if (done) ok(); else { $("#sum-out").value = txt; $("#sum-out").hidden = false; $("#copy-sum").textContent = "Select the text below to copy"; }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, legacy);
      else legacy();
    } catch (e3) { legacy(); }
  });

  /* ---------- test result marks (sync to checklist items) ---------- */
  function renderMarks() {
    $$(".mark").forEach(function (m) {
      var t = m.getAttribute("data-test");
      var v = state.tests[t];
      m.innerHTML = '<span class="muted small">Result:</span>' + ["ok", "issue"].map(function (k) {
        return '<button class="btn' + (v === k ? (k === "ok" ? " primary" : " armed") : "") + '" data-mark="' + k + '">' + (k === "ok" ? "Passed" : "Issue found") + "</button>";
      }).join("") + '<button class="btn ghost" data-mark="back">Back to checklist</button>';
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-mark]");
    if (!b) return;
    var m = b.closest(".mark");
    var t = m.getAttribute("data-test");
    var v = b.getAttribute("data-mark");
    var items = m.getAttribute("data-items").split(",");
    if (v === "back") { showTab("checklist", "it-" + items[0]); return; }
    if (state.tests[t] === v) { delete state.tests[t]; items.forEach(function (id) { delete state.status[id]; }); }
    else { state.tests[t] = v; items.forEach(function (id) { state.status[id] = v; }); }
    save(); renderMarks(); renderChecklist();
  });
  var jump = $("#test-jump");
  [["colours", "Colours"], ["touch", "Touch"], ["speakers", "Speakers"], ["mic", "Mic"], ["camera", "Cameras"], ["motion", "Motion"], ["pencil", "Pencil"], ["info", "Screen info"], ["tricks", "Tricks"]].forEach(function (p) {
    var b = document.createElement("button"); b.className = "btn"; b.textContent = p[1];
    b.addEventListener("click", function () { document.getElementById("t-" + p[0]).scrollIntoView({ behavior: "smooth" }); });
    jump.appendChild(b);
  });

  /* ---------- fullscreen helpers (iPad Safari supports element fullscreen only partly, so the overlay is the real fallback) ---------- */
  function enterFs(el) {
    try {
      if (el.requestFullscreen) { var p = el.requestFullscreen(); if (p && p.catch) p.catch(function () {}); }
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) { /* overlay still covers the viewport */ }
  }
  function exitFs() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch (e) { /* ignore */ }
  }
  function lockScroll(on) { document.documentElement.style.overflow = on ? "hidden" : ""; document.body.style.overflow = on ? "hidden" : ""; }

  /* ---------- colour test ---------- */
  var COLS = [["Black", "#000", "#555"], ["White", "#fff", "#999"], ["Red", "#f00", "#fff"], ["Green", "#0f0", "#040"], ["Blue", "#00f", "#fff"], ["Grey", "#808080", "#fff"], ["Gradient", "linear-gradient(90deg,#000,#fff)", "#f00"]];
  var cIdx = 0, holdT = 0, labelT = 0, cOv = $("#colour-ov"), cLabel = $("#colour-label");
  function paintColour() {
    var c = COLS[cIdx];
    cOv.style.background = c[1];
    cLabel.style.color = c[2]; cLabel.style.opacity = "0.75";
    cLabel.textContent = c[0] + " " + (cIdx + 1) + "/" + COLS.length + ". Tap for next. Hold or two-finger tap to exit.";
    cExit.classList.remove("gone");
    clearTimeout(labelT); labelT = setTimeout(function () { cLabel.style.opacity = "0"; cExit.classList.add("gone"); }, 2500);
  }
  function closeColour() { if (cOv.hidden) return; cOv.hidden = true; lockScroll(false); exitFs(); clearTimeout(holdT); clearTimeout(labelT); }
  $("#colour-start").addEventListener("click", function () { if (!cOv.hidden) return; cIdx = 0; cOv.hidden = false; lockScroll(true); paintColour(); enterFs(cOv); });
  var cExit = $("#colour-exit");
  ["touchstart", "touchend", "mousedown", "mouseup"].forEach(function (ev) { cExit.addEventListener(ev, function (e) { e.stopPropagation(); if (ev === "touchend" || ev === "mouseup") { e.preventDefault(); closeColour(); } }, { passive: false }); });
  var cMoved = false, cHeld = false;
  cOv.addEventListener("touchstart", function (e) {
    e.preventDefault();
    if (e.touches.length >= 2) { closeColour(); return; }
    cHeld = false; cMoved = false;
    clearTimeout(holdT); holdT = setTimeout(function () { cHeld = true; closeColour(); }, 900);
  }, { passive: false });
  cOv.addEventListener("touchmove", function (e) { e.preventDefault(); cMoved = true; }, { passive: false });
  cOv.addEventListener("touchend", function (e) {
    e.preventDefault(); clearTimeout(holdT);
    if (cOv.hidden || cHeld || e.touches.length) return;
    if (cIdx < COLS.length - 1) { cIdx++; paintColour(); } else closeColour();
  }, { passive: false });
  cOv.addEventListener("mousedown", function () { clearTimeout(holdT); holdT = setTimeout(function () { cHeld = true; closeColour(); }, 900); cHeld = false; });
  cOv.addEventListener("mouseup", function () { clearTimeout(holdT); if (cHeld || cOv.hidden) return; if (cIdx < COLS.length - 1) { cIdx++; paintColour(); } else closeColour(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!cOv.hidden) closeColour(); if (!tOv.hidden) closeTouch(); } });

  /* ---------- touch grid ---------- */
  var tOv = $("#touch-ov"), grid = $("#touch-grid"), dots = $("#touch-dots");
  var gCols = 12, gRows = 16, hit = [], hitCount = 0, maxT = 0, cells = [];
  function buildGrid() {
    var gb = grid.getBoundingClientRect();
    var land = (gb.width || window.innerWidth) > (gb.height || window.innerHeight);
    gCols = land ? 16 : 12; gRows = land ? 12 : 16;
    grid.style.gridTemplateColumns = "repeat(" + gCols + ",1fr)";
    grid.style.gridTemplateRows = "repeat(" + gRows + ",1fr)";
    grid.innerHTML = ""; cells = []; hit = []; hitCount = 0; maxT = 0;
    for (var i = 0; i < gCols * gRows; i++) { var d = document.createElement("div"); grid.appendChild(d); cells.push(d); hit.push(false); }
    updHud(0);
  }
  function updHud(now) {
    var pct = Math.round(hitCount / (gCols * gRows) * 100);
    $("#touch-pct").textContent = pct + "%";
    $("#touch-now").textContent = now + " touch" + (now === 1 ? "" : "es");
    $("#touch-max").textContent = "max " + maxT;
  }
  function markAt(x, y) {
    var b = grid.getBoundingClientRect();
    if (!b.width || !b.height) return;
    var c = Math.floor((x - b.left) / b.width * gCols), r = Math.floor((y - b.top) / b.height * gRows);
    if (c < 0 || r < 0 || c >= gCols || r >= gRows) return;
    var i = r * gCols + c;
    if (!hit[i]) { hit[i] = true; hitCount++; cells[i].className = "hit"; }
  }
  function onTouches(e) {
    if (e.target.closest && e.target.closest("#touch-hud button")) return;
    e.preventDefault();
    var t = e.touches;
    maxT = Math.max(maxT, t.length);
    var html = "";
    for (var i = 0; i < t.length; i++) { markAt(t[i].clientX, t[i].clientY); html += '<div class="dot" style="left:' + t[i].clientX + "px;top:" + t[i].clientY + 'px">' + (i + 1) + "</div>"; }
    dots.innerHTML = html;
    updHud(t.length);
  }
  ["touchstart", "touchmove", "touchend", "touchcancel"].forEach(function (ev) { tOv.addEventListener(ev, onTouches, { passive: false }); });
  var mouseDown = false;
  tOv.addEventListener("mousedown", function (e) { if (e.target.closest("#touch-hud button")) return; mouseDown = true; markAt(e.clientX, e.clientY); updHud(1); });
  tOv.addEventListener("mousemove", function (e) { if (mouseDown) { markAt(e.clientX, e.clientY); updHud(1); } });
  window.addEventListener("mouseup", function () { mouseDown = false; });
  function closeTouch() {
    if (tOv.hidden) return;
    tOv.hidden = true; lockScroll(false); exitFs(); dots.innerHTML = "";
    var pct = Math.round(hitCount / (gCols * gRows) * 100);
    $("#touch-result").textContent = "Last run: " + pct + "% of cells covered, most fingers at once " + maxT + "." + (pct === 100 ? " Every cell responded." : " Any cell that never turned green is a possible dead zone, run it again to confirm.");
  }
  $("#touch-start").addEventListener("click", function () { if (!tOv.hidden) return; tOv.hidden = false; lockScroll(true); buildGrid(); enterFs(tOv); setTimeout(function () { if (!tOv.hidden && hitCount === 0) buildGrid(); }, 300); });
  $("#touch-done").addEventListener("click", closeTouch);
  $("#touch-clear").addEventListener("click", buildGrid);
  $("#touch-move").addEventListener("click", function () { $("#touch-hud").classList.toggle("alt"); });
  document.addEventListener("gesturestart", function (e) { if (!tOv.hidden || !cOv.hidden) e.preventDefault(); });
  window.addEventListener("resize", function () { if (!tOv.hidden && hitCount === 0) buildGrid(); dots.innerHTML = ""; });

  /* ---------- speakers (Web Audio, started from a tap so iOS allows it) ---------- */
  var actx = null;
  function setSession(type) {
    try { if (navigator.audioSession) navigator.audioSession.type = type; } catch (e) { /* older iPadOS */ }
  }
  /* Must be called synchronously inside a tap handler so iOS lets audio start. */
  function audioCtx() {
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    if (!actx || actx.state === "closed") {
      try { actx = new C(); } catch (e) { actx = null; return null; }
      try {
        var b = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource();
        src.buffer = b; src.connect(actx.destination); src.start(0);
      } catch (e2) { /* unlock is best effort */ }
    }
    if (actx.state !== "running" && actx.resume) { try { var r = actx.resume(); if (r && r.catch) r.catch(function () {}); } catch (e3) { /* ignore */ } }
    return actx;
  }
  function tone(panFrom, panTo, freq, secs, vol, label) {
    setSession("playback");
    var ctx = audioCtx();
    if (!ctx) { $("#spk-msg").textContent = "Web Audio is not available. Play a stereo test video on YouTube instead."; return; }
    var t = ctx.currentTime + 0.05, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.05);
    g.gain.setValueAtTime(vol, t + secs - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + secs);
    o.connect(g);
    if (typeof ctx.createStereoPanner === "function") {
      var p = ctx.createStereoPanner(); p.pan.setValueAtTime(panFrom, t); p.pan.linearRampToValueAtTime(panTo, t + secs);
      g.connect(p); p.connect(ctx.destination);
    } else g.connect(ctx.destination);
    o.start(t); o.stop(t + secs + 0.05);
    liveOsc.push(o);
    o.onended = function () { var i = liveOsc.indexOf(o); if (i > -1) liveOsc.splice(i, 1); };
    $("#spk-msg").textContent = "Playing: " + label + ". If you hear nothing, turn the volume up with the side buttons.";
  }
  var TONES = {
    left: [-1, -1, 440, 1.5, 0.5, "left channel"], right: [1, 1, 660, 1.5, 0.5, "right channel"], both: [0, 0, 523, 1.5, 0.5, "both channels"],
    sweep: [-1, 1, 440, 4, 0.5, "sweep left to right"], bass: [0, 0, 80, 3, 0.8, "low bass tone"], loud: [0, 0, 1000, 2, 0.95, "loud tone, listen for crackle"]
  };
  var liveOsc = [];
  function stopTones() { liveOsc.slice().forEach(function (o) { try { o.stop(); } catch (e) { /* already stopped */ } }); liveOsc = []; }
  $("#spk-stop").addEventListener("click", function () { stopTones(); $("#spk-msg").textContent = "Stopped."; });
  $$("[data-tone]").forEach(function (b) { b.addEventListener("click", function () { var a = TONES[b.getAttribute("data-tone")]; stopTones(); tone(a[0], a[1], a[2], a[3], a[4], a[5]); }); });

  /* ---------- microphone ---------- */
  /* ---------- shared error text ---------- */
  function mediaErr(kind, err) {
    var n = err && err.name ? err.name : "Error";
    var app = kind === "Camera" ? "the Camera app" : "Voice Memos";
    if (n === "NotAllowedError" || n === "SecurityError" || n === "PermissionDeniedError")
      return kind + " permission was denied. In Safari tap aA in the address bar > Website Settings > " + kind + " > Allow (or Ask), then tap the button again. If no prompt appears, reload the page. Fallback: " + app + ".";
    if (n === "NotFoundError" || n === "DevicesNotFoundError" || n === "OverconstrainedError")
      return "No " + kind.toLowerCase() + " was found for this request. Try the other button, or check in " + app + ". A missing camera or mic on an iPad is a hardware fault.";
    if (n === "NotReadableError" || n === "TrackStartError" || n === "AbortError")
      return "The " + kind.toLowerCase() + " is busy or could not start. Close other apps using it (FaceTime, Camera), wait a second and tap again. If it keeps failing, test in " + app + ".";
    return kind + " could not start (" + n + "). Tap again, reload the page, or use " + app + ".";
  }

  /* ---------- microphone ---------- */
  var micUrl = "", micBusy = false, micStop = null;
  function stopMic() { if (micStop) micStop(); }
  $("#mic-stop").addEventListener("click", function () { if (micBusy) stopMic(); });
  $("#mic-rec").addEventListener("click", function () {
    if (micBusy) return;
    var msg = $("#mic-msg"); msg.textContent = "";
    if (!window.isSecureContext) { msg.textContent = "The microphone needs an HTTPS page."; return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = "Microphone access is not available in this browser. Use Voice Memos instead."; return; }
    camWanted = ""; stopCam();
    micBusy = true; var cancelled = false;
    $("#mic-rec").disabled = true; $("#mic-rec").textContent = "Starting mic..."; $("#mic-stop").disabled = false;
    setSession("play-and-record");
    var ctx = audioCtx(); /* created inside the tap so the level meter runs on iOS */
    var reset = function () { micBusy = false; micStop = null; $("#mic-rec").disabled = false; $("#mic-stop").disabled = true; $("#mic-level").style.width = "0"; setSession("playback"); };
    micStop = function () { cancelled = true; reset(); $("#mic-rec").textContent = "Record 5 seconds"; msg.textContent = "Stopped."; };
    var gum;
    try { gum = navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e0) { gum = Promise.reject(e0); }
    gum.then(function (stream) {
      if (cancelled) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      var an = null, buf = null, raf = 0, peak = 0, iv = 0, ended = false;
      if (ctx && ctx.state !== "running" && ctx.resume) { try { ctx.resume().catch(function () {}); } catch (e1) { /* ignore */ } }
      if (ctx) {
        try {
          var src = ctx.createMediaStreamSource(stream); an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an); buf = new Uint8Array(an.fftSize);
        } catch (e6) { an = null; }
      }
      if (an) {
        var loop = function () {
          if (ended) return;
          an.getByteTimeDomainData(buf); var s = 0;
          for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; s += v * v; }
          var rms = Math.min(1, Math.sqrt(s / buf.length) * 4); peak = Math.max(peak, rms);
          $("#mic-level").style.width = Math.round(rms * 100) + "%";
          raf = requestAnimationFrame(loop);
        };
        loop();
      }
      var chunks = [], rec = null;
      if (typeof window.MediaRecorder === "function") {
        var mt = "";
        var cands = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm"];
        for (var ci = 0; ci < cands.length; ci++) {
          try { if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(cands[ci])) { mt = cands[ci]; break; } } catch (e2) { /* ignore */ }
        }
        try { rec = mt ? new MediaRecorder(stream, { mimeType: mt }) : new MediaRecorder(stream); } catch (e3) {
          try { rec = new MediaRecorder(stream); } catch (e4) { rec = null; }
        }
      }
      var release = function () { ended = true; clearInterval(iv); cancelAnimationFrame(raf); stream.getTracks().forEach(function (t) { t.stop(); }); };
      var finish = function () {
        release(); reset(); $("#mic-rec").textContent = "Record again";
        msg.textContent = "Peak level " + Math.round(peak * 100) + "%. A healthy mic at normal speaking volume moves the meter well past 25%. " + (rec ? "Tap Play back and listen." : "Recording is not supported here, so use Voice Memos for playback.");
      };
      micStop = function () {
        cancelled = true;
        if (rec) { rec.onstop = null; try { if (rec.state !== "inactive") rec.stop(); } catch (e7) { /* ignore */ } }
        release(); reset(); $("#mic-rec").textContent = "Record 5 seconds"; msg.textContent = "Recording stopped early. Tap Record to try again.";
      };
      if (rec) {
        rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
        rec.onstop = function () {
          if (chunks.length) {
            if (micUrl) URL.revokeObjectURL(micUrl);
            var type = (rec.mimeType || (chunks[0] && chunks[0].type) || "audio/mp4").split(";")[0];
            micUrl = URL.createObjectURL(new Blob(chunks, { type: type }));
            var au = $("#mic-audio"); au.src = micUrl; au.hidden = false; try { au.load(); } catch (e5) { /* ignore */ }
            $("#mic-play").disabled = false;
          }
          finish();
        };
        rec.onerror = function () { finish(); };
        try { rec.start(); } catch (e8) { rec = null; }
      }
      stream.getTracks().forEach(function (t) { t.addEventListener("ended", function () { if (!ended && micBusy) { if (rec && rec.state !== "inactive") { try { rec.stop(); } catch (e9) { finish(); } } else finish(); } }); });
      var n = 5; $("#mic-rec").textContent = "Recording... 5s";
      iv = setInterval(function () {
        n--; $("#mic-rec").textContent = "Recording... " + Math.max(n, 0) + "s";
        if (n <= 0) { clearInterval(iv); if (rec && rec.state !== "inactive") { try { rec.stop(); } catch (e10) { finish(); } } else finish(); }
      }, 1000);
    }).catch(function (err) {
      if (cancelled) return;
      reset(); $("#mic-rec").textContent = "Try again";
      msg.textContent = mediaErr("Microphone", err);
    });
  });
  $("#mic-play").addEventListener("click", function () {
    if (!micUrl) return;
    var a = $("#mic-audio");
    try { a.currentTime = 0; } catch (e) { /* ignore */ }
    var p = a.play();
    if (p && p.catch) p.catch(function () { $("#mic-msg").textContent = "Playback was blocked. Use the play button on the audio bar below."; });
  });

  /* ---------- cameras ---------- */
  var camStream = null, camWanted = "", video = $("#cam-video");
  video.muted = true; video.setAttribute("muted", ""); video.setAttribute("playsinline", ""); video.setAttribute("webkit-playsinline", "");
  function stopCam() { if (camStream) camStream.getTracks().forEach(function (t) { t.stop(); }); camStream = null; video.srcObject = null; $("#cam-snap").disabled = true; $("#cam-stop").disabled = true; }
  function startCam(facing) {
    var msg = $("#cam-msg"); msg.textContent = "";
    if (!window.isSecureContext) { msg.textContent = "The camera needs an HTTPS page."; return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = "Camera access is not available in this browser. Use the Camera app instead."; return; }
    var hadCam = !!camStream;
    stopMic();
    stopCam();
    msg.textContent = "Starting camera...";
    var attempts = [
      { audio: false, video: { facingMode: { exact: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { audio: false, video: { facingMode: facing } },
      { audio: false, video: true }
    ];
    var tryCam = function (i) {
      return navigator.mediaDevices.getUserMedia(attempts[i]).catch(function (err) {
        var name = err && err.name;
        if (i < attempts.length - 1 && (name === "OverconstrainedError" || name === "NotFoundError" || name === "NotReadableError" || name === "AbortError" || name === "TypeError")) return tryCam(i + 1);
        throw err;
      });
    };
    setTimeout(function () { tryCam(0).then(function (s) {
      if (camWanted !== facing) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      camStream = s; video.srcObject = s;
      s.getTracks().forEach(function (t) { t.addEventListener("ended", function () { if (camStream === s) { stopCam(); $("#cam-msg").textContent = "The camera stopped (the iPad may have locked or another app took it). Tap Front or Back to restart."; } }); }); video.setAttribute("playsinline", ""); var p = video.play(); if (p && p.catch) p.catch(function () {});
      $("#cam-snap").disabled = false; $("#cam-stop").disabled = false;
      var tr = s.getVideoTracks()[0], st = tr && tr.getSettings ? tr.getSettings() : {};
      var real = st.facingMode ? (st.facingMode === "user" ? "front" : "back") : (facing === "user" ? "front" : "back");
      msg.textContent = (real === "front" ? "Front" : "Back") + " camera on: " + (tr ? tr.label : "") + (st.width ? ", " + st.width + " x " + st.height : "") + ". Move closer and further to check focus.";
    }).catch(function (err) {
      if (camWanted !== facing) return;
      msg.textContent = mediaErr("Camera", err);
    }); }, hadCam ? 200 : 0);
  }
  $("#cam-front").addEventListener("click", function () { camWanted = "user"; startCam("user"); });
  $("#cam-back").addEventListener("click", function () { camWanted = "environment"; startCam("environment"); });
  $("#cam-stop").addEventListener("click", function () { camWanted = ""; stopCam(); $("#cam-msg").textContent = "Camera stopped."; });
  $("#cam-snap").addEventListener("click", function () {
    if (!video.videoWidth) return;
    var c = document.createElement("canvas"); c.width = video.videoWidth; c.height = video.videoHeight;
    c.getContext("2d").drawImage(video, 0, 0);
    var img = new Image(); img.src = c.toDataURL("image/jpeg", 0.85); img.alt = "Snapshot";
    $("#cam-snaps").prepend(img);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (camStream) { camWanted = ""; stopCam(); $("#cam-msg").textContent = "Camera paused while the page was in the background. Tap Front or Back to restart."; }
      if (micBusy) stopMic();
      stopTones();
    }
  });
  window.addEventListener("pagehide", function () { camWanted = ""; stopCam(); stopMic(); });

  /* ---------- motion ---------- */
  var motionOn = false, motionAsking = false, hOri = null, hMot = null, motionT = 0;
  function stopMotion() {
    if (hOri) window.removeEventListener("deviceorientation", hOri);
    if (hMot) window.removeEventListener("devicemotion", hMot);
    hOri = hMot = null; motionOn = false; clearTimeout(motionT);
    $("#motion-start").textContent = "Start sensors"; $("#motion-start").disabled = false; $("#motion-stop").disabled = true;
  }
  $("#motion-stop").addEventListener("click", function () { stopMotion(); $("#motion-msg").textContent = "Sensors stopped."; });
  $("#motion-start").addEventListener("click", function () {
    if (motionOn || motionAsking) return;
    var msg = $("#motion-msg"); msg.textContent = "";
    var go = function () {
      if (motionOn) return; motionOn = true; $("#motion-start").textContent = "Sensors on"; $("#motion-start").disabled = true; $("#motion-stop").disabled = false;
      var got = false, o = null, a = null;
      var show = function () {
        var s = "";
        if (o) s += "tilt front/back " + o.b.toFixed(1) + "\u00b0, side " + o.g.toFixed(1) + "\u00b0, heading " + o.a.toFixed(0) + "\u00b0";
        if (a) s += (s ? " | " : "") + "accel x " + a.x.toFixed(1) + " y " + a.y.toFixed(1) + " z " + a.z.toFixed(1);
        $("#motion-vals").textContent = s;
        if (o) {
          var bx = Math.max(-1, Math.min(1, o.g / 45)), by = Math.max(-1, Math.min(1, o.b / 45));
          $("#bubble").style.transform = "translate(calc(-50% + " + (bx * 80) + "px), calc(-50% + " + (by * 80) + "px))";
        }
        if (got) msg.textContent = "";
      };
      var num = function (v) { return typeof v === "number" && isFinite(v) ? v : 0; };
      hOri = function (e) { if (e.beta === null && e.gamma === null) return; got = true; o = { a: num(e.alpha), b: num(e.beta), g: num(e.gamma) }; show(); };
      hMot = function (e) { var g = e.accelerationIncludingGravity; if (g && g.x !== null && g.x !== undefined) { got = true; a = { x: num(g.x), y: num(g.y), z: num(g.z) }; show(); } };
      window.addEventListener("deviceorientation", hOri);
      window.addEventListener("devicemotion", hMot);
      motionT = setTimeout(function () { if (!got && motionOn) msg.textContent = "No sensor data yet. Check Settings > Apps > Safari > Motion & Orientation Access is on, then reload. Fallback: Measure app Level, and check the screen rotates."; }, 3000);
    };
    var DOE = window.DeviceOrientationEvent, DME = window.DeviceMotionEvent;
    var ask = function (C) {
      if (!C || typeof C.requestPermission !== "function") return Promise.resolve("n/a");
      try { return C.requestPermission().catch(function () { return "error"; }); } catch (e) { return Promise.resolve("error"); }
    };
    if ((DOE && typeof DOE.requestPermission === "function") || (DME && typeof DME.requestPermission === "function")) {
      motionAsking = true;
      /* Both requests start synchronously inside this tap, as iOS requires. */
      Promise.all([ask(DOE), ask(DME)]).then(function (r) {
        motionAsking = false;
        if (r[0] === "granted" || r[1] === "granted") go();
        else if (r[0] === "denied" || r[1] === "denied") msg.textContent = "Motion permission was denied. Safari only asks once per visit: close this tab, open the link again and tap Allow. Fallback: Measure app Level.";
        else msg.textContent = "The motion permission prompt did not appear. Tap Start sensors again. Fallback: Measure app Level.";
      });
    } else if (DOE || DME) go();
    else msg.textContent = "This browser has no motion sensor support. Use the Measure app Level instead.";
  });

  /* ---------- pencil / drawing pad ---------- */
  var pad = $("#pad"), pctx = null, last = {};
  function sizePad() {
    var r = pad.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    pad.width = Math.round(r.width * dpr); pad.height = Math.round(r.height * dpr);
    padW = Math.round(r.width);
    pctx = pad.getContext("2d"); pctx.setTransform(dpr, 0, 0, dpr, 0, 0); pctx.lineCap = "round"; pctx.lineJoin = "round";
  }
  function padPos(e) { var r = pad.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  pad.addEventListener("pointerdown", function (e) { if (!pctx) sizePad(); try { pad.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } last[e.pointerId] = padPos(e); e.preventDefault(); });
  pad.addEventListener("pointermove", function (e) {
    if (!last[e.pointerId] || !pctx) return;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
    evs.forEach(function (ev) {
      var p = padPos(ev), pr = ev.pressure || 0.5;
      pctx.strokeStyle = ev.pointerType === "pen" ? "#1d4ed8" : "#111";
      pctx.lineWidth = ev.pointerType === "pen" ? 1 + pr * 6 : 4;
      pctx.beginPath(); pctx.moveTo(last[e.pointerId].x, last[e.pointerId].y); pctx.lineTo(p.x, p.y); pctx.stroke();
      last[e.pointerId] = p;
    });
    $("#pad-info").textContent = "input: " + e.pointerType + ", pressure " + (e.pressure || 0).toFixed(2) + (e.pointerType === "pen" ? ", tilt " + (e.tiltX || 0) + "/" + (e.tiltY || 0) : "");
    e.preventDefault();
  });
  ["pointerup", "pointercancel"].forEach(function (ev) { pad.addEventListener(ev, function (e) { delete last[e.pointerId]; }); });
  $("#pad-clear").addEventListener("click", function () { sizePad(); });
  var padW = 0;
  window.addEventListener("resize", function () {
    if (!pctx) return;
    var w = Math.round(pad.getBoundingClientRect().width);
    if (w === padW || !w) return;
    var keep = null;
    try { keep = document.createElement("canvas"); keep.width = pad.width; keep.height = pad.height; keep.getContext("2d").drawImage(pad, 0, 0); } catch (e) { keep = null; }
    sizePad();
    if (keep) { try { pctx.drawImage(keep, 0, 0, keep.width, keep.height, 0, 0, pad.getBoundingClientRect().width, pad.getBoundingClientRect().height); } catch (e2) { /* ignore */ } }
  });

  /* ---------- screen info ---------- */
  function screenInfo() {
    var s = window.screen;
    var rows = [["Screen (points)", s.width + " x " + s.height], ["Pixel ratio", String(window.devicePixelRatio)], ["Max touch points", String(navigator.maxTouchPoints || 0)], ["Browser", navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("CriOS") === -1 ? "Safari" : "Other"], ["Secure page (HTTPS)", window.isSecureContext ? "Yes" : "No"]];
    $("#screen-info").innerHTML = rows.map(function (r) { return "<div>" + esc(r[0]) + "</div><div>" + esc(r[1]) + "</div>"; }).join("");
  }

  /* ---------- facts tab ---------- */
  function renderFacts() {
    $("#facts").innerHTML = FACT_DEFS.map(function (f) { return "<div>" + esc(f[1]) + "</div><div>" + esc(fact(f[0])) + "</div>"; }).join("");
    $$("[data-fact]").forEach(function (el) { el.textContent = fact(el.getAttribute("data-fact")); });
    $("#fact-edit").innerHTML = FACT_DEFS.map(function (f) {
      return '<label class="f">' + esc(f[1]) + '<input class="fact" data-k="' + f[0] + '" value="' + esc(state.facts[f[0]] || "") + '" placeholder="' + esc(f[2]) + '" autocomplete="off" autocapitalize="off" spellcheck="false"></label>';
    }).join("");
  }
  $("#fact-edit").addEventListener("change", function (e) {
    var t = e.target; if (!t.hasAttribute("data-k")) return;
    var v = t.value.trim(); if (v) state.facts[t.getAttribute("data-k")] = v.slice(0, 200); else delete state.facts[t.getAttribute("data-k")];
    save(); renderFacts(); renderChecklist();
  });

  /* ---------- boot ---------- */
  save();
  renderFacts(); renderChecklist(); renderMarks(); screenInfo();
  var startTab = "checklist";
  try { startTab = sessionStorage.getItem("ipc_tab") || "checklist"; } catch (e) { /* ignore */ }
  if (startTab !== "checklist" && startTab !== "tests" && startTab !== "ipad") startTab = "checklist";
  showTab(startTab);
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { /* offline cache is optional */ }); });
  }
})();
