import { openDB } from 'idb';

const DB_NAME = 'cleanreport-offline';
const STORE_NAME = 'pendingReports';

let dbPromise;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

/**
 * Saves a report's data into the offline store.
 * Supports storing raw photo File/Blob objects natively.
 * @param {Object} reportData - The report data
 * @returns {Promise<number>} - The new count of pending items
 */
export const addPendingReport = async (reportData) => {
  const db = await initDB();
  await db.add(STORE_NAME, {
    ...reportData,
    createdAt: Date.now(),
  });
  return await getPendingCount();
};

/**
 * Returns all currently queued reports.
 * @returns {Promise<Array>} - Array of pending reports
 */
export const getPendingReports = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

/**
 * Deletes one entry after successful sync.
 * @param {number} id - The ID of the pending report to delete
 */
export const removePendingReport = async (id) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

/**
 * Returns just the count of pending reports, for the UI badge.
 * @returns {Promise<number>} - The count
 */
export const getPendingCount = async () => {
  const db = await initDB();
  return await db.count(STORE_NAME);
};
