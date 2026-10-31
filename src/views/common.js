import { icon } from '../icons.js';
import { sparkline } from '../charts.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const backBtn = (to, label = 'Back', act = 'go', always = false) =>
  `<button class="back iconback" data-act="${act}" data-to="${to}" aria-label="${esc(label)}">${icon('chevL')}</button>`;

export const pageHead = (title, sub = '', right = '', back = '', opt = {}) => `
  <header class="row sb" style="align-items:flex-start">
    <div class="head-title ${back ? 'hasback' : ''}">
      ${back ? backBtn(back, opt.label, opt.act, opt.always) : ''}
      <h1 class="h1" id="page-title" tabindex="-1">${esc(title)}</h1>
      ${sub ? `<p class="muted">${esc(sub)}</p>` : ''}
    </div>${right ? `<div class="head-right">${right}</div>` : ''}
  </header>`;

export const syncChip = s => ({
  synced: `<span class="chip ok">${icon('check', 'sm')}Synced</span>`,
  pending: `<span class="chip warn">${icon('clock', 'sm')}Sync pending</span>`,
  failed: `<span class="chip bad">${icon('warn', 'sm')}Sync failed</span>`,
}[s] || '');

export const stateChip = d => d.state === 'connected'
  ? `<span class="chip ok">${icon('check', 'sm')}Connected · ${d.battery}%</span>`
  : `<span class="chip bad">${icon('wifiOff', 'sm')}Not connected</span>`;

export const vcard = ({ label, value, unit, range, delta, ic, gauge, count, live, to = '/patient/vitals' }) => {
  const trend = delta.startsWith('↑') ? 'up' : delta.startsWith('↓') ? 'down' : 'steady';
  const pc = x => Math.max(0, Math.min(100, (x - gauge.min) / (gauge.max - gauge.min) * 100));
  let meter, note;
  if (gauge.goal) {
    meter = `<span class="gauge" aria-hidden="true"><span class="fill" style="width:${pc(gauge.v)}%"></span></span>`;
    note = `<span class="vnote">${Math.round(gauge.v / gauge.goal * 100)}% of goal</span>`;
  } else {
    const inr = gauge.v >= gauge.lo && gauge.v <= gauge.hi;
    meter = `<span class="gauge" aria-hidden="true"><span class="zone" style="left:${pc(gauge.lo)}%;width:${pc(gauge.hi) - pc(gauge.lo)}%"></span><span class="mark" style="left:${pc(gauge.v)}%"></span></span>`;
    note = `<span class="vnote">${inr ? icon('check', 'sm') + 'In range' : 'Outside range'}</span>`;
  }
  return `
  <button class="card hover vcard" ${live ? `data-live="${live}" data-min="${gauge.min}" data-max="${gauge.max}"` : ''} data-act="go" data-to="${to}" aria-label="${esc(label)} ${esc(value)} ${esc(unit)}. ${esc(range)}. Trend ${trend}, ${esc(delta.replace(/[↑↓→]\s?/, ''))}. Open vitals">
    <span class="vtop"><span class="vlabel">${esc(label)}</span>${live ? '<span class="livepill"><i></i>Live</span>' : ''}</span>
    <span class="vval"><span class="stat" ${count ? `data-count="${count}"` : ''}>${esc(value)}</span><span class="vunit">${esc(unit)}</span></span>
    ${meter}
    <span class="vfoot"><span class="vline">${note}<span class="delta" aria-hidden="true">${esc(delta)}</span></span><span class="vrange">${esc(range)}</span></span>
  </button>`;
};

export const offlineBanner = st => st.offline
  ? `<div class="banner warn" role="status">${icon('wifiOff', 'sm')}<span>You are offline. New readings are saved on this device and will sync when you reconnect. Nothing has been sent to your care team yet.</span></div>` : '';

export const emergencyNote = () => `<p class="cap">NestWell is not an emergency service and your care team may not see readings straight away. In an emergency, call your local emergency number.</p>`;

