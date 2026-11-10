import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, Screen, Seg, T, useC } from '@/components/ui';
import { addMonths, month3, monthYear } from '@/lib/format';

type Period = 'Weekly' | 'Monthly' | 'Yearly';

const WEEKLY: [number, number][] = [[46, 38], [30, 52], [62, 40], [44, 58], [70, 34], [55, 62]];
const MONTHLY: [number, number][] = [[62, 48], [55, 60], [70, 44], [58, 66], [66, 52], [85, 62]];
const YEARLY: [number, number][] = [[40, 36], [55, 44], [68, 58], [76, 62], [88, 66], [94, 70]];

const CATS: [string, string, number][] = [
  ['Rent', '₹28,000', 53],
  ['Groceries', '₹8,400', 16],
  ['Food & drink', '₹6,100', 12],
  ['Transport', '₹4,200', 8],
  ['Shopping', '₹3,540', 7],
  ['Other', '₹2,100', 4],
];

const TIPS = [
  'Food delivery is 122% of its ₹5,000 target. Capping it at ₹4,000 clears the monthly budget with ₹6,660 to spare.',
  'Three subscriptions renew within six days of each other. Moving them to the 1st smooths your cash flow.',
  'Your savings rate held above 30% for four months. Raising the yearly target to ₹7,80,000 is realistic.',
];

function trendFor(period: Period, now: Date): { label: string; inc: number; exp: number }[] {
  if (period === 'Weekly') return WEEKLY.map(([inc, exp], i) => ({ label: 'W' + (i + 1), inc, exp }));
  if (period === 'Monthly') return MONTHLY.map(([inc, exp], i) => ({ label: month3(addMonths(now, i - 5)), inc, exp }));
  const year = now.getFullYear();
  return YEARLY.map(([inc, exp], i) => ({ label: i === 5 ? 'Est' : String(year - 4 + i), inc, exp }));
}

export default function Insights() {
  const c = useC();
  const [period, setPeriod] = useState<Period>('Monthly');
  const now = new Date();
  const trend = trendFor(period, now);

  return (
    <Screen inTabs>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, paddingBottom: 14 }}>
        <T w={800} s={22} ls={-0.03}>Insights</T>
        <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 }}>
          <T w={700} s={12}>{monthYear(now)}</T>
        </View>
      </View>

      <Seg
        value={period}
        onChange={setPeriod}
        options={[{ label: 'Weekly', value: 'Weekly' }, { label: 'Monthly', value: 'Monthly' }, { label: 'Yearly', value: 'Yearly' }]}
      />

      <Card style={{ marginTop: 12 }}>
        <T w={700} s={15}>Income vs expense</T>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: c.green }} />
            <T w={600} s={11} c={c.muted}>Income</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: c.amber }} />
            <T w={600} s={11} c={c.muted}>Expense</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 150, marginTop: 16 }}>
          {trend.map((t) => (
            <View key={t.label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 124 }}>
                <View style={{ width: 11, height: `${t.inc}%`, borderRadius: 5, backgroundColor: c.green }} />
                <View style={{ width: 11, height: `${t.exp}%`, borderRadius: 5, backgroundColor: c.amber }} />
              </View>
              <T w={600} s={10} c={c.placeholderText}>{t.label}</T>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T w={700} s={15}>Spend by category</T>
          <T w={800} s={16} ls={-0.02}>₹52,340</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 3, marginTop: 14 }}>
          {CATS.map(([name, , pct], i) => (
            <View key={name} style={{ flex: pct, height: 12, borderRadius: 4, backgroundColor: c.catRamp[i] }} />
          ))}
        </View>
        <View style={{ gap: 11, marginTop: 16 }}>
          {CATS.map(([name, amount, pct], i) => (
            <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 4, backgroundColor: c.catRamp[i] }} />
              <T w={600} s={13} c={c.mid} style={{ flex: 1 }}>{name}</T>
              <T w={600} s={12} c={c.text2}>{amount}</T>
              <T w={800} s={13} style={{ width: 38, textAlign: 'right' }}>{pct}%</T>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ backgroundColor: c.tintBg, borderWidth: 1, borderColor: c.tintBorder, borderRadius: 22, padding: 18, marginTop: 12 }}>
        <T w={700} s={15} c={c.tintTitle}>Budget optimization tips</T>
        <View style={{ gap: 10, marginTop: 12 }}>
          {TIPS.map((tip) => (
            <View key={tip} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 20, height: 20, borderRadius: 7, backgroundColor: c.green2, marginTop: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="bulb" size={11} color="#FFFFFF" />
              </View>
              <T w={500} s={12} c={c.tintText} lh={1.55} style={{ flex: 1 }}>{tip}</T>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
