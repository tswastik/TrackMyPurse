import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T, useBar } from '@/components/ui';

const CORNER = { position: 'absolute' as const, width: 44, height: 44, borderColor: '#9BD44A' };

export default function Scan() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const camera = useRef<CameraView>(null);
  useBar('light');

  const granted = !!permission?.granted;

  const capture = async () => {
    if (busy) return;
    setBusy(true);
    let uri: string | undefined;
    try {
      if (granted) uri = (await camera.current?.takePictureAsync({ quality: 0.5 }))?.uri;
    } catch {
      uri = undefined;
    }
    router.replace({ pathname: '/review', params: uri ? { uri } : {} });
  };

  const glass = { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center' as const, justifyContent: 'center' as const };

  return (
    <View style={{ flex: 1, backgroundColor: '#0C0E09', paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={glass}>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
        <T w={700} s={14} c="#fff">Scan receipt</T>
        <Pressable onPress={() => setTorch(!torch)} hitSlop={8} style={[glass, torch ? { backgroundColor: '#9BD44A' } : null]}>
          <Ionicons name={torch ? 'flash' : 'flash-outline'} size={16} color={torch ? '#141712' : '#fff'} />
        </Pressable>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ width: 280, height: 388 }}>
          <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1B1F16', alignItems: 'center', justifyContent: 'center' }}>
            {granted ? (
              <CameraView ref={camera} facing="back" enableTorch={torch} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            ) : (
              <View style={{ alignItems: 'center', paddingHorizontal: 28, gap: 14 }}>
                <Ionicons name="camera-outline" size={28} color="#6E7763" />
                <T w={500} s={12} c="#98A18C" center lh={1.6}>
                  {permission && !permission.canAskAgain
                    ? 'Camera access is off. Turn it on for Expo Go in your phone settings.'
                    : 'TrackMyPurse needs the camera to photograph receipts.'}
                </T>
                {!permission || permission.canAskAgain ? (
                  <Pressable onPress={requestPermission} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#9BD44A' }}>
                    <T w={700} s={13} c="#141712">Allow camera</T>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>
          <View style={[CORNER, { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 }]} />
          <View style={[CORNER, { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 }]} />
          <View style={[CORNER, { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 }]} />
          <View style={[CORNER, { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 }]} />
        </View>
      </View>

      <T w={500} s={12} c="#98A18C" center style={{ paddingHorizontal: 40 }}>Hold steady and fit the receipt inside the frame</T>
      <View style={{ paddingTop: 26, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 52, height: 52 }} />
        <Pressable onPress={capture} style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: busy ? '#7DBE3C' : '#9BD44A' }} />
        </Pressable>
        <Pressable onPress={() => router.replace('/add')} style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <T w={700} s={9} c="#fff" style={{ marginTop: 2 }}>Manual</T>
        </Pressable>
      </View>
    </View>
  );
}
