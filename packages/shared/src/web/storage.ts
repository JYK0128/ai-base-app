interface BrowserStorageLike {
  localStorage?: {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
    clear(): void
  }
}

const hasBrowserStorage = (): boolean => typeof globalThis !== 'undefined' && typeof (globalThis as BrowserStorageLike).localStorage !== 'undefined';

export function readBrowserStorage(key: string): string | null {
  if (!hasBrowserStorage()) {
    return null;
  }

  return (globalThis as BrowserStorageLike).localStorage?.getItem(key) ?? null;
}

export function writeBrowserStorage(key: string, value: string): void {
  if (!hasBrowserStorage()) {
    return;
  }

  (globalThis as BrowserStorageLike).localStorage?.setItem(key, value);
}

export function removeBrowserStorage(key: string): void {
  if (!hasBrowserStorage()) {
    return;
  }

  (globalThis as BrowserStorageLike).localStorage?.removeItem(key);
}

export function clearBrowserStorage(): void {
  if (!hasBrowserStorage()) {
    return;
  }

  (globalThis as BrowserStorageLike).localStorage?.clear();
}
