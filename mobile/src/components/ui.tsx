import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Modal, Pressable, ScrollView, Text, TextInput, View,
  type KeyboardTypeOptions, type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore, type Tone } from '@/lib/store';
import { dark, fonts, light, type Colors, type Weight } from '@/lib/theme';

export function useC(): Colors {
  const { state } = useStore();
  return state.settings.dark ? dark : light;
}

export function useBar(style: 'light' | 'dark') {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style, true);
    }, [style]),
  );
}

type TProps = {
  children: ReactNode;
  w?: Weight;
  s?: number;
  c?: string;
  ls?: number;
  lh?: number;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function T({ children, w = 600, s = 14, c, ls, lh, center, style, numberOfLines }: TProps) {
  const colors = useC();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: fonts[w],
          fontSize: s,
          color: c ?? colors.ink,
          letterSpacing: ls ? ls * s : undefined,
          lineHeight: lh ? Math.round(lh * s) : undefined,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

type ScreenProps = {
  children: ReactNode;
  bar?: 'light' | 'dark';
  bg?: string;
  inTabs?: boolean;
  scroll?: boolean;
  padH?: number;
};

export function Screen({ children, bar, bg, inTabs, scroll = true, padH = 18 }: ScreenProps) {
  const c = useC();
  const insets = useSafeAreaInsets();
  useBar(bar ?? (c.dark ? 'light' : 'dark'));
  const pad = {
    paddingTop: insets.top + 14,
    paddingHorizontal: padH,
    paddingBottom: inTabs ? 28 : insets.bottom + 28,
  };
  if (!scroll) {
    return <View style={[{ flex: 1, backgroundColor: bg ?? c.bg }, pad]}>{children}</View>;
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg ?? c.bg }}
      contentContainerStyle={pad}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, r = 22, pad = 18 }: { children: ReactNode; style?: StyleProp<ViewStyle>; r?: number; pad?: number }) {
  const c = useC();
  return (
    <View style={[{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: r, padding: pad }, style]}>
      {children}
    </View>
  );
}

export function ListCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useC();
  return (
    <View style={[{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 }, style]}>
      {children}
    </View>
  );
}

export function Seg<V extends string>({ options, value, onChange, style }: {
  options: { label: string; value: V }[];
  value: V;
  onChange: (v: V) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useC();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: c.seg, borderRadius: 14, padding: 4, borderWidth: c.dark ? 1 : 0, borderColor: c.border }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11,
              backgroundColor: on ? c.segOn : 'transparent',
              elevation: on && !c.dark ? 1 : 0,
            }}>
            <T w={700} s={13} c={on ? c.ink : c.text2}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChipBtn({ label, active, onPress, suffix }: { label: string; active?: boolean; onPress?: () => void; suffix?: string }) {
  const c = useC();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1,
        borderColor: active ? c.chipOnBg : c.chipOffBorder,
        backgroundColor: active ? c.chipOnBg : c.card,
      }}>
      <T w={700} s={13} c={active ? c.chipOnFg : c.muted}>{label}</T>
      {suffix ? <T w={700} s={13} c={active ? c.chipOnFg : c.muted} style={{ opacity: 0.5, marginLeft: 6 }}>{suffix}</T> : null}
    </Pressable>
  );
}

export function InitChip({ text, tone = 'neutral', size = 38 }: { text: string; tone?: Tone | 'income'; size?: number }) {
  const c = useC();
  const bg = tone === 'income' || tone === 'green' ? c.incBg : tone === 'amber' ? c.amberBg : c.chipBg;
  const fg = tone === 'income' || tone === 'green' ? c.incFg : tone === 'amber' ? c.amberFg : c.chipFg;
  return (
    <View style={{ width: size, height: size, borderRadius: Math.round(size / 3), backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T w={800} s={size >= 48 ? 16 : 12} c={fg}>{text}</T>
    </View>
  );
}

export function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const c = useC();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 46, height: 28, borderRadius: 99, padding: 3, flexDirection: 'row',
        justifyContent: on ? 'flex-end' : 'flex-start',
        backgroundColor: on ? c.green : c.toggleOff,
      }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', elevation: 2 }} />
    </Pressable>
  );
}

export function IconBtn({ icon, onPress, size = 36, tint, bg, border }: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  tint?: string;
  bg?: string;
  border?: string;
}) {
  const c = useC();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{
        width: size, height: size, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        backgroundColor: bg ?? c.card, borderWidth: 1, borderColor: border ?? (bg ? bg : c.border),
      }}>
      <Ionicons name={icon} size={18} color={tint ?? c.ink} />
    </Pressable>
  );
}

export function TitleBar({ title, onBack, right, big }: { title: string; onBack?: () => void; right?: ReactNode; big?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4, paddingBottom: 14 }}>
      {onBack ? <IconBtn icon="chevron-back" onPress={onBack} /> : null}
      <T w={800} s={big ? 22 : 20} ls={-0.03} style={{ flex: 1 }}>{title}</T>
      {right}
    </View>
  );
}

