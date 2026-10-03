/*
 * Illustrative demo book for the hero's Overview mock: one year of a small
 * treasury across four sources, priced in EUR. Invented, deterministic, and
 * internally consistent: the balance line, the activity dots, the average
 * cost, the stat tiles and the recent transactions all come from the same
 * events, so no figure on the screen contradicts another.
 *
 * Geometry targets the app's BTC activity chart at a 1440 × 949 window
 * (ui-tauri/src/components/overview-dashboard/BtcActivityChart.tsx): a 784 px
 * plot block with 64 px axes, 4 px margins and the recharts series styles.
 */

const DAY = 86_400_000;
export const START = Date.UTC(2025, 9, 3);
export const END = Date.UTC(2026, 9, 3);

type Flow = "incoming" | "outgoing" | "movement";
export type DemoEvent = { date: string; btc: number; flow: Flow; source: string };

/** Monthly price anchors in EUR, joined by a seeded wobble. */
const PRICE_ANCHORS: Array<[string, number]> = [
  ["2025-10-03", 72_400],
  ["2025-11-01", 66_800],
  ["2025-12-01", 70_100],
  ["2026-01-01", 76_900],
  ["2026-02-01", 74_200],
  ["2026-03-01", 81_500],
  ["2026-04-01", 79_300],
  ["2026-05-01", 86_700],
  ["2026-06-01", 84_100],
  ["2026-07-01", 90_800],
  ["2026-08-01", 93_600],
  ["2026-09-01", 91_200],
  ["2026-10-03", 98_412.07],
];

export const START_BALANCE = 0.3402;
const START_AVG_COST = 61_800;

