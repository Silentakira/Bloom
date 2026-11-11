/* Akira Uriel — portfolio. Hand-written motion, no libraries. */

/* ============================================================
   PROJECTS — edit this list. Swap `poster` for an <img> tag
   (e.g. '<img src="work/halde.jpg" alt="">') to use real work.
   ============================================================ */
const cap = (c, a, b) =>
  `<text x="20" y="32" fill="${c}" font-family="DM Mono, monospace" font-size="9" letter-spacing=".4">${a}</text>` +
  `<text x="20" y="382" fill="${c}" font-family="DM Mono, monospace" font-size="9" letter-spacing=".4">${b}</text>`;
const svg = (bg, inner) =>
  `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="300" height="400" fill="${bg}"/>${inner}</svg>`;
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");

const projects = [
  {
    title: "Halde", kind: "Visual identity", year: "2026", client: "Halde Ceramics", role: "Identity, packaging",
    blurb: "An identity for a two-person ceramics studio. One circle, cropped differently every time it appears, stands in for the wheel, the kiln door and the finished plate.",
    poster: svg("#e6dfd0", `<circle cx="215" cy="255" r="150" fill="#b8402a"/><circle cx="88" cy="118" r="44" fill="#161514"/>${cap("#161514", "HALDE CERAMICS", "IDENTITY — 2026")}`),
  },
  {
    title: "Nocturne", kind: "Poster series", year: "2026", client: "Nocturne Type Festival", role: "Art direction, type",
    blurb: "Campaign for a three-night festival of type and sound. The rings are a score: each poster in the series plays one bar further into the night.",
    poster: svg("#0f0f10", `${range(7, i => `<circle cx="150" cy="410" r="${50 + i * 52}" fill="none" stroke="#d7ff3a" stroke-width="${16 - i * 2}"/>`)}${cap("#d7ff3a", "NOCTURNE TYPE FESTIVAL", "03 NIGHTS — 2026")}`),
  },
  {
    title: "Slow Atlas", kind: "Book design", year: "2025", client: "Field Press", role: "Editorial design",
    blurb: "A 320-page atlas of walking routes, set on a grid that follows the pace of the walk. Long lines for flat ground, short ones where the path climbs.",
    poster: svg("#2440ff", `${[230, 180, 250, 120, 210, 90, 240, 160, 200, 60, 220, 140].map((w, i) => `<rect x="20" y="${70 + i * 23}" width="${w}" height="7" fill="#f1f1ee"/>`).join("")}${cap("#f1f1ee", "SLOW ATLAS", "FIELD PRESS — 2025")}`),
  },
  {
    title: "Tidewater", kind: "Wayfinding", year: "2025", client: "Tidewater Transit", role: "Signage system",
    blurb: "Signage for a harbour ferry network. Arrows drawn on the same angle as the tide tables, readable from a moving deck in bad weather.",
    poster: svg("#f3f2ec", `<rect y="200" width="300" height="200" fill="#ffc400"/><path d="M62 338 L226 174 M112 174 H226 V288" stroke="#111" stroke-width="36" fill="none"/>${cap("#111", "TIDEWATER TRANSIT", "WAYFINDING — 2025")}`),
  },
  {
    title: "Paper Weather", kind: "Publication", year: "2024", client: "Self-initiated", role: "Design, writing, print",
    blurb: "A risograph journal that reports the weather a month late. Every issue turns thirty days of forecasts into one halftone field.",
    poster: svg("#ff5a2b", `${range(88, i => { const x = i % 8, y = Math.floor(i / 8); const r = 3 + 10 * Math.abs(Math.sin(x * 0.7 + y * 0.45)); return `<circle cx="${33 + x * 33.5}" cy="${62 + y * 29}" r="${r.toFixed(1)}" fill="#1a0e0a"/>`; })}${cap("#1a0e0a", "PAPER WEATHER Nº 4", "RISOGRAPH — 2024")}`),
  },
  {
    title: "Oru", kind: "Packaging", year: "2023", client: "Oru Tea", role: "Packaging, illustration",
    blurb: "Folded cartons for a small tea importer. The box opens along the same creases as the pattern printed on it.",
    poster: svg("#1c3a2e", `<polygon points="40,330 150,80 150,330" fill="#f4b6c8"/><polygon points="150,330 150,80 260,330" fill="#f9d7e0"/><polygon points="150,160 208,280 150,330" fill="#e58fa9"/>${cap("#f9d7e0", "ORU TEA", "PACKAGING — 2023")}`),
  },
];

/* ---------- Helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const root = document.documentElement;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mouse = { x: innerWidth / 2, y: innerHeight / 2, moved: false };
const pad = n => String(n).padStart(2, "0");

/* ---------- Theme ---------- */
const themeBtn = $("[data-theme-toggle]");
let dark = root.classList.contains("theme-dark");
const inkNow = () => (dark ? "#f1f1ee" : "#0d0d0c");
const glowNow = () => (dark ? 0.44 : 0.3);
function labelTheme() {
  themeBtn.dataset.t = themeBtn.firstElementChild.textContent = dark ? "Light" : "Dark";
  themeBtn.setAttribute("aria-pressed", dark);
}
function setTheme(next) {
  dark = next;
  root.classList.toggle("theme-dark", dark);
  labelTheme();
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  // the flowers are drawn in ink, so they are redrawn in the new ink (light flowers on dark use the inverse shading)
  for (const f of [...flowers, plant, ...colBlooms]) {
    if (!f) continue;
    f.ink = inkNow(); f.invert = dark;
    if (!f.cols) continue;
    buildGrid(f, f.cols);
    if (f === plant) f.g = -1;
    else if (f.done) { drawFlower(f, 1); f.glow.style.opacity = glowNow(); }
  }
  if (stems) drawStems(performance.now());
}
themeBtn.addEventListener("click", () => setTheme(!dark));
labelTheme();

/* ---------- Kinetic display type ---------- */
// Split into letters; each letter gains a little weight as the cursor nears it.
const kinetics = $$("[data-kinetic]").map(el => {
  let i = 0;
  const chars = [];
  $$(".line__inner", el).forEach(line => {
    const text = line.textContent;
    line.textContent = "";
    for (const c of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", i++);
      s.textContent = c === " " ? " " : c;
      line.append(s);
      chars.push({ el: s, v: 0, last: -1 });
    }
  });
  return { el, chars, visible: false };
});

function fit() {
  $$("[data-fit]").forEach(el => {
    el.style.fontSize = "100px";
    el.style.width = "max-content";
    const w = el.getBoundingClientRect().width;
    el.style.width = "";
    el.style.fontSize = (100 * el.clientWidth) / w + "px";
  });
}

