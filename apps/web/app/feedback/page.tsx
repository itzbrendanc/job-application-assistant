import { Suspense } from "react";
import FeedbackClient from "./FeedbackClient";

export const metadata = {
  title: "Feedback | Hirely",
  description: "Submit beta feedback for Hirely."
};

export const dynamic = "force-dynamic";

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <FeedbackClient />
    </Suspense>
  );
}
