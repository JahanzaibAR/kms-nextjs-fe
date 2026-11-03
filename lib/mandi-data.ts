// Karachi doodh mandi rates (Mushtarika Committee) — Rs per Mun.
// Snapshot as published on the source site; latest = 2 November 2026.

export type DayRate = { day: number; subah: number; shaam: number };

export type MonthRates = {
  key: string;
  label: string;
  labelUrdu: string;
  year: number;
  monthIndex: number; // 0-based
  days: DayRate[];
};

export const mandiMonths: MonthRates[] = [
  {
    key: "2026-09",
    label: "September 2026",
    labelUrdu: "ستمبر 2026",
    year: 2026,
    monthIndex: 8,
    days: [
      { day: 1, subah: 7200, shaam: 8000 },
      { day: 2, subah: 8000, shaam: 7200 },
      { day: 3, subah: 7200, shaam: 7500 },
      { day: 4, subah: 7800, shaam: 7300 },
      { day: 5, subah: 7600, shaam: 7700 },
      { day: 6, subah: 8000, shaam: 8100 },
      { day: 7, subah: 8200, shaam: 8800 },
      { day: 8, subah: 9500, shaam: 9500 },
      { day: 9, subah: 9300, shaam: 8500 },
      { day: 10, subah: 8500, shaam: 9500 },
      { day: 11, subah: 9300, shaam: 9800 },
      { day: 12, subah: 9300, shaam: 9000 },
      { day: 13, subah: 9200, shaam: 9000 },
      { day: 14, subah: 8500, shaam: 9000 },
      { day: 15, subah: 9200, shaam: 10000 },
      { day: 16, subah: 10500, shaam: 10500 },
      { day: 17, subah: 11000, shaam: 11000 },
      { day: 18, subah: 11000, shaam: 11500 },
      { day: 19, subah: 11500, shaam: 10000 },
      { day: 20, subah: 10000, shaam: 9300 },
      { day: 21, subah: 9500, shaam: 10000 },
      { day: 22, subah: 10000, shaam: 10000 },
      { day: 23, subah: 10200, shaam: 11500 },
      { day: 24, subah: 11500, shaam: 11500 },
      { day: 25, subah: 11000, shaam: 10200 },
      { day: 26, subah: 9800, shaam: 10000 },
      { day: 27, subah: 9500, shaam: 9200 },
      { day: 28, subah: 9000, shaam: 8200 },
      { day: 29, subah: 7200, shaam: 7500 },
      { day: 30, subah: 7800, shaam: 7500 },
    ],
  },
  {
    key: "2026-10",
    label: "October 2026",
    labelUrdu: "اکتوبر 2026",
    year: 2026,
    monthIndex: 9,
    days: [
      { day: 1, subah: 7800, shaam: 7800 },
      { day: 2, subah: 7600, shaam: 7400 },
      { day: 3, subah: 7200, shaam: 7200 },
      { day: 4, subah: 7000, shaam: 7300 },
      { day: 5, subah: 7300, shaam: 7300 },
      { day: 6, subah: 7600, shaam: 8000 },
      { day: 7, subah: 7500, shaam: 7300 },
      { day: 8, subah: 7400, shaam: 7500 },
      { day: 9, subah: 8000, shaam: 8300 },
      { day: 10, subah: 8800, shaam: 8400 },
      { day: 11, subah: 8000, shaam: 8000 },
      { day: 12, subah: 7500, shaam: 7200 },
      { day: 13, subah: 6800, shaam: 7500 },
      { day: 14, subah: 7900, shaam: 8000 },
      { day: 15, subah: 8000, shaam: 8400 },
      { day: 16, subah: 8800, shaam: 9200 },
      { day: 17, subah: 9000, shaam: 8600 },
      { day: 18, subah: 8000, shaam: 8000 },
      { day: 19, subah: 8200, shaam: 8800 },
      { day: 20, subah: 9200, shaam: 9600 },
      { day: 21, subah: 9500, shaam: 9000 },
      { day: 22, subah: 9200, shaam: 9200 },
      { day: 23, subah: 9200, shaam: 9200 },
      { day: 24, subah: 9000, shaam: 8200 },
      { day: 25, subah: 7800, shaam: 6800 },
      { day: 26, subah: 7000, shaam: 7200 },
      { day: 27, subah: 7200, shaam: 7000 },
      { day: 28, subah: 7000, shaam: 6800 },
      { day: 29, subah: 7000, shaam: 6600 },
      { day: 30, subah: 7000, shaam: 6400 },
      { day: 31, subah: 6200, shaam: 6000 },
    ],
  },
  {
    key: "2026-11",
    label: "November 2026",
    labelUrdu: "نومبر 2026",
    year: 2026,
    monthIndex: 10,
    days: [
      { day: 1, subah: 7000, shaam: 6500 },
      { day: 2, subah: 6500, shaam: 6500 },
    ],
  },
];

export const latest = {
  label: "2 November 2026",
  labelUrdu: "2 نومبر 2026",
  subah: 6500,
  shaam: 6500,
  source: "Mushtarika Committee · Karachi",
};

export function monthAverage(m: MonthRates) {
  const n = m.days.length;
  const subah = Math.round(m.days.reduce((s, d) => s + d.subah, 0) / n);
  const shaam = Math.round(m.days.reduce((s, d) => s + d.shaam, 0) / n);
  const all = m.days.flatMap((d) => [d.subah, d.shaam]);
  return {
    subah,
    shaam,
    kul: Math.round((subah + shaam) / 2),
    min: Math.min(...all),
    max: Math.max(...all),
    days: n,
  };
}

export const latestMonthKey = "2026-11";

export const KG_PER_MUN = 40;

// Lookup: Date -> { subah, shaam } from the published mandi data (0 = not published).
const rateMap: Record<string, { subah: number; shaam: number }> = {};
for (const m of mandiMonths) {
  for (const d of m.days) {
    const key = `${m.year}-${String(m.monthIndex + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    rateMap[key] = { subah: d.subah, shaam: d.shaam };
  }
}

export function rateForDate(date: Date): { subah: number; shaam: number } {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return rateMap[key] ?? { subah: 0, shaam: 0 };
}
