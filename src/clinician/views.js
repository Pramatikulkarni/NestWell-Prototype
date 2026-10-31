import { icon } from '../icons.js';
import { set, get } from '../store.js';
import { esc, pageHead, avatar, linkStatus } from '../views/common.js';
import { vcard } from '../views/common.js';
import { lineChart, dataTable, stats } from '../charts.js';
import { providers } from '../data.js';
import { patients, byId, alerts, seriesFor, WEEK, sampleThreads, team } from './data.js';

const go = to => `data-act="go" data-to="${to}"`;
const ini = n => n.replace(/^(Dr\.|Nurse)\s+/, '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const av = (name, cls = '', style = '') => avatar(name === 'Prakash Paul' ? 'PP' : name === 'Dr. Kavya Iyer' ? 'KI' : name === 'Dr. Ananya Rao' ? 'AR' : name === 'Dr. Arjun Menon' ? 'AM' : name === 'Nurse Priya' ? 'NP' : ini(name), cls, style);
export const openAlerts = st => alerts(st).filter(a => !a.reviewed).length;
export const statusChip = s => ({
  critical: `<span class="chip bad">${icon('octagon', 'sm')}Critical</span>`,
  warning: `<span class="chip warn">${icon('warn', 'sm')}Warning</span>`,
  follow: `<span class="chip info">${icon('clock', 'sm')}Follow-up</span>`,
  info: `<span class="chip info">${icon('info', 'sm')}Info</span>`,
  stable: `<span class="chip ok">${icon('check', 'sm')}Stable</span>`,
}[s]);
const sevIcon = s => ({ critical: 'octagon', warning: 'warn', info: 'info' }[s]);
const open = id => `data-act="c-open" data-id="${id}"`;
const pct = arr => { const a = arr[arr.length - 2], b = arr[arr.length - 1]; const d = Math.round((b - a) / a * 100); return (d > 0 ? '↑ ' : d < 0 ? '↓ ' : '→ ') + Math.abs(d) + '%'; };
export const tile = (ic, n, l, to, tone = '') => `<button class="card hover ktile ${tone}" ${go(to)}><span class="ibox">${icon(ic, 'sm')}</span><span class="kn stat">${n}</span><span class="kl">${l}</span></button>`;

const alertRow = a => `<div class="item calert ${a.reviewed ? 'done' : ''}">
  <span class="ibox sev-${a.sev}">${icon(sevIcon(a.sev), 'sm')}</span>
  <button class="grow clink" ${open(a.pid)}><span class="t">${esc(a.p.name)}</span><br><span class="s">${esc(a.title)} · ${esc(a.value)} · ${esc(a.when)}</span></button>
  <span class="cacts">${statusChip(a.sev)}${a.reviewed ? `<span class="chip ok">${icon('check', 'sm')}Reviewed</span>` : `<button class="btn ghost sm" data-act="c-review" data-id="${a.id}" aria-label="Mark alert for ${esc(a.p.name)} as reviewed">Review</button>`}</span></div>`;

const patientRow = p => `<button class="item prow" ${open(p.id)} aria-label="${esc(p.name)}, ${esc(p.cond)}, ${p.status}">${av(p.name)}
  <span class="grow"><span class="t">${esc(p.name)}</span><br><span class="s">${esc(p.mrn)} · ${p.age} · ${esc(p.cond)}</span></span>
  <span class="plast"><span class="s">Last reading</span><b>${esc(p.last)}</b></span>${statusChip(p.status)}${icon('chevR', 'sm')}</button>`;

/* ───────── dashboard ───────── */
export function dashboard(st) {
  const ps = patients(st), al = alerts(st), open_ = al.filter(a => !a.reviewed);
  const crit = open_.filter(a => a.sev === 'critical').length, pend = open_.filter(a => a.sev !== 'info').length, off = ps.filter(p => p.device === 'down').length;
  const bell = `<button class="iconbtn phone-only" ${go('/patient/c-alerts')} aria-label="Alerts, ${open_.length} open">${icon('bell')}${open_.length ? '<span class="dot"></span>' : ''}</button>`;
  const prio = ps.filter(p => ['critical', 'warning', 'follow'].includes(p.status));
  return `<main class="page" id="main-content">
    ${pageHead('Good morning, Dr. Kavya Iyer', 'Here’s what needs your attention today · Tue, 14 Oct 2026', bell)}
    <div class="ktiles">${tile('users', ps.length, 'Patients monitored', '/patient/c-patients')}${tile('octagon', crit, 'Critical alerts', '/patient/c-alerts', crit ? 'hot' : '')}${tile('clock', pend, 'Pending review', '/patient/c-alerts')}${tile('wifiOff', off, 'Devices offline', '/patient/c-patients')}</div>
    <div class="split">
      <section class="card col" aria-labelledby="ra-h"><div class="row sb"><h2 class="h2" id="ra-h">Recent alerts</h2><button class="link" ${go('/patient/c-alerts')}>View all</button></div>
        <div class="list">${open_.length ? open_.slice(0, 4).map(alertRow).join('') : `<p class="muted">All alerts reviewed. Nice work.</p>`}</div></section>
      <section class="card col" aria-labelledby="pp-h"><div class="row sb"><h2 class="h2" id="pp-h">Priority patients</h2><button class="link" ${go('/patient/c-patients')}>All patients</button></div>
        <div class="list">${prio.slice(0, 4).map(patientRow).join('')}</div></section>
    </div>
    <p class="cap">Sample data for prototype review. Prakash Paul’s readings update live from the patient app.</p></main>`;
}

/* ───────── patient list ───────── */
export function patientList(st) {
  const f = st.pFilter || 'all', q = (st.cQ || '').toLowerCase();
  const tabs = [['all', 'All'], ['risk', 'High risk'], ['follow', 'Follow-up'], ['stable', 'Stable']];
  const match = p => (f === 'all' || (f === 'risk' && ['critical', 'warning'].includes(p.status)) || (f === 'follow' && p.status === 'follow') || (f === 'stable' && p.status === 'stable'))
    && (!q || (p.name + p.mrn + p.cond).toLowerCase().includes(q));
  const list = patients(st).filter(match);
  return `<main class="page plw" id="main-content">
    ${pageHead('Patients', `${list.length} of ${patients(st).length} patients`, '', '/patient/c-dashboard')}
    <div class="field"><label class="sr-only" for="cq">Search patients</label><div class="searchbox">${icon('search', 'sm')}<input id="cq" class="input" data-input="cq" value="${esc(st.cQ || '')}" placeholder="Search by name, ID or condition" autocomplete="off"></div></div>
    <div class="tabs" role="tablist" aria-label="Filter patients">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${k === f}" data-act="c-pf" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="list">${list.length ? list.map(patientRow).join('') : '<p class="muted">No patients match.</p>'}</div></main>`;
}

/* ───────── patient (overview / vitals / timeline / care plan) ───────── */
const tiles = (st, p) => {
  const S = k => seriesFor(p, k);
  return `<div class="home-grid cgrid">
    ${vcard({ label: 'Heart rate', value: String(p.hr), unit: 'bpm', range: 'Target 60–100', delta: pct(S('hr')), ic: 'heart', live: p.live ? 'hr' : '', gauge: { min: 40, max: 140, lo: 60, hi: 100, v: p.hr }, to: '/patient/c-patient' })}
    ${vcard({ label: 'Blood pressure', value: `${p.sys}/${p.dia}`, unit: 'mmHg', range: 'Target 90–120 sys', delta: pct(S('sys')), ic: 'drop', gauge: { min: 70, max: 190, lo: 90, hi: 120, v: p.sys }, to: '/patient/c-patient' })}
    ${vcard({ label: 'SpO₂', value: String(p.spo2), unit: '%', range: 'Target 95–100', delta: pct(S('spo2')), ic: 'drop', live: p.live ? 'spo2' : '', gauge: { min: 85, max: 100, lo: 95, hi: 100, v: p.spo2 }, to: '/patient/c-patient' })}
    ${vcard({ label: 'Temperature', value: String(p.temp), unit: '°C', range: 'Target 36.1–37.2', delta: '→ 0%', ic: 'thermo', gauge: { min: 35, max: 39, lo: 36.1, hi: 37.2, v: p.temp }, to: '/patient/c-patient' })}</div>`;
};
const events = (st, p) => {
  if (p.id === 'p1') return st.notifications.slice(0, 5).map(n => ({ k: n.icon, t: n.title, d: n.body, w: n.ago }));
  return [{ k: 'warn', t: `${p.last} recorded`, d: `${p.cond} monitoring`, w: '2 min ago' }, { k: 'bell', t: 'Alert triggered', d: 'Reading outside the set range', w: '2 min ago' }, { k: 'check', t: 'Clinician notified', d: 'Added to your triage list', w: '2 min ago' }, { k: 'plan', t: 'Care plan updated', d: 'Monitoring schedule adjusted', w: '1 hour ago' }, { k: 'chat', t: 'Patient message', d: 'Sent an update from the app', w: '3 hours ago' }];
};

export function patient(st) {
  const p = byId(st, st.cPid), tab = st.cTab || 'overview', S = k => seriesFor(p, k);
  const tabs = [['overview', 'Overview'], ['vitals', 'Vitals & trends'], ['timeline', 'Timeline'], ['plan', 'Care plan']];
  const head = `<section class="card pad-lg row sb phead"><div class="row" style="gap:14px;min-width:0">${av(p.name, 'lg')}<div style="min-width:0"><h2 class="h2" style="font-size:18px">${esc(p.name)}</h2><p class="tiny">${esc(p.mrn)} · ${p.age} yrs · ${esc(p.sex)} · ${esc(p.cond)}</p><div class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap">${statusChip(p.status)}${p.device === 'down' ? `<span class="chip bad">${icon('wifiOff', 'sm')}Device not connected</span>` : `<span class="chip ok">${icon('check', 'sm')}Devices connected</span>`}</div></div></div>
    <div class="row" style="gap:8px"><button class="btn primary sm" data-act="c-msg" data-id="${p.id}">${icon('chat', 'sm')}Message</button><button class="btn ghost sm" data-act="toast" data-msg="Calling ${esc(p.name)}… (prototype)">${icon('phone', 'sm')}Call</button></div></section>`;
  let body = '';
  if (tab === 'overview') {
    const sys = S('sys'), dia = S('dia');
    body = `${tiles(st, p)}<div class="split"><section class="card col" aria-labelledby="bt"><h2 class="h2" id="bt">Blood pressure · 7 days</h2>${lineChart({ labels: WEEK, values: sys, values2: dia, unit: 'mmHg', title: 'Blood pressure', band: [90, 120] })}<p class="cap">Shaded band: target range. — Systolic, - - Diastolic.</p></section>
      <section class="card col"><h2 class="h2">Recent activity</h2><div class="list">${events(st, p).slice(0, 3).map(e => `<div class="item"><span class="ibox">${icon(e.k, 'sm')}</span><span class="grow"><span class="t">${esc(e.t)}</span><br><span class="s">${esc(e.d)}</span></span><span class="s">${esc(e.w)}</span></div>`).join('')}</div></section></div>`;
  } else if (tab === 'vitals') {
    const m = st.cMetric || 'hr', mm = { hr: ['Heart rate', 'bpm', [60, 100]], sys: ['Blood pressure', 'mmHg', [90, 120]], spo2: ['SpO₂', '%', [95, 100]] }[m];
    const a = S(m), b = m === 'sys' ? S('dia') : null, s = stats(a);
    body = `<div class="tabs" role="tablist" aria-label="Metric">${[['hr', 'Heart rate'], ['sys', 'Blood pressure'], ['spo2', 'SpO₂']].map(([k, l]) => `<button role="tab" aria-selected="${k === m}" data-act="c-metric" data-v="${k}">${l}</button>`).join('')}</div>
      <section class="card col"><div class="row" style="gap:22px;flex-wrap:wrap"><div><span class="stat">${s.avg}</span><span class="unit">${mm[1]} avg</span></div><div class="tiny">Min ${s.min} · Max ${s.max}</div></div>
        ${st.vTable ? dataTable({ labels: WEEK, values: a, values2: b && b.slice(), head: ['Day', mm[0]], unit: mm[1] }) : lineChart({ labels: WEEK, values: a, values2: b, unit: mm[1], title: mm[0] + ' trend', band: mm[2] })}
        <div class="row sb" style="flex-wrap:wrap"><p class="cap">Shaded band: target range for this patient.</p><button class="link" data-act="vtable">${st.vTable ? 'Show chart' : 'View as table'}</button></div></section>`;
  } else if (tab === 'timeline') {
    body = `<section class="card col"><h2 class="h2">Patient timeline</h2><ol class="tline">${events(st, p).map(e => `<li><span class="ibox">${icon(e.k, 'sm')}</span><span class="grow"><span class="t">${esc(e.t)}</span><br><span class="s">${esc(e.d)}</span></span><span class="s">${esc(e.w)}</span></li>`).join('')}</ol></section>`;
  } else {
    const tasks = p.id === 'p1' ? st.tasks : null;
    body = `<div class="split"><section class="card col"><h2 class="h2">${esc(p.cond)} monitoring</h2><div class="grid g2 g-d2"><div class="field"><label>Programme</label><div class="input ro">Cardiac health monitoring</div></div><div class="field"><label>Next review</label><div class="input ro">15 Nov 2026</div></div><div class="field"><label>Monitoring</label><div class="input ro">Daily BP and heart rate</div></div><div class="field"><label>Lifestyle</label><div class="input ro">Low sodium diet, regular exercise</div></div></div>
      <p class="cap">Primary goal: keep blood pressure within the target range set for this patient.</p></section>
      <section class="card col"><h2 class="h2">Today’s tasks</h2>${tasks ? `<div class="list">${tasks.slice(0, 6).map(t => `<div class="item ${t.done ? 'done' : ''}"><span class="check ${t.done ? 'on' : ''}">${icon('check', 'sm')}</span><span class="grow"><span class="t">${esc(t.title)}</span><br><span class="s">${esc(t.when)}</span></span>${t.done ? `<span class="chip ok done-chip">${icon('check', 'sm')}<span class="done-txt">Done</span></span>` : ''}</div>`).join('')}</div>` : '<p class="muted">Task detail is shown for the patient connected to the live prototype.</p>'}</section></div>`;
  }
  return `<main class="page" id="main-content">${pageHead('Patient', 'Review readings, trends and the care plan.', '', '/patient/c-patients')}${head}
    <div class="tabs" role="tablist" aria-label="Patient sections">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${k === tab}" data-act="c-tab" data-v="${k}">${l}</button>`).join('')}</div>${body}</main>`;
}

/* ───────── alerts & triage ───────── */
export function alertsView(st) {
  const f = st.cFilter || 'all', al = alerts(st), n = k => al.filter(a => k === 'all' || a.sev === k).length;
  const list = al.filter(a => f === 'all' || a.sev === f);
  return `<main class="page" id="main-content">
    ${pageHead('Alerts & triage', `${al.filter(a => !a.reviewed).length} open · ${al.filter(a => a.reviewed).length} reviewed`, `<button class="link" data-act="c-review-all">Mark all as reviewed</button>`, '/patient/c-dashboard')}
    <div class="tabs" role="tablist" aria-label="Severity">${[['all', 'All'], ['critical', 'Critical'], ['warning', 'Warning'], ['info', 'Info']].map(([k, l]) => `<button role="tab" aria-selected="${k === f}" data-act="c-af" data-v="${k}">${l} (${n(k)})</button>`).join('')}</div>
    <div class="list">${list.length ? list.map(alertRow).join('') : '<p class="muted">No alerts in this group.</p>'}</div></main>`;
}

/* ───────── messages & calls ───────── */
const thread = (st, p) => p.id === 'p1' ? st.messages.map(m => ({ from: m.from === 'them' ? 'me' : 'them', text: m.text, t: m.t })) : (st.cMsgs && st.cMsgs[p.id]) || sampleThreads[p.id] || [];
export function messagesView(st) {
  const ps = patients(st), p = byId(st, st.cThread || 'p1'), openT = !!st.cOpen;
  const last = q => { const t = thread(st, q); return t.length ? t[t.length - 1] : { text: 'No messages yet', t: '' }; };
  return `<main class="page cmsg ${openT ? 'is-open' : ''}" id="main-content" style="min-height:100%">
    ${pageHead('Messages & calls', 'Chat with your patients. Not for emergencies.', '', '/patient/c-dashboard')}
    <div class="cm-grid">
      <section class="list cm-list" aria-label="Conversations">${ps.map(q => `<button class="item ${q.id === p.id ? 'unread' : ''}" data-act="c-thread" data-id="${q.id}">${av(q.name)}<span class="grow"><span class="t">${esc(q.name)}</span><br><span class="s clip">${esc(last(q).text)}</span></span><span class="s">${esc(last(q).t)}</span></button>`).join('')}</section>
      <section class="card col cm-thread" aria-label="Conversation with ${esc(p.name)}" style="gap:10px">
        <div class="row sb"><div class="row"><button class="back iconback cm-back" data-act="c-thread-close" aria-label="Back to conversations">${icon('chevL')}</button>${av(p.name)}<div><h2 class="h2">${esc(p.name)}</h2><p class="cap">${esc(p.cond)} · ${esc(p.mrn)}</p></div></div>
          <div class="row" style="gap:6px"><button class="iconbtn round" data-act="toast" data-msg="Calling ${esc(p.name)}… (prototype)" aria-label="Voice call">${icon('phone', 'sm')}</button><button class="iconbtn round" data-act="toast" data-msg="Starting video call… (prototype)" aria-label="Video call">${icon('video', 'sm')}</button></div></div>
        <hr class="divider"><div class="col" role="log" aria-live="polite" id="thread" style="min-height:200px">${thread(st, p).map(m => `<div class="msg ${m.from}"><span>${esc(m.text)}</span><div class="cap" style="${m.from === 'me' ? 'color:inherit;opacity:.85' : ''}">${esc(m.t)}</div></div>`).join('')}</div>
        <form class="row" data-form="cmsg"><label class="sr-only" for="mi">Message</label><input id="mi" class="input" placeholder="Type a message" autocomplete="off"><button class="btn primary" type="submit" aria-label="Send">${icon('send', 'sm')}</button></form>
        <p class="cap">Messages are visible to the patient’s care team.</p></section></div></main>`;
}
export function sendC(form) {
  const i = form.querySelector('#mi'); const v = i.value.trim(); if (!v) return;
  const st = get(), id = st.cThread || 'p1', t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (id === 'p1') set(s => ({ messages: [...s.messages, { from: 'them', who: 'Care team', text: v, t }] }));
  else set(s => ({ cMsgs: { ...(s.cMsgs || {}), [id]: [...(((s.cMsgs || {})[id]) || sampleThreads[id] || []), { from: 'me', text: v, t }] } }));
}

/* ───────── reports & analytics ───────── */
export const donut = (parts, label = 'open alerts', ariaWhat = 'Open alerts by severity') => {
  const tot = parts.reduce((a, p) => a + p.n, 0) || 1, R = 52, C = 2 * Math.PI * R; let off = 0;
  return `<svg class="donut" viewBox="0 0 140 140" role="img" aria-label="${ariaWhat}: ${parts.map(p => p.n + ' ' + p.l).join(', ')}"><circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--surface-3)" stroke-width="18"/>
    ${parts.map(p => { const len = p.n / tot * C, el = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${p.c}" stroke-width="18" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`; off += len; return el; }).join('')}
    <text x="70" y="68" text-anchor="middle" class="dn">${tot}</text><text x="70" y="86" text-anchor="middle" class="dl">${label}</text></svg>`;
};
export function reports(st) {
  const ps = patients(st), al = alerts(st), openA = al.filter(a => !a.reviewed);
  const adh = Math.round(ps.filter(p => p.device === 'ok').length / ps.length * 100);
  const per = [6, 9, 7, 11, 8, 5, 4], mx = Math.max(...per);
  const parts = [['critical', 'Critical', 'var(--sev-c)'], ['warning', 'Warning', 'var(--sev-w)'], ['info', 'Info', 'var(--sev-i)']].map(([k, l, c]) => ({ l, c, k, n: openA.filter(a => a.sev === k).length }));
  return `<main class="page" id="main-content">
    ${pageHead('Reports & analytics', 'A summary of your patient group.', '', '/patient/c-dashboard')}
    <div class="ktiles">${tile('users', ps.length, 'Patients monitored', '/patient/c-patients')}${tile('bell', openA.length, 'Active alerts', '/patient/c-alerts')}${tile('device', adh + '%', 'Device adherence', '/patient/c-patients')}${tile('check', al.filter(a => a.reviewed).length, 'Alerts reviewed', '/patient/c-alerts')}</div>
    <div class="split"><section class="card col"><h2 class="h2">Alerts per day · last 7 days</h2>
      ${st.vTable ? dataTable({ labels: WEEK, values: per, head: ['Day', 'Alerts'], unit: '' }) : `<svg class="bars" viewBox="0 0 280 150" role="img" aria-label="Alerts per day: ${WEEK.map((d, i) => d + ' ' + per[i]).join(', ')}">${per.map((v, i) => `<rect x="${14 + i * 38}" y="${120 - v / mx * 100}" width="26" height="${v / mx * 100}" rx="7" fill="var(--chart-1)" opacity="${i === 3 ? 1 : .55}"/><text x="${27 + i * 38}" y="140" text-anchor="middle">${WEEK[i]}</text><text x="${27 + i * 38}" y="${114 - v / mx * 100}" text-anchor="middle" class="bv">${v}</text>`).join('')}</svg>`}
      <div class="row sb" style="flex-wrap:wrap"><p class="cap">Sample data for prototype review.</p><button class="link" data-act="vtable">${st.vTable ? 'Show chart' : 'View as table'}</button></div></section>
    <section class="card col"><h2 class="h2">Alert distribution</h2><div class="row" style="gap:20px;flex-wrap:wrap;justify-content:center">${donut(parts)}
      <ul class="legend">${parts.map(p => `<li><i style="background:${p.c}"></i><span>${p.l}</span><b>${p.n}</b></li>`).join('')}</ul></div></section></div></main>`;
}

/* ───────── care team ───────── */
export function teamView() {
  return `<main class="page" id="main-content">
    ${pageHead('Care team', 'Colleagues who share your patients.', '', '/patient/c-dashboard')}
    <div class="grid g2 g-d3 tgrid">${team.map(m => `<div class="card hover row">${av(m.name)}<div class="grow"><h2 class="h2">${esc(m.name)}</h2><p class="tiny">${esc(m.role)}</p><span class="chip ${m.tag === 'Off duty' ? 'info' : 'ok'}" style="margin-top:6px">${m.tag === 'Off duty' ? icon('clock', 'sm') : icon('check', 'sm')}${esc(m.tag)}</span></div>
      <button class="iconbtn round" data-act="toast" data-msg="Messaging ${esc(m.name)}… (prototype)" aria-label="Message ${esc(m.name)}">${icon('chat', 'sm')}</button></div>`).join('')}</div></main>`;
}

/* ───────── settings ───────── */
const sw = (id, label, desc, on) => `<div class="row sb item" style="gap:14px"><span class="grow"><span class="t" id="l-${id}">${label}</span><br><span class="s" id="d-${id}">${desc}</span></span><button class="toggle" role="switch" aria-checked="${on}" aria-labelledby="l-${id}" aria-describedby="d-${id}" data-act="c-sw" data-k="${id}"></button></div>`;
export function settingsView(st) {
  const c = { critical: true, warning: true, digest: false, ...(st.cSet || {}) }, th = st.theme;
  return `<main class="page" id="main-content" style="max-width:760px;margin:0 auto;width:100%">
    ${pageHead('Settings', 'Your preferences and account.', '', '/patient/c-dashboard')}
    <section class="card row" style="gap:14px">${avatar('KI', 'lg')}<div class="grow"><h2 class="h2">Dr. Kavya Iyer</h2><p class="tiny">Cardiologist · ${esc((providers.find(p => p.id === st.provider) || { name: 'Mumbai', area: '' }).name)}</p></div></section>
    <section class="card col" aria-labelledby="nt"><h2 class="h2" id="nt">Notifications</h2><div class="list">${sw('critical', 'Critical alerts', 'Notify me straight away', c.critical)}${sw('warning', 'Warning alerts', 'Include in my triage list', c.warning)}${sw('digest', 'Daily summary', 'Email a summary each morning', c.digest)}</div></section>
    <section class="card col" aria-labelledby="th"><h2 class="h2" id="th">Alert thresholds</h2><div class="list">${[['Heart rate', '60–100 bpm'], ['Blood pressure', '90/60–120/80 mmHg'], ['SpO₂', '95–100 %'], ['Temperature', '36.1–37.2 °C']].map(([a, b]) => `<div class="item"><span class="grow t">${a}</span><span class="s">${b}</span></div>`).join('')}</div><p class="cap">Ranges are set per patient in their care plan. These are the programme defaults.</p></section>
    <section class="card col" aria-labelledby="ap"><h2 class="h2" id="ap">Appearance</h2><div class="tabs" role="tablist" aria-label="Theme">${[['light', 'Light', 'sun'], ['dark', 'Dark', 'moon'], ['system', 'System', 'gear']].map(([k, l, i]) => `<button role="tab" aria-selected="${th === k}" data-act="theme" data-v="${k}">${icon(i, 'sm')} ${l}</button>`).join('')}</div></section>
    <button class="btn ghost" data-act="logout" style="align-self:flex-start">${icon('logout', 'sm')}Log out</button></main>`;
}

/* ───────── actions ───────── */
export const acts = {
  'c-open': el => { set({ cPid: el.dataset.id, cTab: 'overview', more: false }); location.hash = '#patient-c-patient'; },
  'c-tab': el => set({ cTab: el.dataset.v }),
  'c-metric': el => set({ cMetric: el.dataset.v }),
  'c-pf': el => set({ pFilter: el.dataset.v }),
  'c-af': el => set({ cFilter: el.dataset.v }),
  'c-review': el => set(s => ({ cRev: { ...(s.cRev || {}), [el.dataset.id]: true } })),
  'c-review-all': () => set(s => ({ cRev: Object.fromEntries(alerts(s).map(a => [a.id, true])) })),
  'c-msg': el => { set({ cThread: el.dataset.id, cOpen: true }); location.hash = '#patient-c-messages'; },
  'c-thread': el => set({ cThread: el.dataset.id, cOpen: true }),
  'c-thread-close': () => set({ cOpen: false }),
  'c-sw': el => set(s => ({ cSet: { critical: true, warning: true, digest: false, ...(s.cSet || {}), [el.dataset.k]: !({ critical: true, warning: true, digest: false, ...(s.cSet || {}) })[el.dataset.k] } })),
};
export const inputs = { cq: el => set({ cQ: el.value }) };
