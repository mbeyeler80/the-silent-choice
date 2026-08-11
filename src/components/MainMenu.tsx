import type { ImageSourcePropType } from 'react-native';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameSave } from '../save/types';
import { colors, typography } from '../theme';

interface Props {
  title: string;
  image?: ImageSourcePropType;
  slots: GameSave[];
  loading: boolean;
  onContinue: () => void;
  onNew: () => void;
  onArchive: () => void;
}

export function MainMenu({
  title,
  image,
  slots,
  loading,
  onContinue,
  onNew,
  onArchive,
}: Props) {
  const latest = [...slots].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  )[0];

  const content = (
    <View style={styles.scrim}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>FIRST COMPLETE PLAYABLE ALPHA</Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rule} />
      </View>

      <View style={styles.actions}>
        {loading ? (
          <Text style={styles.status}>RESTORING CONTINUITIES...</Text>
        ) : (
          <>
            {latest && (
              <>
                <Text style={styles.status}>
                  LATEST: {latest.currentChapter} / {latest.slotId.toUpperCase()}
                </Text>
                <MenuButton label="CONTINUE" onPress={onContinue} />
              </>
            )}
            <MenuButton
              label={slots.length === 0 ? 'BEGIN' : 'BEGIN NEW INSTANCE'}
              onPress={onNew}
            />
            {slots.length > 0 && <MenuButton label="ARCHIVE" onPress={onArchive} />}
          </>
        )}
      </View>
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

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.stone_dark },
  scrim: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 54,
    backgroundColor: 'rgba(5,7,10,0.72)',
  },
  heading: { alignItems: 'center' },
  eyebrow: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 8,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 34,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  rule: { height: 1, width: 44, backgroundColor: colors.accent_warm, marginTop: 24 },
  actions: { gap: 10 },
  status: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 0.7,
    textAlign: 'center',
    marginBottom: 5,
  },
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_warm,
    borderWidth: 1,
    backgroundColor: 'rgba(14,17,22,0.75)',
  },
  pressed: { opacity: 0.62 },
  buttonText: {
    color: colors.text_primary,
    fontFamily: typography.narrativeMedium,
    fontSize: 12,
    letterSpacing: 2.2,
  },
});
