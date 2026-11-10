const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const MONTHS3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return rest + ',' + last3;
}

export function inr(n: number): string {
  const abs = Math.abs(n);
  const fixed = Number.isInteger(abs) ? String(abs) : abs.toFixed(2);
  const [whole, frac] = fixed.split('.');
  return '₹' + groupIndian(whole) + (frac ? '.' + frac : '');
}

export function signed(n: number, inc: boolean): string {
  return (inc ? '+ ' : '− ') + inr(n);
}

export const monthShort = (d: Date) => MONTHS[d.getMonth()];
export const month3 = (d: Date) => MONTHS3[d.getMonth()];
export const monthFull = (d: Date) => MONTHS_FULL[d.getMonth()];
export const dayMonth = (d: Date) => d.getDate() + ' ' + monthShort(d);
export const monthYear = (d: Date) => monthShort(d) + ' ' + d.getFullYear();

export function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  const day = out.getDate();
  out.setDate(1);
  out.setMonth(out.getMonth() + n);
  const lastDay = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
  out.setDate(Math.min(day, lastDay));
  return out;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const diff = daysBetween(d, now);
  const base = dayMonth(d).toUpperCase();
  if (diff === 0) return 'TODAY · ' + base;
  if (diff === 1) return 'YESTERDAY · ' + base;
  return base;
}

export function dateTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${dayMonth(d)} ${d.getFullYear()}, ${h}:${m} ${ap}`;
}

export function initialsOf(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, '');
  return (letters.slice(0, 2) || '··').toUpperCase();
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
