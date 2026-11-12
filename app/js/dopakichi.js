// 星仔：以星形轮廓和轨道装饰绘制的原创吉祥物。
// The actor keeps the existing animation interface and unit space (feet at y=0).
// Body parts are springs; actions are cancellable async routines.
import { Spring, tween, wait, lerp, clamp, rand, pick, quadPoint, easeOutQuad, easeInQuad, easeOutBack, easeInOutCubic, easeOutCubic, onFrame } from './core.js';

const NS = 'http://www.w3.org/2000/svg';
export const INK = '#000';
export const PALETTES = {
  pink: { body: '#ff81ad', inner: '#ffe69b', leg: '#6046b7', cheek: '#ffc4ce' },
  blue: { body: '#7abaff', inner: '#ffedaa', leg: '#5145a5', cheek: '#ffd2c7' },
  yellow: { body: '#ffcf53', inner: '#fff1a8', leg: '#5145a5', cheek: '#ff9d92' },
  mint: { body: '#6bdbb6', inner: '#fff1a8', leg: '#5544a9', cheek: '#ffc3b9' },
  violet: { body: '#b99aff', inner: '#fff1a8', leg: '#5544a9', cheek: '#ffc3c9' },
  // Unlockable colours for the hero (id041, id044).
  gold: { body: '#f8b928', inner: '#fff1a8', leg: '#6549a8', cheek: '#ffa899' },
  snow: { body: '#f2f5ff', inner: '#fff1a8', leg: '#5751aa', cheek: '#ffbec9' },
  rainbow: { body: 'url(#dk-rainbow)', inner: '#fff1a8', leg: '#5544a9', cheek: '#ffd0ce', flat: '#ff81ad' },
};

// Costumes are layered over the mascot.
// head: moves with the head; back: behind the body (capes).
export const COSTUMES = {
  cap: { head: `<path class="dk-l" d="M-27 -145 Q-25 -167 0 -171 Q25 -167 27 -145 Z" fill="#3b6bff"/><path class="dk-l" d="M-7 -145 Q24 -152 39 -141 Q27 -136 -7 -141Z" fill="#2a4fd6"/><circle class="dk-l" cx="0" cy="-170" r="4" fill="#ffd23f"/>` },
  hachimaki: { head: `<path class="dk-l" d="M-30 -134 Q0 -141 30 -134 L30 -124 Q0 -131 -30 -124Z" fill="#fff"/><circle cx="0" cy="-133" r="4" fill="#ff4f6d"/><path class="dk-l" d="M28 -131 Q46 -136 57 -126 Q46 -122 31 -126Z M29 -126 Q43 -118 47 -108 Q36 -114 29 -121Z" fill="#fff"/>` },
  cape: { back: `<path class="dk-l" d="M-21 -73 Q-42 -66 -47 -19 L-29 -8 L0 -14 L29 -8 L47 -19 Q42 -66 21 -73Z" fill="#ed526f"/><path d="M-33 -20 L-24 -16 M33 -20 L24 -16" fill="none" stroke="#ffe69b" stroke-width="3"/>`, head: `<path class="dk-l" d="M-20 -72 Q0 -64 20 -72 L19 -64 Q0 -58 -19 -64Z" fill="#ed526f"/><path class="dk-l" d="M0 -70 L5 -65 L0 -60 L-5 -65Z" fill="#ffe69b"/>` },
  crown: { head: `<path class="dk-l" d="M-25 -145 L-31 -161 L-15 -155 L0 -172 L15 -155 L31 -161 L25 -145Z" fill="#ffce4f"/><path class="dk-l" d="M0 -161 L4 -157 L0 -153 L-4 -157Z" fill="#875bce"/>` },
  glasses: { face: `<circle class="dk-l" cx="0" cy="-108" r="16" fill="rgba(255,255,255,.2)"/><path class="dk-l" d="M-16 -108 L-31 -111 M16 -108 L31 -111" fill="none"/>` },
  ribbon: { head: `<path class="dk-l" d="M0 -147 C-12 -167 -35 -165 -31 -148 C-28 -140 -11 -141 0 -147Z M0 -147 C12 -167 35 -165 31 -148 C28 -140 11 -141 0 -147Z" fill="#ff5a9c"/><circle class="dk-l" cx="0" cy="-147" r="6" fill="#ff7ab6"/>` },
  headphones: { head: `<path d="M-51 -115 Q-50 -174 0 -178 Q50 -174 51 -115" fill="none" stroke="#5647bc" stroke-width="7" stroke-linecap="round"/><rect class="dk-l" x="-61" y="-127" width="13" height="23" rx="4" fill="#8e82ed"/><rect class="dk-l" x="48" y="-127" width="13" height="23" rx="4" fill="#8e82ed"/>` },
  wizard: { head: `<path class="dk-l" d="M-25 -151 L2 -207 L23 -156Z" fill="#6853c7"/><path d="M-12 -165 L12 -168" fill="none" stroke="#ffe69b" stroke-width="4" stroke-linecap="round"/><path class="dk-l" d="M-43 -151 L39 -158 L44 -147 L-39 -140Z" fill="#4938a3"/><circle cx="2" cy="-188" r="3" fill="#ffe69b"/>` },
};

const el = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};

