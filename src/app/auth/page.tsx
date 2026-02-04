'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [inEmail, setInEmail] = useState('kuangqi0317@outlook.com');
  const [inPassword, setInPassword] = useState('aa12345678');
  const [upEmail, setUpEmail] = useState('');
  const [upPassword, setUpPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const resUp = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: upEmail, password: upPassword }),
      });
      console.log('RAW:', JSON.stringify(upEmail));
      console.log('TRIM:', JSON.stringify(upEmail.trim()));
      if (!resUp.ok) {
        const payload = await resUp.json().catch(() => null);
        throw new Error(payload?.message ?? 'Sign up failed');
      }
      toast.success('Account created successfully!');
      setUpPassword('');
      setUpEmail('');
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error ? error.message : 'An error occurred'
      );
      toast.error('Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inEmail, password: inPassword }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? 'Sign in failed');
      }
      toast.success('Signed in successfully!');
      //route.push add when finished route function
      router.push('/dashboard');
      router.refresh();
      setInPassword('');
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error ? error.message : 'An error occurred'
      );
      toast.error('Sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dark relative min-h-[calc(100vh-0px)] overflow-hidden bg-background text-foreground">
      {/* Tech background */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-background to-background" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Center box */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-[500px]">
          <Card className="border-border/60 bg-background/60 shadow-xl backdrop-blur">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    SideKick Investment Assistant
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Secure access to your investment framework and dashboard.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <Tabs defaultValue="sign-in" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sign-in">Sign in</TabsTrigger>
                  <TabsTrigger value="sign-up">Sign up</TabsTrigger>
                </TabsList>

                {/* Sign in */}
                <TabsContent value="sign-in" className="mt-4 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        inputMode="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        value={inEmail}
                        onChange={(e) => setInEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground"
                          aria-label="Forgot password"
                        >
                          Forgot?
                        </button>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        value={inPassword}
                        onChange={(e) => setInPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full"
                      type="button"
                      onClick={handleSignIn}
                      disabled={isSubmitting}
                    >
                      Sign in
                    </Button>

                    <div className="relative">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      type="button"
                      variant="secondary"
                    >
                      Continue with Google
                    </Button>
                  </div>
                </TabsContent>

                {/* Sign up */}
                <TabsContent value="sign-up" className="mt-4 space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="signup-first">First name</Label>
                        <Input
                          id="signup-first"
                          placeholder="First name"
                          autoComplete="given-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-last">Last name</Label>
                        <Input
                          id="signup-last"
                          placeholder="Last name"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        inputMode="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        value={upEmail}
                        onChange={(e) => setUpEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (strong recommended)"
                        autoComplete="new-password"
                        value={upPassword}
                        onChange={(e) => setUpPassword(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 8 characters. Mix letters and numbers for best
                        security.
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      type="button"
                      onClick={handleSignUp}
                      disabled={isSubmitting}
                    >
                      Create account
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By creating an account, you agree to the Terms of Service
                      and Privacy Policy.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border/60 py-4">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} SideKick
              </p>
              <p className="text-xs text-muted-foreground">
                App Router • shadcn/ui
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
