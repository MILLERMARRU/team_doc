// ============================================================
//  app/admin/login/page.tsx
//  Página de login para el panel admin
// ============================================================

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookOpen } from "lucide-react";
import LoginForm from "../_components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
        <Card className="shadow-lg border-border">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">DocHub Admin</CardTitle>
            <CardDescription>
              Inicia sesión para gestionar la documentación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

