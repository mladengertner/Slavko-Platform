import { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, DocumentData } from 'firebase/firestore';
import type { Idea } from '../types';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ideasCollection = collection(db, "ideas");
    const q = query(ideasCollection, orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })) as Idea[];
      setIdeas(ideasData);
      setLoading(false);
    }, (err: any) => {
      console.error("Error fetching ideas:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { ideas, loading };
}