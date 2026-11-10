import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { ChipBtn, FieldSheet, ListCard, Progress, Screen, SectionLabel, T, TitleBar, useC, type SheetConfig } from '@/components/ui';
import { useStore } from '@/lib/store';
import { fonts } from '@/lib/theme';

const MOST_USED: [string, string, number][] = [
  ['#personal', '₹18,400', 92],
  ['#family', '₹12,900', 64],
  ['#work', '₹9,300', 46],
  ['#subscription', '₹3,847', 19],
];

export default function Tags() {
  const c = useC();
  const { state, set, setTagFilter } = useStore();
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const q = query.trim().toLowerCase();
  const tags = state.tags.filter((t) => !q || t.name.toLowerCase().includes(q));
  const added = (name: string) => state.txns.filter((t) => !t.seed && t.tag === name).length;

  const open = (name: string) => {
    setTagFilter(name);
    router.navigate('/activity');
  };
  const addTag = () =>
    setSheet({
      title: 'New tag',
      placeholder: 'e.g. holiday',
      onSubmit: (raw) => {
        const name = '#' + raw.replace(/^#+/, '').replace(/\s+/g, '-').toLowerCase();
        if (name.length < 2) return;
        set((s) => (s.tags.some((t) => t.name === name) ? s : { ...s, tags: [...s.tags, { name, base: 0 }] }));
      },
    });

  return (
    <Screen inTabs>
      <TitleBar title="Tags" onBack={() => router.navigate('/categories')} />
      <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search tags"
          placeholderTextColor={c.text3}
          autoCapitalize="none"
          style={{ fontFamily: fonts[500], fontSize: 14, color: c.ink, paddingVertical: 4 }}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {tags.map((t) => (
          <ChipBtn key={t.name} label={t.name} suffix={String(t.base + added(t.name))} onPress={() => open(t.name)} />
        ))}
        <Pressable onPress={addTag} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderStyle: 'dashed', borderColor: c.dashed }}>
          <T w={700} s={13} c={c.link}>+ New tag</T>
        </Pressable>
      </View>

      <SectionLabel style={{ marginTop: 22 }}>MOST USED THIS MONTH</SectionLabel>
      <ListCard>
        {MOST_USED.map(([label, amount, pct], i) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: i === MOST_USED.length - 1 ? 0 : 1, borderBottomColor: c.divider }}>
            <View style={{ flex: 1 }}>
              <T w={700} s={14}>{label}</T>
              <View style={{ marginTop: 7 }}>
                <Progress pct={pct} height={5} />
              </View>
            </View>
            <T w={800} s={13}>{amount}</T>
          </View>
        ))}
      </ListCard>

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
