import { Suspense } from "react";
import AdminHomeClient from "./AdminHomeClient";

export const metadata = {
  title: "Admin | Job Application Assistant",
  description: "Beta admin dashboard."
};

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <AdminHomeClient />
    </Suspense>
  );
}

