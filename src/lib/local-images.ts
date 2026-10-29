const DB_NAME = "mapleroute-guide-images";
const STORE_NAME = "images";
const LOCAL_PREFIX = "local:";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open the image store"));
  });

  return dbPromise;
}

export function isLocalImagePath(path: string | null | undefined) {
  return Boolean(path?.startsWith(LOCAL_PREFIX));
}

export function localImagePath(id: string) {
  return `${LOCAL_PREFIX}${id}`;
}

export function localImageId(path: string) {
  return path.slice(LOCAL_PREFIX.length);
}

export async function putLocalImage(id: string, dataUrl: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(dataUrl, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not save the image"));
  });
}

export async function getLocalImage(id: string): Promise<string | null> {
  try {
    const db = await openDb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () =>
        resolve(typeof request.result === "string" ? request.result : null);
      request.onerror = () =>
        reject(request.error ?? new Error("Could not read the image"));
    });
  } catch {
    return null;
  }
}

export async function deleteLocalImage(id: string) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("Could not delete the image"));
    });
  } catch {
    // The image may already be gone; there is nothing else to clean up.
  }
}
