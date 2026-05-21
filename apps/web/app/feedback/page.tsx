import { Suspense } from "react";
import FeedbackClient from "./FeedbackClient";

export const metadata = {
  title: "Feedback | Job Application Assistant",
  description: "Submit beta feedback for Job Application Assistant."
};

export const dynamic = "force-dynamic";

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <FeedbackClient />
    </Suspense>
  );
}

