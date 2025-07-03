'use client';

import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Replace with your API call (e.g., fetch("/api/login", { ... }))
    console.log('Logging in with', { email, password });

    // Simulate auth logic
    if (email === 'admin@example.com' && password === 'password') {
      alert('Login successful!');
      // You can redirect using useRouter()
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600 ">Sign In</h1>

        <label className="block mb-4">
          <span className="block text-sm font-medium text-blue-600">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="block mb-6">
          <span className="block text-sm font-medium text-blue-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border rounded"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}
