import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginPageProps {
  onNavigateSignup: () => void;
  onLoginSuccess: () => void;
  message?: string;
}

export function LoginPage({ onNavigateSignup, onLoginSuccess, message }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      login(email.trim());
      onLoginSuccess();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex w-full lg:w-1/2 items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-2xl font-bold text-primary mb-1">DocPulse</p>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to DocPulse</h1>
            <p className="text-gray-500 mt-2">Sign in to start chatting with your documents</p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={onNavigateSignup}
              className="text-primary font-medium hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-1/2">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
          alt="Workspace"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
