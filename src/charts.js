// Accessible SVG charts. Every chart ships with a text summary and a table alternative.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function lineChart({ labels, values, values2, unit = '', title = 'Trend', height = 190, band }) {
  const W = 560, H = height, L = 34, R = 10, T = 12, B = 24;
  const all = values.concat(values2 || []);
  let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.2 || 1; lo -= pad; hi += pad;
  const x = i => L + (i / (values.length - 1)) * (W - L - R);
  const y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const path = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const ticks = [lo + pad, (lo + hi) / 2, hi - pad];
  const step = Math.ceil(labels.length / 7);
  const bandRect = band ? `<rect x="${L}" y="${y(band[1])}" width="${W - L - R}" height="${Math.max(0, y(band[0]) - y(band[1]))}" fill="var(--brand)" opacity=".10"/>` : '';
  const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}: ${values[0]} to ${values[values.length - 1]} ${esc(unit)} across ${labels.length} points">
    ${ticks.map(t => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${Math.round(t * 10) / 10}</text>`).join('')}
    ${bandRect}
    <path class="area" d="${path(values)} L${x(values.length - 1)} ${H - B} L${L} ${H - B}Z"/>
    <path class="line" d="${path(values)}"/>
    ${values2 ? `<path class="line2" d="${path(values2)}"/>` : ''}
    ${values.map((v, i) => i % step === 0 ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(labels[i])}</text>` : '').join('')}
    <circle cx="${x(values.length - 1)}" cy="${y(values[values.length - 1])}" r="4.5" fill="var(--chart-1)" stroke="var(--surface)" stroke-width="2"/>
  </svg>`;
  return svg;
}

export function sparkline(values, label) {
  const W = 120, H = 46, lo = Math.min(...values), hi = Math.max(...values), s = hi - lo || 1;
  const p = values.map((v, i) => `${i ? 'L' : 'M'}${(i / (values.length - 1) * W).toFixed(1)} ${(H - 6 - ((v - lo) / s) * (H - 12)).toFixed(1)}`).join(' ');
  return `<svg class="spark chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} trend"><path class="area" d="${p} L${W} ${H}L0 ${H}Z"/><path class="line" d="${p}"/></svg>`;
}

export function dataTable({ labels, values, values2, head = ['When', 'Value'], unit = '' }) {
  return `<table class="data"><caption class="sr-only">Readings as a table</caption><thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${
    labels.map((l, i) => `<tr><td>${esc(l)}</td><td>${values[i]}${values2 ? '/' + values2[i] : ''} ${esc(unit)}</td></tr>`).join('')}</tbody></table>`;
}

export const stats = v => ({ min: Math.min(...v), max: Math.max(...v), avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length) });
