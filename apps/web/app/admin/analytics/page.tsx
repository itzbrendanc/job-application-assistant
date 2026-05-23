import { Suspense } from "react";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export const metadata = {
  title: "Admin Analytics | Hirely",
  description: "Beta analytics dashboard."
};

export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <AdminAnalyticsClient />
    </Suspense>
  );
}
