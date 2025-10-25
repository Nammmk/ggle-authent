"use client";
import { useState, ChangeEvent, FormEvent } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseClient';
import { useRouter } from 'next/navigation';

type RegisterForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;
};

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dob: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, { displayName: `${form.firstName} ${form.lastName}` });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        email: form.email,
      });
      router.push('/account');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        dob: '',
        email: user.email,
      }, { merge: true })
        .then(() => console.log('Firestore user doc created for', user.uid))
        .catch((firestoreErr) => {
          console.error('Firestore setDoc error:', firestoreErr);
          setError('Firestore error: ' + (firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr)));
        });
      router.push('/account');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      console.error('Google sign-in error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Inscription</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input name="firstName" placeholder="Prénom" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="lastName" placeholder="Nom" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="dob" type="date" placeholder="Date de naissance" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" className="w-full p-2 border rounded" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">S&apos;inscrire</button>
      </form>
      <button onClick={handleGoogle} className="w-full mt-4 bg-red-500 text-white p-2 rounded">S&apos;inscrire avec Google</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
