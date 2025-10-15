import { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, DocumentData } from 'firebase/firestore';
import type { Build } from '../types';

export function useBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildsCollection = collection(db, "builds");
    const q = query(buildsCollection, orderBy("startedAt", "desc"), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const buildsData = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })) as Build[];
      setBuilds(buildsData);
      setLoading(false);
    }, (err: any) => {
      console.error("Error fetching builds:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { builds, loading };
}