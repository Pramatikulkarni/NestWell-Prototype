import { icon } from '../icons.js';
import { set, get } from '../store.js';
import { esc, pageHead, avatar } from '../views/common.js';
import { lineChart, dataTable } from '../charts.js';
import { statusChip, tile, donut } from '../clinician/views.js';
import { patients as cPatients } from '../clinician/data.js';
import { users, devices, programmes, incidents, audit, content, faqs } from './data.js';
import { providers } from '../data.js';

const go = to => `data-act="go" data-to="${to}"`;
const ini = n => n.replace(/^(Dr\.|Nurse)\s+/, '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const PH = { 'Rohan Deshmukh': 'RD', 'Prakash Paul': 'PP', 'Dr. Kavya Iyer': 'KI', 'Dr. Ananya Rao': 'AR', 'Dr. Arjun Menon': 'AM', 'Nurse Priya': 'NP' };
const av = n => avatar(PH[n] || ini(n));
const ok = (t, i = 'check') => `<span class="chip ok">${icon(i, 'sm')}${t}</span>`;
const bad = (t, i = 'wifiOff') => `<span class="chip bad">${icon(i, 'sm')}${t}</span>`;
const warn = (t, i = 'warn') => `<span class="chip warn">${icon(i, 'sm')}${t}</span>`;
const neu = (t, i = 'clock') => `<span class="chip info">${icon(i, 'sm')}${t}</span>`;
const devChip = s => s === 'Online' ? ok('Online') : s === 'Offline' ? bad('Offline') : warn('Issue');
const tabsRow = (label, items, cur, act) => `<div class="tabs" role="tablist" aria-label="${label}">${items.map(([k, l]) => `<button role="tab" aria-selected="${k === cur}" data-act="${act}" data-v="${k}">${l}</button>`).join('')}</div>`;
const search = (id, ph, val, input) => `<div class="field"><label class="sr-only" for="${id}">${ph}</label><div class="searchbox">${icon('search', 'sm')}<input id="${id}" class="input" data-input="${input}" value="${esc(val || '')}" placeholder="${ph}" autocomplete="off"></div></div>`;
const addBtn = (kind, label, role = '') => `<button class="btn primary sm" data-act="a-add" data-k="${kind}" data-role="${role}">${icon('plus', 'sm')}${label}</button>`;
const BACK = '/patient/a-overview';

/* ───────── overview ───────── */
export function overview(st) {
  const us = users(st), ds = devices(st), pg = programmes(st), inc = incidents(st).filter(a => !a.resolved);
  const on = ds.filter(d => d.status === 'Online').length, off = ds.filter(d => d.status === 'Offline').length, iss = ds.filter(d => d.status === 'Issue').length;
  const labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], vals = [2, 3, 3, 4, 5, 6, us.filter(u => u.role === 'Patient').length];
  const c = k => inc.filter(a => a.sev === k).length;
  const bell = `<button class="iconbtn phone-only" ${go('/patient/a-alerts')} aria-label="Incidents, ${inc.length} open">${icon('bell')}${inc.length ? '<span class="dot"></span>' : ''}</button>`;
  return `<main class="page" id="main-content">
    ${pageHead('Good morning, Admin', 'System performance and key insights at a glance · Tue, 14 Oct 2026', bell)}
    <div class="ktiles">${tile('users', us.length, 'Total users', '/patient/a-patients')}${tile('plan', us.filter(u => u.role === 'Clinician').length, 'Active clinicians', '/patient/a-clinicians')}${tile('device', `${on}/${ds.length}`, 'Devices online', '/patient/a-devices')}${tile('book', pg.filter(p => p.status === 'Active').length, 'Active programmes', '/patient/a-programmes')}</div>
    <div class="split"><section class="card col"><h2 class="h2">Patient enrolment · last 7 months</h2>${lineChart({ labels, values: vals, unit: 'patients', title: 'Patient enrolment' })}<p class="cap">Sample data for prototype review.</p></section>
      <section class="card col"><h2 class="h2">Device status</h2><div class="row" style="gap:20px;flex-wrap:wrap;justify-content:center">${donut([{ l: 'Online', c: 'var(--chart-1)', n: on }, { l: 'Offline', c: 'var(--sev-c)', n: off }, { l: 'Issues', c: 'var(--sev-w)', n: iss }], 'devices', 'Devices by status')}
        <ul class="legend"><li><i style="background:var(--chart-1)"></i><span>Online</span><b>${on}</b></li><li><i style="background:var(--sev-c)"></i><span>Offline</span><b>${off}</b></li><li><i style="background:var(--sev-w)"></i><span>Issues</span><b>${iss}</b></li></ul></div></section></div>
    <div class="split even"><section class="card col"><div class="row sb"><h2 class="h2">System alerts</h2><button class="link" ${go('/patient/a-alerts')}>View all</button></div><div class="list">
      <button class="item" ${go('/patient/a-alerts')}><span class="ibox sev-critical">${icon('octagon', 'sm')}</span><span class="grow t">${c('critical')} critical alert${c('critical') === 1 ? '' : 's'}</span>${icon('chevR', 'sm')}</button>
      <button class="item" ${go('/patient/a-alerts')}><span class="ibox sev-warning">${icon('warn', 'sm')}</span><span class="grow t">${c('warning')} warning alert${c('warning') === 1 ? '' : 's'}</span>${icon('chevR', 'sm')}</button>
      <button class="item" ${go('/patient/a-alerts')}><span class="ibox sev-info">${icon('info', 'sm')}</span><span class="grow t">${c('info')} info notice${c('info') === 1 ? '' : 's'}</span>${icon('chevR', 'sm')}</button></div></section>
      <section class="card col"><div class="row sb"><h2 class="h2">Recent activity</h2><button class="link" ${go('/patient/a-audit')}>Audit logs</button></div><div class="list">${audit.slice(0, 3).map(a => `<div class="item"><span class="grow"><span class="t">${esc(a.detail)}</span><br><span class="s">${esc(a.who)} · ${esc(a.when)}</span></span></div>`).join('')}</div></section></div></main>`;
}

