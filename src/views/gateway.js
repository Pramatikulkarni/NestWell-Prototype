// Common entry for all three portals: splash → role landing → login, plus the AI overview button and the clinician/admin portal stub.
import { icon, logoMark, lockup, ecg } from '../icons.js';
import { roles, providers } from '../data.js';
import { get, set } from '../store.js';
import { esc, avatar, linkStatus } from './common.js';
import { t, LANGS } from '../i18n.js';
import { liveNow } from '../live.js';
import { patients as cPatients, alerts as cAlerts } from '../clinician/data.js';
import { users as aUsers, devices as aDevices, programmes as aProgrammes, incidents as aIncidents } from '../admin/data.js';

let splashTimer = null, idx = 0, drag = null, justDragged = false;

/* ───────── splash ───────── */
export function splash() {
  return `<main class="splash2" id="main-content" data-act="to-roles" role="button" tabindex="0" aria-label="Welcome to NestWell. Continue">
    <div class="sp-orb a"></div><div class="sp-orb b"></div>
    <div class="sp-logo"><span class="sp-ring"></span><span class="sp-ring r2"></span>${logoMark(110)}</div>
    <h1 class="sp-word" id="page-title" tabindex="-1">nestwell</h1>
    <p class="logo-tag">Care that stays close</p>
    <div class="sp-ecg">${ecg()}</div>
    <div class="sp-load" aria-hidden="true"><i></i></div>
    <p class="cap">Tap to continue</p></main>`;
}

/* ───────── role landing ───────── */
const card = (r, i, st) => `<button class="rcard" data-role="${r.id}" data-i="${i}" data-act="role-card" aria-label="${esc(t(st, r.id))} ${esc(t(st, 'loginTitle'))}. ${esc(t(st, 'b_' + r.id))}">
  <span class="rc-photo"><span class="rc-icon">${icon(r.icon)}</span></span>
  <span class="rc-tag">${icon(r.icon, 'sm')}${esc(t(st, r.id))}</span>
  <span class="rc-blurb">${esc(t(st, 'b_' + r.id))}</span>
  <span class="rc-go">${esc(t(st, 'login'))} ${icon('chevR', 'sm')}</span></button>`;

export function rolesView(st) {
  return `<main class="roles" id="main-content"><div class="roles-inner">
    <div class="rlinks"><button class="aboutbtn" data-act="privacy-open">${esc(t(st, 'privacy'))}</button><span></span><button class="aboutbtn" data-act="about-open">${esc(t(st, 'about'))}</button></div>
    <div class="roles-head">${lockup(44)}<h1 class="h1" id="page-title" tabindex="-1">${esc(t(st, 'title'))}</h1><p class="muted">${esc(t(st, 'sub'))}</p></div>
    <div class="rstack-wrap">
      <button class="iconbtn sidearrow l" data-act="role-step" data-v="-1" aria-label="Previous login">${icon('chevL')}</button><button class="iconbtn sidearrow r" data-act="role-step" data-v="1" aria-label="Next login">${icon('chevR')}</button>
      <div class="rstack" role="group" aria-roledescription="carousel" aria-label="Login types. Swipe left or right, or use the arrows, then tap a card" tabindex="0">${roles.map((r, i) => card(r, i, st)).join('')}</div>
      <div class="rdots" aria-hidden="true">${roles.map((_, i) => `<i data-d="${i}"></i>`).join('')}</div>
      <p class="cap rhint">${esc(t(st, 'swipe'))}</p></div>
    <div class="rgrid">${roles.map((r, i) => card(r, i, st)).join('')}</div></div>
    <div class="aboutrow"><button class="aboutbtn aboutbtn-phone" data-act="privacy-open">${esc(t(st, 'privacy'))}</button><button class="aboutbtn aboutbtn-phone" data-act="about-open">${esc(t(st, 'about'))}</button></div></main>`;
}

function layoutStack() {
  const st = document.querySelector('.rstack'); if (!st) return;
  st.querySelectorAll('.rcard').forEach((c, i) => {
    const d = i - idx, a = Math.abs(d);
    c.style.setProperty('--d', d);
    c.style.transform = `translateX(${d * 66}px) translateY(${a * 14}px) scale(${1 - a * .08}) rotate(${d * 4}deg)`;
    c.style.zIndex = 10 - a; c.style.opacity = a > 1 ? 0 : 1 - a * .12;
    c.classList.toggle('front', d === 0);
    c.tabIndex = d === 0 ? 0 : -1; c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
  });
  document.querySelectorAll('.rdots i').forEach((e, i) => e.classList.toggle('on', i === idx));
  const pv = document.querySelector('.sidearrow.l'), nx = document.querySelector('.sidearrow.r');
  if (pv) pv.disabled = idx === 0; if (nx) nx.disabled = idx === roles.length - 1;
}
const setIdx = n => { idx = Math.max(0, Math.min(roles.length - 1, n)); layoutStack(); };

