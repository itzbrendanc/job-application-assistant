import JobDetailClient from "./JobDetailClient";

export default async function JobDetailPage({ params }: { params?: Promise<{ jobId?: string }> }) {
  const p = (await params) ?? {};
  const jobId = p.jobId ?? "";
  return <JobDetailClient jobId={jobId} />;
}