/* ───────── patients / clinicians ───────── */
export function usersView(st, role) {
  const f = st.aUf || 'all', q = (st.aQ || '').toLowerCase(), all = users(st).filter(u => u.role === role);
  const n = k => all.filter(u => k === 'all' || (k === 'on' ? u.active : !u.active)).length;
  const list = all.filter(u => (f === 'all' || (f === 'on' ? u.active : !u.active)) && (!q || (u.name + u.email).toLowerCase().includes(q)));
  const word = role === 'Patient' ? 'Patient' : 'Clinician';
  return `<main class="page plw" id="main-content">
    ${pageHead(word + ' management', role === 'Patient' ? 'Manage patient accounts and access.' : 'Manage clinician accounts and access.', addBtn('user', 'Add ' + word.toLowerCase(), role), BACK)}
    ${search('aq', 'Search by name or email', st.aQ, 'aq')}
    ${tabsRow('Status', [['all', `All (${n('all')})`], ['on', `Active (${n('on')})`], ['off', `Inactive (${n('off')})`]], f, 'a-uf')}
    <div class="list">${list.length ? list.map(u => `<div class="item tr" style="--cols:2.4fr 1.2fr 1fr auto">
      <button class="tc main row clink" style="gap:12px" data-act="a-open-user" data-id="${u.id}" aria-label="Open ${esc(u.name)}">${av(u.name)}<span><span class="t">${esc(u.name)}</span><br><span class="s">${esc(u.email)}</span></span></button>
      <span class="tc opt s">${esc(u.last)}</span><span class="tc end">${u.active ? ok('Active') : neu('Inactive', 'wifiOff')}</span>
      <button class="btn ghost sm" data-act="a-toggle-user" data-id="${u.id}" aria-label="${u.active ? 'Deactivate' : 'Activate'} ${esc(u.name)}">${u.active ? 'Deactivate' : 'Activate'}</button></div>`).join('') : '<p class="muted">No one matches.</p>'}</div></main>`;
}
export function userDetail(st) {
  const u = users(st).find(x => x.id === st.aUid) || users(st)[0], isP = u.role === 'Patient';
  const back = isP ? '/patient/a-patients' : '/patient/a-clinicians';
  const cp = providers.find(p => p.id === st.provider), p = isP ? cPatients(st).find(x => 'u-' + x.id === u.id) : null;
  const ro = (l, v) => `<div class="field"><label>${l}</label><div class="input ro">${esc(v)}</div></div>`;
  const ds = isP && p && p.id === 'p1' ? devices(st).filter(d => d.who === 'Prakash Paul') : isP ? devices(st).filter(d => d.who === u.name) : [];
  return `<main class="page" id="main-content">${pageHead(u.name, u.role + ' details', '', back)}
    <section class="card pad-lg row sb phead"><div class="row" style="gap:14px;min-width:0">${av(u.name)}<div style="min-width:0"><h2 class="h2">${esc(u.name)}</h2><p class="tiny">${esc(u.email)}</p><div class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap">${u.active ? ok('Active') : neu('Inactive', 'wifiOff')}${neu(u.role, 'user')}</div></div></div>
      <button class="btn ghost sm" data-act="a-toggle-user" data-id="${u.id}">${u.active ? 'Deactivate' : 'Activate'}</button></section>
    <div class="split even"><section class="card col"><h2 class="h2">Account</h2><div class="grid g2 g-d2">${ro('Role', u.role)}${ro('Last active', u.last)}${ro('Care provider', cp ? cp.name + ', ' + cp.area : 'Not set')}${ro('Status', u.active ? 'Active' : 'Inactive')}</div></section>
    ${isP && p ? `<section class="card col"><h2 class="h2">Care</h2><div class="grid g2 g-d2">${ro('Patient ID', p.mrn)}${ro('Condition', p.cond)}${ro('Age · sex', p.age + ' · ' + p.sex)}${ro('Latest reading', p.last)}</div></section>` : `<section class="card col"><h2 class="h2">Assigned work</h2><p class="muted">${isP ? '' : 'Clinical staff see patients through the clinician portal.'}</p></section>`}</div>
    ${isP ? `<section class="card col"><h2 class="h2">Devices</h2><div class="list">${ds.length ? ds.map(d => `<div class="item"><span class="grow"><span class="t">${esc(d.type)}</span><br><span class="s">${esc(d.id)} · synced ${esc(d.sync)}</span></span>${devChip(d.status)}</div>`).join('') : '<p class="muted">No devices assigned.</p>'}</div></section>` : ''}</main>`;
}
export const patientsView = st => usersView(st, 'Patient');
export const cliniciansView = st => usersView(st, 'Clinician');

