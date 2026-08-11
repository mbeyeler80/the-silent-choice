import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import type { DecisionState } from '../narrative/types';
import { colors } from '../theme';

export function FinalCandles({ decisions }: { decisions: DecisionState }) {
  const opacities = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    const preserve = decisions.continuity === 'PRESERVE';
    const targets = preserve ? [0.08, 1, 0.08] : [1, 0.08, 0.08];
    const timeout = setTimeout(() => {
      Animated.parallel(
        opacities.map((opacity, index) =>
          Animated.timing(opacity, {
            toValue: targets[index] ?? 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }, 700);
    return () => clearTimeout(timeout);
  }, [decisions.continuity, opacities]);

  return (
    <View style={styles.container} accessibilityLabel="Three candle lights">
      {opacities.map((opacity, index) => (
        <Animated.View key={index} style={[styles.candle, { opacity }]}>
          <View style={styles.flame} />
          <View style={styles.wick} />
          <View style={styles.wax} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginVertical: 22,
    paddingHorizontal: 30,
  },
  candle: { alignItems: 'center' },
  flame: {
    width: 12,
    height: 19,
    borderRadius: 9,
    backgroundColor: colors.accent_warm,
    shadowColor: colors.accent_warm,
    shadowOpacity: 0.8,
    shadowRadius: 9,
  },
  wick: { width: 2, height: 7, backgroundColor: colors.text_secondary },
  wax: {
    width: 20,
    height: 48,
    backgroundColor: colors.text_primary,
    opacity: 0.7,
  },
});
