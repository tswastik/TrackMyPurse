import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Btn, Card, ChipBtn, FieldSheet, InitChip, Progress, RowLine, Screen, T, TitleBar, useC, type SheetConfig } from '@/components/ui';
import { dayMonth, daysBetween, inr } from '@/lib/format';
import { cycleProgress, stepCadence, uid, useStore, type Cadence } from '@/lib/store';
import { leadLabel, sortedRules, txnInitials } from '@/lib/txn';

const CADENCES: Cadence[] = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const LEADS: { label: string; days: number }[] = [
  { label: 'Same day', days: 0 },
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '5 days', days: 5 },
];

export default function Recurring() {
  const c = useC();
  const { state, set } = useStore();
  const [cadence, setCadence] = useState<Cadence>('Monthly');
  const [lead, setLead] = useState(3);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const now = new Date();

  const rules = sortedRules(state.rules, now);
  const soon = rules.filter((r) => daysBetween(now, r.due) <= 30);
  const dueTotal = soon.reduce((a, r) => a + r.rule.amount, 0);
  const leadText = LEADS.find((l) => l.days === lead)?.label ?? `${lead} days`;

  const create = () => {
    const value = Number(amount.replace(/[^\d.]/g, ''));
    if (!name.trim() || !value) {
      Alert.alert('Almost there', 'Give the rule a name and an amount first.');
      return;
    }
    set((s) => ({
      ...s,
      rules: [
        ...s.rules,
        { id: uid(), name: name.trim(), amount: value, cadence, anchor: stepCadence(new Date(), cadence, 1).toISOString(), lead, tone: 'neutral' },
      ],
    }));
    setName('');
    setAmount('');
  };

  return (
    <Screen inTabs>
      <TitleBar title="Recurring" onBack={() => router.navigate('/home')} />

      <View style={{ backgroundColor: c.hero, borderWidth: 1, borderColor: c.heroBorder, borderRadius: 22, padding: 18 }}>
        <T w={600} s={12} c={c.heroSub}>Due in the next 30 days</T>
        <T w={800} s={28} c="#FFFFFF" ls={-0.03} style={{ marginTop: 2 }}>{inr(dueTotal)}</T>
        <T w={500} s={11} c={c.heroMuted} style={{ marginTop: 4 }}>
          {rules.length} active {rules.length === 1 ? 'rule' : 'rules'}{rules[0] ? ` · next on ${dayMonth(rules[0].due)}` : ''}
        </T>
      </View>

      <View style={{ gap: 10, marginTop: 12 }}>
        {rules.map(({ rule, due }) => (
          <Card key={rule.id} r={20} pad={15} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <InitChip text={txnInitials(rule)} tone={rule.tone} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T w={700} s={14} numberOfLines={1}>{rule.name}</T>
              <T w={500} s={11} c={c.text2} style={{ marginTop: 2 }}>{rule.cadence} · next {dayMonth(due)}</T>
              <View style={{ marginTop: 8 }}>
                <Progress pct={cycleProgress(rule, now) * 100} height={5} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <T w={800} s={14}>{inr(rule.amount)}</T>
              <T w={500} s={10} c={c.text2} style={{ marginTop: 3 }}>{leadLabel(rule.lead)}</T>
            </View>
          </Card>
        ))}
      </View>

      <View style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: 'dashed', borderColor: c.dashed, borderRadius: 20, padding: 16, marginTop: 12 }}>
        <T w={700} s={14}>New recurring rule</T>
        <RowLine
          label="Name"
          value={name || 'Add name'}
          valueColor={name ? undefined : c.text3}
          onPress={() => setSheet({ title: 'Rule name', value: name, placeholder: 'e.g. Spotify', onSubmit: setName })}
        />
        <RowLine
          label="Amount"
          value={amount ? inr(Number(amount)) : 'Add amount'}
          valueColor={amount ? undefined : c.text3}
          onPress={() =>
            setSheet({
              title: 'Amount (₹)', value: amount, placeholder: '0', keyboardType: 'numeric',
              onSubmit: (v) => setAmount(v.replace(/[^\d.]/g, '')),
            })
          }
        />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {CADENCES.map((k) => (
            <ChipBtn key={k} label={k} active={cadence === k} onPress={() => setCadence(k)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <T w={600} s={12} c={c.text2}>Reminder lead time</T>
          <T w={700} s={12}>{lead === 0 ? 'Same day' : `${leadText} before`}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {LEADS.map((l) => (
            <ChipBtn key={l.label} label={l.label} active={lead === l.days} onPress={() => setLead(l.days)} />
          ))}
        </View>
        <Btn label="Create rule" kind="accent" onPress={create} style={{ marginTop: 14, padding: 14, borderRadius: 14 }} />
      </View>

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