/* ───────── devices ───────── */
export function devicesView(st) {
  const f = st.aDf || 'all', ds = devices(st), q = (st.aQd || '').toLowerCase();
  const cnt = s => ds.filter(d => d.status === s).length;
  const list = ds.filter(d => (f === 'all' || d.status === f) && (!q || (d.id + d.type + d.who).toLowerCase().includes(q)));
  return `<main class="page plw" id="main-content">
    ${pageHead('Device management', 'Monitor and manage all connected devices.', addBtn('device', 'Add device'), BACK)}
    <div class="ktiles">${tile('device', ds.length, 'Total devices', '/patient/a-devices')}${tile('check', cnt('Online'), 'Online', '/patient/a-devices')}${tile('wifiOff', cnt('Offline'), 'Offline', '/patient/a-devices')}${tile('warn', cnt('Issue'), 'Issues', '/patient/a-devices')}</div>
    ${search('aqd', 'Search by device ID, type or patient', st.aQd, 'aqd')}
    ${tabsRow('Status', [['all', 'All'], ['Online', 'Online'], ['Offline', 'Offline'], ['Issue', 'Issues']], f, 'a-df')}
    <div class="list">${list.map(d => `<div class="item tr" style="--cols:1.5fr 1.4fr 1.3fr 80px 1fr auto">
      <span class="tc main"><span class="t">${esc(d.id)}</span><br><span class="s">${esc(d.type)} · ${esc(d.who)}</span></span>
      <span class="tc opt s">${esc(d.type)}</span><span class="tc opt s">${esc(d.who)}</span><span class="tc opt s">${d.battery}%</span><span class="tc opt s">${esc(d.sync)}</span><span class="tc end">${devChip(d.status)}</span></div>`).join('') || '<p class="muted">No devices match.</p>'}</div></main>`;
}

