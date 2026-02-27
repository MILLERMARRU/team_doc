// ============================================================
//  app/admin/page.tsx
//  Panel admin – redirige a login si no hay sesión
// ============================================================

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDocsIndex } from "@/lib/docs";
import AdminEditor from "./_components/AdminEditor";

export const metadata = {
  title: "Admin | DocHub",
};

export default async function AdminPage() {
  const session = await getSession();

  // Sin sesión → login
  if (!session) {
    redirect("/admin/login");
  }

  let index;
  try {
    index = await getDocsIndex();
  } catch {
    index = { sections: [] };
  }

  return <AdminEditor username={session.username} index={index} />;
}
