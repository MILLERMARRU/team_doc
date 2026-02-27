"use client";
// ============================================================
//  app/admin/_components/LoginForm.tsx
//  Formulario de login con shadcn/ui + notificaciones sonner
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Credenciales incorrectas", {
          description: "Verifica tu usuario y contraseña e intenta de nuevo.",
        });
        return;
      }

      toast.success("Sesión iniciada", {
        description: `Bienvenido, ${username}.`,
      });
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Usuario */}
      <div className="space-y-1.5">
        <Label htmlFor="username" className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          Usuario
        </Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          autoFocus
          placeholder="Tu nombre de usuario"
          disabled={loading}
        />
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Tu contraseña"
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