/* ───────── programmes ───────── */
export function programmesView(st) {
  const f = st.aPf || 'Active', pg = programmes(st), n = k => pg.filter(p => p.status === k).length;
  return `<main class="page" id="main-content">
    ${pageHead('Programme management', 'Create and manage care programmes.', addBtn('programme', 'New programme'), BACK)}
    <div class="ktiles">${tile('book', n('Active'), 'Active programmes', '/patient/a-programmes')}${tile('clock', n('Draft'), 'Draft', '/patient/a-programmes')}${tile('plan', n('Archived'), 'Archived', '/patient/a-programmes')}${tile('users', pg.reduce((a, p) => a + p.enrolled, 0), 'Total enrolled', '/patient/a-analytics')}</div>
    ${tabsRow('Status', [['Active', `Active (${n('Active')})`], ['Draft', `Draft (${n('Draft')})`], ['Archived', `Archived (${n('Archived')})`]], f, 'a-pf')}
    <div class="grid g2 g-d3 tgrid">${pg.filter(p => p.status === f).map(p => `<div class="card hover col" style="gap:8px"><div class="row sb"><span class="ibox">${icon(p.ic)}</span>${p.status === 'Active' ? ok('Active') : neu(p.status)}</div><h2 class="h2">${esc(p.name)}</h2><p class="tiny">${p.enrolled} enrolled</p></div>`).join('') || '<p class="muted">Nothing here yet.</p>'}</div></main>`;
}

/* ───────── system alerts & incidents ───────── */
export function alertsView(st) {
  const f = st.aAf || 'all', all = incidents(st), n = k => all.filter(a => k === 'all' ? !a.resolved : k === 'resolved' ? a.resolved : a.sev === k && !a.resolved).length;
  const list = all.filter(a => f === 'resolved' ? a.resolved : !a.resolved && (f === 'all' || a.sev === f));
  return `<main class="page" id="main-content">
    ${pageHead('System alerts & incidents', 'Monitor, triage and resolve system-wide alerts.', `<button class="link" data-act="a-resolve-all">Mark all as resolved</button>`, BACK)}
    ${tabsRow('Severity', [['all', `All (${n('all')})`], ['critical', `Critical (${n('critical')})`], ['warning', `Warning (${n('warning')})`], ['info', `Info (${n('info')})`], ['resolved', `Resolved (${n('resolved')})`]], f, 'a-af')}
    <div class="list">${list.length ? list.map(a => `<div class="item calert ${a.resolved ? 'done' : ''}"><span class="ibox sev-${a.sev}">${icon({ critical: 'octagon', warning: 'warn', info: 'info' }[a.sev], 'sm')}</span><span class="grow clink" style="cursor:default"><span class="t">${esc(a.title)}</span><br><span class="s">${esc(a.who)} · ${esc(a.value)} · ${esc(a.when)}</span></span>
      <span class="cacts">${statusChip(a.sev)}${a.resolved ? ok('Resolved') : `<button class="btn ghost sm" data-act="a-resolve" data-id="${a.id}" aria-label="Resolve ${esc(a.title)}">Resolve</button>`}</span></div>`).join('') : '<p class="muted">Nothing in this group.</p>'}</div></main>`;
}

