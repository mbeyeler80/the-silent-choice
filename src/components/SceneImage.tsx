import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveVisual } from '../assets/registry';
import { colors, typography } from '../theme';

interface Props {
  scene: number;
  visualId?: string;
}

export function SceneImage({ scene, visualId }: Props) {
  const source = resolveVisual(visualId, scene);

  return (
    <View style={styles.frame} accessibilityLabel={`Scene ${scene}${visualId ? `, ${visualId}` : ''}`}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{visualId ?? `SCENE_${scene}`}</Text>
        </View>
      )}
      <View style={[styles.scrim, visualId === 'hermitage_exterior_dim' && styles.dimScrim]} />
      <Text style={styles.sceneLabel}>0{scene}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 218,
    overflow: 'hidden',
    backgroundColor: colors.stone_medium,
    borderBottomColor: colors.stone_light,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 11 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 8, 11, 0.18)' },
  dimScrim: { backgroundColor: 'rgba(6, 8, 11, 0.58)' },
  sceneLabel: {
    position: 'absolute',
    right: 18,
    top: 14,
    color: 'rgba(230,230,230,0.58)',
    fontFamily: typography.system,
    fontSize: 11,
    letterSpacing: 2,
  },
});