function tickKinetic(now) {
  const radius = Math.max(200, innerWidth * 0.2);
  for (const k of kinetics) {
    if (!k.visible) continue;
    const useMouse = fine && mouse.moved;
    const rects = useMouse ? k.chars.map(c => c.el.getBoundingClientRect()) : null;
    k.chars.forEach((c, i) => {
      let t = 0;
      if (reduce) t = 0;
      else if (useMouse) {
        const r = rects[i];
        t = clamp(1 - Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2)) / radius);
        t = t * t * (3 - 2 * t);
      } else {
        t = Math.pow((Math.sin(now / 1400 - i * 0.5) + 1) / 2, 2) * 0.55; // idle wave
      }
      if (c.hold && !reduce) t = Math.max(t, 0.9); // a frog is sitting on this letter
      c.v = lerp(c.v, t, c.hold ? 0.12 : 0.05);
      if (Math.abs(c.v - c.last) > 0.003) {
        c.last = c.v;
        c.el.style.fontVariationSettings = `"wght" ${(300 + 260 * c.v).toFixed(0)}, "wdth" 100`;
      }
    });
  }
}

/* ---------- Work list, preview, case overlay ---------- */
const rows = $("[data-rows]");
const stagePoster = $("[data-preview]");
const stageInfo = $(".stage__info");
const st = Object.fromEntries($$("[data-stage]").map(el => [el.dataset.stage, el]));
rows.innerHTML = projects.map((p, i) => `
  <li class="row" style="--i:${i}">
    <button class="row__btn" data-i="${i}" data-cursor="view" aria-label="${p.title}, ${p.kind}, ${p.year}">
      <span class="row__mask mono"><span>${pad(i + 1)}</span></span>
      <span class="row__mask"><span class="row__t">${p.title}</span></span>
      <span class="row__mask mono row__d"><span>${p.kind}</span></span>
      <span class="row__mask mono row__y"><span>${p.year}</span></span>
      <span class="row__thumb">${p.poster}</span>
    </button>
  </li>`).join("");
stagePoster.innerHTML = projects.map(p => `<div class="preview__item">${p.poster}</div>`).join("");
const previewItems = $$(".preview__item");
const rowEls = $$(".row");
const wide = () => innerWidth >= 760;
let z = 1, active = -1, overRows = false, infoTimer, lastPickY = -1;

// The stage beside the list shows the active project: its poster, typed out in
// characters first, plus the client, role and a short description.
function setActive(i) {
  if (i === active || !wide()) return;
  active = i;
  rows.classList.add("has-active");
  rowEls.forEach((r, j) => r.classList.toggle("is-active", j === i));
  previewItems.forEach((it, j) => it.classList.toggle("is-active", j === i));
  previewItems[i].style.zIndex = ++z;
  develop(previewItems[i], i);
  const p = projects[i];
  stageInfo.classList.add("is-swapping");
  clearTimeout(infoTimer);
  infoTimer = setTimeout(() => {
    st.idx.textContent = `${pad(i + 1)} / ${pad(projects.length)} — ${p.kind}`;
    st.client.textContent = p.client; st.role.textContent = p.role; st.year.textContent = p.year;
    st.blurb.textContent = p.blurb;
    stageInfo.classList.remove("is-swapping");
  }, reduce ? 0 : 220);
}
$$(".row__btn").forEach(btn => {
  const i = +btn.dataset.i;
  btn.addEventListener("mouseenter", () => setActive(i));
  btn.addEventListener("focus", () => setActive(i));
  btn.addEventListener("click", () => openCase(i, btn));
});
rows.addEventListener("mouseenter", () => (overRows = true));
rows.addEventListener("mouseleave", () => (overRows = false));
// with no hover, the project nearest the reading line is the active one
function pickByScroll() {
  if (overRows || !wide() || scrollY === lastPickY) return;
  lastPickY = scrollY;
  const line = innerHeight * 0.42;
  let best = -1, dist = Infinity;
  rowEls.forEach((r, i) => {
    const b = r.getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - line);
    if (d < dist) { dist = d; best = i; }
  });
  if (best >= 0) setActive(best);
}

const caseEl = $(".case");
const cs = Object.fromEntries($$("[data-case]").map(el => [el.dataset.case, el]));
let current = 0, returnFocus = null, closeTimer;

function fillCase(i) {
  const p = projects[i], next = projects[(i + 1) % projects.length];
  current = i;
  cs.idx.textContent = `${pad(i + 1)} / ${pad(projects.length)}`;
  cs.poster.innerHTML = p.poster;
  develop(cs.poster, i, 550);
  cs.kind.textContent = `${p.kind} — ${p.year}`;
  cs.title.textContent = p.title;
  cs.blurb.textContent = p.blurb;
  cs.meta.innerHTML = `<dt>Client</dt><dd>${p.client}</dd><dt>Role</dt><dd>${p.role}</dd><dt>Year</dt><dd>${p.year}</dd>`;
  cs.nextTitle.textContent = next.title;
}
function openCase(i, from) {
  clearTimeout(closeTimer);
  returnFocus = from;
  fillCase(i);
  caseEl.hidden = false;
  caseEl.classList.remove("is-closing");
  caseEl.scrollTop = 0;
  void caseEl.offsetWidth; // commit start state so the wipe animates
  caseEl.classList.add("is-open");
  root.classList.add("is-locked");
  caseEl.focus({ preventScroll: true });
  cursorState();
}
function closeCase() {
  if (!caseEl.classList.contains("is-open")) return;
  caseEl.classList.add("is-closing");
  root.classList.remove("is-locked");
  closeTimer = setTimeout(() => {
    caseEl.hidden = true;
    caseEl.classList.remove("is-open", "is-closing");
  }, reduce ? 0 : 1300);
  returnFocus?.focus({ preventScroll: true });
}
cs.close.addEventListener("click", closeCase);
cs.next.addEventListener("click", () => {
  caseEl.classList.add("is-swapping");
  setTimeout(() => {
    fillCase((current + 1) % projects.length);
    caseEl.scrollTo({ top: 0 });
    caseEl.classList.remove("is-swapping");
  }, reduce ? 0 : 420);
});
addEventListener("keydown", e => {
  if (e.key === "Escape") closeCase();
  if (e.key === "Tab" && caseEl.classList.contains("is-open")) { // keep focus inside the dialog
    const f = [cs.close, cs.next];
    const idx = f.indexOf(document.activeElement);
    e.preventDefault();
    f[(idx + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
  }
});

/* ---------- Scroll-scrubbed statement ---------- */
const scrub = $("[data-scrub]");
const words = scrub.textContent.trim().split(/\s+/).map(w => {
  const s = document.createElement("span");
  s.className = "w";
  s.textContent = s.dataset.t = w;
  return s;
});
scrub.textContent = "";
words.forEach((w, i) => scrub.append(w, i < words.length - 1 ? " " : ""));
let litCount = -1;
function tickScrub() {
  const r = scrub.getBoundingClientRect();
  const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.3));
  scrubP = p;
  const lit = Math.round(p * words.length);
  if (lit === litCount) return;
  if (!reduce && litCount >= 0) for (let i = litCount; i < lit; i++) scrambling.set(words[i], performance.now() + (i - litCount) * 45);
  litCount = lit;
  words.forEach((w, i) => (w.style.opacity = i < lit ? 1 : ""));
}

