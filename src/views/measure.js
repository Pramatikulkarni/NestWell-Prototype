import { icon, ecg, tick } from '../icons.js';
import { targets } from '../data.js';
import { set, get } from '../store.js';
import { esc, pageHead, syncChip, offlineBanner } from './common.js';

const META = {
  bp: { label: 'Blood pressure', unit: 'mmHg', dev: 'bp', normal: '118/76', high: '146/92', steps: ['Sit down and rest for 5 minutes', 'Place the cuff on your bare upper arm at heart level', 'Keep still and do not talk while it measures'] },
  hr: { label: 'Heart rate', unit: 'bpm', dev: 'ox', normal: '72', high: '112', steps: ['Sit down and rest for a few minutes', 'Clip the oximeter on a warm fingertip', 'Keep your hand still on a flat surface'] },
  spo2: { label: 'SpO₂', unit: '%', dev: 'ox', normal: '98', high: '93', steps: ['Rest for a few minutes', 'Remove nail polish and warm your hands', 'Keep your hand still and below heart level'] },
  temp: { label: 'Temperature', unit: '°C', dev: null, normal: '36.6', high: '37.8', steps: ['Wait 30 minutes after eating or exercise', 'Place the thermometer as instructed', 'Wait for the signal'] },
};
let timer = null;
const stop = () => { clearInterval(timer); timer = null; };
const m = () => get().measure || { step: 'select', metric: 'bp' };

export function measure(st) {
  const f = st.measure || { step: 'select', metric: 'bp' };
  const meta = META[f.metric];
  const dev = st.devices.find(d => d.id === meta.dev);
  const blocked = !dev || dev.state !== 'connected';
  const sub = ['ready', 'measuring', 'confirm'].includes(f.step);
  const head = pageHead('Take a measurement', 'Follow the steps. Your care team sees the result with its time and source.', '', '/patient/home', { act: sub ? 'm-cancel' : 'go', always: sub, label: sub ? 'Back to choose measurement' : 'Back' });
  const stepBar = `<div class="steps" role="img" aria-label="Step ${['select', 'ready', 'measuring', 'confirm', 'saved'].indexOf(f.step) + 1} of 5">${['select', 'ready', 'measuring', 'confirm', 'saved'].map((s, i) => `<i class="${i <= ['select', 'ready', 'measuring', 'confirm', 'saved'].indexOf(f.step) ? 'on' : ''}"></i>`).join('')}</div>`;
  let body = '';
  if (f.step === 'select') {
    body = `<div class="tabs" role="tablist" aria-label="What to measure">${Object.entries(META).map(([k, v]) => `<button role="tab" aria-selected="${k === f.metric}" data-act="m-pick" data-v="${k}">${v.label}</button>`).join('')}</div>
      <section class="card col"><div class="row"><span class="ibox">${icon(meta.dev ? 'device' : 'thermo')}</span><div class="grow"><h2 class="h2">${dev ? esc(dev.name) : 'No thermometer paired'}</h2><p class="tiny">${blocked ? (dev ? 'This device is not connected right now.' : 'Manual entry is not enabled for your programme. Pair a thermometer to continue.') : 'Connected and ready.'}</p></div>${dev ? `<span class="chip ${blocked ? 'bad' : 'ok'}">${icon(blocked ? 'wifiOff' : 'check', 'sm')}${blocked ? 'Not connected' : 'Ready'}</span>` : ''}</div>
      ${blocked ? `<div class="banner bad" role="alert">${icon('warn', 'sm')}<span>This is a device issue, not a health alert. Reconnect the device, then try again.</span></div><button class="btn ghost" data-act="go" data-to="/patient/devices">Fix device connection</button>` : ''}
      </section>
      <button class="btn primary block" data-act="m-ready" ${blocked ? 'disabled aria-disabled="true"' : ''}>Continue</button>`;
  } else if (f.step === 'ready') {
    body = `<section class="card col"><h2 class="h2">Get ready: ${esc(meta.label)}</h2>
      <ol class="list" style="padding:0;margin:0;list-style:none">${meta.steps.map((t, i) => `<li class="item"><span class="check on">${i + 1}</span><span class="grow">${esc(t)}</span></li>`).join('')}</ol>
      <p class="cap">General guidance. Use the instructions approved for your device by your care team.</p></section>
      <div class="row" style="flex-wrap:wrap"><button class="btn primary" data-act="m-start">I’m ready, start</button><button class="btn ghost" data-act="m-cancel">Cancel</button></div>`;
  } else if (f.step === 'measuring') {
    body = `<section class="card col" style="align-items:center;padding:28px" aria-live="polite"><div class="ring" style="--p:${f.progress || 0}"><div><div class="h2">Measuring…</div><p class="tiny">Keep still and relaxed</p></div></div><p class="muted">${Math.round(f.progress || 0)}%</p><span class="beat" style="color:var(--accent)">${icon('heart', 'lg')}</span><div style="width:80%">${ecg()}</div></section>
      <button class="btn ghost" data-act="m-cancel">Cancel</button>`;
  } else if (f.step === 'confirm') {
    body = `<section class="card col pad-lg" style="align-items:center;text-align:center"><p class="cap" style="text-transform:uppercase;font-weight:600;letter-spacing:.06em">Reading received</p>
      <div><span class="stat" style="font-size:40px">${esc(f.value)}</span><span class="unit" style="font-size:20px">${esc(meta.unit)}</span></div>
      <p class="tiny">${esc(meta.label)} · Recorded ${esc(f.at)} · ${esc(dev ? dev.name : 'Thermometer')}</p>
      <p class="cap">Please check it looks right. Saved readings are shared with your care team.</p></section>
      <div class="row" style="flex-wrap:wrap"><button class="btn primary" data-act="m-save">Confirm and save</button><button class="btn ghost" data-act="m-retake">Retake</button></div>
      <details class="card flat"><summary style="min-height:44px;display:flex;align-items:center;font-weight:600;cursor:pointer">What if the reading looks wrong?</summary><p class="tiny" style="padding-bottom:8px">Rest, check the device is positioned as shown, and retake. Nothing is discarded: unusual readings you save are still recorded with their time and source.</p></details>`;
  } else {
    const flagged = f.flag;
    body = `<section class="card col pad-lg" aria-live="polite"><div class="row"><span class="ibox ${flagged ? 'warn' : 'ok'}">${flagged ? icon('warn') : tick()}</span><div class="grow"><h2 class="h2">Reading saved</h2><p class="tiny">${esc(meta.label)} ${esc(f.value)} ${esc(meta.unit)} · ${esc(f.at)}</p></div>${syncChip(f.sync)}</div>
      ${f.sync === 'pending' ? `<div class="banner warn" role="status">${icon('clock', 'sm')}<span>Saved on this device. It will reach your care team when you are back online.</span></div>` : ''}
      <hr class="divider">
      <p class="tiny"><strong>Your range:</strong> ${f.metric === 'bp' ? '90/60 – 120/80' : f.metric === 'hr' ? '60 – 100' : f.metric === 'spo2' ? '95 – 100' : '36.1 – 37.2'} ${esc(meta.unit)} <span class="cap">(set by Dr. Rao for you)</span></p>
      ${flagged ? `<div class="banner warn" role="alert">${icon('warn', 'sm')}<span><strong>This reading is outside your range.</strong> Your care team has been notified and may contact you. Follow your care plan. If you feel unwell, call your care team. In an emergency, call your local emergency number. This is not a diagnosis.</span></div>`
        : `<div class="banner ok" role="status">${icon('check', 'sm')}<span>This reading is within the range set by your care team. Keep up your routine.</span></div>`}
    </section>
    <div class="row" style="flex-wrap:wrap"><button class="btn primary" data-act="go" data-to="/patient/home">Back to today</button><button class="btn ghost" data-act="go" data-to="/patient/vitals">View trends</button>${flagged ? `<button class="btn ghost" data-act="go" data-to="/patient/messages">Contact care team</button>` : ''}</div>`;
  }
  return `<main class="page" id="main-content" style="max-width:760px;margin:0 auto;width:100%">${head}${offlineBanner(st)}${stepBar}${body}</main>`;
}

