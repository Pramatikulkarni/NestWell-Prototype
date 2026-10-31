// Simulated real-time vitals: values drift slightly every 1.6 s, the ECG sweeps at the live heart rate.
// Prototype only: numbers are generated on this device, not read from a sensor.
const walk = { hr: 72, spo2: 98 };
const bounds = { hr: [64, 82], spo2: [96, 99] };
let timer = null;

const step = k => {
  const [lo, hi] = bounds[k];
  const d = k === 'hr' ? (Math.random() * 4 - 2) : (Math.random() < .35 ? (Math.random() < .5 ? -1 : 1) : 0);
  walk[k] = Math.round(Math.min(hi, Math.max(lo, walk[k] + d)));
  return walk[k];
};

function tick() {
  const hr = step('hr'), spo2 = step('spo2');
  const val = { hr, spo2 };
  document.querySelectorAll('[data-live]').forEach(el => {
    const k = el.dataset.live, v = val[k];
    const out = el.querySelector('.stat');
    if (out && !out.dataset.counting) out.textContent = v;
    const mark = el.querySelector('.gauge .mark');
    if (mark) { const mn = +el.dataset.min, mx = +el.dataset.max; mark.style.left = Math.max(0, Math.min(100, (v - mn) / (mx - mn) * 100)) + '%'; }
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  });
  document.querySelectorAll('[data-live-text="hr"]').forEach(el => { el.textContent = hr; });
  document.querySelectorAll('.live-ecg').forEach(el => {
    el.style.setProperty('--beat', (3 * 60 / hr).toFixed(2) + 's');
    el.style.setProperty('--bpm-s', (60 / hr).toFixed(2) + 's');
  });
}

export function startLive() {
  if (timer) return;
  timer = setInterval(() => { if (!document.hidden) tick(); }, 1600);
}
export const liveNow = () => ({ ...walk });
export const refreshLive = () => tick();