/* ---------- Cursor + magnetic ---------- */
const cursor = $(".cursor");
const cpos = { x: mouse.x, y: mouse.y };
const ppos = { x: mouse.x, y: mouse.y };
if (fine && !reduce) root.classList.add("has-cursor");
addEventListener("pointermove", e => {
  if (e.pointerType !== "mouse") return;
  mouse.x = e.clientX; mouse.y = e.clientY;
  if (!mouse.moved) { mouse.moved = true; Object.assign(cpos, mouse); Object.assign(ppos, mouse); cursor.classList.add("is-on"); }
  cursorState(e.target);
});
// what is under the pointer decides the cursor's shape (also re-checked on scroll)
function cursorState(target = document.elementFromPoint(mouse.x, mouse.y)) {
  const t = target?.closest?.("[data-cursor], a, button");
  const view = t?.dataset.cursor === "view";
  cursor.classList.toggle("is-view", !!view);
  cursor.classList.toggle("is-link", !!t && !view);
}
addEventListener("scroll", () => mouse.moved && cursorState(), { passive: true });
document.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
document.addEventListener("mouseenter", () => mouse.moved && cursor.classList.add("is-on"));

if (fine && !reduce) {
  $$("[data-magnetic]").forEach(el => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`;
    });
    el.addEventListener("mouseleave", () => (el.style.translate = ""));
  });
}

/* ---------- Marquee (drifts; scroll nudges its speed and direction) ---------- */
const track = $("[data-marquee]");
let mx = 0, mdir = 1, vel = 0, lastY = scrollY, half = 0;

/* ---------- Hero: ASCII flowers + frogs ----------
   Flowers are real photographs (assets/flowers, all CC0) converted to ASCII in
   the browser, laid out around the name and grown from the centre outward.
   A blurred copy of each photo sits underneath as a faint colour glow.
   Frogs hop between the letter tops and the hairline. */
const heroChars = kinetics[0].chars;
const heroInner = $(".hero__inner");
const heroTitle = $(".hero__title");
const heroRule = $(".hero__foot");
const rand = (a, b) => a + Math.random() * (b - a);
let inkBase = 0, inkFont = 0;

// distance from a letter box's top to its baseline / the top of its ink, from the real font
function measureInk() {
  const first = heroChars[0].el;
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0";
  first.parentNode.append(probe);
  inkBase = probe.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
  probe.remove();
  inkFont = parseFloat(getComputedStyle(first).fontSize);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `300 ${inkFont}px "Bricolage Grotesque"`;
  heroChars.forEach(c => (c.ascent = ctx.measureText(c.el.textContent).actualBoundingBoxAscent || inkFont * 0.7));
}
// the name's ink box, in hero-inner coordinates
function nameBox() {
  const o = heroInner.getBoundingClientRect(), t = heroTitle.getBoundingClientRect();
  const first = heroChars[0], last = heroChars[heroChars.length - 1];
  return {
    left: t.left - o.left, width: t.width,
    top: first.el.getBoundingClientRect().top + inkBase - first.ascent - o.top,
    base: last.el.getBoundingClientRect().top + inkBase - o.top,
  };
}

/* Flowers. Each one sprouts from a letter of the name:
     at:   which letter (0 = A, 1 = k, 2 = i, 3 = r, 4 = a, 5 = U, 6 = r, 7 = i, 8 = e, 9 = l)
     u:    where across that letter the stem leaves it (0 left, 1 right)
     ang:  direction it grows, in degrees (negative = up out of the top, positive = down out of the bottom)
     stem: stem length, size: blossom size (both relative), bend: how much the stem curves, and which way */
const FLOWERS = [
  // out of the tops of the letters
  { src: "waterlily",     at: 0, u: 0.5,  ang: -114, stem: 0.3,  size: 1.15, bend: 0.6 },
  { src: "chrysanthemum", at: 1, u: 0.16, ang: -84,  stem: 0.8,  size: 0.8,  bend: -0.5 },
  { src: "dahlia",        at: 2, u: 0.5,  ang: -66,  stem: 0.28, size: 0.55, bend: 0.4 },
  { src: "violet-lily",   at: 4, u: 0.6,  ang: -56,  stem: 0.55, size: 1.0,  bend: -0.6 },
  { src: "lotus",         at: 5, u: 0.14, ang: -101, stem: 0.7,  size: 0.85, bend: 0.5 },
  { src: "magnolia",      at: 8, u: 0.5,  ang: -80,  stem: 0.32, size: 0.95, bend: -0.4 },
  { src: "dahlia",        at: 9, u: 0.5,  ang: -58,  stem: 0.55, size: 1.05, bend: 0.6 },
  // out of the bottoms
  { src: "magnolia",      at: 0, u: 0.12, ang: 112,  stem: 0.55, size: 0.9,  bend: -0.5 },
  { src: "lotus",         at: 3, u: 0.2,  ang: 97,   stem: 0.85, size: 0.7,  bend: 0.5 },
  { src: "chrysanthemum", at: 5, u: 0.5,  ang: 84,   stem: 0.5,  size: 1.0,  bend: -0.4 },
  { src: "violet-lily",   at: 7, u: 0.5,  ang: 70,   stem: 0.95, size: 0.6,  bend: 0.5 },
  { src: "waterlily",     at: 9, u: 0.5,  ang: 66,   stem: 0.6,  size: 0.85, bend: -0.6 },
  // out of the sides (v: how far down the letter the stem leaves, 0 top, 1 baseline)
  { src: "violet-lily",   at: 0, u: 0.27, v: 0.5,  ang: -158, stem: 1.25, size: 0.95, bend: -0.5 },
  { src: "dahlia",        at: 0, u: 0.08, v: 0.93, ang: -176, stem: 1.9,  size: 0.7,  bend: 0.45 },
  { src: "chrysanthemum", at: 0, u: 0.1,  v: 0.96, ang: 152,  stem: 1.45, size: 0.6,  bend: -0.5 },
  { src: "lotus",         at: 9, u: 0.5,  v: 0.3,  ang: -22,  stem: 1.2,  size: 0.9,  bend: 0.5 },
  { src: "magnolia",      at: 9, u: 0.5,  v: 0.62, ang: 6,    stem: 1.95, size: 0.75, bend: -0.45 },
  { src: "waterlily",     at: 9, u: 0.5,  v: 0.9,  ang: 30,   stem: 1.35, size: 0.6,  bend: 0.5 },
];
const CUTS = { chrysanthemum: 0.3 }; // brightness below which a photo's dark background is dropped (default 0.16)
const RAMP = " .'`,:;-~+=<>i!lI?/|()1{}[]rcvunxzjftLCJUYXZO0Qoahkbdpqwm*WMB8&%$#@";
const CELL = 3.4; // px per character column
const dpr = Math.min(devicePixelRatio || 1, 2);
const smooth = (v, a, b) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const flowers = [];
let garden;

// photo -> cropped cut-out (brightness, coverage, and a small colour copy for the glow)
function loadFlower(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const W = 300, H = Math.round((W * img.height) / img.width);
      const cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0, W, H);
      const id = cx.getImageData(0, 0, W, H), px = id.data, cut = CUTS[src] ?? 0.16;
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const a = smooth(Math.max(px[i], px[i + 1], px[i + 2]) / 255, cut, cut + 0.14);
        px[i + 3] = a * 255;
        if (a > 0.5) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      cx.putImageData(id, 0, 0);
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      const crop = cx.getImageData(x0, y0, bw, bh);
      resolve({ px: crop.data, bw, bh, aspect: bw / bh, crop });
    };
    img.src = `assets/flowers/${src}.jpg`;
  });
}
// cut-out -> grid of characters: darker and edgier areas get denser glyphs
function buildGrid(f, cols) {
  const cw = f.bw / cols, ch = cw / 0.6, rows = Math.max(1, Math.floor(f.bh / ch));
  const L = new Float32Array(cols * rows), A = new Float32Array(cols * rows), lums = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let l = 0, a = 0, n = 0;
    const xa = Math.floor(c * cw), xb = Math.max(xa + 1, Math.floor((c + 1) * cw)), ya = Math.floor(r * ch), yb = Math.max(ya + 1, Math.floor((r + 1) * ch));
    for (let y = ya; y < yb && y < f.bh; y++) for (let x = xa; x < xb && x < f.bw; x++) {
      const i = (y * f.bw + x) * 4;
      l += 0.65 * Math.max(f.px[i], f.px[i + 1], f.px[i + 2]) + 0.35 * (0.299 * f.px[i] + 0.587 * f.px[i + 1] + 0.114 * f.px[i + 2]); a += f.px[i + 3]; n++; // mostly brightness, so saturated petals still read as light
    }
    const k = r * cols + c;
    L[k] = n ? l / n / 255 : 0; A[k] = n ? a / n / 255 : 0;
    if (A[k] > 0.5) lums.push(L[k]);
  }
  lums.sort((a, b) => a - b);
  const lo = lums[Math.floor(lums.length * 0.04)] ?? 0, hi = lums[Math.floor(lums.length * 0.96)] ?? 1;
  for (let k = 0; k < L.length; k++) L[k] = clamp((L[k] - lo) / (hi - lo || 1));
  // local contrast: push each cell away from its neighbourhood average so petal edges separate
  const inside = (cc, rr) => cc >= 0 && rr >= 0 && cc < cols && rr < rows && A[rr * cols + cc] >= 0.4;
  const C = new Float32Array(L.length);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let sum = 0, n = 0;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -3; dc <= 3; dc++) if (inside(c + dc, r + dr)) { sum += L[(r + dr) * cols + c + dc]; n++; }
    const k = r * cols + c;
    C[k] = clamp(L[k] + 2.2 * (L[k] - (n ? sum / n : L[k])));
  }
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c;
    if (A[k] < 0.4) continue;
    const at = (cc, rr) => (inside(cc, rr) ? C[rr * cols + cc] : null);
    const l = at(c - 1, r), rt = at(c + 1, r), u = at(c, r - 1), d = at(c, r + 1);
    const rim = l === null || rt === null || u === null || d === null;
    const edge = Math.hypot((rt ?? C[k]) - (l ?? C[k]), (d ?? C[k]) - (u ?? C[k]));
    const dens = clamp((0.5 * Math.pow(f.invert ? C[k] : 1 - C[k], 2.1) + 0.75 * edge + (rim ? 0.16 : 0)) * A[k]);
    const i = Math.round(dens * (RAMP.length - 1));
    if (i < 1) continue; // brightest parts of a petal stay as bare paper
    cells.push({ c, r, i, a: 0.55 + 0.45 * dens, t: clamp(Math.hypot((c / cols - 0.5) * 1.5, r / rows - 0.85) / 1.1) * 0.8 + Math.random() * 0.2 });
  }
  f.cols = cols; f.rows = rows; f.cells = cells;
}
// g: growth 0..1. Characters appear from the centre outward and thicken as they mature.
function drawFlower(f, g) {
  const cx = f.ctx, cw = f.w / f.cols, ch = f.h / f.rows;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.clearRect(0, 0, f.w, f.h);
  cx.font = `400 ${(cw / 0.6).toFixed(2)}px "DM Mono", monospace`;
  cx.textBaseline = "top";
  cx.fillStyle = f.ink || "#0d0d0c";
  const reach = g * 1.3;
  for (const cell of f.cells) {
    let i = cell.i;
    if (g < 1) {
      if (reach < cell.t) continue;
      i = Math.max(1, Math.round(i * clamp((reach - cell.t) / 0.3)));
    }
    cx.globalAlpha = cell.a;
    cx.fillText(RAMP[i], cell.c * cw, cell.r * ch);
  }
}
let stems, stemCtx;
// characters along a stem's curve; ox/oy move the tip when the blossom is pushed aside
function stemPoints(f, ox, oy) {
  const { ax, ay, dx, dy, len } = f.geo, tx = f.geo.tx + ox, ty = f.geo.ty + oy, mx = f.geo.mx + ox * 0.45, my = f.geo.my + oy * 0.45;
  const pts = [], n = Math.max(3, Math.round(len / 5.2));
  for (let i = 0; i <= n; i++) {
    const t = i / n, q = 1 - t;
    const x = q * q * ax + 2 * q * t * mx + t * t * tx, y = q * q * ay + 2 * q * t * my + t * t * ty;
    const deg = ((Math.atan2(2 * q * (my - ay) + 2 * t * (ty - my), 2 * q * (mx - ax) + 2 * t * (tx - mx)) * 180) / Math.PI + 360) % 180;
    pts.push({ x, y, ch: deg < 22.5 || deg > 157.5 ? "-" : deg < 67.5 ? "\\" : deg < 112.5 ? "|" : "/" });
    if (i > 2 && i < n - 2 && i % 5 === 0) pts.push({ x: x - dy * 5 * (i % 2 ? 1 : -1), y: y + dx * 5 * (i % 2 ? 1 : -1), ch: "~" }); // a leaf
  }
  return pts;
}
function placeGarden(redraw) {
  if (!garden) return;
  const o = heroInner.getBoundingClientRect(), box = nameBox();
  const stacked = heroChars[5].el.getBoundingClientRect().top - heroChars[0].el.getBoundingClientRect().top > 10;
  const S = clamp(box.width * (stacked ? 0.36 : 0.25), 64, 210);
  stems.width = Math.round(o.width * dpr); stems.height = Math.round(o.height * dpr);
  for (const f of flowers) {
    const s = f.spec, c = heroChars[s.at], r = c.el.getBoundingClientRect();
    const sideways = s.v !== undefined;
    const up = stacked ? s.at < 5 : s.ang < 0; // when the name stacks, the top word flowers upward and the bottom word downward
    const ang = ((sideways ? s.ang : (up ? -1 : 1) * Math.abs(s.ang)) * Math.PI) / 180;
    // the stem starts just inside the letter's stroke, so it reads as coming out of the letter
    const ax = r.left + r.width * s.u - o.left;
    const inkTop = r.top + inkBase - c.ascent, inkBottom = r.top + inkBase;
    const ay = (sideways ? inkTop + (inkBottom - inkTop) * s.v : up ? inkTop + inkFont * 0.07 : inkBottom - inkFont * 0.05) - o.top;
    const len = s.stem * S, size = S * s.size, dx = Math.cos(ang), dy = Math.sin(ang);
    const tx = ax + dx * len, ty = ay + dy * len;
    const mx = (ax + tx) / 2 - dy * s.bend * len * 0.35, my = (ay + ty) / 2 + dx * s.bend * len * 0.35;
    f.ax = ax;
    f.geo = { ax, ay, mx, my, tx, ty, dx, dy, len };
    f.stem = stemPoints(f, f.ox || 0, f.oy || 0);
    f.w = size * Math.sqrt(f.aspect); f.h = size / Math.sqrt(f.aspect);
    const cx = tx + dx * size * 0.26, cy = ty + dy * size * 0.26; // blossom sits on the stem tip
    const left = cx - f.w / 2, top = cy - f.h / 2;
    f.cx = cx; f.cy = cy;
    f.turn = ((ang * 180) / Math.PI + 90) * 0.85 + s.bend * 10; // faces away from the letter
    Object.assign(f.el.style, { left: left.toFixed(1) + "px", top: top.toFixed(1) + "px", width: f.w.toFixed(1) + "px", height: f.h.toFixed(1) + "px" });
    f.el.style.transformOrigin = f.sway.style.transformOrigin = `${(tx - left).toFixed(1)}px ${(ty - top).toFixed(1)}px`;
    const cols = clamp(Math.round(f.w / CELL), 22, 84);
    if (redraw || cols !== f.cols) {
      buildGrid(f, cols);
      f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
      if (f.done) drawFlower(f, 1);
    }
    if (f.done) f.el.style.rotate = f.turn.toFixed(2) + "deg";
  }
  drawStems(performance.now());
}
function drawStems(now) {
  stemCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stemCtx.clearRect(0, 0, stems.width, stems.height);
  stemCtx.font = '400 8px "DM Mono", monospace';
  stemCtx.textAlign = "center"; stemCtx.textBaseline = "middle";
  stemCtx.fillStyle = inkNow(); stemCtx.globalAlpha = 0.62;
  for (const f of flowers) {
    const p = f.done ? 1 : clamp((now - f.t0) / f.stemDur);
    const n = Math.floor((1 - Math.pow(1 - p, 2)) * f.stem.length);
    for (let i = 0; i < n; i++) stemCtx.fillText(f.stem[i].ch, f.stem[i].x, f.stem[i].y);
  }
}
const photoCache = {};
const getPhoto = src => (photoCache[src] ||= loadFlower(src));
async function initGarden() {
  measureInk();
  const photos = {};
  try {
    await Promise.all([...new Set(FLOWERS.map(s => s.src))].map(async src => (photos[src] = await getPhoto(src))));
    await document.fonts.load('400 10px "DM Mono"');
  } catch { return; } // photos missing: the hero simply stays plain
  garden = document.createElement("div");
  garden.className = "garden";
  garden.setAttribute("aria-hidden", "true");
  heroInner.prepend(garden);
  stems = document.createElement("canvas");
  stems.className = "garden__stems";
  stemCtx = stems.getContext("2d");
  garden.append(stems);
  const specs = innerWidth < 760 ? FLOWERS.filter(s => s.v === undefined).filter((_, i) => i % 2 === 0) : FLOWERS; // fewer on small screens, none out of the sides
  specs.forEach(spec => {
    const f = { ...photos[spec.src], spec, done: false, ink: inkNow(), invert: dark };
    f.el = document.createElement("div");
    f.el.className = "bloom";
    f.sway = document.createElement("div");
    f.sway.className = "bloom__sway";
    f.sway.style.animationDuration = rand(7, 11).toFixed(1) + "s";
    f.sway.style.animationDelay = -rand(0, 8).toFixed(1) + "s";
    f.glow = document.createElement("canvas"); // the photo cut-out itself, blurred by CSS
    f.glow.className = "bloom__glow";
    f.glow.width = f.bw; f.glow.height = f.bh;
    f.glow.getContext("2d").putImageData(f.crop, 0, 0);
    f.canvas = document.createElement("canvas");
    f.canvas.className = "bloom__ascii";
    f.ctx = f.canvas.getContext("2d");
    f.sway.append(f.glow, f.canvas);
    f.el.append(f.sway);
    garden.append(f.el);
    f.t0 = Infinity; f.stemDur = 1; f.stem = [];
    flowers.push(f);
  });
  placeGarden(true);
  // grow from the middle of the name outward
  const box = nameBox(), now = performance.now();
  flowers.forEach(f => {
    f.t0 = now + (Math.abs(f.ax - (box.left + box.width / 2)) / box.width) * 1500 + rand(0, 250);
    f.stemDur = 500 + f.spec.stem * 700;
    if (reduce) { f.done = true; drawFlower(f, 1); f.glow.style.opacity = glowNow(); f.el.style.scale = 1; f.el.style.rotate = f.turn.toFixed(2) + "deg"; }
  });
  if (reduce) drawStems(now);
}
function tickGarden(now) {
  let growing = false;
  for (const f of flowers) {
    if (f.done || now < f.t0) { growing = growing || !f.done; continue; }
    growing = true;
    const p = clamp((now - f.t0 - f.stemDur * 0.8) / 2300); // the blossom opens as the stem arrives
    if (p <= 0) continue;
    const g = 1 - Math.pow(1 - p, 3);
    drawFlower(f, p >= 1 ? 1 : g);
    f.el.style.scale = (0.12 + 0.88 * g).toFixed(3);
    f.el.style.rotate = (f.turn - 34 * (1 - g) * Math.sign(f.spec.bend)).toFixed(2) + "deg";
    f.glow.style.opacity = (glowNow() * g * g).toFixed(3);
    if (p >= 1) f.done = true;
  }
  if (growing && stems) drawStems(now);
}

