"use client";
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseClient';
import { useRouter } from 'next/navigation';

type UserProfile = {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
};

export default function Account() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      const docRef = doc(db, 'users', u.uid);
      const docSnap = await getDoc(docRef);
      setProfile(docSnap.exists() ? (docSnap.data() as UserProfile) : null);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user || !profile) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Mon compte</h1>
      <p><b>Prénom:</b> {profile.firstName}</p>
      <p><b>Nom:</b> {profile.lastName}</p>
      <p><b>Date de naissance:</b> {profile.dob}</p>
      <p><b>Email:</b> {profile.email}</p>
      <button onClick={handleLogout} className="w-full mt-4 bg-gray-700 text-white p-2 rounded">Se déconnecter</button>
    </div>
  );
}
