import { Suspense } from "react";
import AdminFeedbackClient from "./AdminFeedbackClient";

export const metadata = {
  title: "Admin Feedback | Job Application Assistant",
  description: "Beta feedback inbox."
};

export const dynamic = "force-dynamic";

export default function AdminFeedbackPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <AdminFeedbackClient />
    </Suspense>
  );
}