/* Brushing: the cursor pushes aside any blossom it sweeps through. The push follows
   the cursor's direction and speed; the blossom then springs back and settles. */
let pmx = mouse.x, pmy = mouse.y;
function spring(f, cx, cy, R, mvx, mvy, speed) {
  if (f.ox === undefined) { f.ox = f.oy = f.vx = f.vy = 0; }
  const d = Math.hypot(mouse.x - (cx + f.ox), mouse.y - (cy + f.oy));
  if (mouse.moved && speed > 0.4 && d < R) {
    const w = (1 - d / R) * 0.045; // strongest through the middle of the flower; kept gentle
    f.vx += clamp(mvx, -22, 22) * w; f.vy += clamp(mvy, -22, 22) * w;
  }
  // a soft, slow spring: the blossom drifts aside and floats back without snapping
  f.vx = (f.vx - 0.014 * f.ox) * 0.93; f.vy = (f.vy - 0.014 * f.oy) * 0.93;
  const lim = R * 0.3;
  f.ox = clamp(f.ox + f.vx, -lim, lim); f.oy = clamp(f.oy + f.vy, -lim, lim);
  const live = Math.abs(f.ox) + Math.abs(f.oy) + Math.abs(f.vx) + Math.abs(f.vy) > 0.06;
  if (!live && !f.live) return false;
  if (!live) f.ox = f.oy = f.vx = f.vy = 0;
  f.live = live;
  return true;
}
function tickBrush() {
  const mvx = mouse.x - pmx, mvy = mouse.y - pmy, speed = Math.hypot(mvx, mvy);
  pmx = mouse.x; pmy = mouse.y;
  if (reduce || !fine) return;
  if (garden && kinetics[0].visible) {
    const o = heroInner.getBoundingClientRect();
    let moved = false;
    for (const f of flowers) {
      if (!f.done || !spring(f, o.left + f.cx, o.top + f.cy, Math.max(f.w, f.h) * 0.62, mvx, mvy, speed)) continue;
      moved = true;
      f.el.style.translate = `${f.ox.toFixed(1)}px ${f.oy.toFixed(1)}px`;
      f.el.style.rotate = (f.turn + (f.oy * f.geo.dx - f.ox * f.geo.dy) * 0.22).toFixed(2) + "deg"; // leans the way it was pushed
      f.stem = stemPoints(f, f.ox, f.oy);
    }
    if (moved) drawStems(performance.now());
  }
  for (const f of [solo, plant, ...colBlooms]) {
    if (!f || !f.done) continue;
    const r = f.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    if (f.ox === undefined) f.ox = f.oy = f.vx = f.vy = 0;
    if (!spring(f, (r.left + r.right) / 2 - f.ox, (r.top + r.bottom) / 2 - f.oy, Math.max(r.width, r.height) * 0.55, mvx, mvy, speed)) continue;
    f.el.style.translate = `${(f.ox * 0.6).toFixed(1)}px ${(f.oy * 0.6).toFixed(1)}px`;
    f.el.style.rotate = (f.ox * (f === solo ? 0.08 : 0.3)).toFixed(2) + "deg";
  }
}

