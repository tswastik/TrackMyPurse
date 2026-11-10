import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Image, Pressable, View } from 'react-native';

import { Btn, Card, IconBtn, InitChip, ListCard, RowLine, Screen, SectionLabel, T, useC } from '@/components/ui';
import { dateTime } from '@/lib/format';
import { uid, useStore } from '@/lib/store';
import { txnAmount, txnInitials } from '@/lib/txn';

export default function TransactionDetail() {
  const c = useC();
  const { state, set } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = state.txns.find((x) => x.id === id);

  if (!t) {
    return (
      <Screen>
        <View style={{ flexDirection: 'row', paddingTop: 4, paddingBottom: 16 }}>
          <IconBtn icon="chevron-back" onPress={() => router.back()} />
        </View>
        <T w={500} s={13} c={c.text2} center style={{ marginTop: 40 }}>This transaction no longer exists.</T>
      </Screen>
    );
  }

  const duplicate = () => {
    set((s) => ({ ...s, txns: [{ ...t, id: uid(), date: new Date().toISOString(), seed: false }, ...s.txns] }));
    router.back();
    router.navigate('/activity');
  };
  const remove = () =>
    Alert.alert('Delete transaction?', `${t.name} · ${txnAmount(t)}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          router.back();
          set((s) => ({ ...s, txns: s.txns.filter((x) => x.id !== t.id) }));
        },
      },
    ]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 16 }}>
        <IconBtn icon="chevron-back" onPress={() => router.back()} />
        <T w={800} s={15}>Transaction</T>
        <Pressable onPress={() => router.push({ pathname: '/add', params: { id: t.id } })} hitSlop={12} style={{ width: 36, alignItems: 'flex-end' }}>
          <T w={700} s={13} c={c.link}>Edit</T>
        </Pressable>
      </View>

      <Card r={24} pad={22} style={{ alignItems: 'center' }}>
        <InitChip text={txnInitials(t)} tone="income" size={52} />
        <T w={700} s={16} style={{ marginTop: 12 }}>{t.name}</T>
        <T w={800} s={34} ls={-0.035} style={{ marginTop: 4 }}>{txnAmount(t)}</T>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          <View style={{ backgroundColor: c.pillCatBg, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 99 }}>
            <T w={700} s={11} c={c.pillCatFg}>{t.category}</T>
          </View>
          {t.tag ? (
            <View style={{ backgroundColor: c.pillTagBg, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 99 }}>
              <T w={700} s={11} c={c.pillTagFg}>{t.tag}</T>
            </View>
          ) : null}
        </View>
      </Card>

      <ListCard style={{ marginTop: 12 }}>
        <RowLine label="Date" value={dateTime(t.date)} />
        <RowLine label="Payment" value={t.payment ?? '—'} />
        <RowLine label="Source" value={t.source} />
        <RowLine label="Recurring" value={t.recurring ? 'Yes' : 'No'} last={!t.note} />
        {t.note ? <RowLine label="Note" value={t.note} last /> : null}
      </ListCard>

      <SectionLabel>RECEIPT</SectionLabel>
      <View style={{ height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: c.placeholder, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
        {t.receiptUri ? (
          <Image source={{ uri: t.receiptUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <T w={600} s={10} c={c.placeholderText} ls={0.06}>{t.source === 'Scanned receipt' ? 'RECEIPT PHOTO NOT STORED' : 'NO RECEIPT ATTACHED'}</T>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Btn label="Duplicate" kind="outline" flex onPress={duplicate} style={{ padding: 15 }} />
        <Btn label="Delete" kind="danger" flex onPress={remove} style={{ padding: 15 }} />
      </View>
    </Screen>
  );
}
