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
    title: "Ninho", kind: "Social media", year: "2026", client: "Ninho Coffee", role: "Instagram posts, templates",
    blurb: "A month of Instagram posts for a neighbourhood coffee shop. One grid and three kinds of post: the daily special, the story behind a bean, and the week's opening hours.",
    poster: svg("#2a1a12", `${range(9, i => { const x = 24 + (i % 3) * 88, y = 78 + Math.floor(i / 3) * 88, fill = ["#efe2cf", "#c8623a", "#3d2619"][(i * 2) % 3], ink = fill === "#efe2cf" ? "#2a1a12" : "#efe2cf"; return `<rect x="${x}" y="${y}" width="76" height="76" rx="6" fill="${fill}"/>` + (i % 3 === 0 ? `<circle cx="${x + 38}" cy="${y + 38}" r="19" fill="none" stroke="${ink}" stroke-width="5"/><circle cx="${x + 38}" cy="${y + 38}" r="8" fill="${ink}"/>` : i % 3 === 1 ? `<rect x="${x + 14}" y="${y + 22}" width="48" height="6" fill="${ink}"/><rect x="${x + 14}" y="${y + 36}" width="34" height="6" fill="${ink}"/><rect x="${x + 14}" y="${y + 50}" width="42" height="6" fill="${ink}"/>` : `<path d="M${x + 18} ${y + 54} Q${x + 38} ${y + 10} ${x + 58} ${y + 54}" fill="none" stroke="${ink}" stroke-width="5"/>`); })}${cap("#efe2cf", "NINHO COFFEE", "INSTAGRAM — 2026")}`),
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

/* ---------- Theme: dark only ----------
   Flowers are drawn in light characters with inverse shading, and their colour glow is stronger on dark. */
