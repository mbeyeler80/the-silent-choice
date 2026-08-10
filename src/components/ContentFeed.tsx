import { StyleSheet, Text, View } from 'react-native';

import type { ContentBlock } from '../narrative/types';
import { colors, typography } from '../theme';

interface Props {
  blocks: ContentBlock[];
  visibleLengths: number[];
}

export function ContentFeed({ blocks, visibleLengths }: Props) {
  return (
    <View accessibilityLiveRegion="polite">
      {blocks.map((block, index) => {
        const visibleText = block.text.slice(0, visibleLengths[index] ?? 0);
        if (!visibleText) return null;
        if (block.kind === 'system') {
          return (
            <View key={block.id} style={styles.systemRow}>
              <Text style={styles.prompt} accessibilityElementsHidden>{'>'}</Text>
              <Text style={styles.systemText}>{visibleText}</Text>
            </View>
          );
        }
        return (
          <Text key={block.id} style={styles.narrativeText}>
            {visibleText}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  narrativeText: {
    color: colors.text_primary,
    fontFamily: typography.narrative,
    fontSize: 18,
    lineHeight: 29,
    marginBottom: 10,
  },
  systemRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26,31,36,0.76)',
    borderLeftColor: colors.accent_cold,
    borderLeftWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 5,
  },
  prompt: {
    color: colors.accent_cold,
    fontFamily: typography.system,
    fontSize: 13,
    marginRight: 9,
  },
  systemText: {
    flex: 1,
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.55,
  },
});
