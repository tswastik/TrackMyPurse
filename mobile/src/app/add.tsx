import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { ChipBtn, FieldSheet, ListCard, RowLine, Screen, SectionLabel, Seg, T, Toggle, useC, type SheetConfig } from '@/components/ui';
import { addMonths, dayMonth, groupIndian } from '@/lib/format';
import { PAYMENTS, uid, useStore } from '@/lib/store';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

function typeDigit(current: string, key: string): string {
  if (key === 'del') return current.slice(0, -1) || '0';
  if (key === '.') return current.includes('.') ? current : current + '.';
  const [whole, frac] = current.split('.');
  if (frac !== undefined) return frac.length >= 2 ? current : current + key;
  if (whole.length >= 9) return current;
  return current === '0' ? key : current + key;
}

function showAmount(digits: string): string {
  const [whole, frac] = digits.split('.');
  return '₹' + groupIndian(whole) + (frac !== undefined ? '.' + frac : '');
}

export default function Add() {
  const c = useC();
  const { state, set } = useStore();
  const params = useLocalSearchParams<{ id?: string; amount?: string; category?: string; name?: string }>();
  const editing = params.id ? state.txns.find((t) => t.id === params.id) : undefined;

  const [type, setType] = useState<'expense' | 'income'>(editing?.inc ? 'income' : 'expense');
  const [digits, setDigits] = useState(editing ? String(editing.amount) : params.amount && Number(params.amount) > 0 ? params.amount : '0');
  const [name, setName] = useState(editing?.name ?? params.name ?? '');
  const [category, setCategory] = useState(editing?.category ?? params.category ?? 'Groceries');
  const [tag, setTag] = useState(editing?.tag ?? '#personal');
  const [payment, setPayment] = useState(editing?.payment ?? 'HDFC UPI');
  const [repeat, setRepeat] = useState(editing?.recurring ?? false);
  const [sheet, setSheet] = useState<SheetConfig | null>(null);

  const cats = (type === 'expense' ? state.catsExpense : state.catsIncome).map((x) => x.name);
  const quick = type === 'expense'
    ? ['Groceries', 'Food & drink', 'Transport', 'Shopping', 'Health', 'Bills'].filter((x) => cats.includes(x))
    : cats;

  const switchType = (next: 'expense' | 'income') => {
    setType(next);
    const list = (next === 'expense' ? state.catsExpense : state.catsIncome).map((x) => x.name);
    if (!list.includes(category)) setCategory(list[0] ?? 'Other');
  };

  const save = () => {
    const amount = Number(digits);
    if (!amount) {
      Alert.alert('Enter an amount', 'Use the keypad to enter how much this was.');
      return;
    }
    const inc = type === 'income';
    const finalName = name.trim() || category;
    if (editing) {
      set((s) => ({
        ...s,
        txns: s.txns.map((t) =>
          t.id === editing.id
            ? { ...t, name: finalName, initials: finalName === t.name ? t.initials : undefined, category, tag, payment, amount, inc, recurring: repeat }
            : t,
        ),
      }));
      router.back();
      return;
    }
    set((s) => ({
      ...s,
      txns: [
        { id: uid(), name: finalName, category, tag, payment, amount, inc, date: new Date().toISOString(), source: 'Manual entry', recurring: repeat },
        ...s.txns,
      ],
      rules: repeat && !inc
        ? [...s.rules, { id: uid(), name: finalName, amount, cadence: 'Monthly', anchor: addMonths(new Date(), 1).toISOString(), lead: 3, tone: 'neutral' }]
        : s.rules,
    }));
    router.back();
    router.navigate('/activity');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <T w={600} s={14} c={c.text2}>Cancel</T>
        </Pressable>
        <T w={800} s={15}>{editing ? 'Edit transaction' : 'New transaction'}</T>
        <Pressable onPress={save} hitSlop={12}>
          <T w={700} s={14} c={c.link}>Save</T>
        </Pressable>
      </View>

      <Seg value={type} onChange={switchType} options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} />

      <View style={{ alignItems: 'center', paddingTop: 26, paddingBottom: 18 }}>
        <T w={700} s={11} c={c.text3} ls={0.08}>AMOUNT</T>
        <T w={800} s={46} ls={-0.04} style={{ marginTop: 4 }}>{showAmount(digits)}</T>
      </View>

      <ListCard>
        <RowLine
          label="Name"
          value={name || 'Add vendor or source'}
          valueColor={name ? undefined : c.text3}
          onPress={() => setSheet({ title: type === 'expense' ? 'Vendor' : 'Source', value: name, placeholder: type === 'expense' ? 'e.g. Big Bazaar' : 'e.g. Salary', onSubmit: setName })}
        />
        <RowLine label="Category" value={category} onPress={() => setSheet({ title: 'Category', options: cats, value: category, onSubmit: setCategory })} />
        <RowLine label="Tag" value={tag} onPress={() => setSheet({ title: 'Tag', options: state.tags.map((x) => x.name), value: tag, onSubmit: setTag })} />
        <RowLine label="Date" value={editing ? dayMonth(new Date(editing.date)) : `Today, ${dayMonth(new Date())}`} />
        <RowLine label="Payment" value={payment} onPress={() => setSheet({ title: 'Payment', options: PAYMENTS, value: payment, onSubmit: setPayment })} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
          <View>
            <T w={700} s={13}>Repeat monthly</T>
            <T w={500} s={11} c={c.text2} style={{ marginTop: 2 }}>Remind me 3 days before</T>
          </View>
          <Toggle on={repeat} onPress={() => setRepeat(!repeat)} />
        </View>
      </ListCard>

      <SectionLabel>QUICK CATEGORIES</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {quick.map((q) => (
          <ChipBtn key={q} label={q} active={category === q} onPress={() => setCategory(q)} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginTop: 20 }}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => setDigits(typeDigit(digits, k))}
            style={({ pressed }) => ({
              width: '31.6%', paddingVertical: 14, alignItems: 'center', borderRadius: 14,
              backgroundColor: pressed ? c.chipBg : c.card, borderWidth: 1, borderColor: c.border,
            })}>
            {k === 'del' ? <Ionicons name="backspace-outline" size={24} color={c.ink} /> : <T w={700} s={20}>{k}</T>}
          </Pressable>
        ))}
      </View>

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
