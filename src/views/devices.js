import { icon } from '../icons.js';
import { set, get } from '../store.js';
import { esc, pageHead, stateChip, linkCard } from './common.js';

const kinds = [['bp', 'Blood pressure monitor', 'device'], ['ox', 'Pulse oximeter', 'drop'], ['sc', 'Smart scale', 'device'], ['th', 'Thermometer', 'thermo']];
let timer = null;

export function devices(st) {
  const add = `<button class="btn primary" data-act="pair-open">${icon('plus', 'sm')}Add device</button>`;
  const bad = st.devices.filter(d => d.state !== 'connected').length;
  return `<main class="page" id="main-content">
    ${pageHead('Connected devices', 'Manage the devices your care team assigned.', add, '/patient/home')}
    ${linkCard(st)}
    <div class="split">
      <section class="list" aria-label="Devices">${st.devices.map(d => `<div class="item card hover dev" style="padding:16px"><span class="ibox ${d.state === 'connected' ? '' : 'bad'}">${icon(d.icon)}</span>
        <div class="grow"><div class="t">${esc(d.name)}</div><div class="s">Last synced ${esc(d.synced)}</div><div style="margin-top:6px">${stateChip(d)}</div></div>
        ${d.state === 'connected' ? `<button class="btn ghost sm" data-act="go" data-to="/patient/measure" aria-label="Measure with ${esc(d.name)}">Measure</button>` : `<button class="btn primary sm ${st.reconnecting === d.id ? 'loading' : ''}" data-act="reconnect" data-id="${d.id}">${st.reconnecting === d.id ? 'Connecting…' : 'Reconnect'}</button>`}</div>`).join('')}</section>
      <aside class="card col" style="text-align:center;align-items:center" aria-label="Device summary"><span class="ibox ${bad ? 'warn' : 'ok'}" style="width:64px;height:64px">${icon(bad ? 'warn' : 'check', 'lg')}</span>
        <h2 class="h2">${bad ? bad + ' device needs attention' : 'All devices working well'}</h2>
        <p class="tiny">${bad ? 'A disconnected device is a technical issue. It does not mean your health has changed.' : 'Your devices are connected and syncing normally.'}</p>
        <p class="cap">Paired means connected by Bluetooth. Synced means data has reached your care team.</p></aside>
    </div></main>`;
}

export function pairSheet(st) {
  const p = st.pair; if (!p) return '';
  const close = `<button class="btn ghost sm" data-act="pair-close" aria-label="Close">${icon('close', 'sm')}</button>`;
  let inner = '';
  if (p.step === 'choose') inner = `<div class="list">${kinds.map(([id, n, ic]) => `<button class="item" data-act="pair-pick" data-id="${id}"><span class="ibox">${icon(ic)}</span><span class="grow t">${n}</span>${icon('chevR', 'sm')}</button>`).join('')}</div><p class="cap">Only devices assigned by your care team are supported.</p>`;
  if (p.step === 'prepare') inner = `<ol class="list" style="padding:0;margin:0;list-style:none">${['Turn on Bluetooth on this device', 'Keep the device within one metre', 'Press and hold its pairing button'].map((t, i) => `<li class="item"><span class="check on">${i + 1}</span><span class="grow">${t}</span></li>`).join('')}</ol><button class="btn primary block" data-act="pair-go">Start pairing</button>`;
  if (p.step === 'searching') inner = `<div class="col" style="align-items:center;padding:12px" aria-live="polite"><span class="pulse" style="color:var(--brand)">${icon('device', 'lg')}</span><p class="h2">Searching…</p><p class="tiny">Keep the device nearby.</p></div>`;
  if (p.step === 'done') inner = `<div class="banner ok" role="status">${icon('check', 'sm')}<span><strong>Paired.</strong> Your device is connected by Bluetooth. Data is not synced yet: take your first reading to confirm it reaches your care team.</span></div><button class="btn primary block" data-act="pair-finish">Take first reading</button><button class="btn ghost block" data-act="pair-close">Do this later</button>`;
  if (p.step === 'fail') inner = `<div class="banner bad" role="alert">${icon('warn', 'sm')}<span><strong>Couldn’t pair.</strong> This is a connection issue, not a health issue.</span></div><ul class="list" style="padding-left:18px;margin:0"><li>Check the device battery</li><li>Move closer and try again</li><li>Make sure Bluetooth permission is allowed</li></ul><button class="btn primary block" data-act="pair-go">Try again</button><button class="btn ghost block" data-act="toast" data-msg="Support chat would open here.">Contact support</button>`;
  return `<div class="scrim" data-act="pair-close-scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-h"><div class="row sb"><h2 class="h2" id="sh-h">${p.step === 'choose' ? 'Add a device' : esc(p.name || 'Pair device')}</h2>${close}</div>${inner}</div></div>`;
}

export const acts = {
  'pair-open': () => set({ pair: { step: 'choose' } }),
  'pair-close': () => { clearTimeout(timer); set({ pair: null }); },
  'pair-close-scrim': (el, ev) => { if (ev.target === el) { clearTimeout(timer); set({ pair: null }); } },
  'pair-pick': el => { const k = kinds.find(x => x[0] === el.dataset.id); set({ pair: { step: 'prepare', id: k[0], name: k[1] } }); },
  'pair-go': () => {
    const p = get().pair; set({ pair: { ...p, step: 'searching' } });
    clearTimeout(timer); timer = setTimeout(() => { const st = get(); if (!st.pair) return; set({ pair: { ...st.pair, step: st.sim && st.sim.pairFail ? 'fail' : 'done' } }); }, 1800);
  },
  'pair-finish': () => { set({ pair: null }); location.hash = '#patient-measure'; },
  reconnect: el => {
    const id = el.dataset.id; set({ reconnecting: id });
    setTimeout(() => {
      const st = get(); const fail = st.sim && st.sim.pairFail;
      set({ reconnecting: null, devices: st.devices.map(d => d.id === id && !fail ? { ...d, state: 'connected', synced: 'just now' } : d) });
      document.dispatchEvent(new CustomEvent('toast', { detail: fail ? 'Couldn’t connect. Check the battery and move closer.' : 'Connected. Waiting for first sync.' }));
    }, 1500);
  },
};
