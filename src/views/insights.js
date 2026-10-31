import { icon } from '../icons.js';
import { series, targets } from '../data.js';
import { lineChart, dataTable, stats } from '../charts.js';
import { set } from '../store.js';
import { pageHead } from './common.js';

export function insights(st) {
  const days = st.iDays || 'week';
  const sys = series('sys', days), dia = series('dia', days), hr = series('hr', days);
  const s = stats(sys.values), h = stats(hr.values);
  const logged = days === 'week' ? '6 of 7 days' : '26 of 30 days';
  return `<main class="page" id="main-content">
    ${pageHead('Insights & trends', 'Understand your progress over time.', `<div class="tabs" role="tablist" aria-label="Period" style="min-width:210px;align-self:flex-start">${[['week', '7 days'], ['month', '30 days']].map(([k, l]) => `<button role="tab" aria-selected="${k === days}" data-act="idays" data-v="${k}">${l}</button>`).join('')}</div>`, '/patient/home')}
    <div class="split">
      <section class="card col" aria-labelledby="bp-h"><div class="row sb"><h2 class="h2" id="bp-h">Blood pressure trend</h2><span class="cap">— Systolic &nbsp; - - Diastolic</span></div>
        ${st.vTable ? dataTable({ labels: sys.labels, values: sys.values, values2: dia.values, head: ['When', 'Systolic/Diastolic'], unit: 'mmHg' }) : lineChart({ labels: sys.labels, values: sys.values, values2: dia.values, unit: 'mmHg', title: 'Blood pressure', band: [90, 120] })}
        <div class="row sb" style="flex-wrap:wrap"><p class="cap">Shaded band: your target range, set by ${targets.bp.by}.</p><button class="link" data-act="vtable">${st.vTable ? 'Show chart' : 'View as table'}</button></div></section>
      <section class="col" aria-label="Highlights">
        <div class="card row" style="align-items:flex-start"><span class="ibox">${icon('shield')}</span><div><h3>Readings have been steady</h3><p class="tiny" style="margin-top:4px">Systolic averaged ${s.avg} mmHg (range ${s.min}–${s.max}). This describes your readings. It is not a diagnosis.</p></div></div>
        <div class="card row" style="align-items:flex-start"><span class="ibox info">${icon('clock')}</span><div><h3>Consistent monitoring</h3><p class="tiny" style="margin-top:4px">You logged readings on ${logged}. Regular readings help your care team see changes sooner.</p></div></div>
        <div class="card row" style="align-items:flex-start"><span class="ibox ok">${icon('heart')}</span><div><h3>Heart rate average ${h.avg} bpm</h3><p class="tiny" style="margin-top:4px">Between ${h.min} and ${h.max} bpm. Your care team’s range is 60–100 bpm.</p></div></div>
      </section>
    </div></main>`;
}
export const acts = { idays: el => set({ iDays: el.dataset.v }) };
