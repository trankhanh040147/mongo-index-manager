import { Link, useNavigate } from 'react-router-dom';
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { useAuthStore } from '@/store/authStore';
    import { login } from '@/services/authService';
    import React from 'react';

    export default function LoginPage() {
      const navigate = useNavigate();
      const { setTokens } = useAuthStore();

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const identity = formData.get('identity') as string;
        const password = formData.get('password') as string;

        try {
          const data = await login({ identity, password });
          setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
          navigate('/');
        } catch (error) {
          console.error("Login failed", error);
          // TODO: Show error message to user
        }
      };

      return (
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="identity">Email or Username</Label>
                <Input
                  id="identity"
                  name="identity"
                  type="text"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