export function afterRender(name) {
  clearTimeout(splashTimer);
  if (name === 'splash') splashTimer = setTimeout(() => { if (location.hash === '#patient-splash') location.hash = '#patient-roles'; }, 2600);
  if (name === 'roles') { idx = Math.max(0, roles.findIndex(r => r.id === get().role)); layoutStack(); }
}

/* swipe: pointer events on the stack */
document.addEventListener('pointerdown', e => {
  const s = e.target.closest('.rstack'); if (!s) return;
  drag = { x: e.pointerId != null ? e.clientX : 0, id: e.pointerId, dx: 0, moved: false };
});
document.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  drag.dx = e.clientX - drag.x;
  if (Math.abs(drag.dx) > 8) { drag.moved = true; const f = document.querySelector('.rcard.front'); if (f) { f.style.transition = 'none'; f.style.transform = `translateX(${drag.dx * .8}px) rotate(${drag.dx / 40}deg)`; } }
});
const endDrag = e => {
  if (!drag) return;
  const { dx, moved } = drag; drag = null;
  document.querySelectorAll('.rcard').forEach(c => { c.style.transition = ''; });
  if (moved) { justDragged = true; setTimeout(() => { justDragged = false; }, 80); setIdx(idx + (dx < -45 ? 1 : dx > 45 ? -1 : 0)); layoutStack(); }
};
document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
document.addEventListener('keydown', e => {
  if (!e.target.closest || !e.target.closest('.rstack')) return;
  if (e.key === 'ArrowRight') { setIdx(idx + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { setIdx(idx - 1); e.preventDefault(); }
});

/* ───────── clinician / admin portal stub ───────── */
export function portal(st) {
  const r = roles.find(x => x.id === st.role) || roles[1];
  const cp = providers.find(p => p.id === st.provider);
  return `<main class="portal" id="main-content">
    <header class="row sb">${lockup(36)}<button class="btn ghost sm" data-act="logout">${icon('logout', 'sm')}Log out</button></header>
    <section class="card pad-lg col" style="align-items:center;text-align:center;max-width:560px;margin:auto">
      <span class="rc-icon">${icon(r.icon)}</span>
      <span class="rc-tag">${esc(r.label)} portal</span>
      <h1 class="h1" id="page-title" tabindex="-1">You are signed in</h1>
      ${cp ? `<p class="chip">${icon('check', 'sm')}${esc(cp.name)} · ${esc(cp.area)}</p>` : ''}
      <p class="muted">This is the ${esc(r.label.toLowerCase())} portal. Its screens are being designed and will appear here once they are final.</p>
      <p class="cap">Meanwhile, the AI overview button summarises the prototype’s sample data for your role.</p>
      <button class="btn primary" data-act="ai-open">${icon('sparkle', 'sm')}Open AI overview</button></section></main>`;
}

/* ───────── AI overview ───────── */
export const aiFab = st => `<button class="aifab ${st.ai ? 'hide' : ''}" data-act="ai-open" aria-haspopup="dialog" aria-label="AI overview">${icon('sparkle')}<span>AI overview</span></button>`;

function summary(st) {
  const role = st.role || 'patient', ls = linkStatus(st), live = liveNow();
  const done = st.tasks.filter(t => t.done).length, next = st.tasks.find(t => !t.done);
  const bp = st.readings.find(r => r.metric === 'bp') || { value: '118/76' };
  const flagged = st.readings.some(r => r.flag === 'high');
  const unread = st.notifications.filter(n => n.unread).length;
  const linkLine = ls.level === 'ok' ? 'All devices are connected and your readings are reaching the care team.' : ls.detail;
  if (role === 'clinician') {
    const al = cAlerts(st).filter(a => !a.reviewed), crit = al.filter(a => a.sev === 'critical'), warn = al.filter(a => a.sev === 'warning'), ps = cPatients(st), down = ps.filter(p => p.device === 'down');
    const top = crit[0] || warn[0];
    return { head: 'Your patients today', items: [
      [crit.length ? 'octagon' : 'check', `${crit.length} critical and ${warn.length} warning alert${warn.length === 1 ? '' : 's'} are waiting for review.`],
      ...(top ? [['warn', `Most urgent: ${top.p.name}, ${top.title[0].toLowerCase() + top.title.slice(1)} (${top.value}).`]] : []),
      ['users', `${ps.length} patients monitored; ${down.length} ${down.length === 1 ? 'has' : 'have'} a disconnected device.`],
      ['heart', `Prakash Paul’s heart rate is ${live.hr} bpm and SpO₂ ${live.spo2}%, inside the set ranges.`]],
      act: ['Open alerts', '/patient/c-alerts'] };
  }
  if (role === 'admin') {
    const us = aUsers(st), ds = aDevices(st), inc = aIncidents(st).filter(a => !a.resolved), crit = inc.filter(a => a.sev === 'critical').length;
    const on = ds.filter(d => d.status === 'Online').length, bad = ds.length - on;
    return { head: 'Platform at a glance', items: [
      ['users', `${us.length} users: ${us.filter(u => u.role === 'Clinician').length} clinicians, ${us.filter(u => u.role === 'Patient').length} patients and ${us.filter(u => u.role === 'Admin').length} admin.`],
      ['device', `${on} of ${ds.length} devices are online${bad ? `; ${bad} offline or with issues` : ''}.`],
      [crit ? 'octagon' : 'check', `${inc.length} open incident${inc.length === 1 ? '' : 's'}, ${crit} critical.`],
      ['plan', `${aProgrammes(st).filter(p => p.status === 'Active').length} active care programmes.`]],
      act: ['Open incidents', '/patient/a-alerts'] };
  }
  return { head: 'Your day at a glance', items: [
    ['heart', `Heart rate ${live.hr} bpm and SpO₂ ${live.spo2}% are within the ranges set by your care team.`],
    ['check', `Latest blood pressure ${bp.value} mmHg${flagged ? ' is above your range. Your care team has been notified.' : ' is within your range.'}`],
    ['plan', `${done} of ${st.tasks.length} tasks done${next ? '. Next: ' + next.title : '. Nice work today'}.`],
    [ls.ic, linkLine]],
    act: ['Message my care team', '/patient/messages'] };
}

export function aiSheet(st) {
  if (!st.ai) return '';
  const who = { patient: 'patient', clinician: 'clinician', admin: 'admin' }[st.role || 'patient'];
  const body = !st.ai.ready
    ? `<div class="ai-think" role="status" aria-live="polite"><span class="ai-orb"></span><p class="muted">Reading your ${who} data…</p><div class="skeleton" style="height:14px;width:90%"></div><div class="skeleton" style="height:14px;width:75%"></div><div class="skeleton" style="height:14px;width:82%"></div></div>`
    : (() => { const s = summary(st); return `<h3 class="ai-h">${esc(s.head)}</h3><ul class="ai-list" aria-live="polite">${s.items.map(([i, t], k) => `<li style="--k:${k}"><span class="ibox">${icon(i, 'sm')}</span><span>${esc(t)}</span></li>`).join('')}</ul>
      ${s.act ? `<button class="btn ghost sm" data-act="ai-go" data-to="${s.act[1]}" style="align-self:flex-start">${esc(s.act[0])}</button>` : ''}`; })();
  return `<div class="scrim ${st.ai.ready ? 'seen' : ''}" data-act="ai-scrim"><div class="sheet aisheet ${st.ai.ready ? 'seen' : ''}" role="dialog" aria-modal="true" aria-labelledby="ai-t">
    <div class="row sb"><div class="row" style="gap:10px"><span class="ai-badge">${icon('sparkle')}</span><h2 class="h2" id="ai-t">AI overview</h2></div>
      <div class="row" style="gap:6px"><button class="btn ghost sm" data-act="ai-regen" aria-label="Refresh overview">${icon('refresh', 'sm')}</button><button class="btn ghost sm" data-act="ai-close" aria-label="Close">${icon('close', 'sm')}</button></div></div>
    ${body}
    <p class="cap">Generated from this prototype’s sample data. It describes readings and tasks. It is not a diagnosis or medical advice.</p></div></div>`;
}

const think = () => { setTimeout(() => { if (get().ai) set({ ai: { ready: true } }); }, 1100); };

export const acts = {
  'to-roles': () => { location.hash = '#patient-roles'; },
  'role-card': el => {
    if (justDragged) return;
    const i = +el.dataset.i;
    if (el.closest('.rstack') && i !== idx) { setIdx(i); return; }
    set({ role: el.dataset.role, signup: false }); location.hash = '#patient-login';
  },
  'role-step': el => setIdx(idx + +el.dataset.v),
  'ai-open': () => { set({ ai: { ready: false } }); think(); },
  'ai-close': () => set({ ai: null }),
  'ai-scrim': (el, ev) => { if (ev.target === el) set({ ai: null }); },
  'ai-regen': () => { set({ ai: { ready: false } }); think(); },
  'ai-go': el => { set({ ai: null }); location.hash = '#' + el.dataset.to.replace(/^\//, '').replace(/\//g, '-'); },
};

/* ───────── About ───────── */
const ABOUT = {
  about: ['About', [['NestWell is a remote patient monitoring service. Patients take readings at home with approved devices, and their care team sees those readings with the time and source.', ''], ['It is designed to be calm and clear for patients, and fast to scan for clinicians and administrators.', '']]],
  mission: ['Mission', [['Keep people connected to their care between visits, so changes are noticed sooner and nobody has to wonder whether their readings are being seen.', ''], ['NestWell supports care. It does not replace a care team and is not an emergency service.', '']]],
  how: ['How it works', [['1. Your care provider sets up your devices and care plan.', ''], ['2. You take readings at home. They sync to the app, and the app shows whether they are reaching your care team.', ''], ['3. Clinicians review alerts and trends, and message you if something needs attention.', ''], ['4. Administrators keep programmes, devices and access running.', '']]],
  faq: ['FAQ', [['Is NestWell for emergencies?', 'No. In an emergency, call your local emergency number.'], ['Who can see my readings?', 'Your care team at the hospital you chose. A caregiver only if you give permission.'], ['What if a device disconnects?', 'The app shows it. It is a technical issue, not a change in your health. Reconnect it from Devices.'], ['Does NestWell diagnose?', 'No. It shows readings against ranges your clinician set.']]],
  privacy: ['Privacy', [['What we collect: readings from your devices (value, unit, time and source), symptoms you report, and your profile.', ''], ['Who can see it: your care team at the hospital you chose. A caregiver only if you give permission. Never shared for advertising.', ''], ['Your choices: change or withdraw consent any time in Settings. Withdrawing may limit remote monitoring.', ''], ['This prototype uses sample data only and stores your choices on this device.', '']]],
  contact: ['Contact us', [['For help with your account or devices, contact your care provider first.', ''], ['Product questions: hello@nestwell.example (placeholder address for this prototype).', '']]],
};
export function aboutSheet(st) {
  if (!st.about) return '';
  const t = st.about.tab || 'about', [, body] = ABOUT[t];
  return `<div class="scrim" data-act="about-scrim"><div class="sheet aboutsheet" role="dialog" aria-modal="true" aria-labelledby="ab-t">
    <div class="row sb"><h2 class="h2" id="ab-t">${st.about.solo ? 'Privacy' : 'About NestWell'}</h2><button class="btn ghost sm" data-act="about-close" aria-label="Close">${icon('close', 'sm')}</button></div>
    ${st.about.solo ? '' : `<div class="tabs" role="tablist" aria-label="About sections">${Object.entries(ABOUT).map(([k, [l]]) => `<button role="tab" aria-selected="${k === t}" data-act="about-tab" data-v="${k}">${l}</button>`).join('')}</div>`}
    <div class="col" role="tabpanel">${body.map(([a, b]) => b ? `<details class="card flat" open><summary style="min-height:44px;display:flex;align-items:center;font-weight:600">${esc(a)}</summary><p class="tiny" style="padding-bottom:8px">${esc(b)}</p></details>` : `<p style="font-size:15px;line-height:1.6">${esc(a)}</p>`).join('')}</div></div></div>`;
}
Object.assign(acts, {
  'about-open': () => set({ about: { tab: 'about' } }),
  'privacy-open': () => set({ about: { tab: 'privacy', solo: true } }),
  'about-close': () => set({ about: null }),
  'about-tab': el => set({ about: { tab: el.dataset.v } }),
  'about-scrim': (el, ev) => { if (ev.target === el) set({ about: null }); },
});

/* ───────── footer on the entry screens: language (left), credit (centre), theme (right) ───────── */
export function entryFooter(st) {
  const dark = document.body.dataset.nw === 'dark';
  return `<footer class="entryfoot"><button class="aboutbtn foot-about" data-act="about-open">${esc(t(st, 'about'))}</button><label class="langsel"><span class="sr-only">${esc(t(st, 'lang'))}</span>${icon('globe', 'sm')}<select data-lang aria-label="${esc(t(st, 'lang'))}">${LANGS.map(([k, l]) => `<option value="${k}" ${k === (st.lang || 'en') ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <span class="credit">UIUX Case Study | Pramati Kulkarni | ar.pramatikulkarni@gmail.com</span>
    <button class="themeflip" data-act="theme-flip" aria-label="${esc(t(st, 'theme'))}" aria-pressed="${dark}">${icon(dark ? 'sun' : 'moon')}</button></footer>`;
}
Object.assign(acts, { 'theme-flip': () => set({ theme: document.body.dataset.nw === 'dark' ? 'light' : 'dark' }) });
