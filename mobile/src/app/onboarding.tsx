import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T, useBar } from '@/components/ui';
import { addMonths, monthFull } from '@/lib/format';
import { useStore } from '@/lib/store';

const BARS = [
  [34, 52, 40, 66, 48, 80],
  [46, 38, 62, 54, 72, 84],
  [28, 44, 50, 58, 70, 82],
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { set } = useStore();
  const [step, setStep] = useState(0);
  useBar('light');

  const slides = [
    { title: 'Every rupee, accounted for.', body: 'Snap a receipt or log it by hand. TrackMyPurse files it, tags it and keeps the maths honest.', label: 'THIS MONTH', note: '₹52,340 spent across 6 categories', cta: 'Next' },
    { title: 'Budgets that actually hold.', body: 'Set monthly and yearly targets per category. Get nudged before you cross, not after.', label: 'BUDGET USED', note: '87% of ₹60,000 — ₹7,660 left', cta: 'Next' },
    { title: 'Know your financial health.', body: 'One score from savings rate, budget discipline and recurring load. Watch it move week to week.', label: 'HEALTH SCORE', note: `78 / 100 — up 4 points since ${monthFull(addMonths(new Date(), -1))}`, cta: 'Get started' },
  ];
  const slide = slides[step];
  const finish = () => {
    set((s) => ({ ...s, onboarded: true }));
    router.replace('/auth');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#141712', paddingTop: insets.top + 40, paddingHorizontal: 28, paddingBottom: insets.bottom + 28 }}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 28 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#9BD44A', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: '#141712' }} />
        </View>
        <View>
          <T w={800} s={38} c="#F4F6F1" ls={-0.03} lh={1.05}>{slide.title}</T>
          <T w={500} s={15} c="#A6AF9C" lh={1.6} style={{ marginTop: 14, maxWidth: 290 }}>{slide.body}</T>
        </View>
        <View style={{ height: 186, borderRadius: 24, backgroundColor: '#1D211A', borderWidth: 1, borderColor: '#2A2F24', padding: 20, justifyContent: 'space-between' }}>
          <T w={700} s={11} c="#7E8874" ls={0.1}>{slide.label}</T>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 84 }}>
            {BARS[step].map((h, i) => (
              <View key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 7, backgroundColor: i === 5 ? '#9BD44A' : '#2C3325' }} />
            ))}
          </View>
          <T w={600} s={13} c="#D6DCCE">{slide.note}</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 7, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ height: 5, borderRadius: 99, width: i === step ? 26 : 8, backgroundColor: i === step ? '#9BD44A' : '#3A4132' }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={finish} style={{ paddingVertical: 17, paddingHorizontal: 22, borderRadius: 16, borderWidth: 1, borderColor: '#2E3428' }}>
          <T w={600} s={15} c="#A6AF9C">Skip</T>
        </Pressable>
        <Pressable
          onPress={() => (step < 2 ? setStep(step + 1) : finish())}
          style={({ pressed }) => ({ flex: 1, padding: 17, borderRadius: 16, backgroundColor: pressed ? '#AEE45C' : '#9BD44A', alignItems: 'center' })}>
          <T w={700} s={15} c="#141712">{slide.cta}</T>
        </Pressable>
      </View>
    </View>
  );
}
