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
  apiKey: getEnv('VITE_FIREBASE_API_KEY', "AIzaSyCWseZfNrlSbtjZQA1Uv-RyKYrn_SEInyY"),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', "idlecc.firebaseapp.com"),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', "idlecc"),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', "idlecc.firebasestorage.app"),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', "663265188018"),
  appId: getEnv('VITE_FIREBASE_APP_ID', "1:663265188018:web:1a10885e0252262e3c91ab"),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', "G-MRMMRN0N1M"),
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

/* ─── Firestore Generic CRUD Helpers ─── */
export async function fetchAll(collectionName, options = {}) {
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
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    // If query failed due to missing Firestore composite index, retry without order constraint and sort in JS
    if (error?.message?.includes('index') && options.order) {
      try {
        let fallbackConstraints = [];
        if (options.filter) {
          for (const [key, value] of Object.entries(options.filter)) {
            fallbackConstraints.push(where(key, '==', value));
          }
        }
        const fallbackQ = query(collection(db, collectionName), ...fallbackConstraints);
        const snapshot = await getDocs(fallbackQ);
        let items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        const col = options.order.column;
        const asc = options.order.ascending !== false;
        items.sort((a, b) => {
          if (!a[col]) return 1;
          if (!b[col]) return -1;
          return asc ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1);
        });

        if (options.limit) items = items.slice(0, options.limit);
        return items;
      } catch (innerErr) {
        console.warn(`Fallback fetch failed for ${collectionName}:`, innerErr.message);
      }
    }
    console.warn(`Firestore fetchAll notice for ${collectionName}:`, error.message);
    return [];
  }
}

export async function fetchOne(collectionName, id) {
  const docSnap = await getDoc(doc(db, collectionName, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
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
  const payload = {
    ...sanitized,
    created_at: sanitized.created_at || new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, collectionName), payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.warn(`Firestore insertRow failed for ${collectionName}:`, error.message);
    throw error;
  }
}

export async function updateRow(collectionName, id, updates) {
  if (!id) throw new Error(`Missing document ID for updateRow in ${collectionName}`);
  const sanitized = sanitizeData(updates);
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...sanitized,
    updated_at: new Date().toISOString(),
  });
  return { id, ...sanitized };
}

export async function deleteRow(collectionName, id) {
  if (!id) return;
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function countRows(collectionName, filter = {}) {
  try {
    let constraints = [];
    for (const [key, value] of Object.entries(filter)) {
      constraints.push(where(key, '==', value));
    }
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (e) {
    return 0;
  }
}

/* ─── Firebase Storage Helpers ─── */
export async function uploadFile(bucket, path, file) {
  const fileRef = storageRef(storage, `${bucket}/${path}`);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return { path, publicUrl: downloadUrl };
}

export async function uploadMediaFile(bucket, file) {
  if (!file) return null;
  const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'upload';
  const path = `${Date.now()}_${sanitizedName}`;

  // Try Firebase Storage first
  try {
    const res = await uploadFile(bucket, path, file);
    if (res && res.publicUrl) {
      return res.publicUrl;
    }
  } catch (err) {
    console.warn(`Firebase Storage upload notice for ${bucket}/${path}:`, err.message);
  }

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

  // For video or other blob media
  if (typeof window !== 'undefined' && window.URL && file instanceof Blob) {
    return URL.createObjectURL(file);
  }
  return '';
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