/* ───────── analytics ───────── */
export function analytics(st) {
  const t = st.aTab || 'trends', us = users(st), ds = devices(st), pg = programmes(st).filter(p => p.status === 'Active');
  const on = ds.filter(d => d.status === 'Online').length, adh = Math.round(on / ds.length * 100);
  const labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], vals = [2, 3, 3, 4, 5, 6, us.filter(u => u.role === 'Patient').length];
  const tot = pg.reduce((a, p) => a + p.enrolled, 0) || 1, cols = ['var(--sev-i)', 'var(--chart-1)', 'var(--sev-w)', 'var(--sev-c)', 'var(--chart-2)'];
  const parts = pg.map((p, i) => ({ l: p.name, c: cols[i % 5], n: p.enrolled }));
  let body;
  if (t === 'trends') body = `<section class="card col"><h2 class="h2">Patient enrolment trend</h2>${st.vTable ? dataTable({ labels, values: vals, head: ['Month', 'Patients'], unit: '' }) : lineChart({ labels, values: vals, unit: 'patients', title: 'Patient enrolment' })}<div class="row sb"><p class="cap">Sample data for prototype review.</p><button class="link" data-act="vtable">${st.vTable ? 'Show chart' : 'View as table'}</button></div></section>`;
  else if (t === 'devices') body = `<section class="card col"><h2 class="h2">Device usage</h2><div class="row" style="gap:20px;flex-wrap:wrap;justify-content:center">${donut([['Online', 'var(--chart-1)'], ['Offline', 'var(--sev-c)'], ['Issue', 'var(--sev-w)']].map(([l, c]) => ({ l, c, n: ds.filter(d => d.status === l).length })), 'devices', 'Devices by status')}<ul class="legend">${['Online', 'Offline', 'Issue'].map((l, i) => `<li><i style="background:${['var(--chart-1)', 'var(--sev-c)', 'var(--sev-w)'][i]}"></i><span>${l}</span><b>${ds.filter(d => d.status === l).length}</b></li>`).join('')}</ul></div></section>`;
  else body = `<section class="card col"><h2 class="h2">Programme distribution</h2><div class="row" style="gap:20px;flex-wrap:wrap;justify-content:center">${donut(parts, 'patients', 'Patients by programme')}<ul class="legend">${parts.map(p => `<li><i style="background:${p.c}"></i><span>${esc(p.l)}</span><b>${Math.round(p.n / tot * 100)}%</b></li>`).join('')}</ul></div></section>`;
  return `<main class="page" id="main-content">
    ${pageHead('Analytics & reports', 'Explore data insights and generate reports.', `<button class="btn ghost sm" data-act="toast" data-msg="Report export started… (prototype)">Export</button>`, BACK)}
    <div class="ktiles">${tile('users', us.filter(u => u.role === 'Patient').length, 'Total patients', '/patient/a-patients')}${tile('plan', us.filter(u => u.role === 'Clinician').length, 'Active clinicians', '/patient/a-clinicians')}${tile('device', adh + '%', 'Device adherence', '/patient/a-devices')}${tile('book', pg.length, 'Active programmes', '/patient/a-programmes')}</div>
    ${tabsRow('Report', [['trends', 'Patient trends'], ['devices', 'Device usage'], ['programmes', 'Programme outcomes']], t, 'a-tab')}${body}</main>`;
}

/* ───────── health content ───────── */
export function contentView(st) {
  const f = st.aCf || 'all', q = (st.aQc || '').toLowerCase(), all = content(st);
  const list = all.filter(c => (f === 'all' || c.type === f) && (!q || (c.title + c.topic).toLowerCase().includes(q)));
  return `<main class="page plw" id="main-content">
    ${pageHead('Health content', 'Manage educational content and resources.', addBtn('content', 'Add content'), BACK)}
    ${search('aqc', 'Search content by title or topic', st.aQc, 'aqc')}
    ${tabsRow('Type', [['all', `All (${all.length})`], ['Article', 'Articles'], ['Guide', 'Guides'], ['Video', 'Videos']], f, 'a-cf')}
    <div class="list">${list.map(c => `<div class="item tr" style="--cols:2.4fr 1fr 1.4fr 1.2fr auto auto"><span class="tc main"><span class="t">${esc(c.title)}</span><br><span class="s">${esc(c.type)} · ${esc(c.topic)}</span></span>
      <span class="tc opt s">${esc(c.type)}</span><span class="tc opt s">${esc(c.topic)}</span><span class="tc opt s">${esc(c.updated)}</span><span class="tc end">${c.published ? ok('Published') : neu('Draft', 'clock')}</span>
      <button class="btn ghost sm" data-act="a-pub" data-id="${c.id}">${c.published ? 'Unpublish' : 'Publish'}</button></div>`).join('') || '<p class="muted">No content matches.</p>'}</div></main>`;
}

