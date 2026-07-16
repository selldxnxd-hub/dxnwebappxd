import { useFirebase } from '../providers/FirebaseProvider';
import { db } from '../firebase/config';

export const useFirestore = () => {
  const { dbReady } = useFirebase();
  return {
    db,
    dbReady
  };
};
