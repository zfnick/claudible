import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";

export default function SimpleLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "test@test.com" && password === "test123") {
      toast("Login successful");
      navigate("/dashboard");
    } else {
      toast("Invalid credentials. Use test@test.com / test123");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/680f6340-5118-48fd-990f-c89cecd311ef"
              alt="Claudible logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold tracking-wide text-stone-900">CLAUDIBLE</span>
          </div>
          <Link to="/" className="text-sm underline text-stone-700">Home</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl tracking-tight font-bold text-stone-800 text-center mb-10"
        >
          Login
        </motion.h1>

        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-amber-200/60 border-stone-300">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-xl text-stone-900">Welcome back</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm block mb-1 text-stone-800">E-mail:</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    required
                    className="bg-white text-stone-900 placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1 text-stone-800">Password:</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    required
                    className="bg-white text-stone-900 placeholder:text-stone-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-3 pt-2">
                <Link to="/" className="text-sm underline text-stone-700">Cancel</Link>
                <Button type="submit" className="bg-stone-700 hover:bg-stone-800">Login</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-stone-500">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}