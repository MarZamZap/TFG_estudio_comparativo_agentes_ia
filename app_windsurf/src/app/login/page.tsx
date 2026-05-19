"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="login-bg flex min-h-screen items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-50/80 blur-2xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo & heading */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ÓpticaApp</h1>
          <p className="text-sm text-slate-500 mt-1.5">Sistema de Gestión Óptica Profesional</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                required
                autoFocus
                className="h-10 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-200 transition-all"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                <p className="text-sm text-rose-600 text-center font-medium">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all duration-200 mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                  </svg>
                  Conectando...
                </span>
              ) : "Acceder"}
            </Button>
          </form>
          <p className="mt-6 text-xs text-center text-slate-400">
            Demo: <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">admin</code>{" "}
            /{" "}
            <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">admin123</code>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 ÓpticaApp · Sistema de Gestión Integral
        </p>
      </div>
    </div>
  );
}
