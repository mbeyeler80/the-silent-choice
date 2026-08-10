import type { ImageSourcePropType } from 'react-native';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../theme';

interface Props {
  title: string;
  image: ImageSourcePropType | undefined;
  onStart: () => void;
}

export function StartScreen({ title, image, onStart }: Props) {
  const content = (
    <View style={styles.scrim}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>PROTOTYPE V0.1</Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rule} />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        style={({ pressed }) => [styles.begin, pressed && styles.beginPressed]}
      >
        <Text style={styles.beginText}>BEGIN</Text>
      </Pressable>
    </View>
  );

  return image ? (
    <ImageBackground source={image} style={styles.background} resizeMode="cover">
      {content}
    </ImageBackground>
  ) : (
    <View style={styles.background}>{content}</View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.stone_dark },
  scrim: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 112,
    paddingBottom: 70,
    backgroundColor: 'rgba(5,7,10,0.67)',
  },
  heading: { alignItems: 'center' },
  eyebrow: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 22,
  },
  title: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 34,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  rule: { height: 1, width: 44, backgroundColor: colors.accent_warm, marginTop: 24 },
  begin: {
    alignSelf: 'center',
    minWidth: 190,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_warm,
    borderWidth: 1,
  },
  beginPressed: { backgroundColor: 'rgba(181,138,88,0.16)' },
  beginText: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 14,
    letterSpacing: 3,
  },
});
