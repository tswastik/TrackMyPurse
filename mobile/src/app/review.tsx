import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { Btn, Card, FieldSheet, ListCard, RowLine, Screen, T, TitleBar, useC, type SheetConfig } from '@/components/ui';
import { dayMonth, inr } from '@/lib/format';
import { PAYMENTS, uid, useStore } from '@/lib/store';

export default function Review() {
  const c = useC();
  const { state, set } = useStore();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [vendor, setVendor] = useState('Blinkit');
  const [amount, setAmount] = useState(1240);
  const [category, setCategory] = useState('Groceries');
  const [tag, setTag] = useState('#family');
  const [payment, setPayment] = useState('HDFC UPI');
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const now = new Date();

  const save = () => {
    const id = uid();
    set((s) => ({
      ...s,
      txns: [
        { id, name: vendor, category, tag, payment, amount, inc: false, date: new Date().toISOString(), source: 'Scanned receipt', recurring: false, receiptUri: uri },
        ...s.txns,
      ],
    }));
    router.replace({ pathname: '/transaction/[id]', params: { id } });
  };

  return (
    <Screen>
      <TitleBar title="Review receipt" onBack={() => router.replace('/scan')} />
      <View style={{ backgroundColor: c.tintBg, borderWidth: 1, borderColor: c.tintBorder, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.green2 }} />
        <T w={600} s={12} c={c.tintText} style={{ flex: 1 }}>Sample values · receipt reading is not connected yet</T>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        <View style={{ width: 104, height: 150, borderRadius: 16, overflow: 'hidden', backgroundColor: c.placeholder, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
          {uri ? (
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <T w={600} s={9} c={c.placeholderText} center lh={1.6}>NO PHOTO</T>
          )}
        </View>
        <Card r={16} pad={14} style={{ flex: 1 }}>
          <T w={700} s={11} c={c.text3} ls={0.06}>AMOUNT</T>
          <T w={800} s={32} ls={-0.035} style={{ marginTop: 2 }}>{inr(amount)}</T>
          <T w={500} s={11} c={c.text2} lh={1.5} style={{ marginTop: 6 }}>Tap any field to correct it before saving.</T>
        </Card>
      </View>

      <ListCard style={{ marginTop: 12 }}>
        <RowLine label="Vendor" value={vendor} onPress={() => setSheet({ title: 'Vendor', value: vendor, onSubmit: setVendor })} />
        <RowLine
          label="Amount"
          value={inr(amount)}
          onPress={() =>
            setSheet({
              title: 'Amount (₹)', value: String(amount), keyboardType: 'numeric',
              onSubmit: (v) => setAmount(Number(v.replace(/[^\d.]/g, '')) || amount),
            })
          }
        />
        <RowLine label="Date" value={`${dayMonth(now)} ${now.getFullYear()}`} />
        <RowLine label="Category" value={category} onPress={() => setSheet({ title: 'Category', options: state.catsExpense.map((x) => x.name), value: category, onSubmit: setCategory })} />
        <RowLine label="Tag" value={tag} onPress={() => setSheet({ title: 'Tag', options: state.tags.map((x) => x.name), value: tag, onSubmit: setTag })} />
        <RowLine label="Payment" value={payment} last onPress={() => setSheet({ title: 'Payment', options: PAYMENTS, value: payment, onSubmit: setPayment })} />
      </ListCard>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Btn label="Retake" kind="outline" onPress={() => router.replace('/scan')} style={{ paddingHorizontal: 20 }} />
        <Btn label="Save transaction" flex onPress={save} />
      </View>

      <FieldSheet config={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
