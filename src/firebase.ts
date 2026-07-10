import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAo0OBoIBeYNw_jykeu3ERQwcofCVyMDaQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maudahamartfirebase.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maudahamartfirebase",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maudahamartfirebase.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1043763135109",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1043763135109:web:6a9790f54f04f7db1cdfec"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-maudahamart-55495b6b-a809-417b-b1ae-8472e7d6c620");
export const auth = getAuth(app);

export const OperationType = {
  READ: 'read',
  WRITE: 'write',
  UPDATE: 'update',
  DELETE: 'delete',
  AUTH: 'auth',
  LIST: 'list'
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

export function handleFirestoreError(error: any, operation: OperationType, context?: string): void {
  console.error(`Firestore ${operation} error in ${context || 'unknown'}:`, error);
}
