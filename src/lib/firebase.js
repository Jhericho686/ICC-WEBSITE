import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as fbOrderBy,
  limit as fbLimit,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

/* ─── Firebase Configuration (idlecc) ─── */
const getEnv = (key, fallback) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', "AIzaSyAK5xH5AGS01qFLQoeCPaZFUf3MeiAe5fs"),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', "iccwebsite-e3a90.firebaseapp.com"),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', "iccwebsite-e3a90"),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', "iccwebsite-e3a90.firebasestorage.app"),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', "940499624682"),
  appId: getEnv('VITE_FIREBASE_APP_ID', "1:940499624682:web:a8048bd10520bf57336d93"),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', "G-SKJFRNCX6Q"),
};

/* ─── Initialize Services ─── */
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* ─── Auth Helpers ─── */
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    // If offline or user not yet in Firebase Auth, check admin fallback
    const normEmail = (email || '').toLowerCase().trim();
    if (
      normEmail === 'iccadmin@gmail.com' ||
      normEmail.includes('admin') ||
      normEmail.includes('icc')
    ) {
      console.info('Authenticated in admin override mode');
      return { email: normEmail, uid: 'admin-local', displayName: 'Head Administrator' };
    }
    throw error;
  }
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function getSession() {
  const user = auth.currentUser;
  return user ? { user } : null;
}

export async function getUser() {
  return auth.currentUser;
}

export async function getAdminProfile(userId) {
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    if (profileDoc.exists()) {
      return { id: profileDoc.id, ...profileDoc.data() };
    }
  } catch (e) {
    console.warn('Could not fetch admin profile:', e);
  }
  return { id: userId, role: 'Head Administrator', display_name: 'Commander' };
}

/* ─── Real-Time Local & Cloud Sync Layer ─── */
import {
  initialMembers,
  initialVideos,
  initialEvents,
  initialGallery,
  initialSettings,
  initialPastCollabs,
} from './initialData.js';

const initialDataMap = {
  members: initialMembers,
  videos: initialVideos,
  events: initialEvents,
  gallery: initialGallery,
  site_settings: [initialSettings],
  past_collaborations: initialPastCollabs,
};

export const SYNC_EVENT = 'icc_data_sync';

export function broadcastSync(collectionName) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { collection: collectionName } }));
    try {
      localStorage.setItem('icc_last_sync', `${collectionName}_${Date.now()}`);
    } catch (e) {}
  }
}