export const EVENTS: DemoEvent[] = [
  { date: "2025-10-21", btc: 0.042, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2025-11-08", btc: 0.081, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2025-11-26", btc: 0.035, flow: "incoming", source: "Satoshi-Liquid" },
  { date: "2025-12-14", btc: -0.068, flow: "outgoing", source: "Satoshi-Onchain-Multi" },
  { date: "2026-01-05", btc: 0.125, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-01-22", btc: 0.03, flow: "incoming", source: "BTCPay Store" },
  { date: "2026-01-24", btc: 0.012, flow: "incoming", source: "Satoshi-Lightning" },
  { date: "2026-02-11", btc: 0.042, flow: "movement", source: "Satoshi-Liquid" },
  { date: "2026-02-27", btc: 0.056, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-03-18", btc: 0.088, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-04-06", btc: 0.045, flow: "incoming", source: "Satoshi-Liquid" },
  { date: "2026-04-08", btc: 0.021, flow: "incoming", source: "BTCPay Store" },
  { date: "2026-04-09", btc: 0.015, flow: "incoming", source: "Satoshi-Lightning" },
  { date: "2026-05-02", btc: 0.11, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-05-29", btc: -0.024, flow: "outgoing", source: "Satoshi-Lightning" },
  { date: "2026-06-20", btc: 0.065, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-07-11", btc: 0.092, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-07-13", btc: 0.12, flow: "movement", source: "Satoshi-Onchain-Multi" },
  { date: "2026-08-04", btc: 0.048, flow: "incoming", source: "Satoshi-Liquid" },
  { date: "2026-08-30", btc: 0.103, flow: "incoming", source: "BTCPay Store" },
  { date: "2026-09-17", btc: 0.037, flow: "incoming", source: "Satoshi-Onchain-Multi" },
  { date: "2026-09-28", btc: 0.031, flow: "incoming", source: "Satoshi-Lightning" },
];

/** A swap or internal move changes nothing but its network fee. */
const MOVE_FEE = 0.00004;

const time = (date: string) => Date.parse(`${date}T00:00:00Z`);

let seed = 20261003;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** Daily EUR price: anchors joined by smoothstep, plus a small seeded wobble. */
export const PRICES: Array<{ t: number; eur: number }> = (() => {
  const out: Array<{ t: number; eur: number }> = [];
  let wobble = 0;
  for (let t = START; t <= END; t += DAY) {
    const next = PRICE_ANCHORS.findIndex(([date]) => time(date) >= t);
    const [d1, p1] = PRICE_ANCHORS[Math.max(0, next)];
    const [d0, p0] = PRICE_ANCHORS[Math.max(0, next - 1)];
    const span = time(d1) - time(d0) || 1;
    const k = Math.min(1, Math.max(0, (t - time(d0)) / span));
    const eased = k * k * (3 - 2 * k);
    wobble = wobble * 0.82 + (rnd() - 0.5) * 0.022;
    // Pin both ends to the anchors so the tag and the tile agree to the cent.
    const pinned = t === END || t === START ? 0 : wobble;
    out.push({ t, eur: (p0 + (p1 - p0) * eased) * (1 + pinned) });
  }
  return out;
})();

const priceAt = (t: number) => PRICES[Math.min(PRICES.length - 1, Math.max(0, Math.round((t - START) / DAY)))].eur;

/** Balance and moving-average cost after each event, as stepAfter series. */
export const SERIES = (() => {
  let balance = START_BALANCE;
  let avgCost = START_AVG_COST;
  const balanceSteps = [{ t: START, v: balance }];
  const costSteps = [{ t: START, v: avgCost }];
  const markers: Array<DemoEvent & { t: number; balance: number }> = [];
  for (const event of EVENTS) {
    const t = time(event.date);
    if (event.flow === "incoming") {
      avgCost = (avgCost * balance + priceAt(t) * event.btc) / (balance + event.btc);
      balance += event.btc;
      costSteps.push({ t, v: avgCost });
    } else if (event.flow === "outgoing") {
      // Moving average: a disposal leaves the per-coin cost where it was.
      balance += event.btc;
    } else {
      balance -= MOVE_FEE;
    }
    balanceSteps.push({ t, v: balance });
    markers.push({ ...event, t, balance });
  }
  return { balanceSteps, costSteps, markers, balance, avgCost };
})();

export const FINAL_BALANCE = SERIES.balance;
export const FINAL_PRICE = PRICES[PRICES.length - 1].eur;
export const FINAL_AVG_COST = SERIES.avgCost;
export const NET_BTC = FINAL_BALANCE - START_BALANCE;
export const UNREALIZED_PCT = ((FINAL_PRICE - FINAL_AVG_COST) / FINAL_AVG_COST) * 100;

// ── Chart geometry ───────────────────────────────────────────
export const CHART = { width: 784, height: 325, x0: 68, x1: 716, y0: 12, y1: 287 };
const BTC_MAX = 1.4;
const EUR_MAX = 100_000;

const sx = (t: number) => CHART.x0 + ((t - START) / (END - START)) * (CHART.x1 - CHART.x0);
const syBtc = (v: number) => CHART.y1 - (v / BTC_MAX) * (CHART.y1 - CHART.y0);
const syEur = (v: number) => CHART.y1 - (v / EUR_MAX) * (CHART.y1 - CHART.y0);
const f = (n: number) => Math.round(n * 10) / 10;

function stepPath(steps: Array<{ t: number; v: number }>, sy: (v: number) => number) {
  let d = `M ${f(sx(steps[0].t))} ${f(sy(steps[0].v))}`;
  for (let i = 1; i < steps.length; i += 1) {
    d += ` H ${f(sx(steps[i].t))} V ${f(sy(steps[i].v))}`;
  }
  return `${d} H ${f(sx(END))}`;
}

export const PATHS = {
  balance: stepPath(SERIES.balanceSteps, syBtc),
  cost: stepPath(SERIES.costSteps, syEur),
  price: `M ${PRICES.map((p) => `${f(sx(p.t))} ${f(syEur(p.eur))}`).join(" L ")}`,
};

export const Y_TICKS = [0, 0.35, 0.7, 1.05, 1.4].map((v) => ({
  y: f(syBtc(v)),
  btc: `₿${v >= 1 ? v.toFixed(2) : v.toFixed(3)}`,
  eur: (v / BTC_MAX) * EUR_MAX,
}));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const X_TICKS = ["2025-11-01", "2026-01-01", "2026-03-01", "2026-05-01", "2026-07-01", "2026-09-01"].map((date) => {
  const t = time(date);
  const d = new Date(t);
  return { x: f(sx(t)), label: `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}` };
});

const FLOW_COLOR: Record<Flow, string> = { incoming: "#34d399", outgoing: "#f87171", movement: "#38bdf8" };

/**
 * Activity dots on the balance line, sized by volume on recharts' ZAxis area
 * range [80, 480]. Events a few pixels apart merge into one dot with a count;
 * mixed flows split it into slices.
 */
export const DOTS = (() => {
  const volumes = SERIES.markers.map((m) => Math.abs(m.btc));
  const lo = Math.min(...volumes);
  const hi = Math.max(...volumes);
  const groups: Array<typeof SERIES.markers> = [];
  for (const marker of SERIES.markers) {
    const last = groups[groups.length - 1];
    if (last && sx(marker.t) - sx(last[last.length - 1].t) < 7) last.push(marker);
    else groups.push([marker]);
  }
  return groups.map((group) => {
    const volume = group.reduce((sum, m) => sum + Math.abs(m.btc), 0);
    const area = 80 + ((Math.min(volume, hi) - lo) / (hi - lo || 1)) * 400;
    const r = Math.max(3, Math.sqrt(area / Math.PI));
    const anchor = group[group.length - 1];
    const cx = f(sx(anchor.t));
    const cy = f(syBtc(anchor.balance));
    const flows = [...new Set(group.map((m) => m.flow))];
    // Mixed flows: one slice per flow, in proportion to its volume.
    let angle = -Math.PI / 2;
    const slices =
      flows.length > 1
        ? flows.map((flow) => {
            const share = group.filter((m) => m.flow === flow).reduce((s, m) => s + Math.abs(m.btc), 0) / volume;
            const a0 = angle;
            const a1 = angle + share * Math.PI * 2;
            angle = a1;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            const p = (a: number) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
            return { color: FLOW_COLOR[flow], d: `M ${cx} ${cy} L ${p(a0)} A ${f(r)} ${f(r)} 0 ${large} 1 ${p(a1)} Z` };
          })
        : null;
    return { cx, cy, r: f(r), color: FLOW_COLOR[flows[0]], slices, count: group.length > 1 ? group.length : null };
  });
})();

/** Right-gutter and in-plot value tags, as LastValueTag draws them. */
export const TAGS = {
  balance: { y: f(syBtc(FINAL_BALANCE)), label: `₿${FINAL_BALANCE.toFixed(2)}` },
  price: { y: f(syEur(FINAL_PRICE)), label: groupThousands(Math.round(FINAL_PRICE)) },
  cost: { y: f(syEur(FINAL_AVG_COST)), label: groupThousands(Math.round(FINAL_AVG_COST)) },
};

export const tagWidth = (label: string) => Math.max(30, Math.round(label.length * 5.8) + 10);

/** The brush strip's mini balance area, in a 784 × 54 box with 68 px margins. */
export const BRUSH = (() => {
  const x0 = 68;
  const x1 = 716;
  const top = 9;
  const bottom = 53;
  const bx = (t: number) => x0 + ((t - START) / (END - START)) * (x1 - x0);
  const by = (v: number) => bottom - (v / BTC_MAX) * (bottom - top);
  const steps = SERIES.balanceSteps;
  let line = `M ${f(bx(steps[0].t))} ${f(by(steps[0].v))}`;
  for (let i = 1; i < steps.length; i += 1) line += ` H ${f(bx(steps[i].t))} V ${f(by(steps[i].v))}`;
  line += ` H ${x1}`;
  return { line, area: `${line} V ${bottom} H ${x0} Z`, x0, x1 };
})();

// ── Formatting, de-AT as the app's EUR book prints it ──────────
/** "25 000": de-AT groups thousands with a no-break space. */
export function groupThousands(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** "€ 98.412,07" */
export function eur(n: number, decimals = 2) {
  const [whole, frac] = n.toFixed(decimals).split(".");
  return `€ ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${frac ? `,${frac}` : ""}`;
}

export function btc(n: number, decimals = 8) {
  return `₿ ${n.toFixed(decimals)}`;
}

/** The latest eight receipts, newest first, priced at their own day. */
export const RECENT = EVENTS.filter((event) => event.flow === "incoming")
  .slice(-8)
  .reverse()
  .map((event, index) => {
    const t = time(event.date);
    const hour = 6 + ((index * 7) % 14);
    const minute = (index * 23 + 11) % 60;
    return {
      source: event.source,
      when: `${event.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      btc: btc(event.btc),
      eur: eur(event.btc * priceAt(t)),
    };
  });

export const HOLDINGS = [
  { name: "Satoshi-Onchain-Multi", btc: 1.0165, color: "#e5e5e5" },
  { name: "Satoshi-Liquid", btc: 0.1284, color: "#a7a7a7" },
  { name: "Satoshi-Lightning", btc: 0.0812, color: "#787878" },
  { name: "BTCPay Store", btc: 0.058, color: "#6e6e6e" },
];

/** Donut slices: inner 55 %, outer 90 %, 2° padding, as the recharts Pie. */
export const DONUT = (() => {
  const total = HOLDINGS.reduce((sum, h) => sum + h.btc, 0);
  const size = 136;
  const c = size / 2;
  const ro = (size / 2) * 0.9;
  const ri = (size / 2) * 0.55;
  const pad = (2 * Math.PI) / 180;
  let angle = -Math.PI / 2;
  return HOLDINGS.map((holding) => {
    const sweep = (holding.btc / total) * Math.PI * 2;
    const a0 = angle + pad / 2;
    const a1 = angle + sweep - pad / 2;
    angle += sweep;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (r: number, a: number) => `${f(c + r * Math.cos(a))} ${f(c + r * Math.sin(a))}`;
    return {
      ...holding,
      percent: Math.round((holding.btc / total) * 100),
      d: `M ${p(ro, a0)} A ${f(ro)} ${f(ro)} 0 ${large} 1 ${p(ro, a1)} L ${p(ri, a1)} A ${f(ri)} ${f(ri)} 0 ${large} 0 ${p(ri, a0)} Z`,
    };
  });
})();

export const DRIVERS = (() => {
  const incoming = EVENTS.filter((e) => e.flow === "incoming");
  const outgoing = EVENTS.filter((e) => e.flow === "outgoing");
  const moves = EVENTS.filter((e) => e.flow === "movement");
  const sum = (list: DemoEvent[]) => list.reduce((s, e) => s + Math.abs(e.btc), 0);
  const fees = moves.length * MOVE_FEE + 0.00000913;
  const rows = [
    { key: "incoming", label: "Incoming", count: incoming.length, btc: sum(incoming) },
    { key: "outgoing", label: "Outgoing", count: outgoing.length, btc: sum(outgoing) },
    { key: "swap", label: "Swap volume", count: moves.length, btc: sum(moves) },
    { key: "fees", label: "Fees", count: moves.length + 1, btc: fees },
  ];
  const max = Math.max(...rows.map((r) => r.btc));
  return {
    net: NET_BTC,
    count: EVENTS.length,
    rows: rows.map((r) => ({ ...r, width: Math.max((r.btc / max) * 100, 4) })),
  };
})();
