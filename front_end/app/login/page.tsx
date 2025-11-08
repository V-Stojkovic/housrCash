"use client"

import { handleGoogleSignIn, handleSignOut } from '../../lib/auth';
import { useSession } from 'next-auth/react';
import { LoginForm } from '@/components/login-form';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      {session ? (
        <div>
          <h2 className="text-lg font-medium text-gray-700">
            Welcome, {session?.user.name}!
          </h2>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 mt-4 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
      )}
    </main>
  );
}
