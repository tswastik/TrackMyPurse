import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { T, useC } from './ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 68;
const LENGTH = 2 * Math.PI * R;

export function HealthGauge({ score, size = 150, label }: { score: number; size?: number; label?: string }) {
  const c = useC();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: score / 100,
      duration: 1600,
      delay: 350,
      easing: Easing.bezier(0.2, 0.85, 0.25, 1),
      useNativeDriver: false,
    }).start();
  }, [progress, score]);

  const offset = progress.interpolate({ inputRange: [0, 1], outputRange: [LENGTH, 0] });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Circle cx={80} cy={80} r={R} fill="none" stroke={c.track} strokeWidth={15} />
        <AnimatedCircle
          cx={80}
          cy={80}
          r={R}
          fill="none"
          stroke={c.green}
          strokeWidth={15}
          strokeLinecap="round"
          strokeDasharray={`${LENGTH} ${LENGTH}`}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <T w={800} s={32} ls={-0.03}>{score}</T>
        {label ? <T w={700} s={10} c={c.text2} ls={0.08}>{label}</T> : null}
      </View>
    </View>
  );
}
