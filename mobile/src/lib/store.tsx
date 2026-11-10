import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { addMonths, daysBetween, startOfDay } from './format';

export type Txn = {
  id: string;
  name: string;
  initials?: string;
  category: string;
  tag?: string;
  payment?: string;
  amount: number;
  inc: boolean;
  date: string;
  source: 'Scanned receipt' | 'Manual entry';
  recurring: boolean;
  note?: string;
  receiptUri?: string;
  seed?: boolean;
};

export type ListItem = { id: string; text: string; meta: string; price?: number; done: boolean };
export type Cadence = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type Tone = 'neutral' | 'amber' | 'green';
export type Rule = {
  id: string;
  name: string;
  initials?: string;
  amount: number;
  cadence: Cadence;
  anchor: string;
  lead: number;
  tone: Tone;
};
export type Named = { name: string; initials?: string; base: number };

export type State = {
  onboarded: boolean;
  signedIn: boolean;
  name: string;
  email: string;
  txns: Txn[];
  todo: ListItem[];
  shopping: ListItem[];
  rules: Rule[];
  catsExpense: Named[];
  catsIncome: Named[];
  tags: Named[];
  settings: { notif: boolean; dark: boolean; backup: boolean };
};

const KEY = 'trackmypurse.state.v1';
let counter = 0;
export const uid = () => Date.now().toString(36) + '-' + (counter++).toString(36);

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

function thisMonthOn(day: number): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day).toISOString();
}

function seedState(): State {
  const t = (
    name: string, initials: string, category: string, amount: number, inc: boolean, h: number,
    extra: Partial<Txn> = {},
  ): Txn => ({
    id: uid(), name, initials, category, amount, inc, date: hoursAgo(h),
    source: 'Manual entry', recurring: false, seed: true, ...extra,
  });
  return {
    onboarded: false,
    signedIn: false,
    name: 'Ananya Rao',
    email: 'ananya.rao@gmail.com',
    txns: [
      t('Blinkit', 'BL', 'Groceries', 1240, false, 0.4, {
        tag: '#family', payment: 'HDFC UPI', source: 'Scanned receipt', note: 'Weekly grocery run',
      }),
      t('Uber', 'UB', 'Transport', 320, false, 3, { tag: '#work' }),
      t('Salary — Nexthink', 'SA', 'Salary', 85000, true, 6, { payment: 'Bank transfer', recurring: true }),
      t('Zomato', 'ZO', 'Food & drink', 680, false, 26, { tag: '#personal', source: 'Scanned receipt' }),
      t('Croma', 'CR', 'Shopping', 4999, false, 29, { tag: '#reimbursable', source: 'Scanned receipt' }),
      t('Freelance — Loom', 'FR', 'Freelance', 18000, true, 32, { tag: '#work' }),
      t('Indian Oil', 'IO', 'Transport', 2100, false, 50, { payment: 'Fuel card', source: 'Scanned receipt' }),
      t('Apollo Pharmacy', 'AP', 'Health', 860, false, 53, { tag: '#personal', source: 'Scanned receipt' }),
    ],
    todo: [
      { id: uid(), text: 'Pay electricity bill', meta: 'Due on the 18th', done: false },
      { id: uid(), text: 'File Q2 reimbursements', meta: 'Work · 4 receipts', done: true },
      { id: uid(), text: 'Review SIP allocation', meta: 'Monthly check', done: false },
      { id: uid(), text: 'Cancel unused gym add-on', meta: 'Saves ₹400/mo', done: false },
    ],
    shopping: [
      { id: uid(), text: 'Atta 5kg', meta: 'Groceries', price: 320, done: true },
      { id: uid(), text: 'Olive oil', meta: 'Groceries', price: 780, done: false },
      { id: uid(), text: 'Coffee beans', meta: 'Pantry', price: 650, done: false },
      { id: uid(), text: 'Dish soap refill', meta: 'Household', price: 180, done: true },
      { id: uid(), text: 'Paneer 400g', meta: 'Groceries', price: 250, done: false },
      { id: uid(), text: 'Birthday gift', meta: '#family', price: 1000, done: false },
    ],
    rules: [
      { id: uid(), name: 'Rent — Prestige', initials: 'RE', amount: 28000, cadence: 'Monthly', anchor: thisMonthOn(1), lead: 5, tone: 'neutral' },
      { id: uid(), name: 'Netflix', initials: 'NF', amount: 649, cadence: 'Monthly', anchor: thisMonthOn(14), lead: 3, tone: 'amber' },
      { id: uid(), name: 'Cult.fit', initials: 'CF', amount: 1200, cadence: 'Monthly', anchor: thisMonthOn(18), lead: 2, tone: 'green' },
      { id: uid(), name: 'ACT Fibernet', initials: 'AC', amount: 999, cadence: 'Monthly', anchor: thisMonthOn(20), lead: 1, tone: 'neutral' },
    ],
    catsExpense: [
      { name: 'Rent', initials: 'RE', base: 12 },
      { name: 'Groceries', initials: 'GR', base: 38 },
      { name: 'Food & drink', initials: 'FD', base: 26 },
      { name: 'Transport', initials: 'TR', base: 19 },
      { name: 'Health', initials: 'HE', base: 7 },
      { name: 'Shopping', initials: 'SH', base: 11 },
      { name: 'Bills', initials: 'BI', base: 0 },
    ],
    catsIncome: [
      { name: 'Salary', initials: 'SA', base: 12 },
      { name: 'Freelance', initials: 'FR', base: 9 },
      { name: 'Dividends', initials: 'DI', base: 4 },
      { name: 'Rent received', initials: 'RR', base: 12 },
      { name: 'Refunds', initials: 'RF', base: 3 },
    ],
    tags: [
      { name: '#family', base: 24 },
      { name: '#work', base: 18 },
      { name: '#reimbursable', base: 11 },
      { name: '#subscription', base: 9 },
      { name: '#personal', base: 31 },
      { name: '#travel', base: 6 },
    ],
    settings: { notif: true, dark: false, backup: true },
  };
}

