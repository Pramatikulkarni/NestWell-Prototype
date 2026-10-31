import { icon } from '../icons.js';
import { careplan } from '../data.js';
import { set } from '../store.js';
import { esc, pageHead } from './common.js';

export function careplanView(st) {
  const tab = st.cpTab || 'Overview';
  const done = st.tasks.filter(t => t.done).length;
  const pct = Math.round(done / st.tasks.length * 100);
  let body = '';
  if (tab === 'Overview') body = `<div class="split"><section class="card col" aria-labelledby="tt"><div class="row sb"><h2 class="h2" id="tt">Today’s tasks</h2><span class="chip">${done} of ${st.tasks.length} done</span></div>
      <div class="list">${st.tasks.map(t => `<button class="item ${t.done ? 'done' : ''}" data-act="toggle-task" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" ${st.popId === t.id ? 'data-pop' : ''}><span class="check ${t.done ? 'on' : ''}">${icon('check', 'sm')}</span><span class="grow"><span class="t">${esc(t.title)}</span><br><span class="s">${esc(t.when)}</span></span>${t.done ? '<span class="chip ok done-chip">' + icon('check', 'sm') + '<span class="done-txt">Done</span></span>' : ''}</button>`).join('')}</div></section>
      <section class="col"><div class="card col"><h3>Plan</h3><p class="h2">${esc(careplan.name)}</p><p class="tiny">${esc(careplan.period)} · Updated ${esc(careplan.updated)}</p><span class="chip ok" style="align-self:flex-start">${icon('check', 'sm')}${careplan.status}</span></div>
      <div class="card col"><h3>Progress today</h3><div class="steps" role="img" aria-label="${pct}% complete" style="height:10px"><i class="on" style="flex:${pct};border-radius:6px"></i><i style="flex:${100 - pct}"></i></div><p class="tiny">${pct}% complete</p></div></section></div>`;
  else if (tab === 'Goals') body = `<div class="goals">${careplan.goals.map(g => `<div class="card hover goal"><span class="ibox">${icon(g.icon)}</span><div><h3>${esc(g.title)}</h3><p class="tiny" style="margin-top:4px">${esc(g.body)}</p></div></div>`).join('')}</div>`;
  else body = `<section class="card col"><h2 class="h2">Progress this week</h2>${['Measurements completed', 'Medication taken', 'Activity goal'].map((l, i) => `<div class="col" style="gap:6px"><div class="row sb"><span>${l}</span><span class="tiny">${[86, 100, 62][i]}%</span></div><div class="steps" role="img" aria-label="${l} ${[86, 100, 62][i]}%" style="height:10px"><i class="on" style="flex:${[86, 100, 62][i]};border-radius:6px"></i><i style="flex:${100 - [86, 100, 62][i]}"></i></div></div>`).join('')}</section>`;
  return `<main class="page" id="main-content">${pageHead('My care plan', 'Set by your care team. Only your prescribed tasks appear here.', '', '/patient/home')}
    <div class="tabs" role="tablist" aria-label="Care plan sections" style="max-width:460px">${['Overview', 'Goals', 'Progress'].map(k => `<button role="tab" aria-selected="${k === tab}" data-act="cptab" data-v="${k}">${k}</button>`).join('')}</div>${body}
    <button class="link" style="align-self:flex-start" data-act="toast" data-msg="Explanation: your care team chose these tasks to track your condition between visits.">Why am I measuring this?</button></main>`;
}
export const acts = {
  cptab: el => set({ cpTab: el.dataset.v }),
  'toggle-task': el => { set(s => ({ popId: el.dataset.id, tasks: s.tasks.map(t => t.id === el.dataset.id ? { ...t, done: !t.done } : t) })); setTimeout(() => set({ popId: null }), 700); },
};
