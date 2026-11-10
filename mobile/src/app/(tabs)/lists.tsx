import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Btn, Dashed, FieldSheet, ListCard, Screen, Seg, T, useC, type SheetConfig } from '@/components/ui';
import { inr } from '@/lib/format';
import { uid, useStore } from '@/lib/store';

export default function Lists() {
  const c = useC();
  const { state, set } = useStore();
  const [tab, setTab] = useState<'todo' | 'shopping'>('todo');
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const items = state[tab];
  const done = items.filter((i) => i.done).length;
  const basket = state.shopping.reduce((a, i) => a + (i.price ?? 0), 0);
  const checkedTotal = state.shopping.filter((i) => i.done).reduce((a, i) => a + (i.price ?? 0), 0);

  const toggle = (id: string) =>
    set((s) => ({ ...s, [tab]: s[tab].map((i) => (i.id === id ? { ...i, done: !i.done } : i)) }));

  const addItem = () =>
    setSheet({
      title: tab === 'todo' ? 'New to-do' : 'New shopping item',
      placeholder: tab === 'todo' ? 'What needs doing?' : 'Item name',
      onSubmit: (text) =>
        set((s) => ({
          ...s,
          [tab]: [...s[tab], { id: uid(), text, meta: tab === 'todo' ? 'Added today' : 'Groceries', done: false }],
        })),
    });

  return (
    <Screen inTabs>
      <T w={800} s={22} ls={-0.03} style={{ paddingTop: 4, paddingBottom: 14 }}>Lists</T>
      <Seg value={tab} onChange={setTab} options={[{ label: 'To-do', value: 'todo' }, { label: 'Shopping', value: 'shopping' }]} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginHorizontal: 4, marginBottom: 10 }}>
        <T w={700} s={13}>{tab === 'todo' ? 'Money to-dos' : 'Shopping notes'}</T>
        <T w={700} s={11} c={c.text2}>{done} of {items.length} done</T>
      </View>

      <ListCard>
        {items.map((it, i) => (
          <Pressable
            key={it.id}
            onPress={() => toggle(it.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: i === items.length - 1 ? 0 : 1, borderBottomColor: c.divider }}>
            <View
              style={{
                width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                backgroundColor: it.done ? '#9BD44A' : c.card, borderWidth: it.done ? 1 : 1.5, borderColor: it.done ? '#9BD44A' : c.checkBorder,
              }}>
              {it.done ? <Ionicons name="checkmark" size={14} color="#141712" /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <T w={600} s={14} c={it.done ? c.doneText : c.ink} style={{ textDecorationLine: it.done ? 'line-through' : 'none' }}>{it.text}</T>
              <T w={500} s={11} c={c.text3} style={{ marginTop: 2 }}>{it.meta}</T>
            </View>
            {it.price != null ? <T w={700} s={13} c={it.done ? c.doneText : c.ink}>{inr(it.price)}</T> : null}
          </Pressable>
        ))}
        {items.length === 0 ? <T w={500} s={13} c={c.text2} style={{ paddingVertical: 16 }}>Nothing here yet.</T> : null}
      </ListCard>

      <Dashed label="+ Add item" onPress={addItem} style={{ marginTop: 12 }} />

      {tab === 'shopping' ? (
        <View style={{ backgroundColor: c.tintBg, borderWidth: 1, borderColor: c.tintBorder, borderRadius: 20, padding: 16, marginTop: 14 }}>
          <T w={700} s={13} c={c.tintTitle}>Estimated basket {inr(basket)}</T>
          <T w={500} s={11} c={c.tintText} lh={1.55} style={{ marginTop: 4 }}>
            Convert the checked items into a Groceries expense when you're done shopping.
          </T>
          <Btn
            label={checkedTotal > 0 ? `Convert ${inr(checkedTotal)} to transaction` : 'Convert to transaction'}
            style={{ marginTop: 12, padding: 12, borderRadius: 13 }}
            onPress={() => router.push({ pathname: '/add', params: { amount: String(checkedTotal), category: 'Groceries', name: 'Shopping list' } })}
          />
        </View>
      ) : null}

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
