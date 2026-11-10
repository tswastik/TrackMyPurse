import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T, useBar } from '@/components/ui';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function Lock() {
  const insets = useSafeAreaInsets();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [pin, setPin] = useState('');
  useBar('light');

  const unlock = () => {
    if (from === 'settings' && router.canGoBack()) router.back();
    else router.replace('/home');
  };

  const press = (k: string) => {
    if (!k) return;
    const next = k === 'del' ? pin.slice(0, -1) : (pin + k).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        setPin('');
        unlock();
      }, 260);
    }
  };

  const biometric = async () => {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (!hasHardware || !enrolled) {
      Alert.alert('Fingerprint not set up', 'Add a fingerprint or face unlock in your phone settings, or enter the PIN.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock TrackMyPurse' });
    if (result.success) unlock();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#141712', paddingTop: insets.top + 64, paddingHorizontal: 32, paddingBottom: insets.bottom + 28, alignItems: 'center' }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#1D211A', borderWidth: 1, borderColor: '#2C3226', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="lock-closed" size={22} color="#9BD44A" />
      </View>
      <T w={700} s={20} c="#F4F6F1" ls={-0.02} style={{ marginTop: 18 }}>App locked</T>
      <T w={500} s={13} c="#8B9480" style={{ marginTop: 6 }}>Enter your PIN to unlock TrackMyPurse</T>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 30, marginBottom: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 14, height: 14, borderRadius: 7,
              backgroundColor: i < pin.length ? '#9BD44A' : 'transparent',
              borderWidth: i < pin.length ? 0 : 1.5, borderColor: '#3A4132',
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 72 * 3 + 16 * 2, gap: 16, marginTop: 26 }}>
        {KEYS.map((k, i) => (
          <Pressable
            key={i}
            onPress={() => press(k)}
            disabled={!k}
            style={({ pressed }) => ({
              width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
              backgroundColor: !k ? 'transparent' : pressed ? '#262C1F' : '#1D211A',
            })}>
            {k === 'del' ? <Ionicons name="backspace-outline" size={24} color="#F4F6F1" /> : <T w={600} s={24} c="#F4F6F1">{k}</T>}
          </Pressable>
        ))}
      </View>
      <Pressable onPress={biometric} hitSlop={12} style={{ marginTop: 26 }}>
        <T w={700} s={13} c="#9BD44A">Use fingerprint instead</T>
      </Pressable>
    </View>
  );
}