/* Frogs */
const FROG = {
  sit:    [" @..@ ", "(----)", "( >< )", "^^  ^^"],
  blink:  [" -..- ", "(----)", "( >< )", "^^  ^^"],
  crouch: ["      ", " @..@ ", "(-><-)", "^^^^^^"],
  leap:   [" @..@ ", "(----)", " )  ( ", " /  \\ "],
};
const perchAt = { A: 0.5, k: 0.16, i: 0.5, r: 0.3, a: 0.5, U: 0.14, e: 0.5, l: 0.5 }; // where on each glyph a frog can stand
const frogs = [];
let frogLayer;

function perchPos(p, o) {
  if (p.c) {
    const r = p.c.el.getBoundingClientRect();
    return { x: r.left + r.width * p.u - o.left, y: r.top + inkBase - p.c.ascent - o.top };
  }
  const r = heroRule.getBoundingClientRect();
  return { x: r.left + r.width * p.u - o.left, y: r.top - o.top };
}
function pickPerch(f) {
  const free = heroChars.filter(c => !c.frog && c.el.textContent.trim());
  if (free.length && Math.random() < 0.6) {
    const c = free[Math.floor(Math.random() * free.length)];
    c.frog = f;
    return { c, u: perchAt[c.el.textContent] ?? 0.5 };
  }
  return { u: rand(0.03, 0.97) };
}
function setFrame(f, name) {
  if (f.frame === name) return;
  f.frame = name;
  f.el.textContent = FROG[name].join("\n");
}
function squash(c, amount) {
  if (reduce) return;
  c.el.animate(
    [
      { transform: "none" },
      { transform: `translateY(${amount}%) scaleY(${1 - amount / 50})`, offset: 0.16 },
      { transform: `translateY(${-amount / 6}%) scaleY(${1 + amount / 300})`, offset: 0.5 },
      { transform: "none" },
    ],
    { duration: 950, easing: "cubic-bezier(0.2, 0, 0, 1)" }
  );
}
function initFrogs() {
  measureInk();
  frogLayer = document.createElement("div");
  frogLayer.className = "frogs";
  frogLayer.setAttribute("aria-hidden", "true");
  heroInner.append(frogLayer);
  const n = innerWidth < 760 ? 2 : 3;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("pre");
    el.className = "frog";
    frogLayer.append(el);
    const f = { el, state: "sit", perch: { u: (i + 0.5) / n + rand(-0.08, 0.08) }, next: performance.now() + 900 + i * 1400, blink: 0 };
    setFrame(f, "sit");
    f.w = el.offsetWidth; f.h = el.offsetHeight;
    frogs.push(f);
  }
  tickFrogs(performance.now());
  requestAnimationFrame(() => frogLayer.classList.add("in"));
}
function tickFrogs(now) {
  if (!frogLayer) return;
  const o = heroInner.getBoundingClientRect();
  for (const f of frogs) {
    let pos;
    if (f.state === "sit") {
      pos = perchPos(f.perch, o);
      const near = fine && mouse.moved && Math.hypot(mouse.x - (pos.x + o.left), mouse.y - (pos.y + o.top - f.h / 2)) < 70;
      if (!reduce && (now > f.next || near)) {
        f.state = "crouch"; f.t0 = now;
        if (f.perch.c) squash(f.perch.c, 1.5);
      } else {
        if (now > f.blink) f.blink = now + rand(2200, 6000);
        setFrame(f, f.blink - now < 140 ? "blink" : "sit");
      }
    }
    if (f.state === "crouch") {
      pos = perchPos(f.perch, o);
      setFrame(f, "crouch");
      if (now - f.t0 > 170) {
        if (f.perch.c) { f.perch.c.frog = null; f.perch.c.hold = false; }
        f.from = pos;
        f.perch = pickPerch(f);
        const to = perchPos(f.perch, o);
        const dist = Math.hypot(to.x - pos.x, to.y - pos.y);
        f.dur = clamp(420 + dist * 0.55, 520, 1250);
        f.arc = Math.max(70, dist * 0.3);
        f.state = "leap"; f.t0 = now;
      }
    }
    if (f.state === "leap") {
      const p = clamp((now - f.t0) / f.dur);
      const to = perchPos(f.perch, o);
      pos = { x: lerp(f.from.x, to.x, p), y: lerp(f.from.y, to.y, p) - f.arc * 4 * p * (1 - p) };
      setFrame(f, "leap");
      if (p >= 1) {
        f.state = "land"; f.t0 = now;
        if (f.perch.c) { f.perch.c.hold = true; squash(f.perch.c, 4); }
      }
    }
    if (f.state === "land") {
      pos = perchPos(f.perch, o);
      setFrame(f, "crouch");
      if (now - f.t0 > 190) { f.state = "sit"; f.next = now + rand(1600, 5200); }
    }
    f.el.style.transform = `translate3d(${(pos.x - f.w / 2).toFixed(1)}px, ${(pos.y - f.h + 1).toFixed(1)}px, 0)`;
  }
}

