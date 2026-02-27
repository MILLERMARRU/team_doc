// ============================================================
//  app/admin/login/page.tsx
//  Página de login para el panel admin
// ============================================================

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookOpen } from "lucide-react";
import LoginForm from "../_components/LoginForm";

export const metadata = {
  title: "Login Admin | DocHub",
};

export default async function LoginPage() {
  const session = await getSession();

  // Si ya está logueado → panel
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-4">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            DocHub Admin
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            Inicia sesión para gestionar la documentación
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <LoginForm />
        </div>

        {/* Hint credenciales por defecto */}
        <p className="text-center text-xs text-neutral-400 mt-4">
          Credenciales por defecto: <code className="font-mono">admin</code> /{" "}
          <code className="font-mono">admin123</code>
        </p>
      </div>
    </div>
  );
}
