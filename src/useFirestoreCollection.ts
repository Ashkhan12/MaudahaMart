import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export function useFirestoreCollection<T extends { id: string }>(collectionName: string) {
  const [data, setDataLocal] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as T));
      setDataLocal(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName]);

  const setData = useCallback((newVal: T[] | ((prev: T[]) => T[])) => {
    setDataLocal(prev => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      
      // Find diffs and upload to Firestore
      updated.forEach(item => {
        const oldItem = prev.find(p => p.id === item.id);
        if (JSON.stringify(item) !== JSON.stringify(oldItem)) {
          if (item.id && item.id.trim() !== '' && item.id !== 'undefined') {
            setDoc(doc(db, collectionName, item.id), item, { merge: true }).catch(err => {
               console.error(`Sync error for ${collectionName}:`, err);
            });
          }
        }
      });

      // Handle deletions
      prev.forEach(oldItem => {
        if (!updated.some(item => item.id === oldItem.id)) {
           if (oldItem.id && oldItem.id.trim() !== '' && oldItem.id !== 'undefined') {
             deleteDoc(doc(db, collectionName, oldItem.id)).catch(err => {
                console.error(`Delete error for ${collectionName}:`, err);
             });
           }
        }
      });

      return updated;
    });
  }, [collectionName]);

  return [data, setData, loading] as const;
}