/* ---------- Contact: one large flower, light characters on the dark page ---------- */
let solo;
async function initSolo() {
  const host = $(".contact");
  let photo;
  try { photo = await getPhoto("waterlily"); } catch { return; }
  const f = (solo = { ...photo, ink: "#f1f1ee", invert: true, done: false, t0: Infinity });
  f.el = document.createElement("div");
  f.el.className = "contact__bloom";
  f.el.setAttribute("aria-hidden", "true");
  const sway = document.createElement("div");
  sway.className = "bloom__sway";
  f.glow = document.createElement("canvas");
  f.glow.className = "bloom__glow";
  f.glow.width = f.bw; f.glow.height = f.bh;
  f.glow.getContext("2d").putImageData(f.crop, 0, 0);
  f.canvas = document.createElement("canvas");
  f.canvas.className = "bloom__ascii";
  f.ctx = f.canvas.getContext("2d");
  sway.append(f.glow, f.canvas);
  f.el.append(sway);
  host.prepend(f.el);
  placeSolo();
  if (reduce) { f.done = true; drawFlower(f, 1); f.glow.style.opacity = 0.4; f.el.style.scale = 1; return; }
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { f.t0 = performance.now() + 350; io.disconnect(); }
  }, { threshold: 0.35 }).observe(host);
}
function placeSolo() {
  if (!solo) return;
  const f = solo, w = Math.min(innerWidth * (innerWidth < 760 ? 0.82 : 0.44), 640);
  f.w = w; f.h = w / f.aspect;
  f.el.style.width = w.toFixed(1) + "px"; f.el.style.height = f.h.toFixed(1) + "px";
  buildGrid(f, clamp(Math.round(w / 5), 30, 124));
  f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
  if (f.done) drawFlower(f, 1);
}
function tickSolo(now) {
  const f = solo;
  if (!f || f.done || now < f.t0) return;
  const p = clamp((now - f.t0) / 3400), g = 1 - Math.pow(1 - p, 3);
  drawFlower(f, p >= 1 ? 1 : g);
  f.el.style.scale = (0.7 + 0.3 * g).toFixed(3);
  f.glow.style.opacity = (0.42 * g * g).toFixed(3);
  if (p >= 1) f.done = true;
}

