import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { ChipBtn, FieldSheet, IconBtn, ListCard, Screen, T, TxnRow, useC, type SheetConfig } from '@/components/ui';
import { dayLabel, inr, monthYear } from '@/lib/format';
import { useStore, type Txn } from '@/lib/store';
import { fonts } from '@/lib/theme';
import { byNewest, metaOf, txnAmount, txnInitials } from '@/lib/txn';

const TYPES = ['All', 'Expense', 'Income', 'Receipts', 'Recurring'] as const;
type TypeFilter = (typeof TYPES)[number];

export default function Activity() {
  const c = useC();
  const { state, tagFilter, setTagFilter } = useStore();
  const [type, setType] = useState<TypeFilter>('All');
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const now = new Date();

  const q = query.trim().toLowerCase();
  const shown = [...state.txns].sort(byNewest).filter((t) => {
    if (type === 'Expense' && t.inc) return false;
    if (type === 'Income' && !t.inc) return false;
    if (type === 'Receipts' && t.source !== 'Scanned receipt') return false;
    if (type === 'Recurring' && !t.recurring) return false;
    if (tagFilter && t.tag !== tagFilter) return false;
    if (q && !`${t.name} ${t.note ?? ''} ${t.tag ?? ''} ${t.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const groups: { day: string; items: Txn[] }[] = [];
  for (const t of shown) {
    const day = dayLabel(t.date, now);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(t);
    else groups.push({ day, items: [t] });
  }
  const net = shown.reduce((a, t) => a + (t.inc ? t.amount : -t.amount), 0);

  const box = {
    flex: 1, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
  };

  return (
    <Screen inTabs>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, paddingBottom: 14 }}>
        <T w={800} s={22} ls={-0.03}>Transactions</T>
        <IconBtn icon="add" bg={c.dark ? c.accent : '#141712'} tint={c.dark ? '#141712' : '#9BD44A'} onPress={() => router.push('/add')} />
      </View>

      <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="search" size={16} color={c.text3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search vendor, note or tag"
          placeholderTextColor={c.text3}
          style={{ flex: 1, fontFamily: fonts[500], fontSize: 14, color: c.ink, paddingVertical: 4 }}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={16} color={c.text3} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -18 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
        {TYPES.map((f) => (
          <ChipBtn key={f} label={f} active={type === f} onPress={() => setType(f)} />
        ))}
        <ChipBtn label="#work" active={tagFilter === '#work'} onPress={() => setTagFilter(tagFilter === '#work' ? null : '#work')} />
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <View style={box}>
          <T w={600} s={12}>{monthYear(now)}</T>
        </View>
        <Pressable
          style={box}
          onPress={() =>
            setSheet({
              title: 'Filter by tag',
              options: ['All tags', ...state.tags.map((t) => t.name)],
              value: tagFilter ?? 'All tags',
              onSubmit: (v) => setTagFilter(v === 'All tags' ? null : v),
            })
          }>
          <T w={600} s={12}>{tagFilter ?? 'All tags'}</T>
          <Ionicons name="chevron-down" size={13} color={c.chevron} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginHorizontal: 4, marginBottom: 8 }}>
        <T w={700} s={11} c={c.text2}>{shown.length} {shown.length === 1 ? 'transaction' : 'transactions'}</T>
        <T w={700} s={11} c={c.text2}>Net {(net < 0 ? '− ' : '+ ') + inr(net)}</T>
      </View>

      {groups.map((g) => (
        <View key={g.day} style={{ marginBottom: 14 }}>
          <T w={700} s={11} c={c.text3} ls={0.08} style={{ paddingHorizontal: 4, paddingBottom: 8 }}>{g.day}</T>
          <ListCard style={{ paddingHorizontal: 14 }}>
            {g.items.map((t, i) => (
              <TxnRow
                key={t.id}
                initials={txnInitials(t)}
                income={t.inc}
                name={t.name}
                meta={metaOf(t)}
                amount={txnAmount(t)}
                last={i === g.items.length - 1}
                onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: t.id } })}
              />
            ))}
          </ListCard>
        </View>
      ))}
      {groups.length === 0 ? (
        <T w={500} s={13} c={c.text2} center style={{ marginTop: 28 }}>Nothing matches these filters.</T>
      ) : null}

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