/* ───────── configuration ───────── */
const cfgSw = (k, label, desc, on) => `<div class="row sb item" style="gap:14px"><span class="grow"><span class="t" id="l-${k}">${label}</span><br><span class="s" id="d-${k}">${desc}</span></span><button class="toggle" role="switch" aria-checked="${on}" aria-labelledby="l-${k}" aria-describedby="d-${k}" data-act="a-sw" data-k="${k}"></button></div>`;
export function config(st) {
  const c = { reg: true, invite: true, escalate: true, email: true, push: true, ...(st.aCfg || {}) }, t = st.aCt || 'general';
  const ro = (l, v) => `<div class="field"><label>${l}</label><div class="input ro">${esc(v)}</div></div>`;
  const body = t === 'general' ? `<section class="card col"><h2 class="h2">Platform</h2><div class="grid g2 g-d2">${ro('Platform name', 'NestWell')}${ro('Timezone', '(UTC+5:30) India Standard Time')}${ro('Date format', '14 Oct 2026')}${ro('Measurement units', 'Metric (kg, cm, mmHg)')}${ro('Default language', 'English')}</div></section>
      <section class="card col"><h2 class="h2">Access</h2><div class="list">${cfgSw('reg', 'Enable patient registration', 'Let patients register with their care provider’s code', c.reg)}${cfgSw('invite', 'Enable clinician invitations', 'Allow admins to invite clinicians by email', c.invite)}${cfgSw('escalate', 'Automated alert escalation', 'Escalate unreviewed critical alerts after 30 minutes', c.escalate)}</div></section>`
    : t === 'notify' ? `<section class="card col"><h2 class="h2">Notifications</h2><div class="list">${cfgSw('email', 'Email notifications', 'Send summaries and incident emails', c.email)}${cfgSw('push', 'Push notifications', 'Send alerts to the mobile apps', c.push)}</div></section>`
    : `<section class="card col"><h2 class="h2">Integrations</h2><div class="list">${[['Hospital records (HL7 / FHIR)', 'Syncs patient records with the care provider'], ['SMS gateway', 'Sends appointment and alert text messages'], ['Single sign-on', 'Sign in with the hospital directory']].map(([a, b]) => `<div class="item"><span class="grow"><span class="t">${a}</span><br><span class="s">${b}</span></span>${neu('Not connected', 'wifiOff')}</div>`).join('')}</div></section>`;
  return `<main class="page" id="main-content">
    ${pageHead('System configuration', 'Configure platform settings and preferences.', '', BACK)}
    ${tabsRow('Section', [['general', 'General'], ['notify', 'Notifications'], ['integrations', 'Integrations']], t, 'a-ct')}${body}</main>`;
}

/* ───────── audit logs ───────── */
export function auditView(st) {
  const q = (st.aQa || '').toLowerCase(), list = audit.filter(a => !q || Object.values(a).join(' ').toLowerCase().includes(q));
  return `<main class="page plw" id="main-content">
    ${pageHead('Audit logs', 'Track system activity and changes.', `<button class="btn ghost sm" data-act="toast" data-msg="Audit log export started… (prototype)">Export</button>`, BACK)}
    ${search('aqa', 'Search by user, action or detail', st.aQa, 'aqa')}
    <div class="list">${list.map(a => `<div class="item tr" style="--cols:1.4fr 1.2fr .8fr 1.2fr 2fr"><span class="tc main"><span class="t">${esc(a.detail)}</span><br><span class="s">${esc(a.who)} · ${esc(a.when)}</span></span>
      <span class="tc opt s">${esc(a.when)}</span><span class="tc opt s">${esc(a.who)}</span><span class="tc opt">${neu(esc(a.action), 'check')}</span><span class="tc opt s">${esc(a.entity)}</span></div>`).join('') || '<p class="muted">No entries match.</p>'}</div></main>`;
}