/* ---------- About: a flower that grows as you read ----------
   Scroll progress through the paragraph drives it: the stem climbs first, then the bloom opens. */
const PLANT_STEM = [0, 1, 0, 2, 0, 1, 3, 0, 4, 0, 5, 1, 0, 2, 0, 3, 1, 0, 0, 2, 0, 1].map(i => ["   |   ", "   |   ", "  \\|   ", "   |/  ", "   )   ", "   (   "][i]);
let plant, scrubP = 0;
async function initPlant() {
  const host = $("[data-plant]");
  if (!host || !host.clientWidth) return; // hidden on small screens
  let photo;
  try { photo = await getPhoto("lotus"); } catch { return; }
  const f = (plant = { ...photo, ink: inkNow(), invert: dark, done: false, g: -1, stemRows: -1 });
  f.el = document.createElement("div");
  f.el.className = "plant__bloom";
  const sway = document.createElement("div");
  sway.className = "bloom__sway";
  f.glow = document.createElement("canvas");
  f.glow.className = "bloom__glow";
  f.glow.width = f.bw; f.glow.height = f.bh;
  f.glow.getContext("2d").putImageData(f.crop, 0, 0);
  f.canvas = document.createElement("canvas");
  f.canvas.className = "bloom__ascii";
  f.ctx = f.canvas.getContext("2d");
  sway.append(f.glow, f.canvas);
  f.el.append(sway);
  f.stemEl = document.createElement("pre");
  f.stemEl.className = "plant__stem";
  host.append(f.el, f.stemEl);
  f.w = Math.min(host.clientWidth, 230); f.h = f.w / f.aspect;
  f.el.style.width = f.w.toFixed(1) + "px"; f.el.style.height = f.h.toFixed(1) + "px";
  buildGrid(f, clamp(Math.round(f.w / 3.4), 22, 84));
  f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
}
function tickPlant() {
  const f = plant;
  if (!f) return;
  const p = reduce ? 1 : scrubP;
  const n = Math.round(clamp(p / 0.5) * PLANT_STEM.length);
  if (n !== f.stemRows) { f.stemRows = n; f.stemEl.textContent = PLANT_STEM.slice(PLANT_STEM.length - n).join("\n"); }
  const g = clamp((p - 0.28) / 0.62);
  if (Math.abs(g - f.g) < 0.004) return;
  f.g = g; f.done = g >= 1;
  drawFlower(f, g >= 1 ? 1 : g);
  f.el.style.scale = (0.3 + 0.7 * g).toFixed(3);
  f.glow.style.opacity = (glowNow() * g * g).toFixed(3);
}

/* ---------- Posters develop from ASCII ----------
   A poster is first typed out as characters in its own colours, top to bottom,
   then the characters dissolve into the real image. */
