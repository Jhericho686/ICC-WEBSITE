import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
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
  onSnapshot,
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

/* ─── Admin Password & Auth Helpers ─── */
export const DEFAULT_ADMIN_PASSWORD = 'iccadmin123!';

export function getAdminPassword() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('icc_admin_password');
    if (saved) return saved;
  }
  return DEFAULT_ADMIN_PASSWORD;
}

export async function setAdminPassword(newPassword) {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const cleanPass = newPassword.trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('icc_admin_password', cleanPass);
  }
  if (auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, cleanPass);
    } catch (e) {
      console.warn('Firebase user password sync skipped:', e.message);
    }
  }
  return cleanPass;
}

export function getLocalAdminSession() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('icc_admin_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('icc_admin_auth'));
  }
}

export async function signIn(email, password) {
  const normEmail = (email || '').toLowerCase().trim();
  const currentAdminPass = getAdminPassword();

  // 1. Try Firebase Auth first
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('icc_admin_session');
    }
    notifyAuthChange();
    return userCredential.user;
  } catch (error) {
    // 2. If Firebase user not registered yet or offline, verify against admin credentials
    const isAdminEmail =
      normEmail === 'iccadmin@gmail.com' ||
      normEmail.includes('admin') ||
      normEmail.includes('icc');

    if (isAdminEmail) {
      if (password === currentAdminPass) {
        const adminUser = {
          email: normEmail,
          uid: 'admin-local',
          displayName: 'Head Administrator',
        };
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('icc_admin_session', JSON.stringify(adminUser));
        }
        notifyAuthChange();

        // Attempt to create user in Firebase Auth in background so cloud rules work seamlessly
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (_) {
          // Ignored if user already exists or registrations closed
        }

        return adminUser;
      } else {
        throw new Error('Incorrect password. Access denied.');
      }
    }

    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Access denied.');
    }
    throw new Error(error.message || 'Invalid admin credentials.');
  }
}

export async function signOut() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('icc_admin_session');
  }
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Firebase signout error:', e);
  }
  notifyAuthChange();
}

export async function getSession() {
  const user = auth.currentUser || getLocalAdminSession();
  return user ? { user } : null;
}

export async function getUser() {
  return auth.currentUser || getLocalAdminSession();
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

/* ─── Cloud Timeout Helper ─── */
const CLOUD_TIMEOUT_MS = 8000;

function withTimeout(promise, ms = CLOUD_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Cloud operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/* ─── Real-Time Firestore Collection Listener ─── */
export function subscribeCollection(collectionName, options = {}, onUpdate, onError) {
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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setLocalStore(collectionName, items);
        if (onUpdate) onUpdate(items);
      },
      (error) => {
        console.warn(`Firestore onSnapshot error for ${collectionName}:`, error.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`Could not setup onSnapshot for ${collectionName}:`, err);
    return () => {};
  }
}

/* ─── Firestore & Local Sync Generic CRUD Helpers ─── */
export async function fetchAll(collectionName, options = {}) {
  let items = [];
  let fetchedFromCloud = false;

  // 1. Check local store first for fast initial display
  const local = getLocalStore(collectionName);

  // 2. Attempt Firestore Cloud fetch
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

    if (querySnapshot) {
      items = querySnapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id,
      }));
      fetchedFromCloud = true;
      setLocalStore(collectionName, items);
    }
  } catch (error) {
    console.warn(`Cloud fetch notice for ${collectionName}:`, error.message);
  }

  // 3. If cloud operation failed (e.g. offline), load from Local Sync Store or initial data
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
    const docSnap = await withTimeout(getDoc(doc(db, collectionName, String(id))), 5000);
    if (docSnap && docSnap.exists()) return { ...docSnap.data(), id: docSnap.id };
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
  const current = getLocalStore(collectionName) || [];
  const updated = [payload, ...current.filter((item) => String(item.id) !== String(newId))];
  setLocalStore(collectionName, updated);
  broadcastSync(collectionName);

  // 2. Persist directly to Google Cloud Firestore
  try {
    const docRef = doc(db, collectionName, newId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.error(`Firestore insert error for ${collectionName}:`, error);
    throw error;
  }

  return payload;
}

export async function updateRow(collectionName, id, updates) {
  if (!id) throw new Error(`Missing document ID for updateRow in ${collectionName}`);
  const sanitized = sanitizeData(updates);
  const updatedTime = new Date().toISOString();

  // 1. Immediately update Local Sync Store & notify all components
  const current = getLocalStore(collectionName) || [];
  const index = current.findIndex((item) => String(item.id) === String(id));
  let updatedItem = { ...sanitized, id, updated_at: updatedTime };

  if (index >= 0) {
    updatedItem = { ...current[index], ...sanitized, id, updated_at: updatedTime };
    current[index] = updatedItem;
    setLocalStore(collectionName, [...current]);
  } else {
    current.push(updatedItem);
    setLocalStore(collectionName, [...current]);
  }
  broadcastSync(collectionName);

  // 2. Persist directly to Google Cloud Firestore
  try {
    const docRef = doc(db, collectionName, String(id));
    await setDoc(docRef, { ...sanitized, updated_at: updatedTime }, { merge: true });
  } catch (error) {
    console.error(`Firestore update error for ${collectionName}/${id}:`, error);
    throw error;
  }

  return updatedItem;
}

export async function deleteRow(collectionName, id) {
  if (!id) return;

  // 1. Immediately remove from Local Sync Store & notify all components
  const current = getLocalStore(collectionName) || [];
  const filtered = current.filter((item) => String(item.id) !== String(id));
  setLocalStore(collectionName, filtered);
  broadcastSync(collectionName);

  // 2. Remove directly from Google Cloud Firestore
  try {
    // Delete by document ID directly
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);

    // Also delete any document whose internal 'id' matches (handles legacy seeded documents)
    try {
      const q = query(collection(db, collectionName), where('id', '==', String(id)));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (innerErr) {
      // Ignore if query where index not present
    }
  } catch (error) {
    console.error(`Firestore delete error for ${collectionName}/${id}:`, error);
    throw error;
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

  // 1. If file is an image, immediately compress to fast, reliable high-quality JPEG (<75KB)
  if (file.type && file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 960;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          if (onProgress) onProgress(100);
          resolve(compressed);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'upload';
  const path = `${Date.now()}_${sanitizedName}`;

  // Try Firebase Storage with fast timeout for video files
  try {
    const fileRef = storageRef(storage, `${bucket}/${path}`);
    const downloadUrl = await new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);

      let inactivityTimer = setTimeout(() => {
        try { uploadTask.cancel(); } catch (e) {}
        reject(new Error('Cloud upload timed out.'));
      }, 30000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            try { uploadTask.cancel(); } catch (e) {}
            reject(new Error('Cloud upload stalled.'));
          }, 30000);

          if (snapshot.totalBytes > 0) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(pct);
          }
        },
        (error) => {
          clearTimeout(inactivityTimer);
          reject(error);
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
    throw new Error(
      'Cloud storage upload failed: Please paste a YouTube or Google Drive video share link.'
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