/* ───────── help & support ───────── */
export function support(st) {
  const q = (st.aQs || '').toLowerCase();
  return `<main class="page" id="main-content" style="max-width:820px;margin:0 auto;width:100%">
    ${pageHead('Help & support', 'Find answers or raise a support request.', '', BACK)}
    ${search('aqs', 'Search for help articles', st.aQs, 'aqs')}
    ${faqs.map(([cat, qs]) => { const l = qs.filter(([a, b]) => !q || (a + b).toLowerCase().includes(q)); return l.length ? `<section class="card col"><h2 class="h2">${cat}</h2>${l.map(([a, b]) => `<details class="card flat"><summary style="min-height:44px;display:flex;align-items:center;font-weight:600;cursor:pointer">${esc(a)}</summary><p class="tiny" style="padding-bottom:8px">${esc(b)}</p></details>`).join('')}</section>` : ''; }).join('')}
    <div class="row" style="flex-wrap:wrap"><button class="btn ghost" data-act="toast" data-msg="Opening contact options… (prototype)">${icon('phone', 'sm')}Contact support</button><button class="btn primary" data-act="toast" data-msg="Support ticket form would open here. (prototype)">${icon('plus', 'sm')}Raise a ticket</button></div></main>`;
}

/* ───────── profile & settings ───────── */
export function profile(st) {
  const cp = providers.find(p => p.id === st.provider), th = st.theme;
  const ro = (l, v) => `<div class="field"><label>${l}</label><div class="input ro">${esc(v)}</div></div>`;
  return `<main class="page" id="main-content" style="max-width:820px;margin:0 auto;width:100%">
    ${pageHead('Profile & settings', 'Manage your profile and account preferences.', '', BACK)}
    <section class="card col" style="align-items:center;text-align:center">${avatar('RD', 'lg')}<h2 class="h2">Rohan Deshmukh</h2><p class="tiny">System administrator${cp ? ' · ' + esc(cp.name) + ', ' + esc(cp.area) : ''}</p></section>
    <section class="card col"><h2 class="h2">Account</h2><div class="grid g2 g-d2">${ro('Full name', 'Rohan Deshmukh')}${ro('Role', 'System administrator')}${ro('Email', 'rohan.deshmukh@example.com')}${ro('Language', 'English')}</div></section>
    <section class="card col" aria-labelledby="th"><h2 class="h2" id="th">Appearance</h2><div class="tabs" role="tablist" aria-label="Theme">${[['light', 'Light', 'sun'], ['dark', 'Dark', 'moon'], ['system', 'System', 'gear']].map(([k, l, i]) => `<button role="tab" aria-selected="${th === k}" data-act="theme" data-v="${k}">${icon(i, 'sm')} ${l}</button>`).join('')}</div></section>
    <button class="btn ghost" data-act="logout" style="align-self:flex-start">${icon('logout', 'sm')}Log out</button></main>`;
}