function posterAscii(svgText, cols = 46) {
  return new Promise(resolve => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      const W = 150, H = 200, cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0, W, H);
      const d = cx.getImageData(0, 0, W, H).data, bg = [d[0], d[1], d[2]];
      const cw = W / cols, ch = cw / 0.6, rows = Math.floor(H / ch), cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = (Math.floor((r + 0.5) * ch) * W + Math.floor((c + 0.5) * cw)) * 4;
        const dist = Math.hypot(d[i] - bg[0], d[i + 1] - bg[1], d[i + 2] - bg[2]) / 255;
        if (dist < 0.12) continue;
        cells.push({ c, r, ch: RAMP[Math.round(clamp(0.3 + dist * 0.5) * (RAMP.length - 1))], color: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`, t: (r / rows) * 0.72 + Math.random() * 0.28 });
      }
      resolve({ cols, rows, cells, bg: `rgb(${bg})` });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
  });
}
const posterData = projects.map(p => posterAscii(p.poster));
const develops = [];
function develop(host, i, delay = 0) {
  if (reduce) return;
  let d = host._dev;
  if (!d) {
    const cv = document.createElement("canvas");
    cv.className = "develop";
    d = host._dev = { cv, ctx: cv.getContext("2d") };
    develops.push(d);
  }
  if (!d.cv.isConnected) host.append(d.cv);
  d.cv.classList.remove("is-out");
  d.data = null; d.active = true; d.t0 = performance.now() + delay;
  posterData[i].then(data => (data ? (d.data = data) : (d.active = false)));
}
function tickDevelop(now) {
  for (const d of develops) {
    if (!d.active || !d.data) continue;
    const w = d.cv.clientWidth, h = d.cv.clientHeight;
    if (!w) continue;
    if (d.cv.width !== Math.round(w * dpr)) { d.cv.width = Math.round(w * dpr); d.cv.height = Math.round(h * dpr); }
    const p = clamp((now - d.t0) / 700), cx = d.ctx, cw = w / d.data.cols, ch = h / d.data.rows;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.fillStyle = d.data.bg;
    cx.fillRect(0, 0, w, h);
    cx.font = `500 ${(cw / 0.6).toFixed(2)}px "DM Mono", monospace`;
    cx.textBaseline = "top";
    for (const cell of d.data.cells) {
      if (cell.t > p * 1.05) continue;
      cx.fillStyle = cell.color;
      cx.fillText(cell.ch, cell.c * cw, cell.r * ch);
    }
    if (now - d.t0 > 1000) { d.cv.classList.add("is-out"); d.active = false; }
  }
}

/* ---------- About text decodes from ASCII glyphs as each word lights up ---------- */
const GLYPHS = "/\\|()[]{}<>*+=-~:;.#%&@";
const scrambling = new Map();
let scrFrame = 0;
function lockWords() { // fix each word's width so scrambled glyphs never re-wrap the paragraph
  const fs = parseFloat(getComputedStyle(scrub).fontSize);
  words.forEach(w => (w.style.width = ""));
  const widths = words.map(w => w.getBoundingClientRect().width / fs);
  words.forEach((w, i) => (w.style.width = widths[i].toFixed(4) + "em"));
}
function tickScramble(now) {
  if (!scrambling.size || scrFrame++ % 3) return;
  for (const [w, t0] of scrambling) {
    const text = w.dataset.t, p = clamp((now - t0) / 460);
    if (p <= 0) continue;
    if (p >= 1) { w.textContent = text; scrambling.delete(w); continue; }
    let out = text.slice(0, Math.floor(p * text.length));
    for (let i = out.length; i < text.length; i++) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    w.textContent = out;
  }
}

/* ---------- Practice: one flower per discipline ----------
   Same photo-to-ASCII flowers as the hero. Each opens when its column scrolls into view. */
const colBlooms = [];
async function initColBlooms() {
  for (const host of $$("[data-bloom]")) {
    let photo;
    try { photo = await getPhoto(host.dataset.bloom); } catch { continue; }
    const f = { ...photo, ink: inkNow(), invert: dark, done: false, t0: Infinity };
    f.el = document.createElement("div");
    f.el.className = "col__flower";
    const sway = document.createElement("div");
    sway.className = "bloom__sway";
    f.glow = document.createElement("canvas");
    f.glow.className = "bloom__glow";
    f.glow.width = f.bw; f.glow.height = f.bh;
    f.glow.getContext("2d").putImageData(f.crop, 0, 0);
    f.canvas = document.createElement("canvas");
    f.canvas.className = "bloom__ascii";
    f.ctx = f.canvas.getContext("2d");
    sway.append(f.glow, f.canvas);
    f.el.append(sway);
    host.append(f.el);
    f.h = Math.min(host.clientHeight || 150, host.clientWidth / f.aspect); f.w = f.h * f.aspect;
    f.el.style.width = f.w.toFixed(1) + "px"; f.el.style.height = f.h.toFixed(1) + "px";
    buildGrid(f, clamp(Math.round(f.w / 3.2), 22, 84));
    f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
    const n = colBlooms.push(f);
    if (reduce) { f.done = true; drawFlower(f, 1); f.glow.style.opacity = glowNow(); f.el.style.scale = 1; continue; }
    new IntersectionObserver(([e], io) => {
      if (e.isIntersecting) { f.t0 = performance.now() + 150 + n * 280; io.disconnect(); }
    }, { threshold: 0.6 }).observe(host);
  }
}
function tickColBlooms(now) {
  for (const f of colBlooms) {
    if (f.done || now < f.t0) continue;
    const p = clamp((now - f.t0) / 2400), g = 1 - Math.pow(1 - p, 3);
    drawFlower(f, p >= 1 ? 1 : g);
    f.el.style.scale = (0.4 + 0.6 * g).toFixed(3);
    f.glow.style.opacity = (glowNow() * g * g).toFixed(3);
    if (p >= 1) f.done = true;
  }
}

/* ---------- Frame loop ---------- */
const contact = $(".contact");
function frame(now) {
  const y = scrollY, dy = y - lastY;
  lastY = y;
  vel = lerp(vel, dy, 0.12);
  if (Math.abs(dy) > 0.5) mdir = dy > 0 ? 1 : -1;

  tickKinetic(now);
  if (kinetics[0].visible) { tickGarden(now); tickFrogs(now); }
  tickScrub();
  tickScramble(now);
  tickDevelop(now);
  tickSolo(now);
  tickPlant();
  tickBrush();
  tickColBlooms(now);
  pickByScroll();

  if (!reduce) {
    // hero drifts away slower than the page
    if (y < innerHeight * 1.2) {
      heroInner.style.transform = `translate3d(0, ${(y * 0.14).toFixed(1)}px, 0)`;
      heroInner.style.opacity = clamp(1 - y / (innerHeight * 0.9)).toFixed(3);
    }
    // marquee
    half = half || track.scrollWidth / 2;
    mx -= (0.45 + Math.abs(vel) * 0.12) * mdir;
    if (mx <= -half) mx += half;
    if (mx > 0) mx -= half;
    track.style.transform = `translate3d(${mx.toFixed(1)}px, 0, 0)`;
    // cursor + preview follow with different lag
    cpos.x = lerp(cpos.x, mouse.x, 0.18); cpos.y = lerp(cpos.y, mouse.y, 0.18);
    cursor.style.transform = `translate3d(${cpos.x.toFixed(1)}px, ${cpos.y.toFixed(1)}px, 0)`;
  }

  // ink floods the page as the contact section arrives
  root.classList.toggle("is-dark", dark || contact.getBoundingClientRect().top < innerHeight * 0.55);
  requestAnimationFrame(frame);
}

/* ---------- Reveal on view ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.target.matches("[data-kinetic]")) kinetics.find(k => k.el === e.target).visible = e.isIntersecting;
    if (e.isIntersecting && !e.target.classList.contains("in")) e.target.classList.add("in");
  });
}, { threshold: 0.12 });

/* ---------- Clock ---------- */
const clock = $("[data-clock]");
const tz = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value || "";
const tock = () => (clock.textContent = `${new Date().toLocaleTimeString("en-GB")} ${tz}`);
tock(); setInterval(tock, 1000);

/* ---------- Boot: count up, lift the curtain, let the letters rise ---------- */
function start() {
  fit();
  lockWords();
  initSolo();
  initPlant();
  initColBlooms();
  root.classList.remove("is-loading");
  $$("[data-reveal], [data-kinetic], [data-rows]").forEach(el => io.observe(el));
  requestAnimationFrame(frame);
  setTimeout(initGarden, reduce ? 0 : 1500); // flowers start as the letters settle
  setTimeout(initFrogs, reduce ? 0 : 4200);
}
(function boot() {
  history.scrollRestoration = "manual";
  scrollTo(0, 0);
  const count = $(".loader__count"), bar = $(".loader__bar");
  const drawBar = v => (bar.textContent = `[${"#".repeat(Math.round(v * 28))}${".".repeat(28 - Math.round(v * 28))}]`);
  const fonts = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]);
  if (reduce) { root.classList.remove("is-loading"); fonts.then(start); return; }
  root.classList.add("is-loading");
  const t0 = performance.now(), dur = 1900;
  let ready = false;
  fonts.then(() => (ready = true));
  (function step(now) {
    const p = clamp((now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    count.textContent = String(Math.round(eased * (ready ? 100 : 92))).padStart(3, "0");
    drawBar(eased * (ready ? 1 : 0.92));
    if (p < 1 || !ready) return requestAnimationFrame(step);
    count.textContent = "100";
    drawBar(1);
    setTimeout(start, 220);
  })(t0);
})();

addEventListener("resize", () => { fit(); half = 0; if (garden) { measureInk(); placeGarden(); } placeSolo(); lockWords(); });

