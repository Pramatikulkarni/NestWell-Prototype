import { icon, ecg, liveEcg } from '../icons.js';
import { series } from '../data.js';
import { esc, pageHead, linkCard, vcard, offlineBanner, emergencyNote } from './common.js';

export function home(st) {
  const next = st.tasks.find(t => !t.done);
  const done = st.tasks.filter(t => t.done).length;
  const last = st.readings[0];
  const flagged = last && last.flag === 'high';
  const unread = st.notifications.filter(n => n.unread).length;
  const bell = `<button class="iconbtn phone-only" data-act="go" data-to="/patient/notifications" aria-label="Notifications, ${unread} unread">${icon('bell')}${unread ? '<span class="dot"></span>' : ''}</button>`;
  const measurable = next && ['bp', 'spo2'].includes(next.kind);
  const bpv = parseInt(String(last && last.metric === 'bp' ? last.value : '118/76'), 10);
  return `<main class="page" id="main-content">
    ${pageHead('Good morning, Prakash', 'Here’s your health overview · Tue, 14 Oct 2026', bell)}
    ${linkCard(st)}
    ${next ? `<section class="card next row sb" aria-label="Your next task"><div class="row" style="min-width:0"><span class="ibox">${icon('plan')}</span><div><p class="eyebrow">Next task</p><h2 class="h2">${esc(next.title)}</h2><p class="tiny">${esc(next.when)} · ${done} of ${st.tasks.length} done today</p></div></div>
      <button class="btn primary" data-act="${measurable ? 'start-measure' : 'go'}" data-metric="${next.kind}" data-to="/patient/careplan">${measurable ? 'Start now' : 'Open care plan'}</button></section>`
      : `<section class="card pad-lg row"><span class="ibox ok">${icon('check')}</span><div><h2 class="h2">All tasks done for today</h2><p class="tiny">Nice work. Your next task appears tomorrow.</p></div></section>`}
    <div class="home-grid">
      ${vcard({ label: 'Heart rate', value: '72', count: 72, unit: 'bpm', range: 'Target 60–100', delta: '↑ 2%', ic: 'heart', live: 'hr', gauge: { min: 40, max: 140, lo: 60, hi: 100, v: 72 } })}
      ${vcard({ label: 'Blood pressure', value: last && last.metric === 'bp' ? last.value : '118/76', unit: 'mmHg', range: 'Target 90–120 sys', delta: '↓ 5%', ic: 'drop', gauge: { min: 70, max: 150, lo: 90, hi: 120, v: bpv } })}
      ${vcard({ label: 'SpO₂', value: '98', count: 98, unit: '%', range: 'Target 95–100', delta: '→ 0%', ic: 'drop', live: 'spo2', gauge: { min: 90, max: 100, lo: 95, hi: 100, v: 98 } })}
      ${vcard({ label: 'Steps', value: '6,240', count: 6240, unit: 'steps', range: 'Goal 10,000', delta: '↑ 12%', ic: 'steps', gauge: { min: 0, max: 10000, goal: 10000, v: 6240 } })}
      <section class="card plan col" aria-labelledby="plan-h"><div class="row sb"><h2 class="h2" id="plan-h">Today’s plan</h2><button class="link" data-act="go" data-to="/patient/careplan">View all</button></div>
        <div class="list">${st.tasks.slice(0, 4).map(t => `<button class="item ${t.done ? 'done' : ''}" data-act="toggle-task" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" ${st.popId === t.id ? 'data-pop' : ''}><span class="check ${t.done ? 'on' : ''}">${icon('check', 'sm')}</span><span class="grow"><span class="t">${esc(t.title)}</span><br><span class="s">${esc(t.when)}</span></span>${t.done ? '<span class="chip ok done-chip">' + icon('check', 'sm') + '<span class="done-txt">Done</span></span>' : ''}</button>`).join('')}</div>
        <p class="cap">Last reading: ${last ? esc(last.at) + ' · ' + esc(last.source) : 'none yet'}</p></section>
      <section class="card a2 col" aria-label="Status summary" style="gap:10px"><div class="row" style="align-items:flex-start"><span class="ibox ${flagged ? 'warn' : 'ok'}">${icon(flagged ? 'warn' : 'leaf')}</span>
        <div><h2 class="h2">${flagged ? 'A reading needs review' : 'You’re doing well'}</h2>
        <p class="tiny" style="margin-top:4px">${flagged ? 'Your latest reading is above the range set by Dr. Rao. Your care team has been notified. This is not a diagnosis.' : 'Your latest readings are within the ranges set by Dr. Rao. Keep up your routine.'}</p></div></div>
        <div class="livebox"><p class="cap"><span class="livepill"><i></i>Live</span> Heart rhythm · <b><span data-live-text="hr">72</span> bpm</b> · simulated for this prototype</p>${liveEcg()}</div>
        <button class="link" data-act="go" data-to="${flagged ? '/patient/notifications' : '/patient/insights'}" style="align-self:flex-start">${flagged ? 'See what to do next' : 'See your trends'}</button></section>
    </div>${emergencyNote()}</main>`;
}
export const acts = {};
