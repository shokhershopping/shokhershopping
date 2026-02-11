'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { clientAuth } from 'firebase-config/client';
import { Button, Input, Password, Text } from 'rizzui';
import toast from 'react-hot-toast';

export function FirebaseSignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      // Create session cookie on the server
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      toast.success(<Text as="b">Successfully signed in!</Text>);
      router.push('/');
    } catch (error: any) {
      const errorMessage =
        error?.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : error?.code === 'auth/user-not-found'
            ? 'No account found with this email'
            : error?.code === 'auth/too-many-requests'
              ? 'Too many attempts. Please try again later.'
              : 'Sign in failed. Please try again.';
      toast.error(<Text as="b">{errorMessage}</Text>);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(clientAuth, provider);
      const idToken = await result.user.getIdToken();

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      toast.success(<Text as="b">Successfully signed in!</Text>);
      router.push('/');
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        toast.error(<Text as="b">Google sign in failed</Text>);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleEmailSignIn} className="space-y-5">
        <Input
          type="email"
          size="lg"
          label="Email"
          placeholder="Enter your email"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Password
          label="Password"
          placeholder="Enter your password"
          size="lg"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          className="w-full"
          type="submit"
          size="lg"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <span className="absolute bg-white px-2 text-sm text-gray-500">
          OR
        </span>
        <div className="w-full border-t border-gray-300" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}
