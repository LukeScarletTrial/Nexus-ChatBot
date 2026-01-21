import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFm2YjLCmsyJ8cCP1a89xo70VVhbJ5TNQ",
  authDomain: "nexus-ai-a789a.firebaseapp.com",
  projectId: "nexus-ai-a789a",
  storageBucket: "nexus-ai-a789a.firebasestorage.app",
  messagingSenderId: "64824858780",
  appId: "1:64824858780:web:8e6126402d69240ecbf559",
  measurementId: "G-9VT4XPCCM2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error registering with email", error);
    throw error;
  }
};

export const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const generateApiKey = async (userId: string, name: string): Promise<string> => {
  const key = `nx_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
  await addDoc(collection(db, "api_keys"), {
    key: key,
    name: name,
    userId: userId,
    createdAt: serverTimestamp(),
    active: true
  });
  return key;
};

export const getUserKeys = async (userId: string) => {
  const q = query(collection(db, "api_keys"), where("userId", "==", userId), where("active", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const q = query(collection(db, "api_keys"), where("key", "==", apiKey), where("active", "==", true));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const getApiKeyDetails = async (apiKey: string) => {
  const q = query(collection(db, "api_keys"), where("key", "==", apiKey), where("active", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data();
};

export const getUserPresentations = async (userId: string) => {
  try {
    const q = query(collection(db, "presentations"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    // Fallback if index missing
    const q = query(collection(db, "presentations"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export { auth, db, onAuthStateChanged };