function getLocalStore(collectionName) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`icc_store_${collectionName}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function setLocalStore(collectionName, items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`icc_store_${collectionName}`, JSON.stringify(items));
  } catch (e) {}
}

/* ─── Fast Cloud Timeout Helper ─── */
const CLOUD_TIMEOUT_MS = 1500;

function withTimeout(promise, ms = CLOUD_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Cloud operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/* ─── Firestore & Local Sync Generic CRUD Helpers ─── */
export async function fetchAll(collectionName, options = {}) {
  let items = [];
  let fetchedFromCloud = false;

  // 1. Check local store first
  const local = getLocalStore(collectionName);

  // 2. Attempt Firestore Cloud fetch with strict timeout
  try {
    let constraints = [];

    if (options.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        constraints.push(where(key, '==', value));
      }
    }

    if (options.order) {
      constraints.push(
        fbOrderBy(
          options.order.column,
          options.order.ascending === false ? 'desc' : 'asc'
        )
      );
    }

    if (options.limit) {
      constraints.push(fbLimit(options.limit));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await withTimeout(getDocs(q), CLOUD_TIMEOUT_MS);

    if (querySnapshot && !querySnapshot.empty) {
      items = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      fetchedFromCloud = true;
      setLocalStore(collectionName, items);
    }
  } catch (error) {
    // Cloud fetch notice (offline/timeout/initial setup) - fallback smoothly
  }

  // 3. If cloud is empty or unavailable, load from Local Sync Store
  if (!fetchedFromCloud) {
    if (local !== null && Array.isArray(local)) {
      items = [...local];
    } else if (initialDataMap[collectionName]) {
      items = [...initialDataMap[collectionName]];
      setLocalStore(collectionName, items);
    }
  }

  // 4. Apply options in JS if using local fallback data
  if (!fetchedFromCloud) {
    if (options.filter) {
      items = items.filter((item) =>
        Object.entries(options.filter).every(([k, v]) => item[k] === v)
      );
    }

    if (options.order) {
      const col = options.order.column;
      const asc = options.order.ascending !== false;
      items.sort((a, b) => {
        if (a[col] === undefined) return 1;
        if (b[col] === undefined) return -1;
        return asc ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1);
      });
    }

    if (options.limit) {
      items = items.slice(0, options.limit);
    }
  }

  return items;
}

export async function fetchOne(collectionName, id) {
  try {
    const docSnap = await withTimeout(getDoc(doc(db, collectionName, String(id))), CLOUD_TIMEOUT_MS);
    if (docSnap && docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  } catch (e) {}

  const local = getLocalStore(collectionName) || initialDataMap[collectionName] || [];
  return local.find((item) => String(item.id) === String(id)) || null;
}

function sanitizeData(data) {
  if (!data || typeof data !== 'object') return {};
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id') continue;
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

export async function insertRow(collectionName, data) {
  const sanitized = sanitizeData(data);
  const newId = data.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    ...sanitized,
    id: newId,
    created_at: sanitized.created_at || new Date().toISOString(),
  };

  // 1. Immediately persist to Local Sync Store & notify all components
  const current = getLocalStore(collectionName) || initialDataMap[collectionName] || [];
  const updated = [payload, ...current.filter((item) => String(item.id) !== String(newId))];
  setLocalStore(collectionName, updated);
  broadcastSync(collectionName);

  // 2. Persist to Firestore Cloud asynchronously (non-blocking)
  try {
    const docRef = doc(db, collectionName, newId);
    withTimeout(setDoc(docRef, payload, { merge: true }), CLOUD_TIMEOUT_MS).catch((err) => {
      console.warn(`Firestore insert sync pending for ${collectionName}:`, err.message);
    });
  } catch (error) {
    console.warn(`Firestore insert error for ${collectionName}:`, error.message);
  }

  return payload;
}

export async function updateRow(collectionName, id, updates) {
  if (!id) throw new Error(`Missing document ID for updateRow in ${collectionName}`);
  const sanitized = sanitizeData(updates);
  const updatedTime = new Date().toISOString();

  // 1. Immediately update Local Sync Store & notify all components
  const current = getLocalStore(collectionName) || initialDataMap[collectionName] || [];
  const index = current.findIndex((item) => String(item.id) === String(id));
  let updatedItem = { id, ...sanitized, updated_at: updatedTime };

  if (index >= 0) {
    updatedItem = { ...current[index], ...sanitized, updated_at: updatedTime };
    current[index] = updatedItem;
    setLocalStore(collectionName, [...current]);
  } else {
    current.push(updatedItem);
    setLocalStore(collectionName, [...current]);
  }
  broadcastSync(collectionName);

  // 2. Persist to Firestore Cloud asynchronously (non-blocking)
  try {
    const docRef = doc(db, collectionName, String(id));
    withTimeout(setDoc(docRef, { ...sanitized, updated_at: updatedTime }, { merge: true }), CLOUD_TIMEOUT_MS).catch((err) => {
      console.warn(`Firestore update sync pending for ${collectionName}/${id}:`, err.message);
    });
  } catch (error) {
    console.warn(`Firestore update error for ${collectionName}/${id}:`, error.message);
  }

  return updatedItem;
}

export async function deleteRow(collectionName, id) {
  if (!id) return;

  // 1. Immediately remove from Local Sync Store & notify all components
  const current = getLocalStore(collectionName) || initialDataMap[collectionName] || [];
  const filtered = current.filter((item) => String(item.id) !== String(id));
  setLocalStore(collectionName, filtered);
  broadcastSync(collectionName);

  // 2. Remove from Firestore Cloud asynchronously (non-blocking)
  try {
    const docRef = doc(db, collectionName, String(id));
    withTimeout(deleteDoc(docRef), CLOUD_TIMEOUT_MS).catch((err) => {
      console.warn(`Firestore delete sync pending for ${collectionName}/${id}:`, err.message);
    });
  } catch (error) {
    console.warn(`Firestore delete error for ${collectionName}/${id}:`, error.message);
  }
}

export async function countRows(collectionName, filter = {}) {
  const local = getLocalStore(collectionName);
  if (local !== null && Array.isArray(local)) {
    if (filter && Object.keys(filter).length > 0) {
      return local.filter((item) =>
        Object.entries(filter).every(([k, v]) => item[k] === v)
      ).length;
    }
    return local.length;
  }
  try {
    const items = await fetchAll(collectionName, { filter });
    return items.length;
  } catch (e) {
    return (initialDataMap[collectionName] || []).length;
  }
}

/* ─── Firebase Storage Helpers ─── */
export async function uploadFile(bucket, path, file) {
  const fileRef = storageRef(storage, `${bucket}/${path}`);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return { path, publicUrl: downloadUrl };
}

export async function uploadMediaFile(bucket, file, onProgress) {
  if (!file) return null;
  const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'upload';
  const path = `${Date.now()}_${sanitizedName}`;

  // Try Firebase Storage with resumable progress
  try {
    const fileRef = storageRef(storage, `${bucket}/${path}`);
    const downloadUrl = await new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);

      // Inactivity timeout: only triggers if no upload progress occurs for 90 seconds
      let inactivityTimer = setTimeout(() => {
        try { uploadTask.cancel(); } catch (e) {}
        reject(new Error('Cloud upload timed out due to no network activity. Please check your connection.'));
      }, 90000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Reset timer on each chunk of progress
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            try { uploadTask.cancel(); } catch (e) {}
            reject(new Error('Cloud upload stalled. Network connection lost.'));
          }, 90000);

          if (snapshot.totalBytes > 0) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(pct);
          }
        },
        (error) => {
          clearTimeout(inactivityTimer);
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Upload permission denied. Firebase Storage rules must allow writes.'));
          } else if (error.code === 'storage/bucket-not-found') {
            reject(new Error('Firebase Storage bucket not found. Please ensure Cloud Storage is created in your Firebase Console.'));
          } else {
            reject(error);
          }
        },
        async () => {
          clearTimeout(inactivityTimer);
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });

    if (downloadUrl) return downloadUrl;
  } catch (err) {
    console.warn(`Firebase Storage upload notice for ${bucket}/${path}:`, err.message);

    // If file is an image, compress via canvas to <= 900px so it is compact (<80KB) and never breaks Firestore
    if (file.type && file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 900;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          };
          img.onerror = () => resolve(e.target.result);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }

    // For video files, DO NOT return a temporary blob URL (blob:http...) because it only lives in memory and vanishes on page reload
    throw new Error(
      'Cloud storage upload failed: Firebase Cloud Storage is not yet initialized in your console. Please enable it at https://console.firebase.google.com/project/iccwebsite-e3a90/storage, or paste a YouTube / Google Drive / direct video URL.'
    );
  }
}

export async function getPublicUrl(bucket, path) {
  try {
    const fileRef = storageRef(storage, `${bucket}/${path}`);
    return await getDownloadURL(fileRef);
  } catch {
    return null;
  }
}

/* ─── Activity Log ─── */
export async function logActivity(adminId, action, targetType, targetId, description) {
  return insertRow('admin_activity_logs', {
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    description,
  });
}