// Outlines use the class "dk-l" (stroke width from --dkw); expression
// strokes use "dk-f", slightly heavier so faces stay readable when small.
const L = 'class="dk-l"';
const F = 'class="dk-f"';
const EYE = {
  open: () => `<g class="dk-iris"><ellipse rx="10" ry="12" fill="#19234d"/><circle cx="-3" cy="-4" r="3" fill="#fff"/></g>`,
  wide: () => `<g class="dk-iris"><ellipse rx="12" ry="14" fill="#19234d"/><circle cx="-4" cy="-5" r="3.5" fill="#fff"/></g>`,
  happy: () => `<path d="M-9 3 Q0 -10 9 3" fill="none" ${F}/>`,
  closed: () => `<path d="M-9 -1 Q0 7 9 -1" fill="none" ${F}/>`,
  x: () => `<path d="M-7 -7 L7 7 M7 -7 L-7 7" fill="none" ${F}/>`,
  swirl: () => `<path d="M0 0 m0 -1.3 a1.3 1.3 0 1 1 -1.3 1.3 a3.4 3.4 0 1 1 3.4 3.4 a5.7 5.7 0 1 1 -5.7 -5.7 a8.3 8.3 0 1 1 8.3 8.3" fill="none" ${L}/>`,
  star: () => `<path d="M0 -12 L3.5 -3.8 L12 -3.6 L5.3 1.9 L7.6 10.3 L0 5.5 L-7.6 10.3 L-5.3 1.9 L-12 -3.6 L-3.5 -3.8Z" fill="#ffd23f" ${L}/>`,
  heart: () => `<path d="M0 9.6 C-14.4 -1.2 -10.8 -13.2 -4.3 -11.4 C-1.9 -10.8 0 -8.4 0 -6.5 C0 -8.4 1.9 -10.8 4.3 -11.4 C10.8 -13.2 14.4 -1.2 0 9.6Z" fill="#ff2d7a" ${L}/>`,
  tight: () => `<path d="M-8 -5 L6 0 L-8 5" fill="none" ${F}/>`,
};
// Brow pose per eye expression: lift (up) and tilt (degrees, inner ends up when > 0).
const BROW = { happy: [1, 0], star: [1.2, 0], heart: [1, 0], wide: [1.6, 0], x: [0.4, 18], swirl: [0.2, 14], tight: [0, -16], closed: [0, 8] };
const MOUTH = {
  smile: `<path d="M-8.1 -1.3 C-4.9 3 4.9 3 8.1 -1.3" fill="none" ${L}/>`,
  cat: `<path d="M-9 -1 Q-4.5 5 0 0 Q4.5 5 9 -1" fill="none" ${L}/>`,
  grin: `<path d="M-10 -3 Q0 -1 10 -3 Q9 12 0 12 Q-9 12 -10 -3Z" fill="#7a1840" ${L}/><path d="M-5 8 Q0 4 5 8 Q3 11.5 0 11.6 Q-3 11.5 -5 8Z" fill="#ff7aa8"/>`,
  o: `<ellipse rx="4.6" ry="5.8" fill="#7a1840" ${L}/>`,
  big: `<ellipse rx="9" ry="11" fill="#7a1840" ${L}/><ellipse cy="5" rx="5.5" ry="4" fill="#ff7aa8"/>`,
  wobble: `<path d="M-10 1 L-6 -3 L-2 2 L2 -3 L6 2 L10 -2" fill="none" ${L}/>`,
  flat: `<path d="M-6 0 L6 0" fill="none" ${L}/>`,
  puff: `<path d="M-3 0 L3 0" fill="none" ${L}/>`,
};

// Star-shaped space explorer; the animation uses feet-at-zero unit space.
export const G = {
  foot: 'M-24 -20 L-9 -20 L-8 -6 Q-8 -1 -13 -1 L-32 -1 Q-37 -1 -36 -6 L-33 -12 Q-30 -16 -24 -16Z',
  footPivot: { x: 18.5, y: -15.8 },
  bodyFill: 'M-22 -80 Q-29 -62 -25 -29 Q-24 -14 -13 -14 L13 -14 Q24 -14 25 -29 Q29 -62 22 -80Z',
  bodyLine: 'M-22 -80 Q-29 -62 -25 -29 Q-24 -14 -13 -14 L13 -14 Q24 -14 25 -29 Q29 -62 22 -80Z',
  belly: { cy: -42, rx: 8, ry: 8 },
  headFill: 'M0 -158 L14 -128 L51 -126 L25 -103 L34 -68 L0 -85 L-34 -68 L-25 -103 L-51 -126 L-14 -128Z',
  headLine: 'M0 -158 L14 -128 L51 -126 L25 -103 L34 -68 L0 -85 L-34 -68 L-25 -103 L-51 -126 L-14 -128Z',
  face: '',
  head: { cy: -108, r: 52 },
  neckY: -75,
  ear: { x: 72, cy: -110, rx: 8, ry: 7, irx: 3, iry: 3, pivot: 45 },
  eye: { x: 0, y: -108 },
  brow: { x: 0, y: -124, rx: 4, ry: 1.8 },
  mouthY: -90,
  cheek: { x: 24, y: -94, rx: 4, ry: 2.5 },
  shoulder: { x: 23, y: -54 },
  rest: { x: 37, y: -35 },
  arm: 4.6,
  hand: 9.7,
};

// Outline width in unit space: thin like the drawing, with a pixel floor.
const lineFor = (S) => clamp(1.7 / S, 1.4, 3.2);

// Static parts shared by the live actor and the sprite image.
const earSVG = (p, s) => `<g transform="scale(${s} 1)"><path ${L} d="M43 -113 Q61 -111 69 -101" fill="none"/><path ${L} d="M72 -108 L75 -103 L80 -101 L75 -99 L72 -94 L69 -99 L64 -101 L69 -103Z" fill="${p.inner}"/></g>`;
const footSVG = (p, s) => `<path ${L} d="${G.foot}" fill="${p.leg}"${s > 0 ? ' transform="scale(-1 1)"' : ''}/>`;
const bodySVG = (p) => `<path ${L} d="${G.bodyFill}" fill="${p.leg}"/><path d="M0 -54 L3 -47 L10 -45 L4 -40 L5 -33 L0 -36 L-5 -33 L-4 -40 L-10 -45 L-3 -47Z" fill="${p.inner}"/>`;
const headSVG = (p) => `<path ${L} d="${G.headFill}" fill="${p.body}"/>`;
const STYLE = `.dk-l,.dk-f,.dk-t{stroke:${INK};stroke-linecap:round;stroke-linejoin:round}.dk-l{stroke-width:var(--dkw)}.dk-f{stroke-width:calc(var(--dkw) * 1.5)}.dk-t{stroke-width:calc(var(--dkw) * 0.55)}`;
const RAINBOW = '<linearGradient id="dk-rainbow" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff81ad"/><stop offset=".33" stop-color="#ffcf53"/><stop offset=".66" stop-color="#6bdbb6"/><stop offset="1" stop-color="#7abaff"/></linearGradient>';

