import {
  Raleway_400Regular,
  Raleway_500Medium,
  useFonts as useRalewayFonts,
} from '@expo-google-fonts/raleway';
import {
  SpaceMono_400Regular,
  useFonts as useSpaceMonoFonts,
} from '@expo-google-fonts/space-mono';
import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, Pressable, View } from 'react-native';

import storyData from './game_data/story/prologue_v0_1.json';
import { resolveVisual } from './src/assets/registry';
import { NarrativeScreen } from './src/components/NarrativeScreen';
import { StartScreen } from './src/components/StartScreen';
import { useNarrativeAudio } from './src/hooks/useNarrativeAudio';
import {
  advance,
  createSession,
  getAvailableChoices,
  getNode,
  isEnding,
  logEnding,
  selectChoice,
  validateStory,
} from './src/narrative/engine';
import type { NarrativeChoice, NarrativeSession, NarrativeStory } from './src/narrative/types';
import { colors, typography } from './src/theme';

const story = storyData as NarrativeStory;
const validationErrors = validateStory(story);
if (validationErrors.length > 0) throw new Error(validationErrors.join('\n'));

const speeds = [
  { label: 'SLOW', ms: 42 },
  { label: 'NORMAL', ms: 25 },
  { label: 'FAST', ms: 12 },
  { label: 'INSTANT', ms: 0 },
] as const;

export default function App() {
  const [ralewayLoaded] = useRalewayFonts({ Raleway_400Regular, Raleway_500Medium });
  const [spaceMonoLoaded] = useSpaceMonoFonts({ SpaceMono_400Regular });
  const [session, setSession] = useState<NarrativeSession | null>(null);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const node = session ? getNode(story, session.currentNodeId) : undefined;
  useNarrativeAudio(
    {
      music: node?.music,
      ambience: node?.ambience,
      uiSounds: node?.ui_sounds,
      stingers: node?.stingers,
      eventKey: node?.id,
    },
    audioEnabled && Boolean(session),
  );

  const choices = useMemo(
    () => (node && session ? getAvailableChoices(node, session) : []),
    [node, session],
  );

  const start = useCallback(() => setSession(createSession(story)), []);
  const restart = useCallback(() => setSession(null), []);
  const choose = useCallback(
    (choice: NarrativeChoice) => setSession((current) => selectChoice(story, current!, choice)),
    [],
  );
  const continueStory = useCallback(
    () => setSession((current) => advance(story, current!)),
    [],
  );
  const endingRevealed = useCallback(() => {
    if (session) logEnding(session);
  }, [session]);

  if (!ralewayLoaded || !spaceMonoLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.stone_dark} />
      {!session || !node ? (
        <StartScreen title={story.title} image={resolveVisual('hermitage_exterior_dim', 1)} onStart={start} />
      ) : (
        <>
          <View style={styles.utilityBar}>
            <Text style={styles.nodeLabel}>SCENE 0{node.scene}</Text>
            <View style={styles.utilityActions}>
              <Pressable
                accessibilityLabel={`Text speed: ${speeds[speedIndex]!.label}`}
                onPress={() => setSpeedIndex((current) => (current + 1) % speeds.length)}
                hitSlop={10}
              >
                <Text style={styles.utilityText}>{speeds[speedIndex]!.label}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={audioEnabled ? 'Mute audio' : 'Enable audio'}
                onPress={() => setAudioEnabled((enabled) => !enabled)}
                hitSlop={10}
              >
                <Text style={styles.utilityText}>{audioEnabled ? 'SOUND ON' : 'SOUND OFF'}</Text>
              </Pressable>
            </View>
          </View>
          <NarrativeScreen
            node={node}
            choices={choices}
            speedMs={speeds[speedIndex]!.ms}
            onChoice={choose}
            onAdvance={continueStory}
            onRestart={restart}
            onEndingRevealed={endingRevealed}
            isEnding={isEnding(node)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.stone_dark },
  loading: { flex: 1, backgroundColor: colors.stone_dark },
  utilityBar: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: colors.stone_dark,
    borderBottomColor: colors.stone_light,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  utilityActions: { flexDirection: 'row', gap: 18 },
  nodeLabel: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  utilityText: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    letterSpacing: 0.9,
  },
});
