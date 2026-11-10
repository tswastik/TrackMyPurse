import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Btn, Screen, Seg, T, useC } from '@/components/ui';
import { useStore } from '@/lib/store';
import { fonts } from '@/lib/theme';

export default function Auth() {
  const c = useC();
  const { set } = useStore();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const isSignup = mode === 'signup';

  const proceed = () => {
    set((s) => ({
      ...s,
      signedIn: true,
      name: name.trim() || s.name,
      email: email.trim() || s.email,
    }));
    router.replace('/lock');
  };

  const field = { backgroundColor: c.card, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: c.inputBorder };
  const input = { fontFamily: fonts[600], fontSize: 15, color: c.ink, padding: 0, marginTop: 4 };

  return (
    <Screen padH={24}>
      <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: '#141712', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 22 }}>
        <View style={{ width: 19, height: 19, borderRadius: 6, backgroundColor: '#9BD44A' }} />
      </View>
      <T w={800} s={28} ls={-0.03}>{isSignup ? 'Create your purse' : 'Welcome back'}</T>
      <T w={500} s={14} c={c.muted} style={{ marginTop: 6 }}>
        {isSignup ? 'Two minutes to set up. No bank login required.' : 'Log in to pick up where you left off.'}
      </T>

      <Seg
        style={{ marginTop: 22, marginBottom: 20 }}
        value={mode}
        onChange={setMode}
        options={[{ label: 'Sign up', value: 'signup' }, { label: 'Log in', value: 'login' }]}
      />

      <View style={{ gap: 12 }}>
        {isSignup ? (
          <View style={field}>
            <T w={700} s={11} c={c.text3} ls={0.06}>FULL NAME</T>
            <TextInput value={name} onChangeText={setName} placeholder="Ananya Rao" placeholderTextColor={c.text3} autoCapitalize="words" style={input} />
          </View>
        ) : null}
        <View style={field}>
          <T w={700} s={11} c={c.text3} ls={0.06}>EMAIL</T>
          <TextInput value={email} onChangeText={setEmail} placeholder="ananya.rao@gmail.com" placeholderTextColor={c.text3} keyboardType="email-address" autoCapitalize="none" style={input} />
        </View>
        <View style={[field, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1 }}>
            <T w={700} s={11} c={c.text3} ls={0.06}>PASSWORD</T>
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={c.text3} secureTextEntry={!show} autoCapitalize="none" style={input} />
          </View>
          <Pressable onPress={() => setShow(!show)} hitSlop={10}>
            <T w={700} s={12} c={c.link}>{show ? 'Hide' : 'Show'}</T>
          </Pressable>
        </View>
      </View>

      <Btn label={isSignup ? 'Create account' : 'Log in'} onPress={proceed} style={{ marginTop: 20, padding: 17 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: c.outline }} />
        <T w={600} s={11} c={c.text3}>OR</T>
        <View style={{ flex: 1, height: 1, backgroundColor: c.outline }} />
      </View>
      <Btn label="Continue with Google" kind="plain" onPress={proceed} style={{ padding: 15 }} />
      <T w={500} s={11} c={c.text3} center lh={1.6} style={{ marginTop: 22 }}>
        By continuing you agree to the Terms and Privacy Policy.
      </T>
    </Screen>
  );
}
