"use client";
// ============================================================
//  app/admin/_components/UsersPanel.tsx
//  Gestión de usuarios admin: listar y crear. Solo visible para
//  sesiones con role === "admin" (AdminEditor ya filtra el tab).
// ============================================================

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserPlus, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div className="grid gap-4 md:grid-cols-2">
      {/* ── Formulario: crear usuario ── */}
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400">
            <UserPlus className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Crear usuario
          </h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ej. sam"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 dark:text-neutral-400">
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
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
          >
            <option value="editor">Editor (solo docs)</option>
            <option value="admin">Admin (gestiona usuarios)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 text-white dark:text-neutral-900 text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear usuario"}
        </button>
      </form>

      {/* ── Lista de usuarios ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400">
            <UsersIcon className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Usuarios existentes
          </h2>
        </div>

        {loadingList && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
          </div>
        )}

        {listError && <p className="text-sm text-red-500">{listError}</p>}

        {!loadingList && !listError && users && (
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.username}
                className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
              >
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {u.username}
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {u.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
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
