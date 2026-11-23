"use strict";

// Campaign victories provide tickets. Ownership and payment are separate so that bringing
// in an older save keeps its earned companions without charging for them again.
const Roster = (() => {
  const size = 30;
  const poolMask = (2 ** size) - 1;
  const legacyGates = [1, 5, 20, 40, 3, 10, 7];
  const validId = id => Number.isInteger(id) && id >= 0 && id < size;
  const has = (r, id) => validId(id) && (r.owned & (1 << id)) !== 0;
  const ids = r => Array.from({length:size}, (_, i) => i).filter(id => has(r, id));
  const clearCount = n => Number.isInteger(n) && n >= 0 && n <= 80 ? n : 0;

  function freshSeed() {
    const bytes = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else bytes[0] = Math.floor(Math.random() * 0x100000000);
    return bytes[0] || 0xa38bc25d;
  }

  function blank(seed = freshSeed()) {
    return {seed:(seed >>> 0) || 0xa38bc25d, owned:0, paid:0, guide:-1, slots:[], cells:[]};
  }

  function balance(r, frontier) {
    let cost = 0;
    for (let mask = r.paid; mask; mask &= mask - 1) cost++;
    return Math.max(0, clearCount(frontier) - cost);
  }

  function deck(seed) {
    const all = Array.from({length:size}, (_, i) => i);
    let n = seed >>> 0;
    // A fixed Fisher–Yates shuffle for this save; rejection avoids modulo bias.
    // xorshift32 visits all non-zero uint32 values, so use n-1 as the zero-based sample.
    for (let i = all.length - 1; i > 0; i--) {
      const width = i + 1, limit = 0xffffffff - (0xffffffff % width);
      let sample;
      do {
        n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
        sample = (n >>> 0) - 1;
      } while (sample >= limit);
      const j = sample % width;
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  function draw(r, frontier, expectedOwned = r.owned) {
    if (expectedOwned !== r.owned || r.owned === poolMask || !balance(r, frontier)) return null;
    const id = deck(r.seed).find(id => !has(r, id));
    r.owned |= 1 << id;
    r.paid |= 1 << id;
    return id;
  }

  const validCell = pos => Number.isInteger(pos) && pos >= 0 && pos < 9;
  const cell = (r, id) => r.cells[r.slots.indexOf(id)] ?? -1;
  const defaultCells = [4,7,1,3,5,0,2,6,8];

  function remove(r, id) {
    const i = r.slots.indexOf(id);
    if (i < 0) return false;
    r.slots.splice(i, 1);
    r.cells.splice(i, 1);
    return true;
  }

  function setGuide(r, id) {
    if (id !== -1 && (!has(r, id) || id >= 4)) return false;
    r.guide = id;
    remove(r, id);
    return true;
  }

  function setSlots(r, next, cells) {
    if (!Array.isArray(next) || next.length > 3 || new Set(next).size !== next.length ||
        !next.every(id => has(r, id))) return false;
    if (cells === undefined) {
      cells = next.map(id => cell(r, id));
      for (let i=0;i<cells.length;i++) if(cells[i]===-1) cells[i]=defaultCells.find(pos=>!cells.includes(pos));
    }
    if (!Array.isArray(cells) || cells.length !== next.length || !cells.every(validCell) ||
        new Set(cells).size !== cells.length) return false;
    r.slots = next.slice();
    r.cells = cells.slice();
    if (r.slots.includes(r.guide)) r.guide = -1;
    return true;
  }

  function place(r,id,pos) {
    if (!has(r,id) || !validCell(pos)) return false;
    const i=r.slots.indexOf(id), occupied=r.cells.indexOf(pos);
    if (i<0) {
      if(r.slots.length>=3 || occupied>=0) return false;
      return setSlots(r,[...r.slots,id],[...r.cells,pos]);
    }
    if (occupied>=0) r.cells[occupied]=r.cells[i];
    r.cells[i]=pos;
    return true;
  }

  function migrate(frontier, guide, crew) {
    const r = blank();
    const wins = clearCount(frontier);
    legacyGates.forEach((gate, id) => { if (wins >= gate) r.owned |= 1 << id; });
    if (guide === undefined && wins) r.guide = 0;
    else if (Number.isInteger(guide) && guide >= 1 && guide <= 4) setGuide(r, guide - 1);
    if (Array.isArray(crew)) {
      const selected = crew.filter(id => Number.isInteger(id) && id >= 1 && id <= 3)
        .map(id => id + 3).filter(id => has(r, id));
      setSlots(r, [...new Set(selected)].slice(0, 2));
    }
    return r;
  }

  function pack(r) {
    const raw = new Uint8Array(18), view = new DataView(raw.buffer);
    raw[0] = 2;
    view.setUint32(1, r.seed);
    view.setUint32(5, r.owned);
    view.setUint32(9, r.paid);
    raw[13] = r.guide + 1;
    let formation = 0;
    r.slots.forEach((id,i) => {formation |= (1 + id * 9 + r.cells[i]) << (9*i);});
    view.setUint32(14, formation);
    return btoa(String.fromCharCode(...raw));
  }

  function unpack(raw) {
    if (typeof raw !== "string" || !/^(?:[A-Za-z0-9+/]{22}==|[A-Za-z0-9+/]{24})$/.test(raw)) return null;
    const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    const view = new DataView(bytes.buffer), format = bytes[0];
    if ((format!==1 || bytes.length!==16) && (format!==2 || bytes.length!==18)) return null;
    const seed = view.getUint32(1), owned = view.getUint32(5), paid = view.getUint32(9);
    if (!seed || owned > poolMask || (paid & ~owned) !== 0) return null;
    const r = {seed, owned, paid, guide:-1, slots:[], cells:[]};
    if (!setGuide(r, bytes[13]-1)) return null;
    if(format===1) return setSlots(r,[bytes[14],bytes[15]].filter(Boolean).map(id=>id-1))?r:null;
    const selected=[], positions=[];
    let formation=view.getUint32(14);
    while(formation){
      const item=(formation & 511)-1;
      if(item<0 || item>=size*9 || selected.length>=3) return null;
      selected.push(Math.floor(item/9)); positions.push(item%9);
      formation >>>= 9;
    }
    return setSlots(r,selected,positions)?r:null;
  }

  function load(raw, frontier, guide, crew) {
    if (raw === undefined || raw === null) return migrate(frontier, guide, crew);
    return unpack(raw) ?? blank();
  }

  function restore(r, raw, frontier, guide, crew) {
    const legacy = raw === undefined || raw === null;
    const incoming = legacy ? migrate(frontier, guide, crew) : unpack(raw);
    if (!incoming) return false;
    if (!legacy && !r.owned) r.seed = incoming.seed;
    r.owned |= incoming.owned;
    r.paid |= incoming.paid;
    if (!legacy || guide !== undefined) setGuide(r, incoming.guide);
    if (!legacy || Array.isArray(crew)) setSlots(r, incoming.slots, incoming.cells);
    return true;
  }

  return {size, blank, balance, ids, has, draw, setGuide, setSlots, place, remove, cell, pack, load, restore};
})();
