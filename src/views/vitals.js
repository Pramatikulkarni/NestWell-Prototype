import { icon } from '../icons.js';
import { series, targets } from '../data.js';
import { lineChart, dataTable, stats } from '../charts.js';
import { set } from '../store.js';
import { esc, pageHead, syncChip, linkCard } from './common.js';

const M = {
  hr: { label: 'Heart rate', unit: 'bpm', key: 'hr', band: [60, 100] },
  bp: { label: 'Blood pressure', unit: 'mmHg', key: 'sys', key2: 'dia', band: [90, 120] },
  spo2: { label: 'SpO₂', unit: '%', key: 'spo2', band: [95, 100] },
  temp: { label: 'Temperature', unit: '°C', key: 'temp', band: [36.1, 37.2] },
};
const today = [
  ['Heart rate', '72', 'bpm', '10:20 AM', 'Pulse oximeter', 'synced'],
  ['Blood pressure', '118/76', 'mmHg', '7:40 AM', 'Blood pressure monitor', 'synced'],
  ['SpO₂', '98', '%', '7:42 AM', 'Pulse oximeter', 'synced'],
  ['Temperature', '36.6', '°C', '7:45 AM', 'Manual entry (approved)', 'synced'],
];

export function vitals(st) {
  const range = st.vRange || 'day', metric = st.vMetric || 'hr', m = M[metric];
  const a = series(m.key, range), b = m.key2 ? series(m.key2, range) : null;
  const s = stats(a.values);
  const mine = st.readings.filter(r => r.id !== 'r0').map(r => [M[r.metric].label, r.value, r.unit, r.at.replace('Today, ', ''), r.source, r.sync]);
  const rows = mine.concat(today);
  const stale = false;
  return `<main class="page" id="main-content">
    ${pageHead('Vitals', 'Your readings with their time, unit and source.', '', '/patient/home')}
    ${linkCard(st)}
    <div class="tabs" role="tablist" aria-label="Metric">${Object.entries(M).map(([k, v]) => `<button role="tab" aria-selected="${k === metric}" data-act="vmetric" data-v="${k}">${v.label}</button>`).join('')}</div>
    <div class="split">
      <section class="card col" aria-labelledby="trend-h">
        <div class="row sb" style="flex-wrap:wrap"><h2 class="h2" id="trend-h">${m.label} trend</h2>
          <div class="tabs" role="tablist" aria-label="Range" style="min-width:220px">${['day', 'week', 'month'].map(r => `<button role="tab" aria-selected="${r === range}" data-act="vrange" data-v="${r}">${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</div></div>
        <div class="row" style="gap:22px;flex-wrap:wrap"><div><span class="stat">${b ? Math.round((s.avg)) + '/' + Math.round(stats(b.values).avg) : s.avg}</span><span class="unit">${m.unit} avg</span></div><div class="tiny">Min ${s.min} · Max ${s.max}</div></div>
        ${st.vTable ? dataTable({ labels: a.labels, values: a.values, values2: b && b.values, head: ['When', m.label], unit: m.unit }) : lineChart({ labels: a.labels, values: a.values, values2: b && b.values, unit: m.unit, title: m.label + ' trend', band: m.band })}
        <div class="row sb" style="flex-wrap:wrap"><p class="cap">Shaded band: target range set by ${targets[metric].by}. Ranges are personal to you.</p><button class="link" data-act="vtable">${st.vTable ? 'Show chart' : 'View as table'}</button></div>
      </section>
      <section class="card col" aria-labelledby="today-h"><h2 class="h2" id="today-h">Today’s readings</h2>
        <div class="list">${rows.map(r => `<div class="item"><span class="grow"><span class="t">${esc(r[0])}</span><br><span class="s">${esc(r[3])} · ${esc(r[4])}</span></span><span style="text-align:right"><span class="stat" style="font-size:20px">${esc(r[1])}</span><span class="unit">${esc(r[2])}</span><br>${syncChip(r[5])}</span></div>`).join('')}</div>
      </section>
    </div></main>`;
}

export const acts = {
  vmetric: el => set({ vMetric: el.dataset.v }),
  vrange: el => set({ vRange: el.dataset.v }),
  vtable: () => set(s => ({ vTable: !s.vTable })),
};
