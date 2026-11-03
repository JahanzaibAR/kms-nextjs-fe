// Pure helpers to turn flat Strapi mandi-rate rows into the shapes the UI needs.
// Safe to import from both server and client components (no data fetching here).

export const KG_PER_MUN = 40;

export type RateRow = { date: string; subah: number; shaam: number };

export type DayRate = { day: number; subah: number; shaam: number };

export type MonthRates = {
  key: string; // "2026-11"
  label: string; // "November 2026"
  labelUrdu: string; // "نومبر 2026"
  year: number;
  monthIndex: number; // 0-based
  days: DayRate[];
};

export type Latest = {
  label: string;
  labelUrdu: string;
  subah: number;
  shaam: number;
  source: string;
};

export type RateMap = Record<string, { subah: number; shaam: number }>;

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_UR = [
  "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
  "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر",
];

export function monthAverage(m: MonthRates) {
  const n = m.days.length || 1;
  const subah = Math.round(m.days.reduce((s, d) => s + d.subah, 0) / n);
  const shaam = Math.round(m.days.reduce((s, d) => s + d.shaam, 0) / n);
  const all = m.days.flatMap((d) => [d.subah, d.shaam]);
  return {
    subah,
    shaam,
    kul: Math.round((subah + shaam) / 2),
    min: all.length ? Math.min(...all) : 0,
    max: all.length ? Math.max(...all) : 0,
    days: m.days.length,
  };
}

const RATE_SOURCE = "Mushtarika Committee · Karachi";

/** Build months, latest snapshot and a date->rate lookup from flat rows. */
export function buildMandiData(rows: RateRow[]): {
  months: MonthRates[];
  latest: Latest;
  rateMap: RateMap;
  latestMonthKey: string;
} {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));

  const rateMap: RateMap = {};
  const monthsByKey = new Map<string, MonthRates>();

  for (const row of sorted) {
    const [y, m, d] = row.date.split("-").map((n) => parseInt(n, 10));
    if (!y || !m || !d) continue;
    rateMap[row.date] = { subah: row.subah, shaam: row.shaam };

    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!monthsByKey.has(key)) {
      monthsByKey.set(key, {
        key,
        label: `${MONTHS_EN[m - 1]} ${y}`,
        labelUrdu: `${MONTHS_UR[m - 1]} ${y}`,
        year: y,
        monthIndex: m - 1,
        days: [],
      });
    }
    monthsByKey.get(key)!.days.push({ day: d, subah: row.subah, shaam: row.shaam });
  }

  const months = [...monthsByKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  const last = sorted[sorted.length - 1];

  const latest: Latest = last
    ? {
        label: formatLongDate(last.date),
        labelUrdu: formatLongDateUrdu(last.date),
        subah: last.subah,
        shaam: last.shaam,
        source: RATE_SOURCE,
      }
    : { label: "", labelUrdu: "", subah: 0, shaam: 0, source: RATE_SOURCE };

  return {
    months,
    latest,
    rateMap,
    latestMonthKey: months.length ? months[months.length - 1].key : "",
  };
}

export function rateForDate(rateMap: RateMap, date: Date): { subah: number; shaam: number } {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  return rateMap[key] ?? { subah: 0, shaam: 0 };
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return `${d} ${MONTHS_EN[m - 1]} ${y}`;
}

function formatLongDateUrdu(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return `${d} ${MONTHS_UR[m - 1]} ${y}`;
}
