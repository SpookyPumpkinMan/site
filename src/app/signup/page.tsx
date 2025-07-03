'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabaseClient';
import { FaGoogle } from 'react-icons/fa';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Check your inbox to confirm your email!');
      setEmail('');
      setPassword('');
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(220,242,241)]">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-[rgb(15,16,53)]">Sign up</h1>
          <p className="text-[rgb(54,84,134)]">
            Sign up for free and start using WorkNest in seconds.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(54,84,134)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={`w-full rounded-lg border border-[rgb(220,242,241)] px-4 py-3 focus:border-[rgb(127,199,217)] focus:outline-none focus:ring-2 focus:ring-[rgb(127,199,217)] ${
                email ? 'text-black' : 'text-[rgb(54,84,134)]'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(54,84,134)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={`w-full rounded-lg border border-[rgb(220,242,241)] px-4 py-3 focus:border-[rgb(127,199,217)] focus:outline-none focus:ring-2 focus:ring-[rgb(127,199,217)] ${
                password ? 'text-black' : 'text-[rgb(54,84,134)]'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[rgb(127,199,217)] px-4 py-3 font-semibold text-[rgb(15,16,53)] hover:bg-[rgb(54,84,134)] hover:text-white transition-colors"
          >
            SIGN UP
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          <FaGoogle className="text-[rgb(219,68,55)]" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[rgb(54,84,134)]">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/signin')} 
            className="font-semibold text-[rgb(127,199,217)] hover:text-[rgb(54,84,134)]"
          >
            Sign in
          </button>
        </p>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-4 text-center text-sm text-green-600">{success}</p>
        )}
      </div>
    </div>
  );
}