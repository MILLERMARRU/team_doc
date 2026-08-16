"use client";
// ============================================================
//  app/admin/_components/UsersPanel.tsx
//  Gestión de usuarios admin: listar y crear. Solo visible para
//  sesiones con role === "admin" (AdminEditor ya filtra el tab).
// ============================================================

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserPlus, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SafeUser, UserRole } from "@/types";

export default function UsersPanel() {
  const [users, setUsers] = useState<SafeUser[] | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [creating, setCreating] = useState(false);

  async function loadUsers() {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar usuarios");
      setUsers(data.users);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el usuario");

      toast.success(`Usuario "${username}" creado`);
      setUsername("");
      setPassword("");
      setRole("editor");
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Formulario: crear usuario ── */}
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl border bg-card p-5"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4" />
          Crear usuario
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ej. sam"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">
            Contraseña temporal (mín. 8 caracteres)
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="editor">Editor (solo docs)</option>
            <option value="admin">Admin (gestiona usuarios)</option>
          </select>
        </div>

        <Button type="submit" disabled={creating} className="w-full">
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Crear usuario"
          )}
        </Button>
      </form>

      {/* ── Lista de usuarios ── */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <UsersIcon className="h-4 w-4" />
          Usuarios existentes
        </h2>

        {loadingList && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
          </div>
        )}

        {listError && (
          <p className="text-sm text-red-500">{listError}</p>
        )}

        {!loadingList && !listError && users && (
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.username}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">{u.username}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {u.role === "admin" && (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
