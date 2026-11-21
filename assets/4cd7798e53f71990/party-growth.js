"use strict";
const PartyGrowth = (() => {
  const steps = [1, 6, 19];
  const count = mask => (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1);
  function read(value) {
    if (!Number.isInteger(value) || value < 0 || value > 127) value = 0;
    const marks = value & 7, total = count(marks), attack = (value >> 3) & 3, guard = (value >> 5) & 3;
    if (attack + guard > total) return {marks, total, attack:0, guard:0};
    return {marks, total, attack, guard};
  }
  const pack = ({marks,attack,guard}) => marks | (attack << 3) | (guard << 5);
  function merged(a, b) {
    const first = read(a), second = read(b);
    const chosen = b === null || b === undefined ? first : second;
    return pack({...chosen, marks:first.marks | second.marks});
  }
  function markFor(id) {
    const index = Number.isInteger(id) && id >= 0 && id < 320 ? steps.indexOf(id % 20) : -1;
    return index === -1 ? 0 : 1 << index;
  }
  function shift(value, stat, n) {
    const data = read(value);
    if (!["attack","guard"].includes(stat) || ![1,-1].includes(n) || data[stat]+n<0 || n>0 && data.attack+data.guard>=data.total) return pack(data);
    data[stat] += n;
    return pack(data);
  }
  // A campaign-scoped receipt protects earned marks and the latest assignment from a stale tab.
  const key = () => CampaignSlots.key + ".party-training." + CampaignSlots.id.toString(36);
  function current(base) {
    try {
      const raw = localStorage.getItem(key());
      return merged(base,raw === null ? null : Number(raw));
    } catch { return pack(read(base)); }
  }
  function write(value) {
    localStorage.setItem(key(),String(value));
    saved.growth = value;
  }
  function locked(action) {
    return navigator.locks?.request ? navigator.locks.request(key(), action) : Promise.resolve().then(action);
  }
  async function award(id) {
    const bit = markFor(id);
    if (!bit) return 0;
    return locked(() => {
      const value = current(saved.growth);
      if (value & bit) { saved.growth=value; return 0; }
      write(value | bit);
      return bit;
    });
  }
  async function adjust(stat, n) {
    return locked(() => {
      const value=current(saved.growth), next=shift(value,stat,n);
      if (next===value) return false;
      write(next);
      return true;
    });
  }
  function restore(incoming) {
    if (!Number.isInteger(incoming)||incoming<0||incoming>127) return;
    write(merged(current(saved.growth),incoming));
  }
  const offense = (value,damage) => damage + 2*read(value).attack;
  const block = (value,damage) => Math.max(1,damage-2*read(value).guard);
  return Object.freeze({read,pack,merged,markFor,shift,current,award,adjust,restore,offense,block});
})();
if (typeof module !== "undefined") module.exports=PartyGrowth;
