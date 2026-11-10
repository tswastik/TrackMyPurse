import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { Btn, Card, ListCard, Screen, SectionLabel, T, Toggle, useC } from '@/components/ui';
import { monthYear } from '@/lib/format';
import { useStore, type State } from '@/lib/store';

const LATER = 'This arrives once the app is connected to its backend.';

export default function Settings() {
  const c = useC();
  const { state, set, reset } = useStore();
  const initials = state.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const flip = (key: keyof State['settings']) =>
    set((s) => ({ ...s, settings: { ...s.settings, [key]: !s.settings[key] } }));

  const toggles: { key: keyof State['settings']; label: string; sub: string }[] = [
    { key: 'notif', label: 'Notifications', sub: 'Bill reminders and budget alerts' },
    { key: 'dark', label: 'Dark mode', sub: 'Use the dark theme' },
    { key: 'backup', label: 'Auto backup', sub: 'Daily to Google Drive' },
  ];
  const dataRows = [
    { label: 'Backup & restore', sub: 'Not backed up yet', onOpen: () => Alert.alert('Backup & restore', LATER) },
    { label: 'Export to CSV', sub: `${monthYear(new Date())} · ${76 + state.txns.length} transactions`, onOpen: () => Alert.alert('Export to CSV', LATER) },
    { label: 'Categories', sub: `${state.catsExpense.length + state.catsIncome.length} categories`, onOpen: () => router.navigate('/categories') },
    { label: 'Tags', sub: `${state.tags.length} tags`, onOpen: () => router.navigate('/tags') },
  ];

  const logOut = () => {
    set((s) => ({ ...s, signedIn: false }));
    router.replace('/auth');
  };
  const deleteAccount = () =>
    Alert.alert('Delete account?', 'This clears everything saved on this phone and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          reset();
          router.replace('/onboarding');
        },
      },
    ]);

  const row = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: 13, gap: 12 };

  return (
    <Screen inTabs>
      <T w={800} s={22} ls={-0.03} style={{ paddingTop: 4, paddingBottom: 14 }}>Settings</T>
      <Card pad={16} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c.dark ? c.accent : '#141712', alignItems: 'center', justifyContent: 'center' }}>
          <T w={800} s={15} c={c.dark ? '#141712' : '#9BD44A'}>{initials}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T w={700} s={15} numberOfLines={1}>{state.name}</T>
          <T w={500} s={12} c={c.text2} style={{ marginTop: 2 }} numberOfLines={1}>{state.email}</T>
        </View>
      </Card>

      <SectionLabel style={{ marginTop: 20 }}>PREFERENCES</SectionLabel>
      <ListCard>
        <View style={[row, { borderBottomWidth: 1, borderBottomColor: c.divider, paddingVertical: 14 }]}>
          <T w={600} s={14}>Currency</T>
          <T w={700} s={13} c={c.text2}>INR · ₹</T>
        </View>
        {toggles.map((t) => (
          <Pressable key={t.key} onPress={() => flip(t.key)} style={[row, { borderBottomWidth: 1, borderBottomColor: c.divider }]}>
            <View style={{ flex: 1 }}>
              <T w={600} s={14}>{t.label}</T>
              <T w={500} s={11} c={c.text3} style={{ marginTop: 2 }}>{t.sub}</T>
            </View>
            <Toggle on={state.settings[t.key]} onPress={() => flip(t.key)} />
          </Pressable>
        ))}
        <Pressable onPress={() => router.push({ pathname: '/lock', params: { from: 'settings' } })} style={[row, { paddingVertical: 14 }]}>
          <T w={600} s={14}>App lock & biometrics</T>
          <Ionicons name="chevron-forward" size={14} color={c.chevron} />
        </Pressable>
      </ListCard>

      <SectionLabel style={{ marginTop: 20 }}>DATA</SectionLabel>
      <ListCard>
        {dataRows.map((d, i) => (
          <Pressable key={d.label} onPress={d.onOpen} style={[row, { paddingVertical: 14, borderBottomWidth: i === dataRows.length - 1 ? 0 : 1, borderBottomColor: c.divider }]}>
            <View style={{ flex: 1 }}>
              <T w={600} s={14}>{d.label}</T>
              <T w={500} s={11} c={c.text3} style={{ marginTop: 2 }}>{d.sub}</T>
            </View>
            <Ionicons name="chevron-forward" size={14} color={c.chevron} />
          </Pressable>
        ))}
      </ListCard>

      <View style={{ gap: 10, marginTop: 20 }}>
        <Btn label="Log out" kind="plain" onPress={logOut} style={{ padding: 15 }} />
        <Btn label="Delete account" kind="danger" onPress={deleteAccount} style={{ padding: 15 }} />
      </View>
      <T w={500} s={11} c={c.chevron} center style={{ marginTop: 16 }}>TrackMyPurse v2.4.0</T>
    </Screen>
  );
}
