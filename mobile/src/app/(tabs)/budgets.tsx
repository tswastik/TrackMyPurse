import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Card, Dashed, Progress, Screen, SectionLabel, Seg, T, TitleBar, useC } from '@/components/ui';
import { inr, monthFull } from '@/lib/format';
import { MONTH_BUDGET, totals, useStore } from '@/lib/store';

const MONTHLY: [string, string, string, number][] = [
  ['Rent', '₹28,000', '₹28,000', 100],
  ['Groceries', '₹8,400', '₹10,000', 84],
  ['Food & drink', '₹6,100', '₹5,000', 122],
  ['Transport', '₹4,200', '₹6,000', 70],
  ['Shopping', '₹3,540', '₹7,000', 51],
];
const YEARLY: [string, string, string, number][] = [
  ['Rent', '₹3,36,000', '₹3,36,000', 100],
  ['Groceries', '₹92,400', '₹1,20,000', 77],
  ['Travel', '₹68,000', '₹60,000', 113],
  ['Transport', '₹46,200', '₹72,000', 64],
  ['Shopping', '₹38,940', '₹84,000', 46],
];
const YEAR_TOTAL = 720000;
const YEAR_BASE_SPENT = 511200 - 52340;

export default function Budgets() {
  const c = useC();
  const { state } = useStore();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const now = new Date();
  const { expense } = totals(state.txns);
  const monthly = period === 'monthly';
  const spent = monthly ? expense : YEAR_BASE_SPENT + expense;
  const total = monthly ? MONTH_BUDGET : YEAR_TOTAL;
  const pct = Math.round((spent / total) * 100);
  const left = total - spent;
  const rows = monthly ? MONTHLY : YEARLY;

  return (
    <Screen inTabs>
      <TitleBar title="Budgets" onBack={() => router.navigate('/home')} />
      <Seg value={period} onChange={setPeriod} options={[{ label: 'Monthly', value: 'monthly' }, { label: 'Yearly', value: 'yearly' }]} />

      <View style={{ backgroundColor: c.hero, borderWidth: 1, borderColor: c.heroBorder, borderRadius: 24, padding: 20, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T w={600} s={12} c={c.heroSub}>{monthly ? `${monthFull(now)} budget` : `${now.getFullYear()} budget`}</T>
          <T w={700} s={11} c={pct > 100 ? '#F0B26B' : '#9BD44A'}>{pct}% used</T>
        </View>
        <T w={800} s={32} c="#FFFFFF" ls={-0.035} style={{ marginTop: 2 }}>{inr(spent)}</T>
        <View style={{ marginTop: 14 }}>
          <Progress pct={pct} height={12} color={pct > 100 ? c.over : '#8CC93F'} track={c.heroTrack} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <T w={600} s={11} c={c.heroMuted}>of {inr(total)}</T>
          <T w={600} s={11} c={c.heroMuted}>{left < 0 ? `${inr(-left)} over` : `${inr(left)} left`}</T>
        </View>
      </View>

      <SectionLabel>CATEGORY TARGETS</SectionLabel>
      <View style={{ gap: 10 }}>
        {rows.map(([name, rowSpent, target, rowPct]) => {
          const over = rowPct > 100;
          return (
            <Card key={name} r={18} pad={14} style={{ paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T w={700} s={14}>{name}</T>
                <View style={{ paddingVertical: 4, paddingHorizontal: 9, borderRadius: 99, backgroundColor: over ? c.dangerBg : c.tintBg }}>
                  <T w={700} s={11} c={over ? c.danger : c.link}>{rowPct}%</T>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <Progress pct={rowPct} color={over ? c.over : c.green} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }}>
                <T w={600} s={11} c={c.text2}>{rowSpent} spent</T>
                <T w={600} s={11} c={c.text2}>of {target}</T>
              </View>
            </Card>
          );
        })}
      </View>
      <Dashed
        label="+ Add category budget"
        style={{ marginTop: 12 }}
        onPress={() => Alert.alert('Category budgets', 'Category targets are sample figures for now. Editing them arrives with the backend.')}
      />
    </Screen>
  );
}
