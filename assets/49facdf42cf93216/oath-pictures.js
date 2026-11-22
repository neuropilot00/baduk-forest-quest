"use strict";

// Every story frame comes from one painted rectangle. The combat caller relinquishes
// its canvas before drawing again, including when an old illustration is still loading.
const OathPictures = (() => {
  const arrivals = "./riverbanks-before.webp";
  const restored = "./riverbanks-restored.webp";
  const endings = "./oath-endings.jpg";
  const highlands = "./district-panoramas.webp";
  const waterways = "./tail-waterways.webp";
  const images = new Map();
  const requests = new WeakMap();
  const limit = (v, low, high) => Math.max(low, Math.min(high, v));

  function picture(path) {
    if (images.has(path)) return images.get(path);
    const image = new Image();
    const ready = new Promise(resolve => {
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
    });
    const record = {image, ready};
    images.set(path, record);
    image.src = path;
    return record;
  }

  function release(canvas) {
    requests.delete(canvas);
    delete canvas.dataset.oathPicture;
    delete canvas.dataset.bankIllustration;
  }

  function present(canvas, spec) {
    const {image, ready} = picture(spec.path);
    const host = canvas.closest("dialog");
    const prior = requests.get(canvas);
    if (!prior || prior.key !== spec.key) {
      release(canvas);
      const ticket = {key: spec.key};
      requests.set(canvas, ticket);
      if (!image.naturalWidth) ready.then(ok => {
        if (ok && host?.open && requests.get(canvas) === ticket) present(canvas, spec);
      });
    }
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.65, 1600 / box.width, 1700 / box.height);
    const w = Math.max(1, Math.round(box.width * ratio));
    const h = Math.max(1, Math.round(box.height * ratio));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const c = canvas.getContext("2d");
    c.fillStyle = spec.matte;
    c.fillRect(0, 0, w, h);
    if (!image.naturalWidth) return;

    const panel = spec.copy && host.querySelector(spec.copy);
    const copyBox = panel && panel.getBoundingClientRect();
    const side = copyBox && box.width >= 740 && box.width / box.height >= 1.25;
    const aw = side ? limit((copyBox.left - box.left + 5) * ratio, w * .4, w) : w;
    const ah = !side && copyBox ? limit((copyBox.top - box.top + 22) * ratio, h * .30, h) : h;
    const sw = image.naturalWidth / spec.cols;
    const sh = image.naturalHeight / spec.rows;
    // Use the available space without cutting a bell off its beam or the letters
    // out of the recipient's hands. Matte space absorbs extreme phone ratios.
    const square = spec.copy && !side;
    const dh = square ? Math.min(ah, aw * (spec.portraitRatio || 1.28)) : ah;
    const dw = side ? Math.min(aw, dh * 1.46) : aw;
    const dx = (aw - dw) / 2;
    const dy = (ah - dh) * .52;
    const scale = Math.max(dw / (sw - 2), dh / (sh - 2)) * (spec.zoom || 1);
    const cw = dw / scale, ch = dh / scale;
    const sx = (spec.cell % spec.cols) * sw + 1 + Math.max(0, sw - 2 - cw) * spec.x;
    const sy = Math.floor(spec.cell / spec.cols) * sh + 1 + Math.max(0, sh - 2 - ch) * spec.y;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    c.drawImage(image, sx, sy, cw, ch, dx, dy, dw, dh);
    canvas.dataset.oathPicture = spec.key;
    if (spec.bank) canvas.dataset.bankIllustration = spec.bank;
  }

  function fork(canvas, route, won) {
    const bank = (route === 1 ? "bridge" : "sluice") + (won ? "-restored" : "-arrival");
    present(canvas, {path: won ? restored : arrivals, cols: 2, rows: 1, cell: route - 1,
      key: bank, bank, copy: "#forkWords", x: route === 1 ? .46 : .56, y: .43, matte: "#23372e"});
  }

  function ending(canvas, route, page, savedSignal) {
    // A prospective selection must never expose a final panel. Only FinalPost's
    // committed receipt reaches savedSignal, including on reload and reread.
    const row = savedSignal === 1 ? 2 : savedSignal === 2 ? 3 : page >= 3 ? 1 : 0;
    const bank = route === 1 ? "west" : "east";
    const key = bank + "-" + ["waiting", "flags", "hanging-bell", "door-knockers"][row];
    const center = [[.53, .60], [.47, .49], [.66, .55], [.57, .53]];
    present(canvas, {path: endings, cols: 2, rows: 4, cell: row * 2 + Number(route !== 1),
      key, copy: "article > section", x: center[row][Number(route !== 1)], y: .48,
      // Both flags sit near opposite edges of this one painting.
      portraitRatio: row === 1 ? 1 : 1.28,
      matte: row === 0 ? "#182e34" : "#35372e"});
  }

  // Each marked settlement has its own painting. Its side of the river, gate,
  // pier or windbreak is framed according to the party's permanent route.
  const banks = [[.20,.82],[.36,.88],[.16,.72],[.23,.90],[.15,.71],[.34,.83],
    [.28,.79],[.17,.76],[.29,.82],[.24,.78],[.18,.81]];
  function crossing(canvas, region, route) {
    const early = region < 3;
    present(canvas, {path: early ? highlands : waterways, cols: 2, rows: early ? 3 : 4,
      cell: early ? 3 + region : region - 3, key: "crossing-" + region + "-" + route,
      x: banks[region][route - 1], y: .58, zoom: 1.10, matte: "#243633"});
  }
  return Object.freeze({fork, ending, crossing, release});
})();