let uid = 0;

export class Dopakichi {
  constructor(layer, { scale = 0.7, palette = 'pink', front } = {}) {
    this.layer = layer;
    this.S = scale;
    this.lw = lineFor(scale);
    this.pal = PALETTES[palette] || PALETTES.pink;
    this.id = uid++;
    this.x = 0; this.y = 0;
    this.home = { x: 0, y: 0 };
    this.ground = null;
    this.rot = 0;
    this.lift = 0;
    this.sq = new Spring(1, 260, 11);
    this.lean = new Spring(0, 120, 12);
    this.tilt = new Spring(0, 160, 10);
    this.earL = new Spring(0, 180, 7);
    this.earR = new Spring(0, 180, 7);
    this.stretchX = 1; this.stretchY = 1;
    this.look = { x: 0, y: 0 }; this.lookTarget = { x: 0, y: 0 };
    this.eyes = null; this.mouth = null;
    this.baseEyes = 'open'; this.baseMouth = 'smile';
    this.blinkAt = performance.now() + 1800; this.blinkK = 0;
    this.browLift = new Spring(0, 220, 14);
    this.browTilt = new Spring(0, 220, 14);
    this.cheekPuff = 0;
    this.visible = true;
    this.opacity = 1;
    this.bob = 0;
    this.shake = 0;
    this.hands = [this.makeHand(-1), this.makeHand(1)];
    this.token = 0;
    this.busy = false;
    this.build(front);
  }

  makeHand(side) { return { side, mode: 'rest', x: 0, y: 0, job: 0, carry: null, raise: 0 }; }

