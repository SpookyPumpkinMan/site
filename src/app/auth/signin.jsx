import { useState } from 'react';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn({ csrfToken }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError('Invalid email or password');
    } else {
      router.push('/'); // Redirect after successful login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <h1 className="text-2xl mb-6 text-center font-bold">Sign In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          className="border p-2 mb-4 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          className="border p-2 mb-6 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full border border-gray-400 py-2 rounded hover:bg-gray-200 transition"
          >
            Sign in with Google
          </button>
        </div>
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
