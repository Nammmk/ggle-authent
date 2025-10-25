"use client";
import { useState, ChangeEvent, FormEvent } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [form, setForm] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push('/account');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/account');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" className="w-full p-2 border rounded" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Se connecter</button>
      </form>
      <button onClick={handleGoogle} className="w-full mt-4 bg-red-500 text-white p-2 rounded">Connexion avec Google</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
