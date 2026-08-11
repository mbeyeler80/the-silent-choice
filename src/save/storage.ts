import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseSaveCollection } from './model';
import type { SaveCollection } from './types';

const SAVE_KEY = '@the_silent_choice/saves/v1';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface SaveRepository {
  load(): Promise<SaveCollection>;
  persist(collection: SaveCollection): Promise<void>;
}

export function createSaveRepository(storage: KeyValueStorage): SaveRepository {
  return {
    async load() {
      try {
        return parseSaveCollection(await storage.getItem(SAVE_KEY));
      } catch {
        return parseSaveCollection(null);
      }
    },
    async persist(collection) {
      try {
        await storage.setItem(SAVE_KEY, JSON.stringify(collection));
      } catch (error) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[save] persistence failed', error);
        }
      }
    },
  };
}

export const saveRepository = createSaveRepository(AsyncStorage);