  build(front) {
    const p = this.pal;
    this.front = front;
    this.root = el('g', { class: 'dk' }, this.layer);
    this.root.style.setProperty('--dkw', this.lw);
    this.shadow = el('ellipse', { rx: 40, ry: 7, fill: INK, opacity: 0.14 }, this.root);
    this.bodyG = el('g', {}, this.root);
    this.backG = el('g', {}, this.bodyG);
    this.feet = [-1, 1].map((s) => { const g = el('g', {}, this.bodyG); g.innerHTML = footSVG(p, s); return g; });
    el('g', {}, this.bodyG).innerHTML = bodySVG(p);
    this.headG = el('g', {}, this.bodyG);
    this.earGs = [-1, 1].map((s) => { const g = el('g', {}, this.headG); g.innerHTML = earSVG(p, s); return { g, s }; });
    el('g', {}, this.headG).innerHTML = headSVG(p);
    this.face = el('g', {}, this.headG);
    this.cheeks = [-1, 1].map((s) => el('ellipse', { cx: s * G.cheek.x, cy: G.cheek.y, rx: G.cheek.rx, ry: G.cheek.ry, fill: p.cheek }, this.face));
    this.brows = [el('ellipse', { class: 'dk-l', rx: G.brow.rx, ry: G.brow.ry, fill: INK }, this.face)];
    this.eyeGs = [el('g', {}, this.face)];
    this.irises = [];
    this.mouthG = el('g', { transform: `translate(0 ${G.mouthY})` }, this.face);
    this.sweat = el('path', { d: 'M0 -12 Q6 -2 0 2 Q-6 -2 0 -12Z', fill: '#8fd3ff', class: 'dk-l', opacity: 0 }, this.face);
    this.faceWear = el('g', {}, this.headG);
    this.headWear = el('g', {}, this.headG);
    this.armsFront = el('g', { class: 'dk-arms' }, front || this.root);
    // A gradient body colour cannot paint a thin stroke well; arms use a flat colour.
    const armCol = p.flat || p.body;
    this.arms = this.hands.map(() => ({
      out: el('path', { fill: 'none', stroke: INK, 'stroke-linecap': 'round' }, this.armsFront),
      inn: el('path', { fill: 'none', stroke: armCol, 'stroke-linecap': 'round' }, this.armsFront),
      hand: el('circle', { fill: armCol, stroke: INK }, this.armsFront),
      digit: el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'dk-digit' }, this.armsFront),
    }));
    const svg = this.layer.ownerSVGElement || this.layer;
    if (!document.getElementById('dk-style')) el('style', { id: 'dk-style' }, svg).textContent = STYLE;
    if (!document.getElementById('dk-rainbow')) {
      const defs = el('defs', {}, svg);
      defs.innerHTML = RAINBOW;
    }
    this.eyes = null; this.mouth = null;
    this.setFace(this.baseEyes || 'open', this.baseMouth || 'smile', true);
    this.setCostume(this.costume || null);
  }

  // Unlockable look (id041, id044): recolour by rebuilding; costumes are layered.
  setPalette(name) {
    const pal = PALETTES[name] || PALETTES.pink;
    if (pal === this.pal) return;
    this.pal = pal;
    const vis = this.visible;
    this.root.remove(); this.armsFront.remove();
    this.build(this.front);
    this.visible = vis;
  }
  setCostume(id) {
    this.costume = id && COSTUMES[id] ? id : null;
    const c = this.costume ? COSTUMES[this.costume] : {};
    this.headWear.innerHTML = c.head || '';
    this.faceWear.innerHTML = c.face || '';
    this.backG.innerHTML = c.back || '';
  }

  setFace(eyes, mouth, base = false) {
    if (eyes && eyes !== this.eyes) {
      this.eyes = eyes;
      this.eyeGs.forEach((g) => {
        const kind = eyes === 'wink' ? 'happy' : eyes;
        g.innerHTML = EYE[kind](this.pal);
      });
      this.irises = this.eyeGs.map((g) => g.querySelector('.dk-iris'));
      const [lift, tilt] = BROW[eyes === 'wink' ? 'happy' : eyes] || [0, 0];
      this.browLift.target = lift; this.browTilt.target = tilt;
    }
    if (mouth && mouth !== this.mouth) { this.mouth = mouth; this.mouthG.innerHTML = MOUTH[mouth]; }
    if (base) { this.baseEyes = eyes || this.baseEyes; this.baseMouth = mouth || this.baseMouth; }
  }
  resetFace() { this.setFace(this.baseEyes, this.baseMouth); this.cheekPuff = 0; this.sweat.setAttribute('opacity', 0); }

  // Local (unit) coordinates -> screen.
  toScreen(lx, ly) {
    const S = this.S;
    const sy = this.sq.value * this.stretchY;
    const sx = this.stretchX / Math.sqrt(Math.max(0.2, this.sq.value));
    const pc = 60 * S;
    const px = lx * S * sx; const py = ly * S * sy + pc;
    const a = ((this.rot + this.lean.value) * Math.PI) / 180;
    const c = Math.cos(a); const s = Math.sin(a);
    return { x: this.x + px * c - py * s, y: this.y - this.lift + px * s + py * c - pc };
  }
  shoulder(side) { return this.toScreen(side * G.shoulder.x, G.shoulder.y); }
  // Raised hands go up past the ears, clear of the face.
  restHand(side, h) { return this.toScreen(side * (G.rest.x + h.raise * 34), G.rest.y - h.raise * 120); }
  get headCenter() { return this.toScreen(0, G.head.cy); }

  place(x, y) { this.x = x; this.y = y; this.home = { x, y }; this.ground = y; }

  update(dt, t, ctx = {}) {
    this.sq.step(dt); this.lean.step(dt); this.tilt.step(dt); this.earL.step(dt); this.earR.step(dt);
    this.browLift.step(dt); this.browTilt.step(dt);
    this.look.x = lerp(this.look.x, this.lookTarget.x, Math.min(1, dt * 10));
    this.look.y = lerp(this.look.y, this.lookTarget.y, Math.min(1, dt * 10));
    // blink
    if (t > this.blinkAt) { this.blinkK = 1; this.blinkAt = t + rand(1800, 4200); }
    this.blinkK = Math.max(0, this.blinkK - dt * 7);
    const blink = this.eyes === 'open' ? 1 - Math.sin(this.blinkK * Math.PI) * 0.92 : 1;

    const breath = Math.sin(t / 520 + this.id) * 0.018;
    const beat = ctx.beat || 0;
    const sy = (this.sq.value + breath + this.bob * beat * 0.06) * this.stretchY;
    const sx = this.stretchX / Math.sqrt(Math.max(0.2, this.sq.value + breath));
    const S = this.S;
    const pc = 60 * S;
    const shakeX = this.shake ? Math.sin(t / 22) * this.shake : 0;
    const bx = this.x + shakeX; const by = this.y - this.lift;
    const rot = this.rot + this.lean.value;
    this.root.setAttribute('opacity', this.opacity);
    // Arms live in a separate front layer, so hide them together with the body.
    this.root.style.display = this.visible ? '' : 'none';
    this.armsFront.style.display = this.visible ? '' : 'none';
    this.armsFront.setAttribute('opacity', this.opacity);
    this.bodyG.setAttribute('transform', `translate(${bx} ${by - pc}) rotate(${rot}) translate(0 ${pc}) scale(${S * sx} ${S * sy})`);
    const gy = this.ground ?? this.y;
    const hk = clamp(1 - (gy - by) / 400, 0.2, 1);
    this.shadow.setAttribute('transform', `translate(${bx} ${gy + 2}) scale(${S * hk * sx} ${S * hk})`);
    this.headG.setAttribute('transform', `rotate(${this.tilt.value} 0 ${G.neckY})`);
    this.earGs.forEach(({ g, s }) => {
      const a = (s < 0 ? -this.earL.value : this.earR.value);
      g.setAttribute('transform', `rotate(${a} ${s * G.ear.pivot} ${G.ear.cy})`);
    });
    const lx = this.look.x * 1.6; const ly = this.look.y * 1.4;
    this.eyeGs.forEach((g, i) => {
      const s = i ? 1 : -1;
      g.setAttribute('transform', `translate(${s * G.eye.x + lx} ${G.eye.y + ly}) scale(1 ${blink})`);
    });
    // The eye and its highlight follow the look target together.
    this.irises.forEach((ir) => { if (ir) ir.setAttribute('transform', `translate(${this.look.x * 2.2} ${this.look.y * 2})`); });
    this.brows.forEach((b, i) => {
      const s = i ? 1 : -1;
      b.setAttribute('transform', `translate(${s * G.brow.x + lx} ${G.brow.y + ly - this.browLift.value * 4}) rotate(${-s * this.browTilt.value})`);
    });
    this.mouthG.setAttribute('transform', `translate(${lx * 0.6} ${G.mouthY + ly * 0.5})`);
    this.cheeks.forEach((c, i) => {
      const k = 1 + this.cheekPuff * 0.7;
      c.setAttribute('rx', G.cheek.rx * k); c.setAttribute('ry', G.cheek.ry * k);
      c.setAttribute('cx', (i ? 1 : -1) * (G.cheek.x + this.cheekPuff * 3) + lx * 0.4);
    });
    this.feet.forEach((f, i) => {
      const s = i ? 1 : -1;
      const kick = this.lift > 4 ? Math.sin(t / 60 + i * 2) * 4 : 0;
      f.setAttribute('transform', `translate(0 ${kick}) rotate(${this.lift > 4 ? s * 14 : 0} ${s * G.footPivot.x} ${G.footPivot.y})`);
    });

    // arms
    const lpx = this.lw * S;
    this.hands.forEach((h, i) => {
      const sh = this.shoulder(h.side);
      if (h.mode === 'rest') {
        const r = this.restHand(h.side, h);
        const sway = Math.sin(t / 400 + i * 1.3) * 1.5 * S;
        h.x = r.x + sway; h.y = r.y;
      }
      const a = this.arms[i];
      const dx = h.x - sh.x; const dy = h.y - sh.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len; const ny = dx / len;
      const bend = h.mode === 'rest' ? 0 : h.side * Math.min(60, len * 0.22);
      // Resting arms hang down in a short curve, like the drawing.
      const droop = h.mode === 'rest' ? len * 0.35 : Math.min(40, len * 0.08);
      const c = { x: (sh.x + h.x) / 2 + nx * bend, y: (sh.y + h.y) / 2 + ny * bend + droop };
      const d = `M${sh.x} ${sh.y} Q${c.x} ${c.y} ${h.x} ${h.y}`;
      const w = Math.max(3, G.arm * S * Math.min(1, Math.sqrt(40 * S / len)));
      a.out.setAttribute('d', d); a.out.setAttribute('stroke-width', w + 2 * lpx);
      a.inn.setAttribute('d', d); a.inn.setAttribute('stroke-width', w);
      a.hand.setAttribute('cx', h.x); a.hand.setAttribute('cy', h.y);
      a.hand.setAttribute('r', G.hand * S); a.hand.setAttribute('stroke-width', lpx);
      if (h.carry != null) {
        a.digit.textContent = h.carry;
        a.digit.setAttribute('x', h.x); a.digit.setAttribute('y', h.y - 20 * S - 10);
        a.digit.setAttribute('font-size', Math.max(26, 40 * S));
        a.digit.style.display = '';
      } else a.digit.style.display = 'none';
    });
  }

  lookAt(pt) {
    if (!pt) { this.lookTarget = { x: 0, y: 0 }; return; }
    const hc = this.headCenter;
    const dx = pt.x - hc.x; const dy = pt.y - hc.y;
    const d = Math.hypot(dx, dy) || 1;
    this.lookTarget = { x: dx / d, y: dy / d };
  }

  // ---------------------------------------------------------------- hands
  freeHand(pt) {
    const h = this.hands.slice().sort((a, b) => (a.job ? 1 : 0) - (b.job ? 1 : 0) || Math.abs((pt.x - this.x) - a.side * 60) - Math.abs((pt.x - this.x) - b.side * 60))[0];
    return h;
  }

  // Grab a digit from a key and put it into a cell.
  async carry(from, to, digit, { E = 0, onGrab, onPlace } = {}) {
    const h = this.freeHand(from);
    if (h.job && h.cancel) h.cancel();
    const job = ++uid;
    let placed = false;
    const finish = () => { if (!placed) { placed = true; h.carry = null; onPlace && onPlace(); } };
    h.job = job; h.cancel = finish;
    const alive = () => h.job === job;
    h.mode = 'free';
    const s0 = { x: h.x, y: h.y };
    this.lookAt(from);
    this.lean.target = clamp((from.x - this.x) / 20, -12, 12);
    const reach = 80 + 40 * (1 - E);
    await tween(reach, (k) => { h.x = lerp(s0.x, from.x, k); h.y = lerp(s0.y, from.y, k); }, easeOutQuad);
    if (!alive()) return;
    h.carry = digit; onGrab && onGrab();
    this.lookAt(to);
    const c = { x: (from.x + to.x) / 2 + (this.x - (from.x + to.x) / 2) * 0.2, y: Math.min(from.y, to.y) - 60 - 40 * E };
    await tween(150 + 40 * (1 - E), (k) => { const q = quadPoint(from, c, to, k); if (alive()) { h.x = q.x; h.y = q.y; } }, easeInOutCubic);
    if (!alive()) return;
    finish();
    const r = this.restHand(h.side, h);
    const p0 = { x: h.x, y: h.y };
    await tween(150, (k) => { if (alive()) { const rr = this.restHand(h.side, h); h.x = lerp(p0.x, rr.x, k); h.y = lerp(p0.y, rr.y, k); } }, easeOutCubic);
    if (alive()) { h.mode = 'rest'; h.job = 0; h.cancel = null; this.lean.target = 0; }
    void r;
  }

  // Swipe a wrong digit away (Backspace).
  async swipe(pt) {
    const h = this.freeHand(pt);
    if (h.job && h.cancel) h.cancel();
    const job = ++uid; h.job = job; h.mode = 'free';
    const alive = () => h.job === job;
    const s0 = { x: h.x, y: h.y };
    await tween(90, (k) => { h.x = lerp(s0.x, pt.x - 30, k); h.y = lerp(s0.y, pt.y, k); });
    await tween(120, (k) => { if (alive()) { h.x = pt.x - 30 + 60 * k; h.y = pt.y - Math.sin(k * Math.PI) * 10; } });
    const p0 = { x: h.x, y: h.y };
    await tween(140, (k) => { if (alive()) { const r = this.restHand(h.side, h); h.x = lerp(p0.x, r.x, k); h.y = lerp(p0.y, r.y, k); } });
    if (alive()) { h.mode = 'rest'; h.job = 0; }
  }

  // ---------------------------------------------------------------- body actions
  begin() { this.token += 1; const tk = this.token; return () => tk === this.token; }

  async hop(height = 30, dur = 360, { spin = 0, flip = 0, to = null, audio } = {}) {
    const ok = this.begin();
    this.sq.value = 0.82; this.sq.velocity = 0;
    await wait(55);
    if (!ok()) return false;
    audio && audio.jump(height / 120);
    this.sq.value = 1.18;
    const x0 = this.x; const y0 = this.y; const tx = to ? to.x : x0; const ty = to ? to.y : y0;
    const r0 = this.rot;
    await tween(dur, (k) => {
      if (!ok()) return;
      this.x = lerp(x0, tx, k); this.y = lerp(y0, ty, k);
      this.lift = Math.sin(k * Math.PI) * height;
      this.rot = r0 + spin * easeInOutCubic(k) + flip * k;
    }, (k) => k);
    if (!ok()) return false;
    this.lift = 0; this.rot = 0;
    this.sq.value = 0.72; this.sq.velocity = 2;
    this.earL.kick(-420); this.earR.kick(-420);
    audio && audio.land();
    return true;
  }

  async clap(times = 3, audio) {
    const ok = this.begin();
    const tk = this.token;
    const hs = this.hands;
    hs.forEach((h) => { h.mode = 'free'; h.clapToken = tk; });
    try {
      for (let i = 0; i < times && ok(); i++) {
        const c = this.toScreen(0, -178);
        const o = [this.toScreen(-80, -164), this.toScreen(80, -164)];
        await tween(70, (k) => hs.forEach((h, j) => { if (ok() && !h.job) { h.x = lerp(o[j].x, c.x + (j ? 8 : -8), k); h.y = lerp(o[j].y, c.y, k); } }), easeInQuad);
        if (!ok()) return;
        audio && audio.clapHands();
        if (this.S < 1.5) this.sq.kick(-1.2);
        await tween(90, (k) => hs.forEach((h, j) => { if (ok() && !h.job) { h.x = lerp(c.x + (j ? 8 : -8), o[j].x, k); h.y = lerp(c.y, o[j].y, k); } }), easeOutQuad);
      }
    } finally {
      // Release the hands even when another action interrupted the clap;
      // otherwise they stay 'free' and the arms keep pointing at stale spots.
      // Hands claimed by a later clap or busy with a job are left alone.
      hs.forEach((h) => { if (h.clapToken === tk) { h.clapToken = 0; if (!h.job) h.mode = 'rest'; } });
    }
  }

  async celebrate(E, { big = false, audio, variant } = {}) {
    const moves = big
      ? ['backflip', 'spinjump', 'starjump', 'clapjump', 'twirl']
      : ['hop', 'hop', 'earflap', 'clapjump', 'twirl'];
    const move = variant || pick(moves.slice(0, Math.max(2, Math.ceil(moves.length * (0.35 + E)))));
    this.setFace(pick(['happy', 'happy', 'star', 'wink']), pick(['grin', 'big', 'cat']));
    this.earL.kick(600); this.earR.kick(600);
    const hMul = 0.6 + E * 1.6;
    if (move === 'hop') await this.hop(22 * hMul, 300, { audio });
    else if (move === 'earflap') { for (let i = 0; i < 3; i++) { this.earL.kick(900); this.earR.kick(-900); this.tilt.kick(i % 2 ? 200 : -200); await wait(110); } }
    else if (move === 'clapjump') { this.hands.forEach((h) => { h.raise = 1; }); this.hop(30 * hMul, 380, { audio }); await this.clap(2 + Math.round(E * 2), audio); this.hands.forEach((h) => { h.raise = 0; }); }
    else if (move === 'twirl') await this.hop(26 * hMul, 460, { spin: 360, audio });
    else if (move === 'backflip') await this.hop(70 * hMul, 620, { flip: -360, audio });
    else if (move === 'spinjump') await this.hop(60 * hMul, 560, { spin: 720, audio });
    else if (move === 'starjump') {
      this.hands.forEach((h) => { h.raise = 1; });
      this.stretchX = 1.2;
      await this.hop(50 * hMul, 520, { audio });
      this.stretchX = 1;
      this.hands.forEach((h) => { h.raise = 0; });
    }
    await wait(250);
    this.resetFace();
  }

  // Comic, non-punishing reactions to a wrong digit. Gentle ones are used
  // early; bigger slapstick unlocks as the show intensifies. The same
  // reaction is not repeated twice in a row.
  async hurt(E, from, { audio, variant } = {}) {
    const ok = this.begin();
    const pool = ['squash', 'boing', 'deflate', 'earspin'];
    if (E >= 0.3) pool.push('pancake', 'dizzy', 'flop', 'roll');
    if (E >= 0.6) pool.push('knockoff', 'headbutt');
    const choices = pool.filter((v) => v !== this.lastHurt);
    const move = variant || pick(choices);
    this.lastHurt = move;
    this.setFace(pick(['x', 'swirl']), pick(['wobble', 'o']));
    this.earL.kick(-1200); this.earR.kick(-1100);
    const dir = from && from.x > this.x ? -1 : 1;
    const x0 = this.x; const y0 = this.y;
    const restore = () => { this.stretchX = 1; this.stretchY = 1; this.rot = 0; this.lift = 0; this.shake = 0; };
    if (move === 'squash') {
      this.sq.value = 0.6; this.sq.velocity = 0;
      this.tilt.kick(dir * 500);
      await wait(420);
    } else if (move === 'boing') {
      // Springy accordion: squashes and bounces up and down.
      for (let i = 0; i < 3 && ok(); i++) {
        await tween(90, (k) => { if (ok()) this.stretchY = lerp(1, 0.55, k); }, easeOutQuad);
        audio && audio.jump(0.3 + i * 0.1);
        await tween(140, (k) => { if (ok()) { this.stretchY = lerp(0.55, 1.35 - i * 0.1, k); this.lift = Math.sin(k * Math.PI) * (30 - i * 8); } }, easeOutQuad);
      }
      this.lift = 0;
      await tween(160, (k) => { if (ok()) this.stretchY = lerp(1.15, 1, k); }, easeOutBack);
    } else if (move === 'deflate') {
      // Shrinks like a balloon losing air, then pops back.
      await tween(360, (k) => { if (ok()) { this.stretchX = lerp(1, 0.55, k); this.stretchY = lerp(1, 0.5, k); this.shake = 2 * (1 - k); } }, easeOutQuad);
      this.shake = 0;
      await wait(160);
      audio && audio.jump(0.8);
      await tween(280, (k) => { if (ok()) { this.stretchX = lerp(0.55, 1, k); this.stretchY = lerp(0.5, 1, k); } }, easeOutBack);
    } else if (move === 'earspin') {
      // Ears whirl like propellers and lift the body a little.
      for (let i = 0; i < 8 && ok(); i++) { this.earL.kick(1400); this.earR.kick(-1400); this.tilt.kick(i % 2 ? 260 : -260); this.lift = Math.sin((i / 8) * Math.PI) * 26; await wait(60); }
      this.lift = 0;
      this.sq.value = 0.75;
    } else if (move === 'pancake') {
      await tween(90, (k) => { if (ok()) { this.stretchY = lerp(1, 0.32, k); this.stretchX = lerp(1, 1.7, k); } });
      this.shake = 3;
      await wait(380);
      this.shake = 0;
      await tween(260, (k) => { if (ok()) { this.stretchY = lerp(0.32, 1, k); this.stretchX = lerp(1.7, 1, k); } }, easeOutBack);
    } else if (move === 'dizzy') {
      // Plops down, head wobbles in circles, then hops back up.
      this.setFace('swirl', 'wobble');
      await tween(140, (k) => { if (ok()) { this.stretchY = lerp(1, 0.7, k); this.stretchX = lerp(1, 1.18, k); } }, easeOutQuad);
      await tween(640, (k) => { if (ok()) { this.tilt.target = Math.sin(k * Math.PI * 4) * 14; this.lean.target = Math.cos(k * Math.PI * 4) * 6; } });
      this.tilt.target = 0; this.lean.target = 0;
      await tween(200, (k) => { if (ok()) { this.stretchY = lerp(0.7, 1, k); this.stretchX = lerp(1.18, 1, k); } }, easeOutBack);
    } else if (move === 'flop') {
      // Falls over backwards, legs kick in the air, springs upright.
      await tween(180, (k) => { if (ok()) { this.rot = dir * -90 * k; this.lift = Math.sin(k * Math.PI) * 18; } }, easeOutQuad);
      audio && audio.land();
      await tween(420, (k) => { if (ok()) this.rot = dir * (-90 + Math.sin(k * Math.PI * 5) * 6); });
      audio && audio.jump(0.6);
      await tween(240, (k) => { if (ok()) { this.rot = dir * -90 * (1 - k); this.lift = Math.sin(k * Math.PI) * 30; } }, easeOutBack);
    } else if (move === 'roll') {
      // Rolls away like a ball and rolls back.
      await tween(360, (k) => { if (ok()) { this.x = x0 + dir * 90 * k; this.rot = dir * 360 * k; this.stretchY = 0.85; } }, easeOutQuad);
      await tween(360, (k) => { if (ok()) { this.x = x0 + dir * 90 * (1 - k); this.rot = dir * 360 * (1 - k); } }, easeInOutCubic);
      this.x = x0;
    } else if (move === 'headbutt') {
      // Bops the wrong digit away with the head.
      await tween(110, (k) => { if (ok()) { this.lean.target = -dir * 18 * k; this.lift = k * 20; } });
      audio && audio.jump(1);
      this.sq.value = 1.25;
      await tween(180, (k) => { if (ok()) { this.lean.target = -dir * 18 * (1 - k); this.lift = 20 + Math.sin(k * Math.PI) * 40; } }, easeOutQuad);
      await tween(160, (k) => { if (ok()) this.lift = 20 * (1 - k); }, easeInQuad);
      this.lean.target = 0;
      this.sq.value = 0.7;
      audio && audio.land();
    } else {
      // Knocked off-stage, spins, and bounces back.
      audio && audio.jump(1.5);
      await tween(420, (k) => { if (ok()) { this.x = x0 + dir * 170 * k; this.lift = Math.sin(k * Math.PI) * 140; this.rot = dir * 540 * k; } }, (k) => k);
      this.rot = 0;
      await tween(360, (k) => { if (ok()) { this.x = lerp(x0 + dir * 170, x0, k); this.lift = Math.sin(k * Math.PI) * 60; } }, easeOutQuad);
      this.x = x0; this.y = y0;
      this.sq.value = 0.55;
      audio && audio.land();
    }
    restore();
    if (!ok()) return;
    // Shake it off.
    this.setFace('closed', 'flat');
    for (let i = 0; i < 4; i++) { this.tilt.kick(i % 2 ? 700 : -700); this.earL.kick(500); this.earR.kick(-500); await wait(70); }
    this.resetFace();
    this.setFace('open', 'smile');
  }

  // Point at a place on screen with one stretched arm (hint gesture).
  async point(pt, hold = 900, { staticPose = false } = {}) {
    const h = this.freeHand(pt);
    if (h.job && h.cancel) h.cancel();
    const job = ++uid; h.job = job; h.mode = 'free';
    const alive = () => h.job === job;
    this.lookAt(pt);
    this.setFace('open', 'o');
    const s0 = { x: h.x, y: h.y };
    const target = { x: lerp(this.x, pt.x, 0.82), y: lerp(this.y - 60 * this.S, pt.y, 0.82) };
    if (staticPose) {
      h.x = target.x; h.y = target.y;
      this.look = { ...this.lookTarget };
      return;
    }
    await tween(220, (k) => { if (alive()) { h.x = lerp(s0.x, target.x, k); h.y = lerp(s0.y, target.y, k); } }, easeOutBack);
    for (let i = 0; i < 3 && alive(); i++) {
      await tween(hold / 6, (k) => { if (alive()) { h.x = target.x + Math.sin(k * Math.PI) * 8; } });
      await tween(hold / 6, () => {});
    }
    const p0 = { x: h.x, y: h.y };
    await tween(200, (k) => { if (alive()) { const r = this.restHand(h.side, h); h.x = lerp(p0.x, r.x, k); h.y = lerp(p0.y, r.y, k); } });
    if (alive()) { h.mode = 'rest'; h.job = 0; this.resetFace(); }
  }

  async reachPose(on) {
    if (on) {
      this.begin();
      this.setFace('wide', 'puff');
      this.cheekPuff = 1;
      this.sweat.setAttribute('opacity', 1);
      this.sweat.setAttribute('transform', 'translate(46 -130)');
      this.shake = 1.4;
      this.hands.forEach((h) => { h.raise = 0.55; });
    } else {
      this.shake = 0;
      this.cheekPuff = 0;
      this.sweat.setAttribute('opacity', 0);
      this.hands.forEach((h) => { h.raise = 0; });
      this.resetFace();
    }
  }

  async leapTo(pt, height = 80, { audio, spin = 0 } = {}) {
    const landed = await this.hop(height, 480, { to: pt, audio, spin });
    if (landed) this.ground = pt.y;
    return landed;
  }

  destroy() { this.root.remove(); this.armsFront.remove(); }
}

