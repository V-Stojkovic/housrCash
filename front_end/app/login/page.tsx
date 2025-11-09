"use client"

import { LoginForm } from '@/components/login-form';

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
