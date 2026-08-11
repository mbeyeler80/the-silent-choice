import { triggerHaptic, type HapticsDriver } from '../src/haptics/service';

describe('narrative haptics', () => {
  it('degrades safely when disabled, absent or unsupported', async () => {
    const driver: HapticsDriver = {
      selectionAsync: jest.fn().mockRejectedValue(new Error('unsupported')),
      impactAsync: jest.fn().mockRejectedValue(new Error('unsupported')),
    };
    await expect(triggerHaptic(undefined, true, driver)).resolves.toBeUndefined();
    await expect(triggerHaptic('coherence', false, driver)).resolves.toBeUndefined();
    await expect(triggerHaptic('coherence', true, driver)).resolves.toBeUndefined();
    expect(driver.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('uses a double impact for assembled identity', async () => {
    jest.useFakeTimers();
    const driver: HapticsDriver = {
      selectionAsync: jest.fn().mockResolvedValue(undefined),
      impactAsync: jest.fn().mockResolvedValue(undefined),
    };
    const pending = triggerHaptic('assembled', true, driver);
    await Promise.resolve();
    jest.advanceTimersByTime(150);
    await pending;
    expect(driver.impactAsync).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});