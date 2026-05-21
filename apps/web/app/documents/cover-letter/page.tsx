import { Suspense } from "react";
import CoverLetterClient from "./CoverLetterClient";

export const dynamic = "force-dynamic";

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <CoverLetterClient />
    </Suspense>
  );
}

