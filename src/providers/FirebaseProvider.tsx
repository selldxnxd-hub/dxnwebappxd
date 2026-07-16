import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  dbReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Check firestore connection
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setDbReady(true);
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firebase client is offline or configuration is pending.');
        } else {
          setDbReady(true); // If it's a permission/notFound error, DB itself is active
        }
      }
    };
    checkConnection();

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, dbReady }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within FirebaseProvider');
  return context;
};