// Standalone mascot sprite for canvas particles (cheering pose).
export function dopakichiSprite(palette = 'pink', size = 128) {
  const p = PALETTES[palette] || PALETTES.pink;
  const { eye, cheek, shoulder, brow } = G;
  const armCol = p.flat || p.body;
  const tip = (s) => ({ x: s * 66, y: -150 });
  const arm = (s) => `M${s * shoulder.x} ${shoulder.y} Q${s * 62} ${shoulder.y - 20} ${tip(s).x} ${tip(s).y}`;
  const svg = `<svg xmlns="${NS}" viewBox="-110 -170 220 176" width="${size}" height="${size * 176 / 220}">${p.flat ? `<defs>${RAINBOW}</defs>` : ''}
  <style>svg{--dkw:3.4}${STYLE}</style>
  ${footSVG(p, -1)}${footSVG(p, 1)}${bodySVG(p)}${earSVG(p, -1)}${earSVG(p, 1)}${headSVG(p)}
  ${[-1, 1].map((s) => `<ellipse cx="${s * cheek.x}" cy="${cheek.y}" rx="${cheek.rx}" ry="${cheek.ry}" fill="${p.cheek}"/>`).join('')}
  <ellipse class="dk-l" cx="${brow.x}" cy="${brow.y - 4}" rx="${brow.rx}" ry="${brow.ry}" fill="${INK}"/><g transform="translate(${eye.x} ${eye.y})">${EYE.happy()}</g>
  <g transform="translate(0 ${G.mouthY})">${MOUTH.grin}</g>
  ${[-1, 1].map((s) => `<path d="${arm(s)}" fill="none" stroke="${INK}" stroke-width="${G.arm + 6.8}" stroke-linecap="round"/><path d="${arm(s)}" fill="none" stroke="${armCol}" stroke-width="${G.arm}" stroke-linecap="round"/><circle class="dk-l" cx="${tip(s).x}" cy="${tip(s).y}" r="${G.hand}" fill="${armCol}"/>`).join('')}
  </svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return img;
}

// Static mascot SVG with a colour and costume (collection thumbnails).
export function dopakichiSVG(palette = 'pink', costume = null) {
  const p = PALETTES[palette] || PALETTES.pink;
  const c = (costume && COSTUMES[costume]) || {};
  const { eye, cheek, brow } = G;
  const armCol = p.flat || p.body;
  const rb = p.flat ? `<defs>${RAINBOW}</defs>` : '';
  return `<svg xmlns="${NS}" viewBox="-112 -232 224 240" aria-hidden="true">${rb}<style>svg{--dkw:3.4}${STYLE}</style>
  ${c.back || ''}${footSVG(p, -1)}${footSVG(p, 1)}${bodySVG(p)}${earSVG(p, -1)}${earSVG(p, 1)}${headSVG(p)}
  ${[-1, 1].map((s) => `<ellipse cx="${s * cheek.x}" cy="${cheek.y}" rx="${cheek.rx}" ry="${cheek.ry}" fill="${p.cheek}"/>`).join('')}
  <ellipse class="dk-l" cx="${brow.x}" cy="${brow.y}" rx="${brow.rx}" ry="${brow.ry}" fill="${INK}"/><g transform="translate(${eye.x} ${eye.y})">${EYE.open()}</g>
  <g transform="translate(0 ${G.mouthY})">${MOUTH.smile}</g>
  ${[-1, 1].map((s) => `<circle class="dk-l" cx="${s * G.rest.x}" cy="${G.rest.y}" r="${G.hand}" fill="${armCol}"/>`).join('')}
  ${c.face || ''}${c.head || ''}</svg>`;
}

export function startActors(list, getCtx) {
  return onFrame((dt, t) => { const ctx = getCtx(); for (const a of list) a.update(dt, t, ctx); });
}
