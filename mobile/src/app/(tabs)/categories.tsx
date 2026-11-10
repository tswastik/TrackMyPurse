import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Dashed, FieldSheet, InitChip, ListCard, Screen, Seg, T, TitleBar, useC, type SheetConfig } from '@/components/ui';
import { initialsOf } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Categories() {
  const c = useC();
  const { state, set } = useStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const key = type === 'expense' ? 'catsExpense' : 'catsIncome';
  const list = state[key];
  const added = (name: string) => state.txns.filter((t) => !t.seed && t.category === name && t.inc === (type === 'income')).length;

  const addCategory = () =>
    setSheet({
      title: type === 'expense' ? 'New expense category' : 'New income category',
      placeholder: 'Category name',
      onSubmit: (name) =>
        set((s) => (s[key].some((x) => x.name.toLowerCase() === name.toLowerCase()) ? s : { ...s, [key]: [...s[key], { name, base: 0 }] })),
    });

  return (
    <Screen inTabs>
      <TitleBar title="Categories" onBack={() => router.navigate('/settings')} />
      <Seg value={type} onChange={setType} options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} />

      <ListCard style={{ marginTop: 12 }}>
        {list.map((cat, i) => {
          const count = cat.base + added(cat.name);
          return (
            <View key={cat.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: c.divider }}>
              <InitChip text={cat.initials ?? initialsOf(cat.name)} />
              <View style={{ flex: 1 }}>
                <T w={700} s={14}>{cat.name}</T>
                <T w={500} s={11} c={c.text2} style={{ marginTop: 2 }}>{count} {count === 1 ? 'transaction' : 'transactions'}</T>
              </View>
            </View>
          );
        })}
      </ListCard>

      <Dashed label="+ New category" onPress={addCategory} style={{ marginTop: 12 }} />
      <Dashed label="Manage tags" onPress={() => router.navigate('/tags')} style={{ marginTop: 10 }} />
      <T w={500} s={11} c={c.text3} lh={1.6} style={{ marginTop: 14, paddingHorizontal: 4 }}>
        Deleting a category moves its transactions to Uncategorized. Merging keeps history intact.
      </T>

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