const dark = true;
const inkNow = () => "#f1f1ee";
const glowNow = () => 0.44;

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
  if (i === active) return;
  active = i;
  markBouquet();
  rows.classList.add("has-active");
  rowEls.forEach((r, j) => r.classList.toggle("is-active", j === i));
  previewItems.forEach((it, j) => it.classList.toggle("is-active", j === i));
  previewItems[i].style.zIndex = ++z;
  develop(previewItems[i], i);
  const p = projects[i];
  stageInfo.classList.add("is-swapping");
  st.blurb.classList.add("is-swapping");
  clearTimeout(infoTimer);
  infoTimer = setTimeout(() => {
    st.idx.textContent = `${pad(i + 1)} / ${pad(projects.length)} — ${p.kind}`;
    st.client.textContent = p.client; st.role.textContent = p.role; st.year.textContent = p.year;
    st.blurb.textContent = p.blurb;
    st.title.textContent = p.title;
    stageInfo.classList.remove("is-swapping");
    st.blurb.classList.remove("is-swapping");
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
  cs.kind.textContent = `Specimen ${pad(i + 1)} — ${p.kind}`;
  cs.title.textContent = p.title;
  cs.blurb.textContent = p.blurb;
  cs.meta.innerHTML = `<dt>Client</dt><dd>${p.client}</dd><dt>Role</dt><dd>${p.role}</dd><dt>Year</dt><dd>${p.year}</dd><dt>Flower</dt><dd>${FLOWER_NAMES[BQ[i].src]}</dd>`;
  showCaseFlower(i, caseEl.classList.contains("is-open") ? 150 : 650);
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
  // starts as the paragraph enters at the bottom of the screen and is fully lit while it is
  // still in the lower third, well before it reaches the middle
  const p = clamp((innerHeight * 0.98 - r.top) / (r.height + innerHeight * 0.3));
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
  cursor.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`; // set here, not in the frame loop, so it never trails the pointer
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
const WHITES = { valley: 0.5, "white-lily": 0.52 }; // photos where the flower is white on a coloured background
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
      const id = cx.getImageData(0, 0, W, H), px = id.data, cut = CUTS[src] ?? 0.16, white = WHITES[src];
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        // dark-background photos are cut out by brightness; white flowers on a coloured background by whiteness
        const a = white ? smooth(Math.min(px[i], px[i + 1], px[i + 2]) / 255, white, white + 0.2) : smooth(Math.max(px[i], px[i + 1], px[i + 2]) / 255, cut, cut + 0.14);
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
  if (f.extra) f.extra(cx, g); // anything a particular flower draws on top of itself
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
const brushV = { x: 0, y: 0, s: 0 };
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
  brushV.x = mvx; brushV.y = mvy; brushV.s = speed; // shared with the bouquet
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
  try { photo = await getPhoto("spider-lily"); } catch { return; }
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
  f.w = Math.min(host.clientWidth, 340); f.h = f.w / f.aspect;
  f.el.style.width = f.w.toFixed(1) + "px"; f.el.style.height = f.h.toFixed(1) + "px";
  buildGrid(f, clamp(Math.round(f.w / 3.2), 22, 116)); // fine enough to hold the thin stamens
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

/* ---------- Work: the bouquet ----------
   Six flowers, one per project, gathered at a knot. On entering view the stems
   rise as one tight bundle, a bow is tied around them, the bundle loosens and
   fans open, and the blossoms open from the middle outward.
   ang: how far each stem leans from vertical, len: stem length, size: blossom size. */
const BQ = [
  { src: "magnolia",    ang: -45, len: 0.42, size: 0.98 },
  { src: "dahlia",      ang: -23, len: 0.57, size: 1.05 },
  { src: "waterlily",   ang: 0,   len: 0.64, size: 1.14 },
  { src: "violet-lily", ang: 23,  len: 0.5,  size: 1.0 },
  { src: "lotus",       ang: 45,  len: 0.55, size: 0.92 },
];
// thin filler stems topped with a scatter of small characters, like baby's breath
const BQ_SPRIGS = [{ ang: -34, len: 0.6 }, { ang: -11, len: 0.38 }, { ang: 12, len: 0.72 }, { ang: 34, len: 0.4 }].map(s => ({
  ...s, dots: Array.from({ length: 10 }, () => ({ x: rand(-17, 17), y: rand(-20, 10), ch: "*.o'*"[Math.floor(Math.random() * 5)] })),
}));
const BOW = [" .--.   .--. ", "(    \\ /    )", " '--. X .--' ", "    /   \\    ", "   /     \\   "].join("\n");
const BQ_ORDER = [2, 1, 3, 0, 4]; // blossoms open from the middle outward
const bq = { el: $("[data-bouquet]"), flowers: [], sprigs: [], t0: Infinity, ready: false, done: false, spread: 0, grow: 0 };
const backOut = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); // eases past the target and settles

function pathChars(fn, length) {
  const pts = [], n = Math.max(2, Math.round(length / 5.2));
  for (let i = 0; i <= n; i++) {
    const t = i / n, [x, y] = fn(t), [x1, y1] = fn(Math.max(0, t - 0.03)), [x2, y2] = fn(Math.min(1, t + 0.03));
    const deg = ((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 360) % 180;
    pts.push({ x, y, ch: deg < 22.5 || deg > 157.5 ? "-" : deg < 67.5 ? "\\" : deg < 112.5 ? "|" : "/" });
  }
  return pts;
}
// spread: 0 = stems bundled straight up, 1 = fanned open. grow: 0..1 stem length.
function layoutBouquet(spread, grow) {
  const { W, H } = bq, T = { x: W * 0.5, y: H * 0.8 }; // T is the knot
  const stemOf = (ang, lenRel, ox = 0, oy = 0) => {
    const fan = clamp(W / 560, 0.6, 1.12); // a narrower fan on narrow screens so nothing runs off the edge, a little wider on big ones
    const th = (ang * spread * fan * Math.PI) / 180, len = lenRel * H * grow, tail = H * 0.11 * grow;
    const tip = { x: T.x + Math.sin(th) * len + ox, y: T.y - Math.cos(th) * len + oy };
    const c = { x: T.x + (tip.x - T.x) * 0.12, y: T.y - len * 0.55 }; // stems arrive at the knot nearly upright
    const foot = { x: T.x - Math.sin(th) * H * 0.055, y: T.y + tail };   // and cross over below it
    const pts = len < 6 ? [] : [
      ...pathChars(t => { const q = 1 - t; return [q * q * tip.x + 2 * q * t * c.x + t * t * T.x, q * q * tip.y + 2 * q * t * c.y + t * t * T.y]; }, len),
      ...pathChars(t => [lerp(T.x, foot.x, t), lerp(T.y, foot.y, t)], tail),
    ];
    return { th, tip, pts };
  };
  for (const f of bq.flowers) {
    const s = stemOf(f.spec.ang, f.spec.len, f.ox || 0, f.oy || 0), side = f.spec.ang < 0 ? -1 : 1;
    f.pts = s.pts; f.cx = s.tip.x; f.cy = s.tip.y - f.h * 0.12;
    f.el.style.translate = `${(s.tip.x - f.w / 2).toFixed(1)}px ${(s.tip.y - f.h * 0.62).toFixed(1)}px`;
    f.el.style.rotate = (((s.th * 180) / Math.PI) * 0.55 + (f.ox || 0) * 0.25).toFixed(2) + "deg";
    f.num.style.translate = `${(s.tip.x + side * f.w * 0.46 - (side < 0 ? 14 : 0)).toFixed(1)}px ${(s.tip.y - f.h * 0.8).toFixed(1)}px`;
  }
  bq.sprigs = BQ_SPRIGS.map(sp => ({ ...stemOf(sp.ang, sp.len), dots: sp.dots }));
  bq.bow.style.translate = `${T.x.toFixed(1)}px ${T.y.toFixed(1)}px`;
  bq.spread = spread; bq.grow = grow;
  drawBqStems();
}
function drawBqStems() {
  const cx = bq.ctx;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.clearRect(0, 0, bq.W, bq.H);
  cx.font = '400 8px "DM Mono", monospace';
  cx.textAlign = "center"; cx.textBaseline = "middle";
  cx.fillStyle = inkNow();
  for (const sp of bq.sprigs) {
    cx.globalAlpha = 0.34;
    for (const p of sp.pts) cx.fillText(p.ch, p.x, p.y);
    cx.globalAlpha = 0.8 * clamp((bq.spread - 0.5) * 2);
    if (cx.globalAlpha > 0.02) for (const d of sp.dots) cx.fillText(d.ch, sp.tip.x + d.x, sp.tip.y + d.y);
  }
  for (const f of bq.flowers) { // the active project's stem stands out
    cx.globalAlpha = active < 0 || !bq.done ? 0.62 : f.i === active ? 0.95 : 0.3;
    for (const p of f.pts) cx.fillText(p.ch, p.x, p.y);
  }
}
function markBouquet() {
  if (!bq.ready) return;
  bq.el.classList.toggle("has-active", active >= 0);
  bq.flowers.forEach(f => { f.el.classList.toggle("is-active", f.i === active); f.num.classList.toggle("is-active", f.i === active); });
  drawBqStems();
}
function sizeBouquet() {
  if (!bq.stems) return;
  // the drawing area's height comes from CSS (--bq-h), so text can sit below it on small screens
  bq.W = bq.el.clientWidth; bq.H = parseFloat(getComputedStyle(bq.el).getPropertyValue("--bq-h")) || bq.el.clientHeight;
  bq.stems.style.height = bq.H + "px";
  bq.stems.width = Math.round(bq.W * dpr); bq.stems.height = Math.round(bq.H * dpr);
  const S = clamp(Math.min(bq.W, bq.H * 1.25) * 0.2, 78, 184);
  for (const f of bq.flowers) {
    const size = S * f.spec.size;
    f.w = size * Math.sqrt(f.aspect); f.h = size / Math.sqrt(f.aspect);
    f.el.style.width = f.w.toFixed(1) + "px"; f.el.style.height = f.h.toFixed(1) + "px";
    buildGrid(f, clamp(Math.round(f.w / 3.4), 22, 84));
    f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
    if (f.done) drawFlower(f, 1);
  }
}
async function initBouquet() {
  if (!bq.el) return;
  const photos = {};
  try { await Promise.all(BQ.map(async s => (photos[s.src] = await getPhoto(s.src)))); } catch { return; }
  bq.stems = document.createElement("canvas");
  bq.stems.className = "bq__stems";
  bq.ctx = bq.stems.getContext("2d");
  bq.bow = document.createElement("pre");
  bq.bow.className = "bq__bow";
  bq.el.prepend(bq.stems);
  BQ.forEach((spec, i) => {
    const f = { ...photos[spec.src], spec, i, ink: inkNow(), invert: dark, done: false };
    f.el = document.createElement("div");
    f.el.className = "bq__flower";
    f.el.dataset.cursor = "view";
    const lift = document.createElement("div");
    lift.className = "bq__lift";
    const sway = document.createElement("div");
    sway.className = "bloom__sway";
    sway.style.animationDuration = rand(7, 11).toFixed(1) + "s";
    sway.style.animationDelay = -rand(0, 8).toFixed(1) + "s";
    f.glow = document.createElement("canvas");
    f.glow.className = "bloom__glow";
    f.glow.width = f.bw; f.glow.height = f.bh;
    f.glow.getContext("2d").putImageData(f.crop, 0, 0);
    f.canvas = document.createElement("canvas");
    f.canvas.className = "bloom__ascii";
    f.ctx = f.canvas.getContext("2d");
    sway.append(f.glow, f.canvas);
    lift.append(sway);
    f.el.append(lift);
    f.num = document.createElement("span");
    f.num.className = "bq__num mono";
    f.num.textContent = pad(i + 1);
    f.el.addEventListener("mouseenter", () => setActive(i));
    // with a mouse a click opens the project; on touch the first tap selects, the second opens
    f.el.addEventListener("click", () => (!fine && active !== i ? setActive(i) : openCase(i, rowEls[i].querySelector("button"))));
    bq.el.append(f.el, f.num);
    bq.flowers.push(f);
  });
  bq.el.append(bq.bow);
  // leaving the bouquet puts it back together: nothing selected, nothing dimmed
  if (fine) bq.el.addEventListener("mouseleave", () => { active = -1; rowEls.forEach(r => r.classList.remove("is-active")); markBouquet(); });
  sizeBouquet();
  bq.ready = true;
  if (reduce) {
    bq.flowers.forEach(f => { f.done = true; drawFlower(f, 1); f.glow.style.opacity = glowNow(); f.el.style.scale = 1; });
    bq.bow.textContent = BOW;
    bq.done = true;
    bq.el.classList.add("is-open");
    layoutBouquet(1, 1);
    markBouquet();
    return;
  }
  layoutBouquet(0, 0);
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { bq.t0 = performance.now() + 150; io.disconnect(); }
  }, { threshold: 0.3 }).observe(bq.el);
}
function tickBouquet(now) {
  if (!bq.ready) return;
  if (!bq.done) {
    if (now < bq.t0) return;
    const t = (now - bq.t0) / 1000;
    const grow = 1 - Math.pow(1 - clamp(t / 0.9), 3);           // 1. the bundle rises
    const shown = Math.round(clamp((t - 0.55) / 0.7) * BOW.length); // 2. the bow is tied, character by character
    if (shown !== bq.bowShown) { bq.bowShown = shown; bq.bow.textContent = BOW.slice(0, shown); }
    const spread = backOut(clamp((t - 0.95) / 1.6));             // 3. it loosens and fans open
    let all = true;
    for (const f of bq.flowers) {                                // 4. blossoms open from the middle outward
      const p = clamp((t - 1.1 - BQ_ORDER.indexOf(f.i) * 0.17) / 2.0), g = 1 - Math.pow(1 - p, 3);
      if (p > 0 && !f.done) {
        drawFlower(f, p >= 1 ? 1 : g);
        f.el.style.scale = (0.15 + 0.85 * g).toFixed(3);
        f.glow.style.opacity = (glowNow() * g * g).toFixed(3);
        if (p >= 1) f.done = true;
      }
      if (!f.done) all = false;
    }
    layoutBouquet(spread, grow);
    if (all && t > 2.6) { bq.done = true; bq.el.classList.add("is-open"); layoutBouquet(1, 1); markBouquet(); } // 5. number tags appear
    return;
  }
  if (reduce) return;
  const r = bq.el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  let moved = false;
  for (const f of bq.flowers) {
    if (spring(f, r.left + f.cx - (f.ox || 0), r.top + f.cy - (f.oy || 0), Math.max(f.w, f.h) * 0.6, brushV.x, brushV.y, brushV.s)) moved = true;
  }
  if (moved) layoutBouquet(1, 1);
}

/* ---------- Bees ----------
   A few bees work the bouquet once it has opened. They fly from blossom to
   blossom (the blossom nods when one lands), drift toward the flower you are
   pointing at, and keep clear of the cursor itself. */
const BEE = {
  r: [[" \\/ ", "(|||>"], [" -- ", "(|||>"]],
  l: [[" \\/ ", "<|||)"], [" -- ", "<|||)"]],
};
const bees = [];
function pickBeeTarget(b, mustBeFlower) {
  if (!mustBeFlower && Math.random() < 0.25) { // sometimes just wander
    b.flower = null;
    b.target = { x: rand(0.12, 0.88) * bq.W, y: rand(0.04, 0.55) * bq.H };
  } else {
    const free = bq.flowers.filter(f => f !== b.prev && !bees.some(o => o !== b && o.flower === f));
    const fav = active >= 0 && Math.random() < 0.6 ? bq.flowers[active] : null; // curious about the selected flower
    b.flower = fav && fav !== b.prev ? fav : free[Math.floor(Math.random() * free.length)] || bq.flowers[0];
    b.off = { x: rand(-0.22, 0.22), y: rand(-0.25, 0.05) };
  }
  b.state = "fly";
}
function initBees() {
  const n = innerWidth < 760 ? 2 : 3;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("pre");
    el.className = "bee";
    el.setAttribute("aria-hidden", "true");
    bq.el.append(el);
    const b = { el, x: i % 2 ? bq.W + 40 : -40, y: rand(0, bq.H * 0.4), vx: 0, vy: 0, phase: rand(0, 6), face: i % 2 ? "l" : "r", frame: "", prev: null, wait: performance.now() + i * 900 };
    bees.push(b);
    pickBeeTarget(b, true);
  }
}
function tickBees(now) {
  if (reduce || !bq.done) return;
  if (!bees.length) initBees();
  const r = bq.el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  const mx = mouse.x - r.left, my = mouse.y - r.top, shy = fine && mouse.moved;
  for (const b of bees) {
    if (now < b.wait) continue;
    const f = b.flower;
    const tx = f ? f.cx + b.off.x * f.w : b.target.x, ty = f ? f.cy + b.off.y * f.h : b.target.y;
    let tilt = 0;
    if (b.state === "land") {
      b.x = tx; b.y = ty + Math.sin(now / 300 + b.phase) * 0.6;
      if (now > b.until || (shy && Math.hypot(mx - b.x, my - b.y) < 34)) { b.prev = f; pickBeeTarget(b); b.vy = -1.6; }
    } else {
      const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(2.4, 0.4 + d * 0.05);
      b.vx = lerp(b.vx, (dx / d) * sp, 0.05); b.vy = lerp(b.vy, (dy / d) * sp, 0.05);
      if (shy) {
        const cd = Math.hypot(b.x - mx, b.y - my) || 1;
        if (cd < 70) { b.vx += ((b.x - mx) / cd) * 0.5; b.vy += ((b.y - my) / cd) * 0.5; }
      }
      b.x += b.vx; b.y += b.vy + Math.sin(now / 90 + b.phase) * 0.45; // a little bob in flight
      b.face = b.vx >= 0 ? "r" : "l";
      tilt = clamp(b.vy * 7, -20, 20) * (b.face === "r" ? 1 : -1);
      if (d < 7) {
        if (f) {
          b.state = "land"; b.until = now + rand(1600, 4200);
          if (f.ox === undefined) f.ox = f.oy = f.vx = f.vy = 0;
          f.vy += 1.1; f.vx += b.vx * 0.5; f.live = true; // the blossom dips under the bee
        } else pickBeeTarget(b, true);
      }
    }
    const flap = b.state === "land" ? (Math.floor(now / 400 + b.phase) % 5 === 0 ? 0 : 1) : Math.floor(now / 55) % 2;
    if (b.face + flap !== b.frame) { b.frame = b.face + flap; b.el.textContent = BEE[b.face][flap].join("\n"); }
    b.el.style.transform = `translate3d(${(b.x - 13).toFixed(1)}px, ${(b.y - 9).toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
  }
}

/* ---------- Project view: the picked flower ----------
   Opening a project "picks" its flower from the bouquet: the same species grows
   large beside the project, stem first, then the bloom. */
const FLOWER_NAMES = { magnolia: "Magnolia", dahlia: "Dahlia", "violet-lily": "Blue water lily", waterlily: "Water lily", chrysanthemum: "Chrysanthemum", lotus: "Lotus" };
const cf = { f: null, t0: Infinity, done: true, rows: -1 };
function showCaseFlower(i, delay) {
  getPhoto(BQ[i].src).then(photo => {
    if (!cf.el) {
      cf.el = document.createElement("div");
      cf.el.className = "case__bloom";
      const sway = document.createElement("div");
      sway.className = "bloom__sway";
      cf.glow = document.createElement("canvas");
      cf.glow.className = "bloom__glow";
      cf.canvas = document.createElement("canvas");
      cf.canvas.className = "bloom__ascii";
      cf.ctx = cf.canvas.getContext("2d");
      sway.append(cf.glow, cf.canvas);
      cf.el.append(sway);
      cf.stem = document.createElement("pre");
      cf.stem.className = "case__stem";
      cs.specimen.append(cf.el, cf.stem);
    }
    const f = (cf.f = { ...photo, ink: "#f1f1ee", invert: true, canvas: cf.canvas, ctx: cf.ctx });
    const box = cs.specimen.getBoundingClientRect();
    let size = Math.min(box.height * 0.54, 380);
    if (size * Math.sqrt(f.aspect) > box.width * 0.9) size = (box.width * 0.9) / Math.sqrt(f.aspect);
    f.w = size * Math.sqrt(f.aspect); f.h = size / Math.sqrt(f.aspect);
    cf.el.style.width = f.w.toFixed(1) + "px"; cf.el.style.height = f.h.toFixed(1) + "px";
    cf.canvas.width = Math.round(f.w * dpr); cf.canvas.height = Math.round(f.h * dpr);
    cf.glow.width = f.bw; cf.glow.height = f.bh;
    cf.glow.getContext("2d").putImageData(f.crop, 0, 0);
    buildGrid(f, clamp(Math.round(f.w / 4.2), 22, 116));
    cf.stemRows = Math.max(4, Math.min(PLANT_STEM.length, Math.floor((box.height - f.h) / 10)));
    if (reduce) {
      drawFlower(f, 1); cf.el.style.scale = 1; cf.glow.style.opacity = 0.5;
      cf.stem.textContent = PLANT_STEM.slice(0, cf.stemRows).join("\n"); cf.done = true;
      return;
    }
    cf.el.style.scale = 0.2; cf.glow.style.opacity = 0; cf.stem.textContent = ""; cf.rows = -1;
    cf.t0 = performance.now() + delay; cf.done = false;
  }).catch(() => {});
}
function tickCaseFlower(now) {
  if (cf.done || !cf.f || now < cf.t0) return;
  const t = (now - cf.t0) / 1000, f = cf.f;
  const n = Math.round(clamp(t / 0.7) * cf.stemRows); // the stem climbs first
  if (n !== cf.rows) { cf.rows = n; cf.stem.textContent = PLANT_STEM.slice(0, cf.stemRows).slice(cf.stemRows - n).join("\n"); }
  const p = clamp((t - 0.4) / 2.3), g = 1 - Math.pow(1 - p, 3);
  if (p > 0) {
    drawFlower(f, p >= 1 ? 1 : g);
    cf.el.style.scale = (0.2 + 0.8 * g).toFixed(3);
    cf.glow.style.opacity = (0.5 * g * g).toFixed(3);
  }
  if (p >= 1) cf.done = true;
}

/* ---------- About: a field of red spider lilies ----------
   A ground plane tilted in real 3D carries rows of red spider lilies standing
   upright on their stalks, swaying, with the far rows fading into the distance.
   A few white lilies stand among the red. Those are the ones
   that carry the facts: point at one and it says its line.
   FIELD_SAYS: one line per white flower. */
// short: the whisper beside the flower on hover. full: the line that takes over the centre when you click it.
const FIELD_SAYS = [
  { short: "one year in", full: "One year of practice so far." },
  { short: "six months at Boutik Studio", full: "Six months as an intern at Boutik Studio." },
  { short: "studied multimedia design", full: "I studied multimedia design." },
  { short: "Portugal, working remotely", full: "Based in Portugal, working remotely." },
];
const FIELD_TILT = 64;
const field = { el: $("[data-field]"), fls: [], ready: false, visible: false, open: false, rx: 0, rz: 0, frame: 0, hover: null, pinned: null };
// one flower drawn once, then copied to every canvas in the field
function masterFlower(photo, size, ink) {
  const f = { ...photo, ink, invert: true };
  f.w = size * Math.sqrt(f.aspect); f.h = size / Math.sqrt(f.aspect);
  f.canvas = document.createElement("canvas");
  f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
  f.ctx = f.canvas.getContext("2d");
  buildGrid(f, clamp(Math.round(f.w / 3.1), 22, 110));
  drawFlower(f, 1);
  return f;
}
// hovering a white flower shows its short line beside it; clicking pins it and brings its full line
// into focus in the centre, with the main statement falling out of focus behind it
function sayFlower(fl) { field.hover = fl; showSaying(); }
function pinFlower(fl) {
  field.pinned = field.pinned === fl ? null : fl;
  if (field.pinned) field.focusText.textContent = field.pinned.say.full;
  field.el.classList.toggle("is-said", !!field.pinned);
  showSaying();
}
function showSaying() {
  const cur = field.hover || field.pinned;
  field.el.classList.toggle("has-focus", !!cur);
  field.fls.forEach(f => f.el.classList.toggle("is-on", f === cur || f === field.pinned));
}
function sizeField() {
  if (!field.plane) return;
  const W = (field.W = field.plane.offsetWidth), H = (field.H = field.plane.offsetHeight);
  for (const f of field.fls) { f.x = f.u * W; f.y = f.v * H; f.h = f.el.offsetHeight; }
  // the ground: a scatter of small marks that thins toward the edges, so the plane reads as a surface
  const cv = field.ground, cx = cv.getContext("2d");
  cv.width = W; cv.height = H;
  cx.font = '500 13px "DM Mono", monospace';
  cx.fillStyle = "#f1f1ee";
  for (let i = 0; i < 1300; i++) {
    const x = Math.random() * W, y = Math.random() * H, ex = (x - W / 2) / (W / 2), ey = (y - H / 2) / (H / 2), e = ex * ex + ey * ey;
    if (e > 1) continue;
    cx.globalAlpha = (1 - e) * 0.34;
    cx.fillText(",.'`\"".charAt(Math.floor(Math.random() * 5)), x, y);
  }
}
async function initField() {
  if (!field.el) return;
  let red, white;
  try { [red, white] = await Promise.all([getPhoto("spider-lily"), getPhoto("white-lily")]); } catch { return; }
  field.plane = $(".field__plane", field.el);
  field.ground = $(".field__ground", field.el);
  field.text = $(".field__text", field.el);
  field.focusText = $(".field__focus", field.el);
  const small = innerWidth < 760, S = small ? 112 : 178;
  const mr = masterFlower(red, S, "#ff9c8a"), mw = masterFlower(white, S * 0.92, "#f6f6f1");
  // rows from far to near; [row, column] of the white flowers
  const rows = small ? [4, 5, 5, 5] : [8, 9, 10, 10, 9];
  const says = small ? [[1, 0], [2, 4], [3, 1], [3, 3]] : [[2, 1], [2, 8], [4, 2], [4, 6]]; // out at the sides and the front, clear of the text
  let sayI = 0;
  rows.forEach((n, r) => {
    for (let c = 0; c < n; c++) {
      const depth = r / (rows.length - 1);
      const v = 0.18 + depth * 0.64 + rand(-0.04, 0.04);
      const u = ((c + 0.5 + rand(-0.3, 0.3)) / n) * (small ? 0.66 : 0.86) + (small ? 0.17 : 0.07); // kept further from the edges on phones
      const telling = says.some(([a, b]) => a === r && b === c), m = telling ? mw : mr;
      const el = document.createElement(telling ? "button" : "div");
      el.className = "fl" + (telling ? " fl--say" : "") + (u < 0.5 ? " fl--l" : " fl--r");
      const stemRows = Math.round(telling ? rand(4, 7) : rand(9, 16));
      el.innerHTML = '<span class="fl__glow"></span><canvas class="fl__head"></canvas><pre class="fl__stem">' + Array(stemRows).fill("|").join("\n") + "</pre>";
      const cv = el.querySelector("canvas");
      cv.width = m.canvas.width; cv.height = m.canvas.height;
      cv.style.width = m.w.toFixed(1) + "px"; cv.style.height = m.h.toFixed(1) + "px";
      cv.getContext("2d").drawImage(m.canvas, 0, 0);
      el.style.setProperty("--d", (r * 0.2 + rand(0, 0.3)).toFixed(2) + "s"); // far rows come up first
      el.style.setProperty("--fade", (0.38 + 0.62 * depth).toFixed(2));        // and stay fainter
      const fl = { el, u, v, telling, w: m.w, phase: rand(0, 6), ga: 0, gv: 0, sx: -9999, sy: -9999, behind: false };
      if (telling) {
        fl.say = FIELD_SAYS[sayI++];
        const say = document.createElement("span");
        say.className = "fl__say";
        say.textContent = fl.say.short;
        el.append(say);
        el.setAttribute("aria-label", fl.say.full);
        el.dataset.cursor = "link";
        el.addEventListener("mouseenter", () => sayFlower(fl));
        el.addEventListener("mouseleave", () => sayFlower(null));
        el.addEventListener("focus", () => sayFlower(fl));
        el.addEventListener("blur", () => sayFlower(null));
        el.addEventListener("click", e => { e.stopPropagation(); pinFlower(fl); });
      } else el.setAttribute("aria-hidden", "true");
      field.plane.append(el);
      field.fls.push(fl);
    }
  });
  sizeField();
  field.el.addEventListener("click", () => field.pinned && pinFlower(field.pinned)); // click anywhere else to return
  addEventListener("keydown", e => { if (e.key === "Escape" && field.pinned) pinFlower(field.pinned); });
  field.ready = true;
  new IntersectionObserver(([e]) => {
    field.visible = e.isIntersecting;
    if (e.isIntersecting && !field.el.classList.contains("is-open")) {
      field.el.classList.add("is-open");
      setTimeout(() => (field.open = true), reduce ? 0 : 2600);
    }
  }, { threshold: 0.15 }).observe(field.el);
}
function tickField(now) {
  if (!field.ready || !field.visible) return;
  const t = now / 1000, r = field.el.getBoundingClientRect(), live = !reduce;
  const lean = live && fine && mouse.moved;
  const mxn = clamp((mouse.x - r.left) / r.width) - 0.5, myn = clamp((mouse.y - r.top) / r.height) - 0.5;
  field.rx = lerp(field.rx, lean ? -myn * 5 : 0, 0.04); field.rz = lerp(field.rz, lean ? -mxn * 5 : 0, 0.04);
  field.plane.style.setProperty("--rx", field.rx.toFixed(2) + "deg");
  field.plane.style.setProperty("--rz", field.rz.toFixed(2) + "deg");
  const measure = field.frame++ % 30 === 0; // where each flower is on screen, refreshed twice a second
const gust = lean && brushV.s > 0.4;
const tr = measure ? (field.text.firstElementChild || field.text).getBoundingClientRect() : null;
for (const f of field.fls) {
  if (measure) {
    const b = f.el.getBoundingClientRect();
    f.sx = b.left + b.width / 2; f.sy = b.top + b.height * 0.25;
    // red flowers that stand behind the words drop out of focus, so the text reads without a backing
    const behind = !f.telling && f.sx > tr.left - 40 && f.sx < tr.right + 40 && f.sy > tr.top - 60 && f.sy < tr.bottom + 50;
    if (behind !== f.behind) { f.behind = behind; f.el.classList.toggle("is-behind", behind); }
  }
    if (gust) { // the cursor passing is a gust of wind
      const dx = Math.abs(mouse.x - f.sx), dy = Math.abs(mouse.y - f.sy);
      if (dx < 150 && dy < 190) f.gv += clamp(brushV.x, -14, 14) * 0.014 * (1 - dx / 150);
    }
    f.gv = (f.gv - 0.011 * f.ga) * 0.95;
    f.ga = clamp(f.ga + f.gv, -9, 9);
    const sway = live ? Math.sin(t * 0.9 + f.phase) * 2.6 + Math.sin(t * 0.37 + f.phase * 2) * 1.6 + f.ga : 0;
    f.el.style.transform = `translate3d(${(f.x - f.w / 2).toFixed(1)}px, ${(f.y - f.h).toFixed(1)}px, 0) rotateX(${-FIELD_TILT}deg) rotateZ(${sway.toFixed(2)}deg)`;
  }
}

/* ---------- About: red spider lily and lily of the valley ----------
   The spider lily grows beside the statement as you read (see the plant above).
   Once it is open it sheds petals that drift across the section and swirl away
   from the cursor. The lily of the valley stands by the fact sheet and its
   bells swing when you run down the list. */
function valleyStem(cx, g) { // the arching stem the bells hang from, drawn over the photo's bells
  if (g < 0.25) return;
  const f = this, p0 = [f.w * 0.1, f.h * 0.05], c = [f.w * 0.66, -f.h * 0.04], p1 = [f.w * 0.9, f.h];
  cx.font = '400 8px "DM Mono", monospace';
  cx.globalAlpha = 0.5 * clamp((g - 0.25) * 2);
  for (const p of pathChars(t => { const q = 1 - t; return [q * q * p0[0] + 2 * q * t * c[0] + t * t * p1[0], q * q * p0[1] + 2 * q * t * c[1] + t * t * p1[1]]; }, f.h * 1.1)) cx.fillText(p.ch, p.x, p.y);
}
$$(".facts > div").forEach(row => row.addEventListener("mouseenter", () => {
  const f = colBlooms.find(b => b.extra);
  if (!f || !f.done) return;
  if (f.ox === undefined) f.ox = f.oy = f.vx = f.vy = 0;
  f.vx += 1.5; f.live = true; // the bells swing
}));
const petals = { el: $(".statement"), list: [], next: 0, W: 0, H: 0 };
function initPetals() {
  if (reduce || !petals.el) return;
  petals.cv = document.createElement("canvas");
  petals.cv.className = "petals";
  petals.cv.setAttribute("aria-hidden", "true");
  petals.ctx = petals.cv.getContext("2d");
  petals.el.prepend(petals.cv);
}
function tickPetals(now) {
  if (!petals.cv || !field.open) return;
  const r = petals.el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  if (Math.abs(petals.W - r.width) > 1 || Math.abs(petals.H - r.height) > 1) {
    petals.W = r.width; petals.H = r.height;
    petals.cv.width = Math.round(r.width); petals.cv.height = Math.round(r.height);
  }
  if (now > petals.next && petals.list.length < 26) { // a petal lets go of one of the red flowers
    const reds = field.fls.filter(f => !f.telling && f.sx > -999), src = reds[Math.floor(Math.random() * reds.length)];
    if (src) petals.list.push({ x: src.sx - r.left + rand(-24, 24), y: src.sy - r.top + rand(-16, 16), vx: rand(0.15, 0.6), vy: rand(0.25, 0.6), ph: rand(0, 6), ch: "',`~)("[Math.floor(rand(0, 6))], born: now, life: rand(9000, 15000) });
    petals.next = now + rand(600, 1500);
  }
  const cx = petals.ctx, mx = mouse.x - r.left, my = mouse.y - r.top, shy = fine && mouse.moved;
  cx.clearRect(0, 0, petals.W, petals.H);
  if (!petals.list.length) return;
  cx.font = '500 13px "DM Mono", monospace';
  cx.fillStyle = "#ea5442";
  petals.list = petals.list.filter(p => {
    const age = now - p.born;
    if (age > p.life || p.y > petals.H + 20 || p.x > petals.W + 20) return false;
    if (shy) { const d = Math.hypot(p.x - mx, p.y - my) || 1; if (d < 90) { p.vx += ((p.x - mx) / d) * 0.08; p.vy += ((p.y - my) / d) * 0.08; } }
    p.vx = lerp(p.vx, 0.35, 0.01); p.vy = lerp(p.vy, 0.45, 0.01); // a light breeze carries them across and down
    p.x += p.vx + Math.sin(now / 900 + p.ph) * 0.5; p.y += p.vy + Math.cos(now / 1300 + p.ph) * 0.15;
    cx.globalAlpha = Math.min(1, age / 800) * Math.min(1, (p.life - age) / 2000) * 0.85;
    cx.fillText(p.ch, p.x, p.y);
    return true;
  });
}

/* ---------- Practice: the pond ----------
   A tilted plane in real 3D (CSS perspective) is the water surface. The water is
   ASCII drawn on that plane, so it recedes with distance. Three water flowers
   float on it; pointing at one lifts it toward you and brings it into focus with
   its text, while the others fall out of focus. Ripples spread from the flowers
   and from wherever the cursor touches the water.
   u / v: where each flower floats (across / into the distance). */
const POND = [
  { src: "waterlily",   u: 0.29, v: 0.58 },
  { src: "lotus",       u: 0.54, v: 0.3 },
  { src: "violet-lily", u: 0.74, v: 0.55 },
];
const pond = { el: $("[data-pond]"), lilies: [], ripples: [], focus: -1, ready: false, visible: false, rx: 0, rz: 0, frame: 0, drawn: false, lastRip: { x: -999, y: -999 } };
function addRipple(x, y, amp) {
  pond.ripples.push({ x, y, amp, t0: performance.now() / 1000 });
  if (pond.ripples.length > 16) pond.ripples.shift();
}
function focusLily(i) {
  if (i === pond.focus) return;
  pond.focus = i;
  pond.el.classList.toggle("has-focus", i >= 0);
  pond.lilies.forEach(f => f.el.classList.toggle("is-focus", f.i === i));
  pond.cards.forEach((c, j) => c.classList.toggle("is-on", j === i));
  if (i >= 0) addRipple(pond.lilies[i].wx, pond.lilies[i].wy, 1.3); // it stirs the water as it lifts
}
function sizePond() {
  if (!pond.plane) return;
  pond.W = pond.plane.offsetWidth; pond.H = pond.plane.offsetHeight;
  pond.water.width = pond.W; pond.water.height = pond.H;
  const S = clamp(pond.W * 0.135, 96, 200);
  for (const f of pond.lilies) {
    f.w = S * Math.sqrt(f.aspect); f.h = S / Math.sqrt(f.aspect);
    f.el.style.width = f.w.toFixed(1) + "px"; f.el.style.height = f.h.toFixed(1) + "px";
    buildGrid(f, clamp(Math.round(f.w / 3.6), 22, 84));
    f.canvas.width = Math.round(f.w * dpr); f.canvas.height = Math.round(f.h * dpr);
    if (f.done) drawFlower(f, 1);
  }
  pond.drawn = false;
}
async function initPond() {
  if (!pond.el) return;
  pond.plane = $(".pond__plane", pond.el);
  pond.water = $(".pond__water", pond.el);
  pond.ctx = pond.water.getContext("2d");
  pond.cards = $$("[data-card]", pond.el);
  const els = $$("[data-lily]", pond.el);
  for (let i = 0; i < POND.length; i++) {
    let photo;
    try { photo = await getPhoto(POND[i].src); } catch { return; }
    const f = { ...photo, spec: POND[i], i, el: els[i], ink: "#f1f1ee", invert: true, done: false, t0: Infinity, phase: i * 2.1, nextRipple: 0, wx: 0, wy: 0 };
    f.bloom = document.createElement("span");
    f.bloom.className = "lily__bloom";
    f.glow = document.createElement("canvas");
    f.glow.className = "bloom__glow";
    f.glow.width = f.bw; f.glow.height = f.bh;
    f.glow.getContext("2d").putImageData(f.crop, 0, 0);
    f.canvas = document.createElement("canvas");
    f.canvas.className = "bloom__ascii";
    f.ctx = f.canvas.getContext("2d");
    f.bloom.append(f.glow, f.canvas);
    f.el.firstElementChild.append(f.bloom);
    f.el.addEventListener("mouseenter", () => focusLily(i));
    f.el.addEventListener("mouseleave", () => focusLily(-1));
    f.el.addEventListener("focus", () => focusLily(i));
    f.el.addEventListener("blur", () => focusLily(-1));
    f.el.addEventListener("click", () => { if (!fine) focusLily(pond.focus === i ? -1 : i); }); // tap to focus on touch screens
    pond.lilies.push(f);
  }
  sizePond();
  // the cursor disturbs the water. offsetX/Y on a 3D-transformed element are already in its own flat coordinates.
  pond.water.addEventListener("pointermove", e => {
    if (Math.hypot(e.offsetX - pond.lastRip.x, e.offsetY - pond.lastRip.y) < 70) return;
    pond.lastRip = { x: e.offsetX, y: e.offsetY };
    addRipple(e.offsetX, e.offsetY, 0.75);
  });
  pond.water.addEventListener("click", () => focusLily(-1));
  pond.ready = true;
  new IntersectionObserver(([e]) => {
    pond.visible = e.isIntersecting;
    if (e.isIntersecting && !pond.started) { pond.started = true; pond.lilies.forEach(f => (f.t0 = performance.now() + 250 + f.i * 320)); }
  }, { threshold: 0.12 }).observe(pond.el);
}
function drawWater(t) {
  const { ctx, W, H } = pond, cw = 13, ch = 16;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '500 13px "DM Mono", monospace';
  ctx.textBaseline = "top";
  ctx.fillStyle = "#f1f1ee";
  pond.ripples = pond.ripples.filter(r => t - r.t0 < 5.5);
  const hw = W / 2, hh = H / 2;
  for (let y = 0; y < H; y += ch) {
    for (let x = 0; x < W; x += cw) {
      const ex = (x - hw) / hw, ey = (y - hh) / hh;
      if (ex * ex + ey * ey > 1) continue; // the pond is an ellipse
      let v = 0.2 * Math.sin(x * 0.016 + t * 0.8 + Math.sin(y * 0.008) * 2) * Math.sin(y * 0.02 - t * 0.5); // slow swell
      for (const r of pond.ripples) { // each ripple is a ring that widens and fades
        const age = t - r.t0, k = (Math.hypot(x - r.x, y - r.y) - age * 120) / 32;
        if (k * k < 12) v += r.amp * Math.exp(-k * k * 0.6) * Math.exp(-age * 0.45) * Math.cos(k * 1.9);
      }
      const a = Math.abs(v);
      if (a < 0.11) continue;
      ctx.globalAlpha = Math.min(0.95, 0.24 + a * 0.9);
      ctx.fillText(a < 0.2 ? "." : a < 0.34 ? "-" : a < 0.52 ? "~" : a < 0.75 ? "=" : "*", x, y);
    }
  }
  pond.drawn = true;
}
function tickPond(now) {
  if (!pond.ready || !pond.visible) return;
  const t = now / 1000, r = pond.el.getBoundingClientRect(), live = !reduce;
  // the camera leans a little with the pointer, which is what sells the depth
  const mxn = clamp((mouse.x - r.left) / r.width) - 0.5, myn = clamp((mouse.y - r.top) / r.height) - 0.5, lean = live && fine && mouse.moved;
  pond.rx = lerp(pond.rx, lean ? -myn * 6 : 0, 0.04); pond.rz = lerp(pond.rz, lean ? -mxn * 5 : 0, 0.04);
  pond.plane.style.setProperty("--rx", pond.rx.toFixed(2) + "deg");
  pond.plane.style.setProperty("--rz", pond.rz.toFixed(2) + "deg");
  for (const f of pond.lilies) {
    if (!f.done && now >= f.t0) { // open on arrival
      const p = reduce ? 1 : clamp((now - f.t0) / 2200), g = 1 - Math.pow(1 - p, 3);
      drawFlower(f, p >= 1 ? 1 : g);
      f.bloom.style.scale = (0.3 + 0.7 * g).toFixed(3);
      f.glow.style.opacity = (0.5 * g * g).toFixed(3);
      if (p >= 1) f.done = true;
    }
    // each flower drifts and bobs on the water
    // two slow waves at different speeds, so the path never visibly repeats
    const x = (f.spec.u + (live ? Math.sin(t * 0.17 + f.phase) * 0.045 + Math.sin(t * 0.07 + f.phase * 2) * 0.02 : 0)) * pond.W;
    const y = (f.spec.v + (live ? Math.cos(t * 0.13 + f.phase) * 0.032 + Math.cos(t * 0.05 + f.phase * 3) * 0.014 : 0)) * pond.H;
    f.wx = x; f.wy = y;
    const bob = live ? Math.sin(t * 0.9 + f.phase) * 8 : 0, turn = live ? Math.sin(t * 0.33 + f.phase) * 7 : 0;
    const rock = live ? Math.sin(t * 0.7 + f.phase * 1.7) * 5 : 0, roll = live ? Math.cos(t * 0.55 + f.phase) * 4 : 0; // rocking on the swell
    f.el.style.transform = `translate3d(${(x - f.w / 2).toFixed(1)}px, ${(y - f.h * 0.85).toFixed(1)}px, ${bob.toFixed(1)}px) rotateZ(${turn.toFixed(2)}deg) rotateX(${rock.toFixed(2)}deg) rotateY(${roll.toFixed(2)}deg)`;
    if (live && f.done && t > f.nextRipple) { addRipple(x, y, 1.1); f.nextRipple = t + 2.2 + rand(0, 1.2); }
  }
  if (pond.focus >= 0) { // the text sits beside the lifted flower
    const card = pond.cards[pond.focus], lr = pond.lilies[pond.focus].el.firstElementChild.getBoundingClientRect();
    const cw = card.offsetWidth, chh = card.offsetHeight;
    let x, y;
    if (innerWidth < 760) { x = (r.width - cw) / 2; y = r.height - chh - 18; }
    else {
      x = lr.left + lr.width / 2 < r.left + r.width / 2 ? lr.right - r.left + 34 : lr.left - r.left - cw - 34;
      y = clamp(lr.top - r.top + lr.height * 0.05, 12, r.height - chh - 12);
      x = clamp(x, 12, r.width - cw - 12);
    }
    card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }
  if (reduce ? !pond.drawn : pond.frame++ % 2 === 0) drawWater(t); // water at half the frame rate
}

/* ---------- Practice: one flower per discipline ----------
   Same photo-to-ASCII flowers as the hero. Each opens when its column scrolls into view. */
const colBlooms = [];
async function initColBlooms() {
  for (const host of $$("[data-bloom]")) {
    let photo;
    try { photo = await getPhoto(host.dataset.bloom); } catch { continue; }
    const f = { ...photo, ink: inkNow(), invert: dark, done: false, t0: Infinity };
    if (host.dataset.bloom === "valley") f.extra = valleyStem;
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

/* ---------- Between sections ----------
   A single stem grows down through the gap as you scroll, ending in a bud, so one
   section leads into the next. Each section also fades up as it arrives and
   fades back as it leaves, instead of being cut off by the edge of the screen. */
const seams = $$(".seam").map(el => {
  const rows = Math.max(8, Math.floor(el.clientHeight / 10) - 2);
  const lines = Array.from({ length: rows }, (_, i) => PLANT_STEM[(i * 3) % PLANT_STEM.length]);
  return { el, pre: el.firstElementChild, lines, shown: -1 };
});
const fadeSections = $$(".statement, .work, .practice").map(el => ({ el, o: -1 }));
function tickSeams() {
  for (const s of seams) {
    const r = s.el.getBoundingClientRect();
    if (r.bottom < -40 || r.top > innerHeight + 40) continue;
    const p = reduce ? 1 : clamp((innerHeight * 0.92 - r.top) / (r.height + innerHeight * 0.22));
    const n = Math.round(p * s.lines.length);
    if (n === s.shown) continue;
    s.shown = n;
    s.pre.textContent = n ? s.lines.slice(0, n).join("\n") + "\n" + (n < s.lines.length ? "   '   " : "  (*)  ") : "";
  }
  if (reduce) return;
  for (const f of fadeSections) {
    const r = f.el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) continue;
    const arrive = smooth(innerHeight * 0.98 - r.top, 0, innerHeight * 0.45), leave = smooth(r.bottom, innerHeight * 0.04, innerHeight * 0.42);
    const o = Math.min(arrive, leave);
    if (Math.abs(o - f.o) < 0.004) continue;
    f.o = o;
    f.el.style.opacity = o.toFixed(3);
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
  tickBouquet(now);
  tickBees(now);
  tickCaseFlower(now);
  tickPond(now);
  tickField(now);
  tickPetals(now);
  tickSeams();

  if (!reduce) {
    // hero drifts away slower than the page
    if (y < innerHeight * 1.2) {
      heroInner.style.transform = `translate3d(0, ${(y * 0.14).toFixed(1)}px, 0)`;
      heroInner.style.opacity = clamp(1 - y / (innerHeight * 0.9)).toFixed(3);
    }
    // cursor + preview follow with different lag
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
  initBouquet();
  initPond();
  initPetals();
  initField();
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

addEventListener("resize", () => { fit(); half = 0; if (garden) { measureInk(); placeGarden(); } placeSolo(); lockWords(); sizeBouquet(); if (bq.done) layoutBouquet(1, 1); sizePond(); sizeField(); });

