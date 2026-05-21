import { Suspense } from "react";
import NewApplicationClient from "./NewApplicationClient";

export const dynamic = "force-dynamic";

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <NewApplicationClient />
    </Suspense>
  );
}