export function SectionLabel({ children, style }: { children: string; style?: StyleProp<ViewStyle> }) {
  const c = useC();
  return (
    <View style={[{ marginTop: 18, marginBottom: 8, marginHorizontal: 4 }, style]}>
      <T w={700} s={11} c={c.text3} ls={0.08}>{children}</T>
    </View>
  );
}

export function RowLine({ label, value, onPress, last, chevron = true, valueColor }: {
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  chevron?: boolean;
  valueColor?: string;
}) {
  const c = useC();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, gap: 12,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: c.divider,
      }}>
      <T w={600} s={13} c={c.text2}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
        {value ? <T w={700} s={14} c={valueColor} numberOfLines={1} style={{ flexShrink: 1 }}>{value}</T> : null}
        {chevron && onPress ? <Ionicons name="chevron-forward" size={14} color={c.chevron} /> : null}
      </View>
    </Pressable>
  );
}

export function Progress({ pct, color, height = 8, track }: { pct: number; color?: string; height?: number; track?: string }) {
  const c = useC();
  return (
    <View style={{ height, borderRadius: 99, backgroundColor: track ?? c.track, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, borderRadius: 99, backgroundColor: color ?? c.green }} />
    </View>
  );
}

export function Dashed({ label, onPress, style }: { label: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const c = useC();
  return (
    <Pressable
      onPress={onPress}
      style={[{ padding: 15, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: c.dashed, alignItems: 'center' }, style]}>
      <T w={700} s={14} c={c.link}>{label}</T>
    </Pressable>
  );
}

export function Btn({ label, onPress, kind = 'primary', style, flex }: {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'accent' | 'outline' | 'danger' | 'plain';
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}) {
  const c = useC();
  const bg = kind === 'primary' ? c.btn : kind === 'accent' ? c.accent : kind === 'plain' ? c.card : 'transparent';
  const fg = kind === 'primary' ? c.btnText : kind === 'accent' ? '#141712' : kind === 'danger' ? c.danger : kind === 'plain' ? c.ink : c.muted;
  const border = kind === 'outline' ? c.outline : kind === 'danger' ? c.dangerBorder : kind === 'plain' ? c.border : bg;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { padding: 16, borderRadius: 16, backgroundColor: bg, borderWidth: 1, borderColor: border, alignItems: 'center', opacity: pressed ? 0.85 : 1 },
        flex ? { flex: 1 } : null,
        style,
      ]}>
      <T w={700} s={14} c={fg}>{label}</T>
    </Pressable>
  );
}

export type SheetConfig = {
  title: string;
  options?: string[];
  value?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  onSubmit: (v: string) => void;
};

export function FieldSheet({ config, onClose }: { config: SheetConfig | null; onClose: () => void }) {
  const c = useC();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  useEffect(() => {
    setText(config && !config.options ? config.value ?? '' : '');
  }, [config]);

  if (!config) return null;
  const isText = !config.options;
  const submit = (v: string) => {
    config.onSubmit(v);
    onClose();
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(10,12,8,0.55)', justifyContent: isText ? 'flex-start' : 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={[
            { backgroundColor: c.card, padding: 20, borderColor: c.border, borderWidth: 1 },
            isText
              ? { marginTop: insets.top + 90, marginHorizontal: 18, borderRadius: 24 }
              : { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: insets.bottom + 18, maxHeight: '70%' },
          ]}>
          <T w={800} s={16} ls={-0.02} style={{ marginBottom: 12 }}>{config.title}</T>
          {isText ? (
            <>
              <TextInput
                autoFocus
                value={text}
                onChangeText={setText}
                placeholder={config.placeholder}
                placeholderTextColor={c.text3}
                keyboardType={config.keyboardType}
                returnKeyType="done"
                onSubmitEditing={() => text.trim() && submit(text.trim())}
                style={{
                  fontFamily: fonts[600], fontSize: 15, color: c.ink, backgroundColor: c.bg,
                  borderWidth: 1, borderColor: c.inputBorder, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Btn label="Cancel" kind="outline" onPress={onClose} />
                <Btn label="Save" flex onPress={() => text.trim() && submit(text.trim())} />
              </View>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {config.options!.map((o, i) => (
                <Pressable
                  key={o}
                  onPress={() => submit(o)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14,
                    borderBottomWidth: i === config.options!.length - 1 ? 0 : 1, borderBottomColor: c.divider,
                  }}>
                  <T w={o === config.value ? 800 : 600} s={15}>{o}</T>
                  {o === config.value ? <Ionicons name="checkmark" size={18} color={c.link} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function TxnRow({ initials, income, name, meta, amount, onPress, last }: {
  initials: string;
  income: boolean;
  name: string;
  meta: string;
  amount: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const c = useC();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.divider }}>
      <InitChip text={initials} tone={income ? 'income' : 'neutral'} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T w={700} s={14} numberOfLines={1}>{name}</T>
        <T w={500} s={11} c={c.text2} style={{ marginTop: 2 }} numberOfLines={1}>{meta}</T>
      </View>
      <T w={800} s={14} ls={-0.01} c={income ? c.incFg : c.ink}>{amount}</T>
    </Pressable>
  );
}