export const acts = {
  'start-measure': el => { const k = el.dataset.metric || 'bp'; set({ measure: { step: 'select', metric: k } }); location.hash = '#patient-measure'; },
  'm-pick': el => set({ measure: { ...m(), metric: el.dataset.v } }),
  'm-ready': () => set({ measure: { ...m(), step: 'ready' } }),
  'm-cancel': () => { stop(); set({ measure: { step: 'select', metric: m().metric } }); },
  'm-start': () => {
    set({ measure: { ...m(), step: 'measuring', progress: 0 } });
    stop(); timer = setInterval(() => {
      const f = m(); if (!f || f.step !== 'measuring') return stop();
      const p = Math.min(100, (f.progress || 0) + 6);
      if (p >= 100) { stop(); const st = get(); const high = (st.sim && st.sim.result === 'high'); const meta = META[f.metric];
        set({ measure: { ...f, progress: 100, step: 'confirm', value: high ? meta.high : meta.normal, flag: high, at: 'just now' } }); }
      else set({ measure: { ...f, progress: p } });
    }, 220);
  },
  'm-retake': () => set({ measure: { ...m(), step: 'ready' } }),
  'm-save': () => {
    const f = m(), st = get(), meta = META[f.metric];
    const sync = st.offline ? 'pending' : 'synced';
    const dev = st.devices.find(d => d.id === meta.dev);
    const r = { id: 'r' + Date.now(), metric: f.metric, value: f.value, unit: meta.unit, at: 'Today, ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), source: dev ? dev.name : 'Thermometer', sync, flag: f.flag ? 'high' : '' };
    const tasks = st.tasks.map(t => t.kind === f.metric ? { ...t, done: true } : t);
    const notifs = f.flag ? [{ id: 'n' + Date.now(), cat: 'Alerts', icon: 'warn', tone: 'warn', title: 'Reading needs review', body: `Your ${meta.label.toLowerCase()} reading of ${f.value} ${meta.unit} is outside the range set by your care team. Your care team has been notified.`, ago: 'just now', unread: true }, ...st.notifications] : st.notifications;
    set({ readings: [r, ...st.readings], tasks, notifications: notifs, measure: { ...f, step: 'saved', sync, at: r.at.replace('Today, ', 'today, ') } });
  },
};
export const cleanup = stop;
