import * as Haptics from 'expo-haptics';

export type HapticEventId =
  | 'genesis_missing'
  | 'origin_absent'
  | 'assembled'
  | 'coherence'
  | 'highest_instance';

export interface HapticsDriver {
  selectionAsync(): Promise<void>;
  impactAsync(style: Haptics.ImpactFeedbackStyle): Promise<void>;
}

const expoDriver: HapticsDriver = {
  selectionAsync: () => Haptics.selectionAsync(),
  impactAsync: (style) => Haptics.impactAsync(style),
};

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function triggerHaptic(
  eventId: string | undefined,
  enabled: boolean,
  driver: HapticsDriver = expoDriver,
): Promise<void> {
  if (!eventId || !enabled) return;
  try {
    switch (eventId as HapticEventId) {
      case 'genesis_missing':
      case 'coherence':
        await driver.selectionAsync();
        break;
      case 'origin_absent':
        await driver.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'assembled':
        await driver.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await pause(140);
        await driver.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'highest_instance':
        await driver.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch {
    // Unsupported devices and platforms intentionally degrade to silence.
  }
}