// profile photos (supplied by the designer); initials remain the fallback
const USE_PHOTOS = false; // initials only: no third-party photos are shipped
const PHOTOS = USE_PHOTOS ? { PP: ['patient', 'Patient profile photo'], AR: ['dr-rao', 'Dr. Ananya Rao'], AM: ['dr-menon', 'Dr. Arjun Menon'], NP: ['nurse-priya', 'Nurse Priya'], KI: ['woman-scrubs', 'Dr. Kavya Iyer'], RD: ['man-suit', 'Rohan Deshmukh'] } : {};
export const avatar = (initials, cls = '', style = '') => {
  const ph = PHOTOS[initials];
  return `<span class="avatar ${cls}" ${style ? `style="${style}"` : ''}>${ph ? `<img src="assets/img/${ph[0]}.jpg" alt="" width="96" height="96" loading="eager" decoding="async">` : esc(initials)}</span>`;
};

// ── Connection to care team: one derived status used everywhere ──
export function linkStatus(st) {
  const down = st.devices.filter(d => d.state !== 'connected');
  const up = st.devices.length - down.length;
  const queued = st.readings.filter(r => r.sync && r.sync !== 'synced').length;
  const lastSync = (st.devices.find(d => d.state === 'connected') || {}).synced;
  let level = 'ok', ic = 'check', short = 'Connected to care team', tiny = 'Connected', title = 'Your readings are reaching your care team',
    detail = `${up} of ${st.devices.length} devices connected${lastSync ? ' · last synced ' + lastSync : ''}. Dr. Rao’s team can see your readings.`;
  let nodes = { dev: 'ok', app: 'ok', care: 'ok' }, links = { a: 'ok', b: 'ok' };
  if (down.length) { level = 'warn'; ic = 'warn'; short = 'Partly connected'; tiny = 'Partly'; title = 'Some readings are not reaching your care team';
    detail = `${down.map(d => d.name).join(', ')} ${down.length > 1 ? 'are' : 'is'} not connected, so ${down.length > 1 ? 'their' : 'its'} readings are not being sent. This is a device issue, not a change in your health.`;
    nodes.dev = 'warn'; links.a = 'bad'; }
  if (queued && !st.offline) { level = level === 'ok' ? 'warn' : level; ic = 'clock'; if (!down.length) { short = 'Sending readings'; tiny = 'Sending'; title = 'Some readings are waiting to send';
    detail = `${queued} reading${queued > 1 ? 's are' : ' is'} saved and will reach your care team shortly.`; } links.b = 'warn'; }
  if (st.offline) { level = 'bad'; ic = 'wifiOff'; short = 'Not sharing · offline'; tiny = 'Offline'; title = 'Your readings are not reaching your care team';
    detail = 'You are offline. New readings are saved on this device and will be sent when you reconnect. Your care team cannot see them yet.';
    nodes.app = 'bad'; nodes.care = 'bad'; links.b = 'bad'; }
  return { level, ic, short, tiny, title, detail, nodes, links, up, total: st.devices.length, down };
}

export const linkPill = st => { const l = linkStatus(st);
  return `<button class="linkpill ${l.level}" data-act="go" data-to="/patient/devices" aria-label="${esc(l.short)}. ${esc(l.title)}. Open devices">${icon(l.ic, 'sm')}<span class="lp-txt">${esc(l.short)}</span><span class="lp-tiny">${esc(l.tiny)}</span></button>`; };

export const linkCard = st => { const l = linkStatus(st);
  const lastSync = (st.devices.find(d => d.state === 'connected') || {}).synced;
  const sub = st.offline ? 'Readings saved on this device, not sent yet'
    : l.down.length ? `${l.down.map(d => d.name).join(', ')} not connected`
    : l.level === 'warn' ? 'Readings waiting to send' : `Last synced ${lastSync || 'just now'}`;
  const dot = (k, ic, n) => `<span class="mdot ${l.nodes[k]}" title="${n}">${icon(ic, 'sm')}</span>`;
  return `<button class="linkstrip ${l.level}" data-act="go" data-to="/patient/devices" aria-label="${esc(l.short)}. ${esc(sub)}. ${esc(l.detail)} Open devices">
    <span class="ls-ico">${icon(l.ic, 'sm')}</span>
    <span class="ls-txt"><b>${esc(l.short)}</b><span>${esc(sub)}</span></span>
    <span class="ls-path" aria-hidden="true">${dot('dev', 'device', 'Devices')}<i class="${l.links.a}"></i>${dot('app', 'phone', 'Your app')}<i class="${l.links.b}"></i>${dot('care', 'plan', 'Care team')}</span>
    ${icon('chevR', 'sm')}</button>`; };