// The prototype's headline figures, expressed so the seed transactions reproduce them exactly.
const SEED_INC = 103000;
const SEED_EXP = 10199;
const BASE_INCOME = 85000;
const BASE_EXPENSE = 52340;
const BASE_BALANCE = 248650;
export const MONTH_BUDGET = 60000;

export function totals(txns: Txn[]) {
  let inc = 0;
  let exp = 0;
  for (const t of txns) {
    if (t.inc) inc += t.amount;
    else exp += t.amount;
  }
  const income = BASE_INCOME + inc - SEED_INC;
  const expense = BASE_EXPENSE + exp - SEED_EXP;
  return { income, expense, balance: BASE_BALANCE + (inc - SEED_INC) - (exp - SEED_EXP) };
}

export function nextDue(rule: Rule, now = new Date()): Date {
  let d = startOfDay(new Date(rule.anchor));
  const today = startOfDay(now);
  let guard = 0;
  while (d.getTime() < today.getTime() && guard++ < 600) d = stepCadence(d, rule.cadence, 1);
  return d;
}

export function stepCadence(d: Date, cadence: Cadence, dir: 1 | -1): Date {
  if (cadence === 'Weekly') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7 * dir);
  if (cadence === 'Monthly') return addMonths(d, dir);
  if (cadence === 'Quarterly') return addMonths(d, 3 * dir);
  return addMonths(d, 12 * dir);
}

export function cycleProgress(rule: Rule, now = new Date()): number {
  const due = nextDue(rule, now);
  const prev = stepCadence(due, rule.cadence, -1);
  const total = Math.max(1, daysBetween(prev, due));
  return Math.min(1, Math.max(0.04, 1 - daysBetween(now, due) / total));
}

type Ctx = {
  state: State;
  hydrated: boolean;
  set: (fn: (s: State) => State) => void;
  reset: () => void;
  tagFilter: string | null;
  setTagFilter: (t: string | null) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as State) }));
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value: Ctx = {
    state,
    hydrated,
    set: (fn) => setState(fn),
    reset: () => setState(seedState()),
    tagFilter,
    setTagFilter,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('StoreProvider is missing');
  return ctx;
}

export const PAYMENTS = ['HDFC UPI', 'Credit card', 'Debit card', 'Cash', 'Bank transfer'];
