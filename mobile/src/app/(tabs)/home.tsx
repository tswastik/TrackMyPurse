import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { HealthGauge } from '@/components/gauge';
import { Card, IconBtn, InitChip, ListCard, Progress, Screen, T, TxnRow, useC } from '@/components/ui';
import { addMonths, greeting, initialsOf, inr, monthShort } from '@/lib/format';
import { MONTH_BUDGET, totals, useStore } from '@/lib/store';
import { byNewest, dueLabel, metaOf, sortedRules, txnAmount, txnInitials } from '@/lib/txn';

const HEALTH = [
  { label: 'Savings rate', val: '32%', pct: 72, key: 'green2' },
  { label: 'Budget discipline', val: '87%', pct: 87, key: 'green3' },
  { label: 'Recurring load', val: '36%', pct: 36, key: 'amber' },
] as const;

export default function Home() {
  const c = useC();
  const { state } = useStore();
  const now = new Date();
  const prev = monthShort(addMonths(now, -1));
  const { income, expense, balance } = totals(state.txns);
  const pct = Math.round((expense / MONTH_BUDGET) * 100);
  const left = MONTH_BUDGET - expense;
  const recent = [...state.txns].sort(byNewest).slice(0, 5);
  const bills = sortedRules(state.rules, now);
  const userInitials = state.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || initialsOf(state.name);

  return (
    <Screen inTabs>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <T w={600} s={12} c={c.text2}>{greeting(now)}</T>
          <T w={800} s={19} ls={-0.02} numberOfLines={1}>{state.name}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconBtn icon="settings-outline" size={38} onPress={() => router.navigate('/settings')} />
          <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: c.dark ? c.accent : '#141712', alignItems: 'center', justifyContent: 'center' }}>
            <T w={700} s={13} c={c.dark ? '#141712' : '#9BD44A'}>{userInitials}</T>
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: c.hero, borderWidth: 1, borderColor: c.heroBorder, borderRadius: 26, padding: 22, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -40, top: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: c.heroBlob }} />
        <T w={600} s={12} c={c.heroSub}>Total balance</T>
        <T w={800} s={36} c="#FFFFFF" ls={-0.035} style={{ marginTop: 4 }}>{(balance < 0 ? '− ' : '') + inr(balance)}</T>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1, backgroundColor: c.heroInner, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14 }}>
            <T w={600} s={11} c={c.heroMuted}>Income</T>
            <T w={700} s={17} c="#9BD44A" style={{ marginTop: 2 }}>{inr(income)}</T>
            <T w={500} s={10} c={c.heroFaint} style={{ marginTop: 2 }}>+5.1% vs {prev}</T>
          </View>
          <View style={{ flex: 1, backgroundColor: c.heroInner, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14 }}>
            <T w={600} s={11} c={c.heroMuted}>Expenses</T>
            <T w={700} s={17} c="#F0B26B" style={{ marginTop: 2 }}>{inr(expense)}</T>
            <T w={500} s={10} c={c.heroFaint} style={{ marginTop: 2 }}>+15.5% vs {prev}</T>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Pressable onPress={() => router.push('/scan')} style={({ pressed }) => ({ flex: 1, backgroundColor: pressed ? '#A8E055' : '#9BD44A', borderRadius: 20, padding: 16 })}>
          <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#141712', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="scan-outline" size={16} color="#9BD44A" />
          </View>
          <T w={700} s={14} c="#141712" style={{ marginTop: 26 }}>Scan receipt</T>
        </Pressable>
        <Pressable onPress={() => router.push('/add')} style={{ flex: 1, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 20, padding: 16 }}>
          <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: c.chipBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={19} color={c.link} />
          </View>
          <T w={700} s={14} style={{ marginTop: 26 }}>Add manually</T>
        </Pressable>
      </View>

      <Card style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T w={700} s={15}>Financial health</T>
          <View style={{ backgroundColor: c.tintBg, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 }}>
            <T w={700} s={11} c={c.link}>{monthShort(now)}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 8 }}>
          <HealthGauge score={78} label="GOOD" />
          <View style={{ flex: 1, gap: 10 }}>
            {HEALTH.map((h) => (
              <View key={h.label}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <T w={600} s={11} c={c.muted}>{h.label}</T>
                  <T w={600} s={11} c={c.muted}>{h.val}</T>
                </View>
                <View style={{ marginTop: 5 }}>
                  <Progress pct={h.pct} height={6} color={c[h.key]} />
                </View>
              </View>
            ))}
          </View>
        </View>
        <T w={500} s={11} c={c.text2} lh={1.55} style={{ marginTop: 6 }}>
          Savings rate is up 4 points. Dining out is the one drag on your score this month.
        </T>
      </Card>

      <Pressable onPress={() => router.navigate('/budgets')}>
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T w={700} s={15}>Monthly budget</T>
            <T w={600} s={12} c={left < 0 ? c.danger : c.text2}>{left < 0 ? `${inr(-left)} over` : `${inr(left)} left`}</T>
          </View>
          <View style={{ marginTop: 12 }}>
            <Progress pct={pct} height={12} color={pct > 100 ? c.over : c.green} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <T w={700} s={12}>{inr(expense)} spent</T>
            <T w={700} s={12} c={c.text3}>{inr(MONTH_BUDGET)}</T>
          </View>
        </Card>
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginHorizontal: 4, marginBottom: 10 }}>
        <T w={700} s={15}>Upcoming bills</T>
        <Pressable onPress={() => router.navigate('/recurring')} hitSlop={10}>
          <T w={700} s={12} c={c.link}>See all</T>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 18 }}>
        {bills.map(({ rule, due }) => (
          <Pressable
            key={rule.id}
            onPress={() => router.navigate('/recurring')}
            style={{ width: 150, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 14 }}>
            <InitChip text={txnInitials(rule)} tone={rule.tone} />
            <T w={700} s={13} style={{ marginTop: 10 }} numberOfLines={1}>{rule.name}</T>
            <T w={500} s={11} c={c.text2} style={{ marginTop: 2 }}>{dueLabel(due)}</T>
            <T w={800} s={15} ls={-0.02} style={{ marginTop: 8 }}>{inr(rule.amount)}</T>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginHorizontal: 4, marginBottom: 10 }}>
        <T w={700} s={15}>Recent transactions</T>
        <Pressable onPress={() => router.navigate('/activity')} hitSlop={10}>
          <T w={700} s={12} c={c.link}>See all</T>
        </Pressable>
      </View>
      <ListCard style={{ paddingHorizontal: 14, borderRadius: 22 }}>
        {recent.map((t, i) => (
          <TxnRow
            key={t.id}
            initials={txnInitials(t)}
            income={t.inc}
            name={t.name}
            meta={metaOf(t)}
            amount={txnAmount(t)}
            last={i === recent.length - 1}
            onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: t.id } })}
          />
        ))}
        {recent.length === 0 ? <T w={500} s={13} c={c.text2} style={{ paddingVertical: 16 }}>No transactions yet.</T> : null}
      </ListCard>
    </Screen>
  );
}