/* ───────── add sheet ───────── */
const FIELDS = {
  user: ['Add user', [['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['role', 'Role', ['Clinician', 'Patient', 'Admin']]]],
  device: ['Add device', [['id', 'Device ID', 'text', 'e.g. NW-BP-0500'], ['type', 'Type', ['Blood pressure monitor', 'Pulse oximeter', 'Thermometer', 'Glucose monitor', 'ECG monitor', 'Smart scale']]]],
  programme: ['New programme', [['name', 'Programme name', 'text']]],
  content: ['Add content', [['title', 'Title', 'text'], ['type', 'Type', ['Article', 'Guide', 'Video']]]],
};
export function addSheet(st) {
  if (!st.aAdd || !FIELDS[st.aAdd.k]) return '';
  const [title, fields] = FIELDS[st.aAdd.k];
  return `<div class="scrim" data-act="a-add-scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="as-t"><div class="row sb"><h2 class="h2" id="as-t">${title}</h2><button class="btn ghost sm" data-act="a-add-close" aria-label="Close">${icon('close', 'sm')}</button></div>
    <form class="col" data-form="aadd" novalidate>${fields.map(([k, l, t, ph]) => `<div class="field"><label for="af-${k}">${l}</label>${Array.isArray(t) ? `<select id="af-${k}" name="${k}" class="input">${t.map(o => `<option ${k === 'role' && o === st.aAdd.role ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<input id="af-${k}" name="${k}" class="input" type="${t}" placeholder="${ph || ''}" autocomplete="off">`}<span class="cap" role="alert" id="ae-${k}"></span></div>`).join('')}
      <div class="row"><button class="btn primary" type="submit">Save</button><button class="btn ghost" type="button" data-act="a-add-close">Cancel</button></div></form></div></div>`;
}
export function submitAdd(f) {
  const k = get().aAdd.k, [, fields] = FIELDS[k], data = {};
  let bad = false;
  fields.forEach(([n, l, t]) => { const el = f.querySelector(`[name="${n}"]`), v = el.value.trim(), e = f.querySelector('#ae-' + n); data[n] = v; if (!v) { e.textContent = `Enter ${l.toLowerCase()}.`; bad = true; } else e.textContent = ''; });
  if (bad) { f.querySelector('input:invalid, input').focus(); return; }
  const item = k === 'device' ? { id: data.id, type: data.type } : data;
  set(s => ({ aAdd: null, aAddList: { ...(s.aAddList || {}), [k]: [...((s.aAddList || {})[k] || []), item] } }));
  document.dispatchEvent(new CustomEvent('toast', { detail: 'Added. (prototype)' }));
}

/* ───────── actions ───────── */
export const acts = {
  'a-uf': el => set({ aUf: el.dataset.v }), 'a-df': el => set({ aDf: el.dataset.v }), 'a-pf': el => set({ aPf: el.dataset.v }), 'a-af': el => set({ aAf: el.dataset.v }),
  'a-cf': el => set({ aCf: el.dataset.v }), 'a-tab': el => set({ aTab: el.dataset.v }), 'a-ct': el => set({ aCt: el.dataset.v }),
  'a-open-user': el => { const r = users(get()).find(x => x.id === el.dataset.id); set({ aUid: el.dataset.id }); location.hash = r && r.role === 'Patient' ? '#patient-a-patient' : '#patient-a-clinician'; },
  'a-toggle-user': el => set(s => ({ aInact: { ...(s.aInact || {}), [el.dataset.id]: !(s.aInact || {})[el.dataset.id] } })),
  'a-resolve': el => set(s => ({ aRes: { ...(s.aRes || {}), [el.dataset.id]: true } })),
  'a-resolve-all': () => set(s => ({ aRes: Object.fromEntries(incidents(s).map(a => [a.id, true])) })),
  'a-pub': el => set(s => { const cur = content(s).find(c => c.id === el.dataset.id); return { aPub: { ...(s.aPub || {}), [el.dataset.id]: !(cur && cur.published) } }; }),
  'a-sw': el => set(s => ({ aCfg: { reg: true, invite: true, escalate: true, email: true, push: true, ...(s.aCfg || {}), [el.dataset.k]: !({ reg: true, invite: true, escalate: true, email: true, push: true, ...(s.aCfg || {}) })[el.dataset.k] } })),
  'a-add': el => set({ aAdd: { k: el.dataset.k, role: el.dataset.role || '' } }),
  'a-add-close': () => set({ aAdd: null }),
  'a-add-scrim': (el, ev) => { if (ev.target === el) set({ aAdd: null }); },
};
export const inputs = { aq: el => set({ aQ: el.value }), aqd: el => set({ aQd: el.value }), aqc: el => set({ aQc: el.value }), aqa: el => set({ aQa: el.value }), aqs: el => set({ aQs: el.value }) };
