import { icon, logoMark, lockup, ecg } from './icons.js';
import { startLive, refreshLive } from './live.js';
import { get, set, subscribe, reset } from './store.js';
import { esc, avatar, linkPill } from './views/common.js';
import * as onboarding from './views/onboarding.js';
import * as home from './views/home.js';
import * as vitals from './views/vitals.js';
import * as measure from './views/measure.js';
import * as devices from './views/devices.js';
import * as insights from './views/insights.js';
import * as notifications from './views/notifications.js';
import * as care from './views/care.js';
import * as careplan from './views/careplan.js';
import * as resources from './views/resources.js';
import * as profile from './views/profile.js';
import * as gateway from './views/gateway.js';
import * as clin from './clinician/views.js';
import * as adm from './admin/views.js';
import { incidents as admIncidents } from './admin/data.js';

const ROUTES = {
  'c-dashboard': { view: clin.dashboard, chrome: true, nav: 'c-dashboard', role: 'clinician' },
  'c-patients': { view: clin.patientList, chrome: true, nav: 'c-patients', role: 'clinician' },
  'c-patient': { view: clin.patient, chrome: true, nav: 'c-patients', role: 'clinician' },
  'c-alerts': { view: clin.alertsView, chrome: true, nav: 'c-alerts', role: 'clinician' },
  'c-messages': { view: clin.messagesView, chrome: true, nav: 'c-messages', role: 'clinician' },
  'c-reports': { view: clin.reports, chrome: true, nav: 'c-reports', role: 'clinician' },
  'c-team': { view: clin.teamView, chrome: true, nav: 'c-team', role: 'clinician' },
  'c-settings': { view: clin.settingsView, chrome: true, nav: 'c-settings', role: 'clinician' },
  'a-overview': { view: adm.overview, chrome: true, nav: 'a-overview', role: 'admin' },
  'a-patients': { view: adm.patientsView, chrome: true, nav: 'a-patients', role: 'admin' },
  'a-patient': { view: adm.userDetail, chrome: true, nav: 'a-patients', role: 'admin' },
  'a-clinician': { view: adm.userDetail, chrome: true, nav: 'a-clinicians', role: 'admin' },
  'a-clinicians': { view: adm.cliniciansView, chrome: true, nav: 'a-clinicians', role: 'admin' },
  'a-devices': { view: adm.devicesView, chrome: true, nav: 'a-devices', role: 'admin' },
  'a-programmes': { view: adm.programmesView, chrome: true, nav: 'a-programmes', role: 'admin' },
  'a-alerts': { view: adm.alertsView, chrome: true, nav: 'a-alerts', role: 'admin' },
  'a-analytics': { view: adm.analytics, chrome: true, nav: 'a-analytics', role: 'admin' },
  'a-content': { view: adm.contentView, chrome: true, nav: 'a-content', role: 'admin' },
  'a-config': { view: adm.config, chrome: true, nav: 'a-config', role: 'admin' },
  'a-audit': { view: adm.auditView, chrome: true, nav: 'a-audit', role: 'admin' },
  'a-support': { view: adm.support, chrome: true, nav: 'a-support', role: 'admin' },
  'a-profile': { view: adm.profile, chrome: true, nav: 'a-profile', role: 'admin' },
  splash: { view: gateway.splash }, roles: { view: gateway.rolesView }, portal: { view: gateway.portal, portal: true },
  welcome: { view: onboarding.welcome }, login: { view: onboarding.login }, consent: { view: onboarding.consent }, declined: { view: onboarding.decline },
  home: { view: home.home, chrome: true, nav: 'home' },
  vitals: { view: vitals.vitals, chrome: true, nav: 'vitals' },
  insights: { view: insights.insights, chrome: true, nav: 'insights' },
  devices: { view: devices.devices, chrome: true, nav: 'devices' },
  measure: { view: measure.measure, chrome: true, nav: 'measure' },
  notifications: { view: notifications.notifications, chrome: true, nav: 'notifications' },
  care: { view: care.care, chrome: true, nav: 'care' },
  messages: { view: care.messages, chrome: true, nav: 'messages' },
  careplan: { view: careplan.careplanView, chrome: true, nav: 'careplan' },
  resources: { view: resources.resourcesView, chrome: true, nav: 'resources' },
  profile: { view: profile.profile, chrome: true, nav: 'profile' },
  settings: { view: profile.settings, chrome: true, nav: 'profile' },
};
const P_SIDE = [['home', 'Home', 'home'], ['vitals', 'Vitals', 'pulse'], ['insights', 'Insights', 'heart'], ['devices', 'Devices', 'device'], ['careplan', 'Care plan', 'plan'], ['resources', 'Health resources', 'book'], ['messages', 'Messages', 'chat'], ['profile', 'Profile', 'user']];
const P_PHONE = [['home', 'Home', 'home'], ['vitals', 'Vitals', 'pulse'], ['measure', 'Measure', 'plus'], ['care', 'Care team', 'users'], ['more', 'More', 'more']];
const P_MORE = [['insights', 'Insights & trends', 'heart'], ['devices', 'Connected devices', 'device'], ['notifications', 'Notifications', 'bell'], ['careplan', 'Care plan', 'plan'], ['resources', 'Health resources', 'book'], ['profile', 'Profile', 'user'], ['settings', 'Settings', 'gear']];
const NAV = {
  patient: { side: P_SIDE, phone: P_PHONE, more: P_MORE, moreKeys: ['insights', 'devices', 'notifications', 'careplan', 'resources', 'profile'], settings: 'settings', home: 'home', bell: 'notifications' },
  clinician: {
    side: [['c-dashboard', 'Dashboard', 'home'], ['c-patients', 'Patients', 'users'], ['c-alerts', 'Alerts & triage', 'bell'], ['c-messages', 'Messages', 'chat'], ['c-reports', 'Reports', 'pulse'], ['c-team', 'Care team', 'plan']],
    phone: [['c-dashboard', 'Dashboard', 'home'], ['c-patients', 'Patients', 'users'], ['c-alerts', 'Alerts', 'bell'], ['c-reports', 'Reports', 'pulse'], ['more', 'More', 'more']],
    more: [['c-messages', 'Messages & calls', 'chat'], ['c-team', 'Care team', 'users'], ['c-settings', 'Settings', 'gear']],
    moreKeys: ['c-messages', 'c-team', 'c-settings'], settings: 'c-settings', home: 'c-dashboard', bell: 'c-alerts' },
  admin: {
    side: [['a-overview', 'Overview', 'home'], ['a-patients', 'Patients', 'users'], ['a-clinicians', 'Clinicians', 'plan'], ['a-devices', 'Devices', 'device'], ['a-programmes', 'Programmes', 'book'], ['a-content', 'Content', 'book'], ['a-alerts', 'Alerts', 'bell'], ['a-analytics', 'Analytics', 'pulse'], ['a-config', 'Configuration', 'gear'], ['a-audit', 'Audit logs', 'clock'], ['a-support', 'Support', 'chat']],
    phone: [['a-overview', 'Home', 'home'], ['a-patients', 'Patients', 'users'], ['a-clinicians', 'Clinicians', 'plan'], ['a-devices', 'Devices', 'device'], ['more', 'More', 'more']],
    more: [['a-programmes', 'Programmes', 'book'], ['a-alerts', 'Alerts & incidents', 'bell'], ['a-analytics', 'Analytics & reports', 'pulse'], ['a-content', 'Health content', 'book'], ['a-config', 'Configuration', 'gear'], ['a-audit', 'Audit logs', 'clock'], ['a-support', 'Help & support', 'chat'], ['a-profile', 'Profile & settings', 'user']],
    moreKeys: ['a-programmes', 'a-alerts', 'a-analytics', 'a-content', 'a-config', 'a-audit', 'a-support', 'a-profile'], settings: 'a-profile', home: 'a-overview', bell: 'a-alerts' },
};
const navFor = st => NAV[st.role] || NAV.patient;
const ACTS = {
  go: el => { const st = get(); const fresh = el.dataset.to.endsWith('/measure') && st.measure && st.measure.step === 'saved'; set({ more: false, ...(fresh ? { measure: null } : {}) }); location.hash = '#' + el.dataset.to.replace(/^\//, '').replace(/\//g, '-'); },
  toast: el => toast(el.dataset.msg),
  more: () => set(s => ({ more: !s.more })),
  'more-close': (el, ev) => { if (ev.target === el) set({ more: false }); },
  ...onboarding.acts, ...home.acts, ...vitals.acts, ...measure.acts, ...devices.acts, ...insights.acts, ...notifications.acts, ...care.acts, ...careplan.acts, ...resources.acts, ...profile.acts, ...gateway.acts, ...clin.acts, ...adm.acts,
};
const INPUTS = { ...resources.inputs, ...clin.inputs, ...adm.inputs };

const resolvedTheme = () => { const t = get().theme; return t === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t; };
const routeName = () => (location.hash.replace(/^#patient-/, '') || 'welcome').split('?')[0];

function shell(st, name, r, inner) {
  const N = navFor(st), isP = (st.role || 'patient') === 'patient', hasStrip = isP && ['home', 'vitals', 'devices'].includes(name);
  const role = st.role || 'patient', badge = isP ? st.notifications.filter(n => n.unread).length : role === 'admin' ? admIncidents(st).filter(a => !a.resolved).length : clin.openAlerts(st);
  const side = `<nav class="sidebar ${N.side.length > 7 ? 'dense' : ''}" aria-label="Main"><div class="brandrow">${lockup(40)}</div>
    ${N.side.map(([k, l, i]) => `<button class="nav" data-act="go" data-to="/patient/${k}" ${r.nav === k ? 'aria-current="page"' : ''}>${icon(i)}${l}</button>`).join('')}
    <div class="push"></div><div class="nav-foot"><button class="nav" data-act="go" data-to="/patient/${N.settings}" ${name === N.settings ? 'aria-current="page"' : ''}>${icon('gear')}Settings</button>
    <button class="nav" data-act="logout">${icon('logout')}Log out</button></div></nav>`;
  const top = `<div class="topbar"><form class="search" data-form="${isP ? 'search' : role === 'admin' ? 'asearch' : 'csearch'}" role="search"><label class="sr-only" for="gs">Search</label>${icon('search', 'sm')}<input id="gs" class="input" placeholder="${isP ? 'Search health topics or support…' : role === 'admin' ? 'Search patients or clinicians…' : 'Search patients by name or ID…'}"></form><span class="sp"></span>${hasStrip || !isP ? '' : linkPill(st)}
    <button class="iconbtn" data-act="go" data-to="/patient/${N.bell}" aria-label="${isP ? 'Notifications' : 'Alerts'}, ${badge} ${isP ? 'unread' : 'open'}">${icon('bell')}${badge ? '<span class="dot"></span>' : ''}</button>
    <button class="row" data-act="go" data-to="/patient/${isP ? 'profile' : role === 'admin' ? 'a-profile' : 'c-settings'}" aria-label="Profile">${isP ? avatar('PP', '', 'width:42px;height:42px;font-size:14px') + '<span style="font-weight:600">Prakash</span>' : (role === 'admin' ? avatar('RD', '', 'width:42px;height:42px;font-size:14px') + '<span style="font-weight:600">Admin</span>' : avatar('KI', '', 'width:42px;height:42px;font-size:14px') + '<span style="font-weight:600">Dr. Kavya</span>')}</button></div>`;
  const bottom = `<nav class="bottom-nav" aria-label="Main">${N.phone.map(([k, l, i]) => k === 'measure'
    ? `<button class="fab" data-act="go" data-to="/patient/measure" aria-label="Take a measurement" ${r.nav === 'measure' ? 'aria-current="page"' : ''}>${icon('plus')}</button>`
    : k === 'more' ? `<button data-act="more" aria-haspopup="dialog" ${N.moreKeys.includes(r.nav) ? 'aria-current="page"' : ''}>${icon(i)}<span>${l}</span></button>`
      : `<button data-act="go" data-to="/patient/${k}" ${r.nav === k || (k === 'care' && r.nav === 'messages') ? 'aria-current="page"' : ''}>${icon(i)}<span>${l}</span></button>`).join('')}</nav>`;
  return `<div class="status-bar" aria-hidden="true"><span>9:41</span><span>●●● 5G ▮</span></div><div class="shell">${side}${top}<div class="main" id="scroller">${hasStrip || !isP ? '' : `<div class="linkbar phone-only">${linkPill(st)}</div>`}${inner}</div>${bottom}</div>`;
}

function moreSheet(st) {
  if (!st.more) return '';
  return `<div class="scrim" data-act="more-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mh"><div class="row sb"><h2 class="h2" id="mh">More</h2><button class="btn ghost sm" data-act="more" aria-label="Close">${icon('close', 'sm')}</button></div>
    <div class="list">${navFor(st).more.map(([k, l, i]) => `<button class="item" data-act="go" data-to="/patient/${k}"><span class="ibox">${icon(i, 'sm')}</span><span class="grow t">${l}</span>${icon('chevR', 'sm')}</button>`).join('')}</div></div></div>`;
}

// Public link: the app fills the window and adapts to the device. The device switcher bar only shows with ?review or inside the review page.
const REVIEW = /[?&]review\b/.test(location.search) || window.top !== window;
function toolbar(st) {
  if (!REVIEW) return '';
  return `<div class="proto-bar" role="region" aria-label="Prototype controls"><span class="brand">NestWell</span>
    <span class="group"><span class="lbl" id="l-device">View</span><span class="seg" role="group" aria-labelledby="l-device">${[['auto', 'Auto'], ['phone', 'Phone'], ['desktop', 'Desktop']].map(([v, l]) => `<button data-act="proto" data-k="device" data-v="${v}" aria-pressed="${st.device === v}">${l}</button>`).join('')}</span></span>
    <details class="demo"><summary>Demo</summary><div class="demo-pop">
      <label class="chk"><input type="checkbox" data-act="sim" data-k="offline" ${st.offline ? 'checked' : ''}> Offline</label>
      <label class="chk"><input type="checkbox" data-act="sim" data-k="result" ${st.sim.result === 'high' ? 'checked' : ''}> Reading above range</label>
      <label class="chk"><input type="checkbox" data-act="sim" data-k="pairFail" ${st.sim.pairFail ? 'checked' : ''}> Pairing fails</label>
      <button class="seg" style="padding:6px 14px;min-height:32px;color:#e6ecea" data-act="reset-proto">Reset</button></div></details></div>`;
}

let lastRoute = null, loading = false, enterNext = false, loadTimer = null;
const skeleton = () => `<main class="page" id="main-content" aria-busy="true"><h1 class="sr-only" id="page-title" tabindex="-1">Loading</h1>
  <div class="loading-wrap" role="status" aria-label="Loading"><div style="max-width:210px;margin:6px auto 0">${ecg()}</div>
  <div class="skeleton" style="min-height:44px;width:55%"></div><div class="skeleton" style="min-height:96px"></div>
  <div class="grid g2"><div class="skeleton" style="min-height:170px"></div><div class="skeleton" style="min-height:170px"></div></div><div class="skeleton" style="min-height:150px"></div></div></main>`;
function countUp() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-count]').forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / 800), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e).toLocaleString('en-US'); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}
function render() {
  const st = get(); const name = routeName(); const r = ROUTES[name] || ROUTES.splash;
  if ((r.chrome || r.portal) && !st.authed) { location.hash = '#patient-splash'; return; }
  if (r.chrome && (r.role || 'patient') !== (st.role || 'patient')) { location.hash = '#patient-' + navFor(st).home; return; }
  if (!r.chrome && !r.portal && name === 'portal') return;
  document.body.dataset.nw = resolvedTheme();
  const changed = lastRoute !== name;
  if (changed) {
    if (lastRoute === 'measure') measure.cleanup();
    lastRoute = name; clearTimeout(loadTimer);
    if (get().aQ || get().aQd || get().aQc || get().aQa || get().aQs || get().cQ) set({ aQ: '', aQd: '', aQc: '', aQa: '', aQs: '', ...(name === 'c-patients' ? {} : { cQ: '' }) });
    if (r.chrome) { loading = true; loadTimer = setTimeout(() => { loading = false; enterNext = true; render(); }, 420); }
    else { loading = false; enterNext = true; }
  }
  const showSkeleton = loading && r.chrome;
  const scroller = document.getElementById('scroller'); const prevScroll = scroller && !changed && !enterNext ? scroller.scrollTop : 0;
  const active = document.activeElement; const aid = active && active.id; const sel = active && active.selectionStart;
  const inner = showSkeleton ? skeleton() : r.view(st);
  const sheets = showSkeleton ? '' : (name === 'devices' ? devices.pairSheet(st) : '') + (name === 'notifications' ? notifications.notifSheet(st) : '') + moreSheet(st) + (name === 'roles' ? gateway.aboutSheet(st) : '') + adm.addSheet(st) + ((r.chrome || r.portal) ? gateway.aiFab(st) + gateway.aiSheet(st) : '');
  const entry = name === 'roles' || name === 'login';
  const content = r.chrome ? shell(st, name, r, inner) : entry ? `<div class="main" id="scroller" style="flex:1;min-height:0">${inner}</div>${gateway.entryFooter(st)}` : `<div class="main" id="scroller" style="height:100%">${inner}</div>`;
  const entering = enterNext && !showSkeleton;
  const root = document.getElementById('root');
  root.innerHTML = `${toolbar(st)}<div class="stage" data-device="${REVIEW ? (st.device === 'full' ? 'auto' : st.device) : 'auto'}"><div class="app" data-chrome="${r.chrome ? 'on' : 'off'}" ${entering ? 'data-enter' : ''}>${content}${sheets}</div></div>`;
  const sc = document.getElementById('scroller'); if (sc) sc.scrollTop = prevScroll;
  if (entering) { enterNext = false; (document.getElementById('page-title') || document.getElementById('main-content'))?.focus({ preventScroll: true }); countUp(); }
  else if (aid && !showSkeleton) { const e = document.getElementById(aid); if (e) { e.focus({ preventScroll: true }); if (sel != null && e.setSelectionRange) try { e.setSelectionRange(sel, sel); } catch { /* ignore */ } } }
  const th = document.getElementById('thread'); if (th) th.scrollTop = th.scrollHeight;
  startLive(); setTimeout(refreshLive, 900); gateway.afterRender(name);
}

export function toast(msg) {
  const app = document.querySelector('.app'); if (!app) return;
  app.querySelector('.toast')?.remove();
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; app.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
document.getElementById('skip')?.addEventListener('click', () => (document.getElementById('main-content') || document.getElementById('scroller'))?.focus());
document.addEventListener('toast', e => toast(e.detail));

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (a === 'proto') { const k = el.dataset.k; set({ [k]: el.dataset.v }); return; }
  if (a === 'sim') { const k = el.dataset.k; if (k === 'offline') set({ offline: el.checked }); else set(s => ({ sim: { ...s.sim, [k]: k === 'result' ? (el.checked ? 'high' : 'normal') : el.checked } })); return; }
  if (a === 'reset-proto') { reset(); location.hash = '#patient-splash'; return; }
  const fn = ACTS[a]; if (fn) { if (el.matches('input[type=checkbox]') && a !== 'agree') return; fn(el, e); }
});
document.addEventListener('change', e => { const lf = e.target.closest('form[data-form="login"] .field'); if (lf) { const c = lf.querySelector('.cap'); if (c) c.textContent = ''; }
  const el = e.target.closest('[data-act="agree"],[data-act="sim"]'); if (el && el.dataset.act === 'agree') ACTS.agree(el); if (el && el.dataset.act === 'sim') { const k = el.dataset.k; if (k === 'offline') set({ offline: el.checked }); else set(s => ({ sim: { ...s.sim, [k]: k === 'result' ? (el.checked ? 'high' : 'normal') : el.checked } })); } });
document.addEventListener('change', e => { const l = e.target.closest('select[data-lang]'); if (l) set({ lang: l.value }); });
document.addEventListener('input', e => { const lf = e.target.closest('form[data-form="login"] .field'); if (lf) { const c = lf.querySelector('.cap'); if (c) c.textContent = ''; }
  const el = e.target.closest('[data-input]'); if (el && INPUTS[el.dataset.input]) INPUTS[el.dataset.input](el); });
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
  const k = f.dataset.form;
  if (k === 'login') onboarding.submitLogin(f);
  if (k === 'msg') care.sendMessage(f);
  if (k === 'cmsg') clin.sendC(f);
  if (k === 'aadd') adm.submitAdd(f);
  if (k === 'asearch') { set({ aQ: f.querySelector('input').value, aUf: 'all' }); location.hash = '#patient-a-patients'; }
  if (k === 'csearch') { set({ cQ: f.querySelector('input').value, pFilter: 'all' }); location.hash = '#patient-c-patients'; }
  if (k === 'search') { const v = f.querySelector('input').value; set({ rQ: v, rCat: 'All', article: null }); location.hash = '#patient-resources'; }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') set({ more: false, pair: null, nOpen: null, ai: null, aAdd: null, about: null }); });
window.addEventListener('hashchange', () => { const s = get(); if (routeName() === 'measure' && s.measure && s.measure.step === 'saved') set({ measure: null }); else render(); });
subscribe(render);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
if (!location.hash) location.hash = '#patient-splash';
render();
