import { dayMonth, initialsOf, signed } from './format';
import { nextDue, type Rule, type Txn } from './store';

export const metaOf = (t: Txn) => [t.category, t.tag, t.payment].filter(Boolean).join(' · ');
export const txnInitials = (t: { name: string; initials?: string }) => t.initials ?? initialsOf(t.name);
export const txnAmount = (t: Txn) => signed(t.amount, t.inc);

export const byNewest = (a: Txn, b: Txn) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export function sortedRules(rules: Rule[], now = new Date()) {
  return rules
    .map((r) => ({ rule: r, due: nextDue(r, now) }))
    .sort((a, b) => a.due.getTime() - b.due.getTime());
}

export const dueLabel = (due: Date) => 'Due ' + dayMonth(due);
export const leadLabel = (lead: number) => (lead === 0 ? 'Same-day reminder' : `${lead}d reminder`);
