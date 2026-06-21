import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupPageProps {
  onNavigateLogin: () => void;
  onSignupSuccess: () => void;
}

export function SignupPage({ onNavigateLogin, onSignupSuccess }: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && password.trim()) {
      onSignupSuccess();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex w-full lg:w-1/2 items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-2xl font-bold text-primary mb-1">DocPulse</p>
            <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-500 mt-2">Sign up to start chatting with your documents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              onClick={onNavigateLogin}
              className="text-primary font-medium hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign in
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
