jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

import { fullStory } from '../src/narrative/story';
import {
  branchFromCheckpoint,
  createCheckpoint,
  createSaveSlot,
  emptySaveCollection,
  nextAvailableSlotId,
  parseSaveCollection,
  sanitizeSaveCollection,
  sessionForResume,
  updateSaveSlot,
  upsertSave,
} from '../src/save/model';
import { createSaveRepository } from '../src/save/storage';

const settings = {
  musicEnabled: true,
  sfxEnabled: true,
  hapticsEnabled: true,
  textSpeedIndex: 1,
};

describe('local save model', () => {
  it('creates at most three named continuity slots', () => {
    let collection = emptySaveCollection();
    for (let index = 1; index <= 3; index += 1) {
      const id = nextAvailableSlotId(collection)!;
      collection = upsertSave(collection, createSaveSlot(fullStory, id, settings, index));
    }
    expect(collection.slots).toHaveLength(3);
    expect(nextAvailableSlotId(collection)).toBeUndefined();
  });

  it('updates progress and creates an immutable checkpoint only once', () => {
    const save = createSaveSlot(fullStory, 'continuity-1', settings, 1000);
    const session = { ...save.session, currentNodeId: 'checkpoint_prologue' };
    const node = fullStory.nodes.find((candidate) => candidate.id === 'checkpoint_prologue')!;
    const updated = updateSaveSlot(save, session, settings, node, 6000);
    const checkpointed = createCheckpoint(updated, 'PROLOGUE_COMPLETE', session, node, 6000);
    const duplicate = createCheckpoint(checkpointed, 'PROLOGUE_COMPLETE', session, node, 7000);
    expect(checkpointed.currentNode).toBe('checkpoint_prologue');
    expect(checkpointed.playTimeSeconds).toBe(5);
    expect(duplicate.checkpoints).toHaveLength(1);
  });

  it('branches a checkpoint into a separate continuity', () => {
    const source = createSaveSlot(fullStory, 'continuity-1', settings, 1000);
    const node = fullStory.nodes.find((candidate) => candidate.id === 'checkpoint_prologue')!;
    const session = { ...source.session, currentNodeId: node.id };
    const checkpointed = createCheckpoint(source, 'PROLOGUE_COMPLETE', session, node, 2000);
    const result = branchFromCheckpoint(
      upsertSave(emptySaveCollection(), checkpointed),
      'continuity-1',
      'PROLOGUE_COMPLETE',
      'continuity-2',
      3000,
    );
    expect(result.collection.slots).toHaveLength(2);
    expect(result.save.slotId).toBe('continuity-2');
    expect(sessionForResume(result.save, 4000).currentNodeId).toBe('checkpoint_prologue');
  });

  it('recovers safely from corrupt, incompatible or out-of-range data', () => {
    expect(parseSaveCollection('{broken')).toEqual(emptySaveCollection());
    expect(parseSaveCollection('{"saveVersion":99,"slots":[]}')).toEqual(emptySaveCollection());
    const save = createSaveSlot(fullStory, 'continuity-1', settings, 1000);
    const corrupt = {
      saveVersion: 1,
      slots: [{ ...save, settings: { ...settings, textSpeedIndex: 99 } }],
    };
    expect(parseSaveCollection(JSON.stringify(corrupt))).toEqual(emptySaveCollection());
  });

  it('drops saves and checkpoints whose narrative nodes no longer exist', () => {
    const save = createSaveSlot(fullStory, 'continuity-1', settings, 1000);
    const missing = {
      ...save,
      currentNode: 'missing_node',
      session: { ...save.session, currentNodeId: 'missing_node' },
    };
    const sanitized = sanitizeSaveCollection(
      { saveVersion: 1, slots: [missing] },
      fullStory,
    );
    expect(sanitized).toEqual(emptySaveCollection());
  });

  it('persists through an injectable local storage adapter', async () => {
    let serialized: string | null = null;
    const repository = createSaveRepository({
      getItem: async () => serialized,
      setItem: async (_key, value) => { serialized = value; },
    });
    const collection = upsertSave(
      emptySaveCollection(),
      createSaveSlot(fullStory, 'continuity-1', settings, 1000),
    );
    await repository.persist(collection);
    await expect(repository.load()).resolves.toEqual(collection);
  });
});