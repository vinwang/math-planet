import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.location = { search: '' };

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attrs = {};
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.innerHTML = '';
  }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  appendChild(child) {
    child.parent = this;
    child.ownerSVGElement = this.tag === 'svg' ? this : this.ownerSVGElement;
    this.children.push(child);
    return child;
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }
  querySelector(selector) {
    return selector === '.dk-iris' && this.innerHTML.includes('dk-iris') ? new Element('g') : null;
  }
}

globalThis.document = {
  createElementNS: (_, tag) => new Element(tag),
  getElementById: () => null,
};
globalThis.Image = class { constructor() { this.src = ''; } };

const { Dopakichi, dopakichiSVG, dopakichiSprite, PALETTES, COSTUMES, G } = await import('../app/js/dopakichi.js');

test('mascot keeps a carried digit and its costume when its palette changes', () => {
  const svg = new Element('svg');
  const layer = svg.appendChild(new Element('g'));
  const front = svg.appendChild(new Element('g'));
  const actor = new Dopakichi(layer, { front, palette: 'pink' });
  actor.place(100, 180);
  actor.setCostume('cape');
  actor.hands[0].mode = 'free';
  actor.hands[0].x = 120;
  actor.hands[0].y = 150;
  actor.hands[0].carry = '5';
  actor.update(0.016, 100, {});
  assert.equal(actor.arms[0].digit.textContent, '5');
  assert.equal(actor.arms[0].digit.style.display, '');
  assert.equal(actor.arms[0].digit.attrs.x, '120');

  actor.setPalette('blue');
  actor.setFace('wink', 'o');
  actor.update(0.016, 116, {});
  assert.equal(actor.pal, PALETTES.blue);
  assert.equal(actor.costume, 'cape');
  assert.equal(actor.arms[0].digit.textContent, '5');
  assert.equal(actor.arms[0].digit.style.display, '');
  assert.ok(actor.backG.innerHTML);
  actor.destroy();
  assert.equal(layer.children.includes(actor.root), false);
  assert.equal(front.children.includes(actor.armsFront), false);
});

test('all mascot palettes render matching static and sprite geometry with resolvable fills', () => {
  for (const [palette, colors] of Object.entries(PALETTES)) {
    const thumbnail = dopakichiSVG(palette);
    const sprite = decodeURIComponent(dopakichiSprite(palette, 96).src.split(',')[1]);
    for (const svg of [thumbnail, sprite]) {
      assert.match(svg, /<svg\b/);
      assert.ok(svg.includes(colors.body), palette);
      assert.ok(svg.includes(`d="${G.headFill}"`), `${palette} uses the actor's star shape`);
      assert.doesNotMatch(svg, /undefined|NaN/, palette);
      if (colors.body.startsWith('url(')) {
        assert.match(svg, /<linearGradient\s+id="dk-rainbow"/, `${palette} defines its own gradient`);
      }
    }
    assert.equal((thumbnail.match(/class="dk-iris"/g) || []).length, 1, `${palette} has one eye`);
    for (const [costume, parts] of Object.entries(COSTUMES)) {
      const dressed = dopakichiSVG(palette, costume);
      for (const part of Object.values(parts)) assert.ok(dressed.includes(part), `${palette} / ${costume}`);
    }
  }
});
