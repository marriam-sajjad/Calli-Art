import { CompositionState } from './types';

const STORAGE_KEY_ACTIVE = 'myqalam_studio_active_project';
const STORAGE_KEY_SAVED_LIST = 'myqalam_studio_saved_projects_index';
const DB_NAME = 'MyQalamStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

export interface SavedProjectMeta {
  id: string;
  title: string;
  script: string;
  shape: string;
  lastModified: number;
}

/**
 * Opens the IndexedDB database.
 */
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves the active composition state to localStorage and IndexedDB.
 */
export function saveActiveProject(state: CompositionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage save failed, using memory/IndexedDB', e);
  }

  // Also persist to IndexedDB asynchronously
  openIndexedDB().then(db => {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: '__active__', state, lastModified: Date.now() });
    } catch (e) {
      console.warn('IndexedDB write error', e);
    }
  });
}

/**
 * Loads the active composition state or returns null.
 */
export function loadActiveProject(): CompositionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves a named project permanently to user library (both LocalStorage and IndexedDB).
 */
export function saveProjectToLibrary(state: CompositionState): void {
  if (typeof window === 'undefined') return;

  const newMeta: SavedProjectMeta = {
    id: state.id,
    title: state.title || 'Untitled Composition',
    script: state.script,
    shape: state.shape,
    lastModified: Date.now(),
  };

  try {
    const projectKey = `myqalam_proj_${state.id}`;
    localStorage.setItem(projectKey, JSON.stringify(state));

    const metaList = listSavedProjects();
    const existingIdx = metaList.findIndex(m => m.id === state.id);

    if (existingIdx >= 0) {
      metaList[existingIdx] = newMeta;
    } else {
      metaList.unshift(newMeta);
    }

    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(metaList));
  } catch (e) {
    console.error('Failed to save project to localStorage', e);
  }

  // IndexedDB backup
  openIndexedDB().then(db => {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: state.id, state, meta: newMeta });
    } catch (e) {
      console.warn('IndexedDB project write error', e);
    }
  });
}

/**
 * Returns metadata list of all saved user projects.
 */
export function listSavedProjects(): SavedProjectMeta[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LIST);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Loads a specific saved project from library by ID.
 */
export function loadProjectFromLibrary(id: string): CompositionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`myqalam_proj_${id}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Deletes a saved project from the library.
 */
export function deleteProjectFromLibrary(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`myqalam_proj_${id}`);
    const metaList = listSavedProjects().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(metaList));
  } catch (e) {
    console.error('Failed to delete project', e);
  }

  openIndexedDB().then(db => {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch (e) {
      console.warn('IndexedDB project delete error', e);
    }
  });
}
